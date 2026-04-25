# Extensibility Guide: Adding New Product Types

This document explains how to add new product types to the Custom Print Studio without breaking existing functionality.

## Architecture Overview

The system uses a **polymorphic product model** approach:

1. **Backend**: Single `Product` model with a `product_type` field and JSON `config` field
2. **Frontend**: Dynamic configurator component selection based on `product_type`

## Steps to Add a New Product Type (Example: Tarpaulin)

### 1. Backend: Add the Product Type

**File**: `backend/shop/models.py`

Add the new type to the `PRODUCT_TYPES` choices:

```python
PRODUCT_TYPES = [
    ('clothing', 'Clothing'),
    ('tarpaulin', 'Tarpaulin'),  # Add new type
    ('dtf', 'DTF Transfer'),
    ('sticker', 'Sticker'),
    ('mug', 'Mug'),
]
```

### 2. Backend: Create Variant Model (Optional)

If your product type needs variants (sizes, materials, etc.), create a variant model:

```python
class TarpaulinVariant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='tarpaulin_variants')
    width = models.DecimalField(max_digits=6, decimal_places=2, help_text="Width in feet")
    height = models.DecimalField(max_digits=6, decimal_places=2, help_text="Height in feet")
    material = models.CharField(max_length=50)
    price_per_sqft = models.DecimalField(max_digits=6, decimal_places=2)
    
    @property
    def total_price(self):
        area = self.width * self.height
        return self.product.base_price + (area * self.price_per_sqft)
```

Register it in `admin.py` similar to `ClothingVariant`.

### 3. Backend: Update API Views

**File**: `backend/shop/views.py`

Update the `variants` action in `ProductViewSet`:

```python
@action(detail=True, methods=['get'])
def variants(self, request, pk=None):
    product = self.get_object()
    
    if product.product_type == 'clothing':
        variants = product.clothing_variants.filter(is_active=True)
        serializer = ClothingVariantSerializer(variants, many=True)
        return Response(serializer.data)
    
    elif product.product_type == 'tarpaulin':  # Add new condition
        variants = product.tarpaulin_variants.all()
        serializer = TarpaulinVariantSerializer(variants, many=True)
        return Response(serializer.data)
    
    return Response([])
```

### 4. Backend: Create Serializer

**File**: `backend/shop/serializers.py`

```python
class TarpaulinVariantSerializer(serializers.ModelSerializer):
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = TarpaulinVariant
        fields = ['id', 'width', 'height', 'material', 'price_per_sqft', 'total_price']
```

### 5. Frontend: Update Types

**File**: `frontend/types/index.ts`

```typescript
export type ProductType = 'clothing' | 'tarpaulin' | 'dtf' | 'sticker' | 'mug';

export interface TarpaulinProduct extends Product {
  product_type: 'tarpaulin';
  tarpaulin_variants: TarpaulinVariant[];
}

export interface TarpaulinVariant {
  id: string;
  width: number;
  height: number;
  material: string;
  price_per_sqft: number;
  total_price: number;
}
```

### 6. Frontend: Create Configurator Component

**File**: `frontend/components/configurators/TarpaulinConfigurator.tsx`

```typescript
'use client';

import { TarpaulinProduct, TarpaulinVariant } from '@/types';

interface TarpaulinConfiguratorProps {
  product: TarpaulinProduct;
  onVariantSelect: (variant: TarpaulinVariant) => void;
  onFileUpload: (file: File) => void;
}

export default function TarpaulinConfigurator({
  product,
  onVariantSelect,
  onFileUpload,
}: TarpaulinConfiguratorProps) {
  return (
    <div className="space-y-6">
      {/* File upload for design */}
      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Upload Design</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])}
          className="input"
        />
        <p className="text-sm text-warm-gray-500 mt-2">
          Upload a high-resolution image (PNG, JPG, PDF)
        </p>
      </div>
      
      {/* Size selection */}
      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Select Size</h3>
        {/* Add your size selection UI */}
      </div>
    </div>
  );
}
```

### 7. Frontend: Register Configurator

**File**: `frontend/app/product/[id]/page.tsx` (or a configurator registry file)

Create a configurator registry:

```typescript
// frontend/lib/configurators.ts
import { Product, ProductType } from '@/types';

// Import configurator components
const ClothingConfigurator = dynamic(() => import('@/components/ClothingConfigurator'));
const TarpaulinConfigurator = dynamic(() => import('@/components/TarpaulinConfigurator'));

export const configuratorMap: Record<ProductType, React.ComponentType<any>> = {
  clothing: ClothingConfigurator,
  tarpaulin: TarpaulinConfigurator,
  dtf: PlaceholderConfigurator,
  sticker: PlaceholderConfigurator,
  mug: PlaceholderConfigurator,
};
```

Then use it in the product page:

```typescript
import { configuratorMap } from '@/lib/configurators';

// In your component:
const Configurator = configuratorMap[product.product_type];
return <Configurator product={product} {...otherProps} />;
```

### 8. Update Cart Store (if needed)

If the new product type requires different cart item structure, update the types in `frontend/types/index.ts`:

```typescript
export interface CartItem {
  id: string;
  product: Product;
  variant?: ClothingVariant | TarpaulinVariant;  // Union type
  design?: CustomDesign | FileUpload;  // Union type for different design types
  quantity: number;
  unit_price: number;
  total_price: number;
}
```

### 9. Update Checkout

Ensure the order creation in `frontend/app/checkout/page.tsx` handles the new product type:

```typescript
const orderItems = items.map((item) => ({
  product_id: item.product.id,
  product_type: item.product.product_type,
  variant_id: item.variant?.id,
  design_id: item.design?.id,
  dimensions: item.product.product_type === 'tarpaulin' 
    ? { width: item.variant?.width, height: item.variant?.height }
    : undefined,
  quantity: item.quantity,
  unit_price: item.unit_price,
  total_price: item.total_price,
}));
```

## Design Considerations

### For Non-Canvas Products (Tarpaulin, Stickers)

- **File Upload Only**: Simple file upload + dimension fields
- **No Real-time Preview**: May not need Fabric.js
- **Different Design Storage**: Store file URL instead of canvas JSON

### For Canvas-Based Products (Mugs, Phone Cases)

- **Use Fabric.js Canvas**: Similar to clothing but with different mockup
- **Curved/3D Mockups**: May need SVG path-based print areas
- **Different Aspect Ratios**: Configure in product `config` field

## Testing Checklist

- [ ] Product appears in gallery with correct filtering
- [ ] Configurator loads correctly for the product type
- [ ] Variants display and select properly
- [ ] Price calculations are correct
- [ ] Design/file uploads work
- [ ] Cart displays items correctly
- [ ] Checkout processes the order
- [ ] Admin panel shows product and variants correctly
- [ ] Order items JSON includes all necessary metadata

## Migration Notes

When adding a new product type to an existing production database:

1. **Database Migration**: Create migration for new variant model
2. **Seed Data**: Create initial products through admin or data migration
3. **Media Files**: Upload product mockup images to `media/products/mockups/`
4. **Product Config**: Set appropriate `config` JSON for canvas dimensions

## Future Enhancements

Consider these for even more extensibility:

1. **Plugin System**: Load configurators dynamically from plugins
2. **Product Templates**: Pre-configured product templates for quick setup
3. **Automated Pricing Rules**: JSON-based pricing formulas
4. **Production Workflows**: Product-type specific order processing pipelines
