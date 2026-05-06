'use client';

import { Suspense, useMemo, useState } from 'react';
import Header from '@/components/Header';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { createOrder } from '@/lib/api';
import { Loader2, Check, AlertTriangle, MapPin, Send, Copy, CheckCircle2 } from 'lucide-react';

interface PaymentInfo {
  gcash_number: string;
  gcash_name: string;
  amount: string;
  reference: string;
}

function CheckoutContent() {
  const { items, clearCart } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_contact: '',
  });

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  }, [items]);

  const hasMissingPhotos = useMemo(() => {
    return items.some((item) => !item.customerPhotos || item.customerPhotos.length === 0);
  }, [items]);

  const telegramUsername = process.env.NEXT_PUBLIC_TELEGRAM_USERNAME || 'hercheysss15';
  const telegramMessage = useMemo(() => {
    const lines = ['🛒 *New Order from Printsy!*'];
    lines.push('--------------------------');
    if (completedOrderId) {
      lines.push(`🆔 *Order ID:* #${completedOrderId.substring(0, 8).toUpperCase()}`);
    }
    if (paymentInfo?.reference) {
      lines.push(`📝 *Reference:* ${paymentInfo.reference}`);
    }
    lines.push(`💰 *Amount:* ₱${paymentInfo?.amount || total}`);
    lines.push('💳 *Status:* Paid via GCash');
    lines.push('--------------------------');
    lines.push('Hi! I just placed my order. Please confirm my payment and start processing. Thank you! ✨');
    
    return encodeURIComponent(lines.join('\n'));
  }, [completedOrderId, paymentInfo, total]);
  const telegramLink = `https://t.me/${telegramUsername}?text=${telegramMessage}`;

  const gcashNumber = paymentInfo?.gcash_number || process.env.NEXT_PUBLIC_GCASH_NUMBER || '09559054871';

  const handleCopyGcash = async () => {
    try {
      await navigator.clipboard.writeText(gcashNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  };

  const handlePlaceOrder = async () => {
    if (!formData.customer_name || !formData.customer_contact || items.length === 0) {
      return;
    }

    if (hasMissingPhotos) {
      setError('Each cart item needs at least one uploaded photo before placing an order.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        product_type: item.product.product_type,
        variant_id: item.variant?.id,
        design_id: item.design?.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        design_preview_url: item.design?.preview_image_url || '',
        customer_photos: item.customerPhotos || [],
      }));

      const result = await createOrder({
        customer_name: formData.customer_name,
        customer_email: formData.customer_contact.includes('@') ? formData.customer_contact : '',
        customer_phone: !formData.customer_contact.includes('@') ? formData.customer_contact : '',
        items: orderItems,
        total_amount: total,
      });

      setCompletedOrderId(result.order?.id || result.id || null);
      setPaymentInfo(result.payment_info || null);
      setOrderComplete(true);
      clearCart();
    } catch (err) {
      console.error('Order creation error:', err);
      setError('Unable to place order right now. Please make sure the backend server is running and try again.');
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-off-white">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-warm-gray-900 mb-2">Order placed!</h2>
            {completedOrderId && (
              <p className="text-sm font-mono text-warm-gray-500">
                Order ID: {completedOrderId}
              </p>
            )}
          </div>

          {/* GCash Payment Instructions */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-bold text-warm-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">💳</span> GCash Payment Instructions
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div>
                  <p className="text-xs text-warm-gray-500 mb-1">Send to GCash Number</p>
                  <p className="text-xl font-bold text-warm-gray-900 tracking-wide">{gcashNumber}</p>
                  {paymentInfo?.gcash_name && (
                    <p className="text-sm text-warm-gray-600">{paymentInfo.gcash_name}</p>
                  )}
                </div>
                <button
                  onClick={handleCopyGcash}
                  className="p-3 rounded-xl bg-white border border-blue-200 hover:bg-blue-100 transition-colors"
                  title="Copy number"
                >
                  {copied ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-accent/5 rounded-xl border border-accent/20">
                <div>
                  <p className="text-xs text-warm-gray-500 mb-1">Amount to Pay</p>
                  <p className="text-2xl font-black text-accent">
                    ₱{paymentInfo?.amount || total}
                  </p>
                </div>
              </div>

              {paymentInfo?.reference && (
                <div className="p-4 bg-warm-gray-50 rounded-xl border border-warm-gray-200">
                  <p className="text-xs text-warm-gray-500 mb-1">Reference / Message</p>
                  <p className="text-sm font-mono font-bold text-warm-gray-900">
                    {paymentInfo.reference}
                  </p>
                  <p className="text-xs text-warm-gray-400 mt-1">
                    Include this as the GCash message so we can match your payment.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Steps */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-bold text-warm-gray-900 mb-4">Next Steps</h3>
            <ol className="space-y-3 text-sm text-warm-gray-600 list-decimal list-inside">
              <li>Open your <strong>GCash app</strong> and send <strong>₱{paymentInfo?.amount || total}</strong> to <strong>{gcashNumber}</strong>.</li>
              <li>Use <strong>{paymentInfo?.reference || 'your Order ID'}</strong> as the message.</li>
              <li><strong>Message us on Telegram</strong> to confirm your payment (button below).</li>
              <li>We&apos;ll process and prepare your prints! 💕</li>
            </ol>
          </div>

          {/* Telegram Button */}
          <div className="space-y-3">
            <button
              onClick={() => {
                const text = decodeURIComponent(telegramMessage);
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-accent/30 text-accent font-medium hover:bg-accent/5 transition-colors flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Order Summary Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  1. Copy Order Summary
                </>
              )}
            </button>

            <a
              href={`https://t.me/${telegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              2. Confirm on Telegram
            </a>
            <p className="text-center text-xs text-warm-gray-400">
              Paste the summary into the chat to confirm your payment!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-off-white">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-semibold text-warm-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-warm-gray-600">
            Add at least one photo print to continue checkout.
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

        <div className="mb-8 space-y-3">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              Our prints are <strong>Instax-inspired</strong>, not actual Instax film. Please upload high-quality photos for the best print results.
            </p>
          </div>
          <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/20 rounded-xl">
            <MapPin className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <p className="text-sm text-warm-gray-700">
              Currently serving <strong>Surigao City</strong> only. Pickup or local delivery is arranged after payment confirmation.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-8">
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

            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">💳</span>
                </div>
                <h2 className="text-xl font-semibold text-warm-gray-900">
                  Payment via GCash
                </h2>
              </div>
              <p className="text-sm text-warm-gray-600">
                After placing your order, you&apos;ll see GCash payment instructions with our number and the exact amount to send. Then message us on Telegram to confirm.
              </p>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold text-warm-gray-900 mb-4">
                How to Complete Your Order
              </h2>
              <ol className="space-y-3 text-sm text-warm-gray-600 list-decimal list-inside">
                <li><strong>Review your order</strong> details and contact info.</li>
                <li><strong>Click Place Order</strong> to submit your order.</li>
                <li><strong>Send GCash payment</strong> to the number shown.</li>
                <li><strong>Message us on Telegram</strong> to confirm payment.</li>
              </ol>
            </div>
          </div>

          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-warm-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-4 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="pb-4 border-b border-warm-gray-100 last:border-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-warm-gray-900">{item.product.name}</span>
                      <span className="font-medium text-warm-gray-900">{formatPrice(item.total_price)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-warm-gray-500 mb-2">
                      <span>{item.variant?.size || 'Standard'} × {item.quantity}</span>
                    </div>
                    {item.customerPhotos && item.customerPhotos.length > 0 && (
                      <div className="flex gap-2">
                        {item.customerPhotos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Photo ${idx + 1}`}
                            className="w-16 h-16 rounded-lg object-cover border border-warm-gray-200"
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

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!formData.customer_name || !formData.customer_contact || loading || hasMissingPhotos}
                    className={`btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 ${
                      (!formData.customer_name || !formData.customer_contact || loading || hasMissingPhotos) &&
                      'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        📦 Place Order
                      </>
                    )}
                  </button>
                </div>

                {hasMissingPhotos && (
                  <p className="text-xs text-red-600 text-center mt-4">
                    Every item needs an uploaded photo before placing an order.
                  </p>
                )}
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
    <Suspense fallback={
      <div className="min-h-screen bg-off-white">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
          <p className="text-warm-gray-600">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}