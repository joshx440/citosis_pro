from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView

from citosis_pro.views import index
from accounts.views import SetPasswordView

urlpatterns = [
    path('favicon.ico', RedirectView.as_view(url=f'{settings.STATIC_URL}favicon.ico', permanent=False), name='favicon'),
    path('set-password/<uidb64>/<token>/', SetPasswordView.as_view(), name='set-password'),
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/', include('tourism.urls')),
    path('api/', include('audit.urls')),
    path('', index, name='home'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
