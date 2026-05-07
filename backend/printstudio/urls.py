"""
URL configuration for printstudio project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from shop import admin_views

urlpatterns = [
    path('', RedirectView.as_view(url='/admin/', permanent=False)),
    path('admin/dashboard/', admin_views.admin_dashboard, name='admin-dashboard'),
    path('admin/transactions/', admin_views.transaction_lobby, name='admin-transactions'),
    path('admin/', admin.site.urls),
    path('api/', include('shop.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
