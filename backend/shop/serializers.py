"""
Serializers for the shop app.
"""
from rest_framework import serializers
from .models import Product, PhotoPrintVariant, CustomDesign, Order




class PhotoPrintVariantSerializer(serializers.ModelSerializer):
    """Serializer for photo print variants."""
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = PhotoPrintVariant
        fields = ['id', 'size', 'stock_quantity', 'price_adjustment', 'total_price', 'is_active']


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product listing."""
    starting_price = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'starting_price', 
                  'product_type', 'thumbnail', 'is_active', 'created_at']


class ProductDetailSerializer(serializers.ModelSerializer):
    photo_variants = PhotoPrintVariantSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'base_price', 'product_type',
                  'thumbnail', 'mockup_image', 'config', 'is_active', 
                  'created_at', 'photo_variants']


class CustomDesignSerializer(serializers.ModelSerializer):
    """Serializer for custom designs."""
    preview_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomDesign
        fields = ['id', 'product', 'design_config', 'preview_image', 
                  'preview_image_url', 'created_at']
        read_only_fields = ['preview_image_url']
    
    def get_preview_image_url(self, obj):
        if obj.preview_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.preview_image.url)
            return obj.preview_image.url
        return None


class OrderItemSerializer(serializers.Serializer):
    """Serializer for individual order items (nested in Order)."""
    product_id = serializers.CharField(required=False, allow_blank=True)
    product_type = serializers.CharField(required=False, allow_blank=True)
    variant_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    design_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    quantity = serializers.IntegerField(min_value=1, default=1)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    design_preview_url = serializers.CharField(required=False, allow_blank=True)
    customer_photos = serializers.ListField(child=serializers.CharField(), required=False, default=list)


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for orders."""
    items = OrderItemSerializer(many=True)
    
    customer_email = serializers.CharField(required=False, allow_blank=True)
    customer_phone = serializers.CharField(required=False, allow_blank=True)
    shipping_address = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Order
        fields = ['id', 'customer_name', 'customer_email', 'customer_phone',
                  'shipping_address', 'items', 'total_amount', 'status',
                  'payment_status', 'stripe_payment_intent_id', 'tracking_number',
                  'created_at', 'updated_at']
        read_only_fields = ['status', 'payment_status', 'stripe_payment_intent_id', 'tracking_number']
    
    def create(self, validated_data):
        from decimal import Decimal
        items_data = validated_data.pop('items')
        # Convert Decimal values to float for JSON serialization
        clean_items = []
        for item in items_data:
            clean_item = {k: float(v) if isinstance(v, Decimal) else v for k, v in item.items()}
            clean_items.append(clean_item)
        order = Order.objects.create(items=clean_items, **validated_data)
        return order

