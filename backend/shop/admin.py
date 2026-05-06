"""
Admin configuration for shop models.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.contrib import messages
from .models import Product, PhotoPrintVariant, CustomDesign, Order, AuditLog
from .telegram import telegram_service


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
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 300px;" />',
                obj.preview_image.url
            )
        return 'No preview available'
    preview_image_display.short_description = 'Preview'


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Admin for audit logs."""
    list_display = ['action', 'order_short', 'created_at', 'details_short']
    list_filter = ['action', 'created_at']
    search_fields = ['action', 'details', 'order__id']
    readonly_fields = ['order', 'action', 'details', 'created_at']
    
    def order_short(self, obj):
        if obj.order:
            return obj.order.id.hex[:8].upper()
        return 'N/A'
    order_short.short_description = 'Order ID'
    
    def details_short(self, obj):
        return obj.details[:50] + '...' if len(obj.details) > 50 else obj.details
    details_short.short_description = 'Details'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin for orders with Telegram integration and custom actions."""
    list_display = [
        'id_short', 'customer_name', 'total_amount', 
        'status_badge', 'payment_badge', 'created_at'
    ]
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['customer_name', 'customer_email', 'customer_phone', 'id']
    readonly_fields = ['created_at', 'updated_at', 'items_display', 'telegram_sent_display', 'customer_photos_display']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    actions = [
        'mark_as_paid', 
        'mark_as_processing', 
        'mark_as_shipped', 
        'mark_as_delivered',
        'mark_as_cancelled',
        'resend_telegram_notification', 
        'export_to_csv'
    ]
    
    fieldsets = (
        ('Customer Information', {
            'fields': ('customer_name', 'customer_email', 'customer_phone', 'shipping_address')
        }),
        ('Order Details', {
            'fields': ('items_display', 'total_amount', 'customer_photos_display')
        }),
        ('Status & Payment', {
            'fields': ('status', 'payment_status', 'tracking_number')
        }),
        ('System Info', {
            'fields': ('telegram_sent_display', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def id_short(self, obj):
        return obj.id.hex[:8].upper()
    id_short.short_description = 'Order ID'
    
    def status_badge(self, obj):
        colors = {
            'pending': '#FFA500',
            'paid': '#28A745',
            'processing': '#17A2B8',
            'shipped': '#6F42C1',
            'delivered': '#1E7E34',
            'cancelled': '#DC3545'
        }
        color = colors.get(obj.status, '#6C757D')
        from django.utils.safestring import mark_safe
        return mark_safe(
            f'<span style="background-color: {color}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; min-width: 80px; display: inline-block; text-align: center;">{obj.status.upper()}</span>'
        )
    status_badge.short_description = 'Order Status'

    def payment_badge(self, obj):
        color = '#28A745' if obj.payment_status == 'paid' else '#DC3545'
        from django.utils.safestring import mark_safe
        return mark_safe(
            f'<span style="color: {color}; font-weight: bold; font-size: 11px;">● {obj.payment_status.upper()}</span>'
        )
    payment_badge.short_description = 'Payment'
    
    def telegram_sent_display(self, obj):
        from django.utils.safestring import mark_safe
        return mark_safe('<span style="color: green; font-weight: bold;">✅ Auto-sent on creation</span>')
    telegram_sent_display.short_description = 'Telegram Notification'
    
    def customer_photos_display(self, obj):
        """Display customer uploaded photos."""
        if not obj.items:
            return 'No photos uploaded'
        
        photos_html = ''
        for i, item in enumerate(obj.items):
            photos = item.get('customer_photos', [])
            if photos:
                photos_html += '<div style="margin-bottom: 10px;"><strong>Item {}:</strong></div>'.format(i + 1)
                for photo_url in photos[:10]:  # Show max 10 photos
                    photos_html += f'<img src="{photo_url}" style="max-width: 250px; max-height: 250px; margin: 5px; border: 2px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />'
        
        if not photos_html:
            return 'No photos uploaded'
        
        from django.utils.safestring import mark_safe
        return mark_safe(photos_html)
    customer_photos_display.short_description = 'Customer Photos'
    
    def items_display(self, obj):
        """Display order items in a readable format."""
        items = obj.items
        if not items:
            return format_html('<em>No items</em>')
        
        html = '<table style="width:100%; border-collapse: collapse; border: 1px solid #ddd; font-family: sans-serif;">'
        html += '<tr style="background-color: #f3f4f6;">'
        html += '<th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Product</th>'
        html += '<th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Variant</th>'
        html += '<th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Qty</th>'
        html += '<th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Price</th></tr>'
        
        for item in items:
            html += '<tr>'
            html += '<td style="padding: 12px; border: 1px solid #ddd;">{}</td>'.format(item.get("product_type", "N/A").replace('_', ' ').title())
            html += '<td style="padding: 12px; border: 1px solid #ddd;">{}</td>'.format(item.get("variant_id", "N/A"))
            html += '<td style="padding: 12px; border: 1px solid #ddd; text-align: center;">{}</td>'.format(item.get("quantity", 0))
            html += '<td style="padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: bold;">₱{}</td>'.format(item.get("total_price", 0))
            html += '</tr>'
        
        html += '<tr style="background-color: #f3f4f6; font-weight: bold;">'
        html += '<td colspan="3" style="padding: 12px; border: 1px solid #ddd; text-align: right; font-size: 1.1em;">Total Amount:</td>'
        html += '<td style="padding: 12px; border: 1px solid #ddd; text-align: right; font-size: 1.2em; color: #b91c1c;">₱{}</td>'.format(obj.total_amount)
        html += '</tr>'
        html += '</table>'
        
        from django.utils.safestring import mark_safe
        return mark_safe(html)
    items_display.short_description = 'Transaction Details'
    
    # Custom Actions
    @admin.action(description='✅ Mark as Paid')
    def mark_as_paid(self, request, queryset):
        for order in queryset:
            order.status = 'paid'
            order.payment_status = 'paid'
            order.save()
        self.message_user(request, f'{queryset.count()} orders marked as Paid.', messages.SUCCESS)
    
    @admin.action(description='⚙️ Mark as Processing')
    def mark_as_processing(self, request, queryset):
        queryset.update(status='processing')
        self.message_user(request, f'{queryset.count()} orders marked as Processing.', messages.SUCCESS)
    
    @admin.action(description='🚚 Mark as Shipped')
    def mark_as_shipped(self, request, queryset):
        queryset.update(status='shipped')
        self.message_user(request, f'{queryset.count()} orders marked as Shipped.', messages.SUCCESS)

    @admin.action(description='🏁 Mark as Delivered / Finished')
    def mark_as_delivered(self, request, queryset):
        queryset.update(status='delivered')
        self.message_user(request, f'{queryset.count()} orders marked as Delivered.', messages.SUCCESS)

    @admin.action(description='❌ Mark as Cancelled')
    def mark_as_cancelled(self, request, queryset):
        queryset.update(status='cancelled')
        self.message_user(request, f'{queryset.count()} orders marked as Cancelled.', messages.WARNING)
    
    @admin.action(description='📱 Resend Telegram notification')
    def resend_telegram_notification(self, request, queryset):
        sent_count = 0
        for order in queryset:
            if telegram_service.send_order_notification(order, action="📱 Manual Resend"):
                sent_count += 1
        
        if sent_count == queryset.count():
            self.message_user(request, f'All {sent_count} Telegram notifications sent successfully.', messages.SUCCESS)
        else:
            self.message_user(request, f'{sent_count} of {queryset.count()} notifications sent.', messages.WARNING)
    
    @admin.action(description='📊 Export to CSV')
    def export_to_csv(self, request, queryset):
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="orders_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Order ID', 'Customer', 'Phone', 'Email', 'Total', 'Status', 'Payment', 'Created'])
        
        for order in queryset:
            writer.writerow([
                order.id.hex[:8].upper(),
                order.customer_name,
                order.customer_phone,
                order.customer_email,
                order.total_amount,
                order.status,
                order.payment_status,
                order.created_at.strftime('%Y-%m-%d %H:%M')
            ])
        
        return response
