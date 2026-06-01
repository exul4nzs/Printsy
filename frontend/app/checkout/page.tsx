'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { createCheckoutSession } from '@/lib/api';
import {
  Loader2,
  AlertTriangle,
  MapPin,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

function CheckoutContent() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
  });

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.total_price, 0),
    [items],
  );

  const handleCheckout = async () => {
    if (!formData.customer_name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.customer_email && !formData.customer_phone) {
      setError('Please enter an email or phone number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderItems = items.map((item) => ({
        size: item.variant?.size || '4R',
        quantity: item.quantity,
        design_id: item.design?.id || '',
        photo: item.customerPhotos?.[0] || '',
      }));

      const result = await createCheckoutSession({
        items: orderItems,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        shipping_address: formData.shipping_address,
      });

      // Clear cart before redirecting to Stripe
      clearCart();

      // Redirect to Stripe Checkout
      window.location.href = result.checkout_url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      const msg =
        err?.response?.data?.error ||
        'Unable to start checkout. Please make sure the backend is running and try again.';
      setError(msg);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-off-white">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-warm-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-warm-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-warm-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-warm-gray-600 mb-6">
            Upload a photo and add a print to your cart to checkout.
          </p>
          <Link href="/editor" className="btn-primary">
            Start Printing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-warm-gray-900 mb-8">Checkout</h1>

        <div className="mb-6 space-y-3">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              Our prints are <strong>Instax-inspired</strong>, not actual Instax film. Please upload
              high-quality photos for the best print results.
            </p>
          </div>
          <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/20 rounded-xl">
            <MapPin className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <p className="text-sm text-warm-gray-700">
              Currently serving <strong>Surigao City</strong> only. Pickup or local delivery is
              arranged after payment confirmation.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left — Customer info */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-warm-gray-900 mb-6">Your Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customer_name: e.target.value }))
                    }
                    className="input"
                    placeholder="Juan Dela Cruz"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customer_email: e.target.value }))
                    }
                    className="input"
                    placeholder="juan@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customer_phone: e.target.value }))
                    }
                    className="input"
                    placeholder="0912 345 6789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-gray-700 mb-1">
                    Pickup / Delivery Notes
                  </label>
                  <textarea
                    value={formData.shipping_address}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, shipping_address: e.target.value }))
                    }
                    className="input min-h-[80px] resize-y"
                    placeholder="Surigao City, near … (pickup or delivery instructions)"
                  />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-warm-gray-900">Secure Payment</h2>
              </div>
              <p className="text-sm text-warm-gray-600 mb-4">
                You&apos;ll be redirected to Stripe Checkout to complete payment. We accept credit
                cards, GCash, and other local payment methods.
              </p>
              <div className="flex items-center gap-2 text-xs text-warm-gray-500">
                <ShieldCheck className="w-4 h-4" />
                <span>Payments are processed securely by Stripe. We never store your card details.</span>
              </div>
            </div>
          </div>

          {/* Right — Order summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-warm-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-4 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="pb-4 border-b border-warm-gray-100 last:border-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-warm-gray-900">
                        {item.product.name}
                      </span>
                      <span className="font-medium text-warm-gray-900">
                        {formatPrice(item.total_price)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-warm-gray-500 mb-2">
                      <span>
                        {item.variant?.size || 'Standard'} × {item.quantity}
                      </span>
                    </div>
                    {item.customerPhotos && item.customerPhotos.length > 0 && (
                      <div className="flex gap-2">
                        {item.customerPhotos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Photo ${idx + 1}`}
                            className="w-14 h-14 rounded-lg object-cover border border-warm-gray-200"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-warm-gray-200 pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-warm-gray-900">Total</span>
                  <span className="text-accent">{formatPrice(total)}</span>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleCheckout}
                    disabled={loading || !formData.customer_name.trim()}
                    className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Redirecting to payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay {formatPrice(total)}
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-warm-gray-400 text-center mt-3">
                  By placing this order, you agree to our terms. You&apos;ll be redirected to Stripe
                  to complete payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-off-white">
          <Header />
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
            <p className="text-warm-gray-600">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
