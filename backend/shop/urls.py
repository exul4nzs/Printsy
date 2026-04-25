"""
URL configuration for the shop app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for viewsets
router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'designs', views.CustomDesignViewSet, basename='design')
router.register(r'orders', views.OrderViewSet, basename='order')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Stripe endpoints
    path('create-payment-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('webhooks/stripe/', views.stripe_webhook, name='stripe-webhook'),
]
