'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSeasonalConfig } from '@/lib/seasonal';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SeasonalProductCardProps {
  overrideSeason?: string;
}

export default function SeasonalProductCard({ overrideSeason }: SeasonalProductCardProps) {
  const config = useMemo(() => getSeasonalConfig(overrideSeason), [overrideSeason]);

  const themeClasses: Record<string, string> = {
    rose: 'from-rose-500 to-pink-600',
    amber: 'from-amber-500 to-orange-500',
    blue: 'from-blue-500 to-indigo-600',
    orange: 'from-orange-500 to-red-500',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-violet-600',
    accent: 'from-accent to-pink-500',
  };

  return (
    <div className="card card-hover group relative overflow-hidden">
      {/* Seasonal Badge */}
      <div className={cn(
        "absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg",
        "bg-gradient-to-r",
        themeClasses[config.themeColor] || themeClasses.accent
      )}>
        {config.badge}
      </div>

      <div className="aspect-square relative overflow-hidden rounded-t-2xl bg-warm-gray-100">
        <Image
          src={config.image}
          alt={config.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Gradient overlay on hover */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity",
          "bg-gradient-to-t",
          themeClasses[config.themeColor] || themeClasses.accent
        )} />
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-lg text-warm-gray-900 mb-1">
          {config.name}
        </h3>
        <p className="text-warm-gray-500 text-sm line-clamp-2 mb-3">
          {config.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-warm-gray-500">Starting at</span>
            <span className="text-accent font-bold text-lg">
              {formatPrice(config.basePrice)}
            </span>
          </div>
          <Link
            href={`/product/seasonal-${config.id}`}
            className={cn(
              "text-sm py-2 px-4 rounded-xl font-medium text-white shadow-lg transition-all",
              "hover:shadow-xl hover:scale-105",
              "bg-gradient-to-r",
              themeClasses[config.themeColor] || themeClasses.accent
            )}
          >
            View Offer
          </Link>
        </div>
      </div>
    </div>
  );
}
