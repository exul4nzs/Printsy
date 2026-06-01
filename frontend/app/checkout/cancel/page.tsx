'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import { XCircle, RotateCcw, ShoppingBag } from 'lucide-react';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-off-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-warm-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-warm-gray-600">
            Your payment was not completed. No charges were made.
          </p>
        </div>

        <div className="card p-6 mb-6">
          <p className="text-sm text-warm-gray-600 text-center">
            Your items are still in your cart. You can try again whenever you&apos;re ready.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/checkout" className="btn-primary flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Link>
          <Link href="/cart" className="btn-outline flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
