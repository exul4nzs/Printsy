'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Check, PartyPopper, ArrowRight } from 'lucide-react';

function SuccessContent() {
  return (
    <div className="min-h-screen bg-off-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-warm-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-warm-gray-600">
            Thank you for your order. We&apos;re preparing your prints!
          </p>
        </div>

        <div className="card p-8 text-center mb-6">
          <PartyPopper className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-warm-gray-900 mb-2">
            What happens next?
          </h2>
          <ol className="space-y-3 text-sm text-warm-gray-600 text-left max-w-md mx-auto">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </span>
              <span>
                We&apos;ll review your photos and prepare them for printing.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </span>
              <span>
                You&apos;ll be contacted for pickup or delivery arrangements in Surigao City.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </span>
              <span>
                Enjoy your high-quality photo prints! 📸
              </span>
            </li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/editor" className="btn-primary flex items-center justify-center gap-2">
            Print Another Photo
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/" className="btn-outline text-center">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-off-white">
          <Header />
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <p className="text-warm-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
