from django.urls import include, path
from rest_framework.routers import DefaultRouter

from tourism.views import TourismRecordViewSet, VisitorViewSet

router = DefaultRouter()
router.register(r'records', TourismRecordViewSet, basename='records')
router.register(r'visitors', VisitorViewSet, basename='visitors')

urlpatterns = [
    path('', include(router.urls)),
]