'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { Loader2, Check, Send, Smartphone, AlertTriangle, MapPin } from 'lucide-react';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_contact: '',
  });

  // Build the Telegram message with order summary
  const telegramMessage = useMemo(() => {
    if (!formData.customer_name) return '';
    const lines = [
      `Hi! I would like to place an order with Printsy.`,
      ``,
      `Name: ${formData.customer_name}`,
      `Contact: ${formData.customer_contact}`,
      ``,
      `Order Details:`
    ];
    items.forEach((item) => {
      lines.push(
        `- ${item.product.name} (${item.variant?.size || 'Standard'}) x${item.quantity} = ${formatPrice(item.total_price)}`
      );
    });
    lines.push(`\nTotal: ${formatPrice(total)}`);
    lines.push(`\nI have sent my photos and proof of payment via GCash. 💕📸`);
    return encodeURIComponent(lines.join('\n'));
  }, [items, total, formData]);

  const telegramLink = `https://t.me/hercheysss15?text=${telegramMessage}`;

  const handlePlaceOrder = async () => {
    if (!formData.customer_name || !formData.customer_contact) return;
    setLoading(true);
    // Simulate a brief loading for UX
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setOrderComplete(true);
    clearCart();
  };

  const gcashNumber = '09XX XXX XXXX'; // TODO: replace with actual GCash number

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
            Order Details Ready!
          </h2>
          <p className="text-warm-gray-600 mb-6">
            Your order summary has been prepared. Please send it via Telegram along with your GCash payment proof and photos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send Order on Telegram
            </a>
          </div>
          <p className="text-sm text-warm-gray-500 mt-6">
            You can also email us at <strong>printsy@example.com</strong> with your order details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-warm-gray-900 mb-8">Checkout</h1>

        {/* Disclaimers */}
        <div className="mb-8 space-y-3">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              Our prints are <strong>Instax-inspired</strong>, not actual Instax film. Please send high-quality photos for the best print results.
            </p>
          </div>
          <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/20 rounded-xl">
            <MapPin className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <p className="text-sm text-warm-gray-700">
              Currently serving <strong>Surigao City</strong> only. Pickup or local delivery arranged after order confirmation.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Customer Info & Payment */}
          <div className="space-y-8">
            {/* Customer Info */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-warm-gray-900 mb-6">
                Your Information
              </h2>
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
                    Phone / Telegram / Email *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_contact}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customer_contact: e.target.value }))
                    }
                    className="input"
                    placeholder="0912 345 6789 or @username"
                    required
                  />
                </div>
              </div>
            </div>

            {/* GCash Payment */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-warm-gray-900">
                  Pay with GCash
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-warm-gray-600">
                  Scan the QR code below or send payment to our GCash number. Screenshot your proof of payment — you will need to send it via Telegram to confirm your order.
                </p>

                {/* GCash QR Placeholder */}
                <div className="flex flex-col items-center gap-3 p-6 bg-warm-gray-50 rounded-xl border-2 border-dashed border-warm-gray-200">
                  <div className="relative w-48 h-48 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                    <Image
                      src="/gcash.png"
                      alt="GCash QR Code"
                      fill
                      className="object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="text-center p-4">
                      <p className="text-sm text-warm-gray-500 font-medium">QR Code placeholder</p>
                      <p className="text-xs text-warm-gray-400 mt-1">
                        Drop <code>gcash.png</code> in <code>frontend/public/</code>
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-warm-gray-900">
                    {gcashNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* How to Order */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-warm-gray-900 mb-4">
                How to Complete Your Order
              </h2>
              <ol className="space-y-3 text-sm text-warm-gray-600 list-decimal list-inside">
                <li>
                  <strong>Pay via GCash</strong> — Scan the QR or send to the number above.
                </li>
                <li>
                  <strong>Screenshot your proof of payment</strong> (GCash receipt).
                </li>
                <li>
                  <strong>Save your photos</strong> — Make sure they are high quality for the best print results.
                </li>
                <li>
                  <strong>Click "Send Order on Telegram"</strong> below to open Telegram with your order details already filled in.
                </li>
                <li>
                  <strong>Attach</strong> your photos and GCash proof of payment, then send.
                </li>
              </ol>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-warm-gray-900 mb-4">
                Order Summary
              </h2>

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
                    {/* Photo previews */}
                    {item.customerPhotos && item.customerPhotos.length > 0 && (
                      <div className="flex gap-2">
                        {item.customerPhotos.map((photo, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-warm-gray-200">
                            <img
                              src={photo}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
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
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handlePlaceOrder}
                  disabled={!formData.customer_name || !formData.customer_contact || loading}
                  className={`btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 ${
                    (!formData.customer_name || !formData.customer_contact || loading) &&
                    'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      I Have Paid via GCash
                    </>
                  )}
                </button>

                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Order on Telegram
                </a>
              </div>

              <p className="text-xs text-warm-gray-500 text-center mt-4">
                By placing an order, you agree to send your photos and payment proof via Telegram or email to complete the transaction.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
