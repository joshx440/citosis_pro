import json

from django.db.models import Count, Q
from django.http import HttpResponse
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsActiveSystemUser, IsAdminOrManager
from audit.models import ActivityLog, RecycleBin
from audit.serializers import ActivityLogSerializer, RecycleBinSerializer
from audit.services import import_backup_payload, log_action, purge_recycle_entry, restore_recycle_entry, serialize_backup_payload
from citosis_pro.common import UserStatusChoices
from tourism.models import TourismRecord, Visitor
from tourism.serializers import TourismRecordSerializer


class DashboardOverviewView(APIView):
    permission_classes = [IsActiveSystemUser]

    def get(self, request):
        records_count = TourismRecord.objects.count()
        visitors_count = Visitor.objects.count()
        users_count = User.objects.filter(status=UserStatusChoices.ACTIVE).count()
        recycle_count = RecycleBin.objects.filter(restored_at__isnull=True).count()

        popularity = list(
            Visitor.objects.values('place')
            .annotate(total=Count('id'))
            .order_by('-total', 'place')[:5]
        )

        recent_activity = ActivityLog.objects.select_related('user').order_by('-created_at')[:8]
        recent_records = TourismRecord.objects.select_related('created_by', 'updated_by').order_by('-updated_at')[:5]

        summary = [
            {
                'title': 'Checked In Visitors',
                'value': Visitor.objects.filter(status='Checked In').count(),
                'description': 'Guests currently marked as checked in.',
            },
            {
                'title': 'Checked Out Visitors',
                'value': Visitor.objects.filter(status='Checked Out').count(),
                'description': 'Guests who already completed their visit.',
            },
            {
                'title': 'Inactive Users',
                'value': User.objects.filter(status='Inactive').count(),
                'description': 'Staff accounts currently not active.',
            },
            {
                'title': 'Recent Logs',
                'value': ActivityLog.objects.count(),
                'description': 'Total activity log entries stored.',
            },
        ]

        return Response(
            {
                'stats': {
                    'records': records_count,
                    'visitors': visitors_count,
                    'users': users_count,
                    'recycle': recycle_count,
                },
                'destination_popularity': popularity,
                'recent_activity': ActivityLogSerializer(recent_activity, many=True).data,
                'recent_records': TourismRecordSerializer(recent_records, many=True, context={'request': request}).data,
                'summary': summary,
            }
        )


class ActivityLogListView(APIView):
    permission_classes = [IsActiveSystemUser]

    def get(self, request):
        search = request.query_params.get('search', '').strip()
        limit = int(request.query_params.get('limit', '25'))
        queryset = ActivityLog.objects.select_related('user').order_by('-created_at')
        if search:
            queryset = queryset.filter(action__icontains=search) | queryset.filter(details__icontains=search)
            queryset = queryset.distinct()
        queryset = queryset[:limit]
        return Response(ActivityLogSerializer(queryset, many=True).data)


class ActivityLogClearView(APIView):
    permission_classes = [IsAdminOrManager]

    def delete(self, request):
        deleted_count, _ = ActivityLog.objects.all().delete()
        log_action(request.user, 'Cleared activity logs', f'Cleared {deleted_count} log rows.', request)
        return Response({'detail': 'Activity logs cleared.'})


class ActivityLogExportView(APIView):
    permission_classes = [IsActiveSystemUser]

    def get(self, request):
        payload = ActivityLogSerializer(ActivityLog.objects.select_related('user').order_by('-created_at'), many=True).data
        response = HttpResponse(json.dumps(payload, indent=2), content_type='application/json')
        response['Content-Disposition'] = 'attachment; filename="activity-logs.json"'
        log_action(request.user, 'Exported activity logs', 'Exported activity logs as JSON.', request)
        return response


class RecycleBinListView(APIView):
    permission_classes = [IsAdminOrManager]

    def get(self, request):
        search = request.query_params.get('search', '').strip().lower()
        item_type = request.query_params.get('type', '').strip().lower()
        queryset = RecycleBin.objects.filter(restored_at__isnull=True).select_related('deleted_by', 'restored_by').order_by('-deleted_at')
        if item_type:
            queryset = queryset.filter(item_type=item_type)
        if search:
            filtered_ids = []
            for item in queryset:
                haystack = json.dumps(item.item_data).lower()
                if search in haystack or search in item.item_type.lower() or search in item.item_id.lower():
                    filtered_ids.append(item.pk)
            queryset = queryset.filter(pk__in=filtered_ids)
        return Response(RecycleBinSerializer(queryset, many=True).data)


class RecycleBinRestoreView(APIView):
    permission_classes = [IsAdminOrManager]

    def post(self, request, pk):
        entry = RecycleBin.objects.filter(pk=pk, restored_at__isnull=True).first()
        if not entry:
            return Response({'detail': 'Recycle bin item not found.'}, status=status.HTTP_404_NOT_FOUND)
        restore_recycle_entry(entry, request.user, request)
        return Response({'detail': 'Item restored successfully.'})


class RecycleBinPurgeView(APIView):
    permission_classes = [IsAdminOrManager]

    def delete(self, request, pk):
        entry = RecycleBin.objects.filter(pk=pk, restored_at__isnull=True).first()
        if not entry:
            return Response({'detail': 'Recycle bin item not found.'}, status=status.HTTP_404_NOT_FOUND)
        purge_recycle_entry(entry, request.user, request)
        return Response({'detail': 'Item permanently removed.'})


class RecycleBinEmptyView(APIView):
    permission_classes = [IsAdminOrManager]

    def delete(self, request):
        entries = list(RecycleBin.objects.filter(restored_at__isnull=True))
        for entry in entries:
            purge_recycle_entry(entry, request.user, request)
        return Response({'detail': 'Recycle bin emptied successfully.'})


class SystemBackupView(APIView):
    permission_classes = [IsAdminOrManager]

    def get(self, request):
        payload = serialize_backup_payload()
        response = HttpResponse(json.dumps(payload, indent=2), content_type='application/json')
        response['Content-Disposition'] = 'attachment; filename="citosis-pro-backup.json"'
        log_action(request.user, 'Exported backup', 'Generated a full JSON backup export.', request)
        return response


class SystemImportView(APIView):
    permission_classes = [IsAdminOrManager]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        file = request.FILES.get('file')
        if file:
            payload = json.loads(file.read().decode('utf-8'))
        else:
            payload = request.data if isinstance(request.data, dict) else {}
        import_backup_payload(payload, actor=request.user, request=request)
        return Response({'detail': 'Backup imported successfully.'})