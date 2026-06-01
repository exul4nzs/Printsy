"""
API views for the shop app.
"""
from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import CustomDesign, Order, PhotoPrintVariant, Product
from .patterns import OrderFactory
from .permissions import IsAdminRole
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
    - List/Retrieve/Update/Delete: admin role required (via IsAdminRole).
    - Create: open to any authenticated or guest request (handled below).
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        """Only allow admin to see all orders."""
        role = getattr(getattr(self.request.user, 'profile', None), 'role', None)
        if role == 'admin':
            return Order.objects.all()
        return Order.objects.none()

    def create(self, request):
        """
        Create a new order using Factory Pattern.
        Open to any user (authenticated or guest).
        Bypasses IsAdminRole by not requiring it for POST.
        """
        # Temporarily allow the create action for everyone
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

    def get_permissions(self):
        """
        Allow unauthenticated POST (order creation),
        but require IsAdminRole for all other actions.
        """
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminRole()]

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update order status (admin only — protected by IsAdminRole)."""
        order = self.get_object()
        new_status = request.data.get('status')

        valid_statuses = [s[0] for s in Order.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Choose from: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = new_status
        order.save()
        return Response(self.get_serializer(order).data)


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