"""
Shop models for Custom Print Studio.
Designed to be extensible for multiple product types.
"""
import uuid
from django.db import models


class Product(models.Model):
    """
    Abstract base product model.
    Extensible for different product types (clothing, tarpaulin, DTF, etc.)
    """
    PRODUCT_TYPES = [
        ('photo_print', 'Photo Print'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPES, default='clothing')
    thumbnail = models.ImageField(upload_to='products/thumbnails/', blank=True, null=True)
    mockup_image = models.ImageField(upload_to='products/mockups/', blank=True, null=True, 
                                     help_text="Base mockup image for the editor")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Configurable attributes as JSON for flexibility
    # Example: {"canvas_width": 500, "canvas_height": 600, "print_area": {"x": 100, "y": 100, "width": 300, "height": 400}}
    config = models.JSONField(default=dict, blank=True, 
                              help_text="Product-specific configuration (dimensions, print area, etc.)")
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_product_type_display()})"


    @property
    def total_price(self):
        return self.product.base_price + self.price_adjustment


class PhotoPrintVariant(models.Model):
    """
    Variant model for photo print products (size, stock).
    """
    SIZE_CHOICES = [
        ('2x3', '2x3 (Wallet)'),
        ('3R', '3.5x5 (3R)'),
        ('4R', '4x6 (4R)'),
        ('5R', '5x7 (5R)'),
        ('6R', '6x8 (6R)'),
        ('8R', '8x10 (8R)'),
        ('A4', '8.27x11.69 (A4)'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='photo_variants')
    size = models.CharField(max_length=10, choices=SIZE_CHOICES)
    stock_quantity = models.PositiveIntegerField(default=999)
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['product', 'size']
        ordering = ['size']
    
    def __str__(self):
        return f"{self.product.name} - {self.size}"
    
    @property
    def total_price(self):
        return self.product.base_price + self.price_adjustment


class CustomDesign(models.Model):
    """
    Stores custom designs created by users.
    Contains Fabric.js canvas data and preview image.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='designs')
    design_config = models.JSONField(help_text="Fabric.js canvas JSON data")
    preview_image = models.ImageField(upload_to='designs/previews/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Design for {self.product.name} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"


class Order(models.Model):
    """
    Order model for guest checkout.
    Stores customer info and order items as JSON.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Customer info (guest checkout)
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField(blank=True, default='')
    customer_phone = models.CharField(max_length=20, blank=True, default='')
    shipping_address = models.TextField(blank=True, default='')
    
    # Order items stored as JSON for flexibility
    # Structure: [
    #   {
    #     "product_id": "uuid",
    #     "product_type": "clothing",
    #     "variant_id": "uuid",
    #     "design_id": "uuid",
    #     "quantity": 2,
    #     "unit_price": "29.99",
    #     "total_price": "59.98",
    #     "design_preview_url": "..."
    #   }
    # ]
    items = models.JSONField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Payment (manual GCash — no automated gateway)
    stripe_payment_intent_id = models.CharField(max_length=100, blank=True, null=True)
    payment_status = models.CharField(max_length=20, default='pending')
    
    # Order status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Tracking
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.id.hex[:8]} - {self.customer_name}"
