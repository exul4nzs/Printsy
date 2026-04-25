'use client';

import Image from 'next/image';
import { testimonials } from '@/lib/testimonials';
import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-warm-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-warm-gray-600 font-medium max-w-2xl mx-auto">
            Real reviews from real customers in Surigao City. Join 100+ happy Printsy users!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="card p-6 hover:shadow-xl transition-shadow duration-300 relative"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-accent/20 mb-4" />

              {/* Review text */}
              <p className="text-warm-gray-700 mb-6 text-sm leading-relaxed">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-warm-gray-200'
                    }`}
                  />
                ))}
              </div>

              {/* Customer info */}
              <div className="flex items-center gap-3 pt-4 border-t border-warm-gray-100">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-accent/10">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-warm-gray-900 text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-warm-gray-500">
                    {testimonial.location} • {testimonial.orderType}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
