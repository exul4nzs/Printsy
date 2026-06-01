"""
URL configuration for the shop app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, views_auth, views_admin, views_payments, views_ai, admin_views

# Create a router for viewsets
router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'designs', views.CustomDesignViewSet, basename='design')
router.register(r'orders', views.OrderViewSet, basename='order')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),

    # Admin dashboard views
    path('admin/dashboard/', admin_views.admin_dashboard, name='admin-dashboard'),
    path('admin/transactions/', admin_views.transaction_lobby, name='admin-transactions'),

    # Auth endpoints
    path('auth/login/', views_auth.login_view, name='login'),
    path('auth/user/', views_auth.user_profile_view, name='user-profile'),

    # Payment endpoints
    path('payment-info/', views.payment_info, name='payment-info'),
    path('payments/create-checkout/', views_payments.create_checkout_session, name='create-checkout'),
    path('payments/webhook/', views_payments.StripeWebhookView.as_view(), name='stripe-webhook'),

    # Admin API endpoints
    path('admin/orders/', views_admin.admin_orders_list, name='admin-orders-list'),
    path('admin/orders/<uuid:pk>/', views_admin.admin_order_update, name='admin-order-update'),
    path('admin/stats/', views_admin.admin_stats, name='admin-stats'),

    # AI endpoints
    path('ai/enhance-image/', views_ai.enhance_image, name='enhance-image'),
    path('ai/analyze-quality/', views_ai.analyze_image_quality, name='analyze-quality'),
    path('ai/enhancement-options/', views_ai.get_enhancement_options, name='enhancement-options'),
]
