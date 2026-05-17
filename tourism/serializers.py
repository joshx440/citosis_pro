from rest_framework import serializers

from tourism.models import TourismRecord, Visitor


class TourismRecordSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.name', read_only=True)

    class Meta:
        model = TourismRecord
        fields = [
            'id',
            'name',
            'location',
            'category',
            'description',
            'image_path',
            'image_url',
            'created_by',
            'updated_by',
            'created_by_name',
            'updated_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'updated_by', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image_path and hasattr(obj.image_path, 'url'):
            return request.build_absolute_uri(obj.image_path.url) if request else obj.image_path.url
        return None


class VisitorSerializer(serializers.ModelSerializer):
    tourism_record_name = serializers.CharField(source='tourism_record.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.name', read_only=True)

    class Meta:
        model = Visitor
        fields = [
            'id',
            'name',
            'place',
            'origin',
            'visit_date',
            'status',
            'tourism_record',
            'tourism_record_name',
            'created_by',
            'updated_by',
            'created_by_name',
            'updated_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'updated_by', 'created_at', 'updated_at']