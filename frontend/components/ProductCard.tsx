import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
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
          <span className="text-accent font-bold text-lg">
            {formatPrice(product.base_price)}
          </span>
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
