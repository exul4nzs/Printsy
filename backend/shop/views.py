"""
API views for the shop app.
"""
from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import CustomDesign, Order, PhotoPrintVariant, Product
from .patterns import OrderFactory
from .serializers import (
    CustomDesignSerializer,
    OrderSerializer,
    PhotoPrintVariantSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


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
        """
        Create a new order using Factory Pattern.
        Returns order info + GCash payment instructions.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create order using Factory
        order = OrderFactory.create_order(serializer.validated_data)

        return Response({
            'order': self.get_serializer(order).data,
            'payment_info': {
                'method': 'gcash',
                'gcash_number': settings.GCASH_NUMBER,
                'gcash_name': settings.GCASH_NAME,
                'amount': str(order.total_amount),
                'reference': f'PRINTSY-{order.id.hex[:8].upper()}',
            },
        }, status=status.HTTP_201_CREATED)

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


@api_view(['GET'])
def payment_info(request):
    """
    Return GCash payment info for the frontend.
    """
    return Response({
        'method': 'gcash',
        'gcash_number': settings.GCASH_NUMBER,
        'gcash_name': settings.GCASH_NAME,
    })