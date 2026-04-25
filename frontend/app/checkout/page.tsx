'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useCartStore } from '@/lib/store';
import { createOrder } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Loader2, Check, AlertCircle } from 'lucide-react';

// Stripe imports would go here for actual integration
// import { loadStripe } from '@stripe/stripe-js';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare order items
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        product_type: item.product.product_type,
        variant_id: item.variant?.id,
        design_id: item.design?.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        design_preview_url: item.design?.preview_image_url,
      }));

      // Create order
      const order = await createOrder({
        ...formData,
        items: orderItems,
        total_amount: total,
      });

      setOrderId(order.order.id);
      setOrderComplete(true);
      clearCart();
      
      // In a real implementation with Stripe:
      // 1. Create payment intent
      // 2. Redirect to Stripe checkout or show payment form
      // 3. Handle webhook confirmation
      
    } catch (err) {
      setError('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-off-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-semibold text-warm-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-warm-gray-600 mb-6">
            Add some items to your cart before checking out.
          </p>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-off-white">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-warm-gray-900 mb-4">
            Order Placed Successfully!
          </h2>
          <p className="text-warm-gray-600 mb-2">
            Thank you for your order. We&apos;ll send you an email confirmation shortly.
          </p>
          {orderId && (
            <p className="text-sm text-warm-gray-500 mb-6">
              Order ID: {orderId}
            </p>
          )}
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-warm-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Customer Information Form */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-warm-gray-900 mb-6">
              Customer Information
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium text-warm-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  required
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="customer_email" className="block text-sm font-medium text-warm-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="customer_email"
                  name="customer_email"
                  required
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="customer_phone" className="block text-sm font-medium text-warm-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="customer_phone"
                  name="customer_phone"
                  required
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="+63 912 345 6789"
                />
              </div>

              <div>
                <label htmlFor="shipping_address" className="block text-sm font-medium text-warm-gray-700 mb-1">
                  Shipping Address *
                </label>
                <textarea
                  id="shipping_address"
                  name="shipping_address"
                  required
                  rows={4}
                  value={formData.shipping_address}
                  onChange={handleInputChange}
                  className="input resize-none"
                  placeholder="Street address, City, Province, ZIP code"
                />
              </div>

              <div className="pt-4">
                <h3 className="font-semibold text-warm-gray-900 mb-4">Payment Method</h3>
                <div className="p-4 bg-warm-gray-50 rounded-xl border border-warm-gray-200">
                  <p className="text-sm text-warm-gray-600 mb-2">
                    <strong>Stripe Checkout</strong> with GCash support
                  </p>
                  <div className="flex items-center gap-2 text-sm text-warm-gray-500">
                    <span className="px-2 py-1 bg-white rounded border">Visa</span>
                    <span className="px-2 py-1 bg-white rounded border">Mastercard</span>
                    <span className="px-2 py-1 bg-white rounded border">GCash</span>
                  </div>
                </div>
                <p className="text-xs text-warm-gray-500 mt-2">
                  Note: This is a demo. In production, Stripe integration would redirect to secure checkout.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Place Order - {formatPrice(total)}</>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-warm-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium text-warm-gray-900">
                        {item.product.name}
                      </span>
                      <span className="text-warm-gray-500 ml-2">
                        x{item.quantity}
                      </span>
                      {item.variant && (
                        <p className="text-xs text-warm-gray-500">
                          {item.variant.size}, {item.variant.color}
                        </p>
                      )}
                    </div>
                    <span className="font-medium text-warm-gray-900">
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-warm-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-warm-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-warm-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>

              <div className="border-t border-warm-gray-200 pt-4 mt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-warm-gray-900">Total</span>
                  <span className="text-accent">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-accent/5 rounded-xl">
                <p className="text-sm text-warm-gray-600">
                  <strong className="text-warm-gray-900">Secure checkout</strong>
                  <br />
                  Your payment information is processed securely through Stripe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
