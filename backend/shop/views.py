"""
API views for the shop app.
"""
import json
import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Product, PhotoPrintVariant, CustomDesign, Order
from .serializers import (
    ProductListSerializer, ProductDetailSerializer,
    PhotoPrintVariantSerializer, CustomDesignSerializer, OrderSerializer
)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for products.
    Supports filtering by product_type.
    """
    queryset = Product.objects.filter(is_active=True)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductDetailSerializer
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        product_type = self.request.query_params.get('type')
        if product_type:
            queryset = queryset.filter(product_type=product_type)
        return queryset
    
    @action(detail=True, methods=['get'])
    def variants(self, request, pk=None):
        """Get variants for a specific product."""
        product = self.get_object()
        
        # For photo print products, return photo variants
        if product.product_type == 'photo_print':
            variants = product.photo_variants.filter(is_active=True)
            serializer = PhotoPrintVariantSerializer(variants, many=True)
            return Response(serializer.data)
        
        return Response([])


class CustomDesignViewSet(viewsets.ModelViewSet):
    """
    ViewSet for custom designs.
    """
    queryset = CustomDesign.objects.all()
    serializer_class = CustomDesignSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def create(self, request):
        """Create a new custom design."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        design = serializer.save()
        
        return Response(
            self.get_serializer(design, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for orders.
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        """Only allow admin to see all orders."""
        if self.request.user.is_staff:
            return Order.objects.all()
        # For non-admin, return empty (guest checkout doesn't track by user)
        return Order.objects.none()
    
    def create(self, request):
        """Create a new order (manual GCash flow)."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Calculate total from items
        items = serializer.validated_data.get('items', [])
        total = sum(
            float(item.get('total_price', 0))
            for item in items
        )

        # Create order
        order = Order.objects.create(
            customer_name=serializer.validated_data['customer_name'],
            customer_email=serializer.validated_data.get('customer_email', ''),
            customer_phone=serializer.validated_data.get('customer_phone', ''),
            shipping_address=serializer.validated_data.get('shipping_address', ''),
            items=items,
            total_amount=total
        )

        return Response(
            self.get_serializer(order).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update order status (admin only)."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
            return Response(self.get_serializer(order).data)
        
        return Response(
            {'error': 'Invalid status'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
def create_payment_intent(request):
    """
    Create a Stripe PaymentIntent for an order.
    """
    try:
        data = request.data
        amount = data.get('amount', 0)
        order_id = data.get('order_id')
        
        payment_intent = stripe.PaymentIntent.create(
            amount=int(float(amount) * 100),  # Convert to cents
            currency='php',
            payment_method_types=['card', 'gcash'],
            metadata={'order_id': order_id} if order_id else {}
        )
        
        return Response({
            'client_secret': payment_intent.client_secret,
            'payment_intent_id': payment_intent.id
        })
        
    except stripe.error.StripeError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
def stripe_webhook(request):
    """
    Handle Stripe webhooks for payment confirmation.
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return JsonResponse({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError:
        return JsonResponse({'error': 'Invalid signature'}, status=400)
    
    # Handle payment success
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        order_id = payment_intent['metadata'].get('order_id')
        
        if order_id:
            try:
                order = Order.objects.get(id=order_id)
                order.payment_status = 'paid'
                order.status = 'paid'
                order.save()
            except Order.DoesNotExist:
                pass
    
    # Handle payment failure
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        order_id = payment_intent['metadata'].get('order_id')
        
        if order_id:
            try:
                order = Order.objects.get(id=order_id)
                order.payment_status = 'failed'
                order.save()
            except Order.DoesNotExist:
                pass
    
    return JsonResponse({'status': 'success'})
