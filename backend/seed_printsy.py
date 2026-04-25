import os
import django
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'printstudio.settings')
django.setup()

from shop.models import Product, PhotoPrintVariant

def seed():
    # 1. Mini Album Keychain
    k, created = Product.objects.get_or_create(
        name="Mini Album Keychain",
        defaults={
            "description": "A pocket-sized memory you can carry anywhere. Perfect for family photos.",
            "base_price": 150.00,
            "product_type": "photo_print",
            "config": {"canvas_width": 500, "canvas_height": 500}
        }
    )
    if not created:
        k.base_price = 150.00
        k.save()

    PhotoPrintVariant.objects.get_or_create(
        product=k,
        size='Standard',
        defaults={"stock_quantity": 999, "price_adjustment": 0}
    )

    # 2. Premium Photo Prints
    p, created = Product.objects.get_or_create(
        name="Premium Photo Print",
        defaults={
            "description": "High-quality glossy or matte prints for your memories.",
            "base_price": 10.00,
            "product_type": "photo_print",
            "config": {"canvas_width": 1000, "canvas_height": 1000}
        }
    )
    
    sizes = [
        ('2x3', 5.00),
        ('3R', 7.00),
        ('4R', 10.00),
        ('5R', 15.00),
        ('8R', 35.00),
        ('A4', 50.00),
    ]

    for size, price in sizes:
        PhotoPrintVariant.objects.get_or_create(
            product=p,
            size=size,
            defaults={
                "stock_quantity": 999,
                "price_adjustment": price - 10.00
            }
        )

    print("Printsy seeded with Mini Album Keychain and Photo Prints!")

if __name__ == "__main__":
    seed()
