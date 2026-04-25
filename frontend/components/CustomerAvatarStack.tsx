'use client';

import Image from 'next/image';
import { getFeaturedTestimonials } from '@/lib/testimonials';

interface CustomerAvatarStackProps {
  count?: number;
}

export default function CustomerAvatarStack({ count = 4 }: CustomerAvatarStackProps) {
  const testimonials = getFeaturedTestimonials(count);

  // Generate initials for fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Pastel colors for fallback avatars
  const fallbackColors = [
    'bg-rose-300',
    'bg-blue-300',
    'bg-green-300',
    'bg-purple-300',
    'bg-amber-300',
  ];

  return (
    <div className="flex items-center gap-4">
      <div className="flex -space-x-3">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={`relative w-10 h-10 rounded-full border-3 border-white overflow-hidden shadow-md hover:scale-110 hover:z-10 transition-all duration-200 ${fallbackColors[index % fallbackColors.length]}`}
            title={`${testimonial.name} - ${testimonial.text.slice(0, 30)}...`}
          >
            {/* Try to load image, fallback to initials */}
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
              {getInitials(testimonial.name)}
            </div>
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              fill
              className="object-cover opacity-0"
              onLoadingComplete={(img) => {
                img.classList.remove('opacity-0');
                img.classList.add('opacity-100');
              }}
              onError={(e) => {
                // Keep showing initials on error
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ))}
        {/* +100 indicator */}
        <div className="relative w-10 h-10 rounded-full border-3 border-white bg-warm-gray-100 flex items-center justify-center text-xs font-bold text-warm-gray-600 shadow-md">
          +100
        </div>
      </div>
      <span className="text-sm font-bold text-warm-gray-500">Happy Customers</span>
    </div>
  );
}
