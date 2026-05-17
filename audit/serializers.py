from rest_framework import serializers

from audit.models import ActivityLog, RecycleBin


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['id', 'user', 'user_name', 'user_username', 'action', 'details', 'ip_address', 'user_agent', 'created_at']


class RecycleBinSerializer(serializers.ModelSerializer):
    deleted_by_name = serializers.CharField(source='deleted_by.name', read_only=True)
    restored_by_name = serializers.CharField(source='restored_by.name', read_only=True)
    item_name = serializers.SerializerMethodField()

    class Meta:
        model = RecycleBin
        fields = [
            'id',
            'item_type',
            'item_id',
            'item_data',
            'item_name',
            'deleted_by',
            'deleted_by_name',
            'deleted_at',
            'restored_at',
            'restored_by',
            'restored_by_name',
        ]

    def get_item_name(self, obj):
        payload = obj.item_data or {}
        return payload.get('name') or payload.get('username') or payload.get('email') or f'Item {obj.item_id}'