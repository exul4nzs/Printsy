"""
Management command to seed the database with sample data.
"""
from django.core.management.base import BaseCommand
from shop.models import Product, ClothingVariant


class Command(BaseCommand):
    help = 'Seed database with sample clothing products'
    
    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')
        
        # Create Classic Cotton T-Shirt
        tshirt, created = Product.objects.get_or_create(
            name='Classic Cotton T-Shirt',
            defaults={
                'description': 'Premium 100% cotton t-shirt perfect for custom prints. Soft, comfortable, and durable.',
                'base_price': 24.99,
                'product_type': 'clothing',
                'config': {
                    'canvas_width': 500,
                    'canvas_height': 600,
                    'print_area': {
                        'x': 150,
                        'y': 100,
                        'width': 200,
                        'height': 250
                    }
                }
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created product: {tshirt.name}'))
            
            # Create variants for t-shirt
            variants = [
                ('S', 'White', '#FFFFFF', 10),
                ('M', 'White', '#FFFFFF', 15),
                ('L', 'White', '#FFFFFF', 12),
                ('XL', 'White', '#FFFFFF', 8),
                ('S', 'Black', '#000000', 10),
                ('M', 'Black', '#000000', 15),
                ('L', 'Black', '#000000', 12),
                ('XL', 'Black', '#000000', 8),
                ('M', 'Navy', '#1e3a5f', 10),
                ('L', 'Navy', '#1e3a5f', 10),
            ]
            
            for size, color, hex_code, stock in variants:
                ClothingVariant.objects.create(
                    product=tshirt,
                    size=size,
                    color=color,
                    color_hex=hex_code,
                    stock_quantity=stock
                )
            
            self.stdout.write(self.style.SUCCESS(f'Created {len(variants)} variants for t-shirt'))
        else:
            self.stdout.write(f'Product already exists: {tshirt.name}')
        
        # Create Athletic Shorts
        shorts, created = Product.objects.get_or_create(
            name='Athletic Performance Shorts',
            defaults={
                'description': 'Lightweight athletic shorts with moisture-wicking fabric. Perfect for sports and casual wear.',
                'base_price': 29.99,
                'product_type': 'clothing',
                'config': {
                    'canvas_width': 500,
                    'canvas_height': 500,
                    'print_area': {
                        'x': 200,
                        'y': 150,
                        'width': 100,
                        'height': 100
                    }
                }
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created product: {shorts.name}'))
            
            # Create variants for shorts
            variants = [
                ('S', 'Black', '#000000', 8),
                ('M', 'Black', '#000000', 12),
                ('L', 'Black', '#000000', 10),
                ('XL', 'Black', '#000000', 6),
                ('M', 'Gray', '#808080', 10),
                ('L', 'Gray', '#808080', 10),
            ]
            
            for size, color, hex_code, stock in variants:
                ClothingVariant.objects.create(
                    product=shorts,
                    size=size,
                    color=color,
                    color_hex=hex_code,
                    stock_quantity=stock
                )
            
            self.stdout.write(self.style.SUCCESS(f'Created {len(variants)} variants for shorts'))
        else:
            self.stdout.write(f'Product already exists: {shorts.name}')
        
        # Create Premium Hoodie
        hoodie, created = Product.objects.get_or_create(
            name='Premium Pullover Hoodie',
            defaults={
                'description': 'Cozy and warm premium hoodie with kangaroo pocket. Ideal for custom designs and everyday comfort.',
                'base_price': 49.99,
                'product_type': 'clothing',
                'config': {
                    'canvas_width': 600,
                    'canvas_height': 700,
                    'print_area': {
                        'x': 200,
                        'y': 150,
                        'width': 200,
                        'height': 250
                    }
                }
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created product: {hoodie.name}'))
            
            # Create variants for hoodie
            variants = [
                ('M', 'Heather Gray', '#9ca3af', 8),
                ('L', 'Heather Gray', '#9ca3af', 10),
                ('XL', 'Heather Gray', '#9ca3af', 6),
                ('M', 'Black', '#000000', 8),
                ('L', 'Black', '#000000', 10),
                ('XL', 'Black', '#000000', 6),
            ]
            
            for size, color, hex_code, stock in variants:
                ClothingVariant.objects.create(
                    product=hoodie,
                    size=size,
                    color=color,
                    color_hex=hex_code,
                    stock_quantity=stock
                )
            
            self.stdout.write(self.style.SUCCESS(f'Created {len(variants)} variants for hoodie'))
        else:
            self.stdout.write(f'Product already exists: {hoodie.name}')
        
        self.stdout.write(self.style.SUCCESS('Seeding complete!'))
