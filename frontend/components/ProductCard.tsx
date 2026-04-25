'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product, PhotoPrintProduct } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product | PhotoPrintProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Calculate price range from variants if available
  const getPriceDisplay = () => {
    // Check if this is a photo print product with variants
    const photoProduct = product as PhotoPrintProduct;
    if (photoProduct.photo_variants && photoProduct.photo_variants.length > 0) {
      const prices = photoProduct.photo_variants.map(v => v.total_price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      if (minPrice === maxPrice) {
        return (
          <span className="text-accent font-bold text-lg">
            {formatPrice(minPrice)}
          </span>
        );
      }

      return (
        <div className="flex flex-col">
          <span className="text-xs text-warm-gray-500">Starting at</span>
          <span className="text-accent font-bold text-lg">
            {formatPrice(minPrice)}
          </span>
        </div>
      );
    }

    // Fallback to base_price or starting_price for placeholder/API products
    const price = (product as any).starting_price ?? product.base_price ?? 0;
    return (
      <span className="text-accent font-bold text-lg">
        {formatPrice(price)}
      </span>
    );
  };

  return (
    <div className="card card-hover group">
      <div className="aspect-square relative overflow-hidden rounded-t-2xl bg-warm-gray-100">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent/5">
            <Image
              src="/logo.png"
              alt="Placeholder"
              width={120}
              height={120}
              className="opacity-20 grayscale"
            />
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-lg text-warm-gray-900 mb-1">
          {product.name}
        </h3>
        <p className="text-warm-gray-500 text-sm line-clamp-2 mb-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          {getPriceDisplay()}
          <Link
            href={`/product/${product.id}`}
            className="btn-primary text-sm py-2 px-4"
          >
            Order Print
          </Link>
        </div>
      </div>
    </div>
  );
}
