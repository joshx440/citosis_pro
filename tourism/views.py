from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from accounts.permissions import IsActiveSystemUser, IsAdminOrManager
from audit.services import log_action, soft_delete_to_recycle
from citosis_pro.common import RecycleItemTypeChoices
from tourism.models import TourismRecord, Visitor
from tourism.serializers import TourismRecordSerializer, VisitorSerializer


class TourismRecordViewSet(viewsets.ModelViewSet):
    serializer_class = TourismRecordSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = TourismRecord.objects.select_related('created_by', 'updated_by').all()

    def get_permissions(self):
        if self.action == 'destroy':
            permission_classes = [IsAdminOrManager]
        else:
            permission_classes = [IsActiveSystemUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = TourismRecord.objects.select_related('created_by', 'updated_by').order_by('-updated_at')
        search = self.request.query_params.get('search', '').strip()
        category = self.request.query_params.get('category', '').strip()
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(location__icontains=search) | queryset.filter(description__icontains=search)
        if category:
            queryset = queryset.filter(category=category)
        return queryset.distinct()

    def perform_create(self, serializer):
        record = serializer.save(created_by=self.request.user)
        log_action(self.request.user, 'Created tourism record', f'Added record #{record.pk} ({record.name}).', self.request)

    def perform_update(self, serializer):
        record = serializer.save(updated_by=self.request.user)
        log_action(self.request.user, 'Updated tourism record', f'Updated record #{record.pk} ({record.name}).', self.request)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        soft_delete_to_recycle(instance, RecycleItemTypeChoices.RECORD, request.user, request=request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class VisitorViewSet(viewsets.ModelViewSet):
    serializer_class = VisitorSerializer
    queryset = Visitor.objects.select_related('tourism_record', 'created_by', 'updated_by').all()

    def get_permissions(self):
        if self.action == 'destroy':
            permission_classes = [IsAdminOrManager]
        else:
            permission_classes = [IsActiveSystemUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = Visitor.objects.select_related('tourism_record', 'created_by', 'updated_by').order_by('-visit_date')
        search = self.request.query_params.get('search', '').strip()
        status_value = self.request.query_params.get('status', '').strip()
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(place__icontains=search) | queryset.filter(origin__icontains=search)
        if status_value:
            queryset = queryset.filter(status=status_value)
        return queryset.distinct()

    def perform_create(self, serializer):
        visitor = serializer.save(created_by=self.request.user)
        log_action(self.request.user, 'Created visitor entry', f'Added visitor #{visitor.pk} ({visitor.name}).', self.request)

    def perform_update(self, serializer):
        visitor = serializer.save(updated_by=self.request.user)
        log_action(self.request.user, 'Updated visitor entry', f'Updated visitor #{visitor.pk} ({visitor.name}).', self.request)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        soft_delete_to_recycle(instance, RecycleItemTypeChoices.VISITOR, request.user, request=request)
        return Response(status=status.HTTP_204_NO_CONTENT)