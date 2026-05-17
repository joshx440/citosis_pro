from django.conf import settings
from django.db import models

from citosis_pro.common import RecycleItemTypeChoices


class ActivityLog(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, related_name='activity_logs')
    action = models.CharField(max_length=255)
    details = models.TextField(blank=True, null=True)
    ip_address = models.CharField(max_length=255, blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_logs'
        ordering = ['-created_at', '-id']

    def __str__(self):
        return self.action


class RecycleBin(models.Model):
    id = models.BigAutoField(primary_key=True)
    item_type = models.CharField(max_length=20, choices=RecycleItemTypeChoices.choices)
    item_id = models.CharField(max_length=255)
    item_data = models.JSONField()
    deleted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, related_name='recycle_deleted_items')
    deleted_at = models.DateTimeField(auto_now_add=True)
    restored_at = models.DateTimeField(blank=True, null=True)
    restored_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, related_name='recycle_restored_items')

    class Meta:
        db_table = 'recycle_bin'
        ordering = ['-deleted_at', '-id']

    def __str__(self):
        return f'{self.item_type}:{self.item_id}'