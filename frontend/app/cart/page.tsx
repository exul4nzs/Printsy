'use client';

import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCartStore();

  return (
    <div className="min-h-screen bg-off-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-warm-gray-900 mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-warm-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-warm-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-warm-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-warm-gray-600 mb-6">
              Browse our products and start designing your custom prints!
            </p>
            <Link href="/" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="card p-4 flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-warm-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                    {item.product.thumbnail ? (
                      <Image
                        src={item.product.thumbnail}
                        alt={item.product.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-warm-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-warm-gray-900">
                      {item.product.name}
                    </h3>
                    {item.variant && (
                      <p className="text-xs text-warm-gray-500">
                        {item.variant.size}
                      </p>
                    )}
                    {item.customerPhotos && item.customerPhotos.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {item.customerPhotos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Uploaded photo ${idx + 1}`}
                            className="w-12 h-12 rounded-lg object-cover border border-warm-gray-200"
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-warm-gray-100 flex items-center justify-center hover:bg-warm-gray-200 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-warm-gray-100 flex items-center justify-center hover:bg-warm-gray-200 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price & Remove */}
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-warm-gray-900">
                          {formatPrice(item.total_price)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-warm-gray-900 mb-4">
                  Order Summary
                </h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-warm-gray-600">
                    <span>Items ({itemCount})</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-warm-gray-600">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-warm-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-warm-gray-900">Subtotal</span>
                    <span className="text-accent">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/"
                  className="btn-outline w-full mt-3 block text-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
