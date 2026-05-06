"""
URL configuration for the shop app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, views_auth

# Create a router for viewsets
router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'designs', views.CustomDesignViewSet, basename='design')
router.register(r'orders', views.OrderViewSet, basename='order')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Auth endpoints
    path('auth/login/', views_auth.login_view, name='login'),
    path('auth/user/', views_auth.user_profile_view, name='user-profile'),
    
    # Payment info endpoint
    path('payment-info/', views.payment_info, name='payment-info'),
]
