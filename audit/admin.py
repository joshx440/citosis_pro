from django.contrib import admin

from audit.models import ActivityLog, RecycleBin


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'action', 'user', 'ip_address', 'created_at')
    search_fields = ('action', 'details', 'user__email', 'user__username', 'user__name')
    list_filter = ('created_at',)


@admin.register(RecycleBin)
class RecycleBinAdmin(admin.ModelAdmin):
    list_display = ('id', 'item_type', 'item_id', 'deleted_by', 'deleted_at', 'restored_at')
    search_fields = ('item_type', 'item_id')
    list_filter = ('item_type', 'deleted_at', 'restored_at')