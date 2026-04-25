"""
Admin configuration for shop models.
"""
from django.contrib import admin
from .models import Product, PhotoPrintVariant, CustomDesign, Order


class PhotoPrintVariantInline(admin.TabularInline):
    """Inline admin for photo print variants."""
    model = PhotoPrintVariant
    extra = 1
    fields = ['size', 'stock_quantity', 'price_adjustment', 'is_active']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin for products."""
    list_display = ['name', 'product_type', 'base_price', 'is_active', 'created_at']
    list_filter = ['product_type', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [PhotoPrintVariantInline]
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'product_type', 'is_active')
        }),
        ('Pricing', {
            'fields': ('base_price',)
        }),
        ('Images', {
            'fields': ('thumbnail', 'mockup_image')
        }),
        ('Configuration', {
            'fields': ('config',),
            'description': 'JSON configuration for product-specific settings (canvas dimensions, print area, etc.)'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PhotoPrintVariant)
class PhotoPrintVariantAdmin(admin.ModelAdmin):
    """Admin for photo print variants."""
    list_display = ['product', 'size', 'stock_quantity', 'total_price', 'is_active']
    list_filter = ['size', 'is_active', 'product']
    search_fields = ['product__name']
    list_select_related = ['product']


@admin.register(CustomDesign)
class CustomDesignAdmin(admin.ModelAdmin):
    """Admin for custom designs."""
    list_display = ['product', 'created_at', 'has_preview']
    list_filter = ['created_at', 'product']
    readonly_fields = ['created_at', 'preview_image_display']
    
    def has_preview(self, obj):
        return bool(obj.preview_image)
    has_preview.boolean = True
    has_preview.short_description = 'Has Preview'
    
    def preview_image_display(self, obj):
        """Display preview image in admin."""
        if obj.preview_image:
            return f'<img src="{obj.preview_image.url}" style="max-width: 300px; max-height: 300px;" />'
        return 'No preview available'
    preview_image_display.allow_tags = True
    preview_image_display.short_description = 'Preview'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin for orders."""
    list_display = ['id_short', 'customer_name', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at', 'payment_status']
    search_fields = ['customer_name', 'customer_email', 'customer_phone']
    readonly_fields = ['created_at', 'updated_at', 'stripe_payment_intent_id']
    fields = [
        'customer_name', 'customer_email', 'customer_phone', 'shipping_address',
        'items_display', 'total_amount', 'status', 'payment_status',
        'stripe_payment_intent_id', 'tracking_number', 'created_at', 'updated_at'
    ]
    
    def id_short(self, obj):
        return obj.id.hex[:8]
    id_short.short_description = 'Order ID'
    
    def items_display(self, obj):
        """Display order items in a readable format."""
        items = obj.items
        if not items:
            return 'No items'
        
        html = '<table style="width:100%; border-collapse: collapse;">'
        html += '<tr style="background:#f0f0f0;"><th style="padding:8px;border:1px solid #ccc;">Product</th>'
        html += '<th style="padding:8px;border:1px solid #ccc;">Variant</th>'
        html += '<th style="padding:8px;border:1px solid #ccc;">Qty</th>'
        html += '<th style="padding:8px;border:1px solid #ccc;">Price</th></tr>'
        
        for item in items:
            html += f'<tr><td style="padding:8px;border:1px solid #ccc;">{item.get("product_type", "N/A")}</td>'
            html += f'<td style="padding:8px;border:1px solid #ccc;">{item.get("variant_id", "N/A")}</td>'
            html += f'<td style="padding:8px;border:1px solid #ccc;">{item.get("quantity", 0)}</td>'
            html += f'<td style="padding:8px;border:1px solid #ccc;">${item.get("total_price", 0)}</td></tr>'
        
        html += '</table>'
        return html
    items_display.allow_tags = True
    items_display.short_description = 'Order Items'
