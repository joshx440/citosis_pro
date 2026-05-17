from django.urls import path

from audit.views import (
    ActivityLogClearView,
    ActivityLogExportView,
    ActivityLogListView,
    DashboardOverviewView,
    RecycleBinEmptyView,
    RecycleBinListView,
    RecycleBinPurgeView,
    RecycleBinRestoreView,
    SystemBackupView,
    SystemImportView,
)

urlpatterns = [
    path('dashboard/overview/', DashboardOverviewView.as_view(), name='dashboard-overview'),
    path('activity-logs/', ActivityLogListView.as_view(), name='activity-logs'),
    path('activity-logs/clear/', ActivityLogClearView.as_view(), name='activity-logs-clear'),
    path('activity-logs/export/', ActivityLogExportView.as_view(), name='activity-logs-export'),
    path('recycle-bin/', RecycleBinListView.as_view(), name='recycle-bin'),
    path('recycle-bin/<int:pk>/restore/', RecycleBinRestoreView.as_view(), name='recycle-bin-restore'),
    path('recycle-bin/<int:pk>/purge/', RecycleBinPurgeView.as_view(), name='recycle-bin-purge'),
    path('recycle-bin/empty/', RecycleBinEmptyView.as_view(), name='recycle-bin-empty'),
    path('system/backup/', SystemBackupView.as_view(), name='system-backup'),
    path('system/import/', SystemImportView.as_view(), name='system-import'),
]