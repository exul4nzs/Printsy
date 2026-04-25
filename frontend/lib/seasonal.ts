export interface SeasonalConfig {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  badge: string;
  themeColor: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

const seasonalConfigs: SeasonalConfig[] = [
  {
    id: 'valentines',
    name: "Valentine's Memory Set",
    description: "Capture love in print. Perfect for couples, anniversaries, or Galentine's gifts. Heart-shaped arrangements and romantic themes available.",
    basePrice: 199,
    image: '/seasonal-valentines.png',
    badge: '💕 Valentine\'s Special',
    themeColor: 'rose',
    startMonth: 2,
    startDay: 1,
    endMonth: 2,
    endDay: 14,
  },
  {
    id: 'summer',
    name: 'Summer Memories Collection',
    description: 'Beach trips, sunsets, and adventures. Keep your summer alive all year with vibrant prints that capture the sunshine.',
    basePrice: 120,
    image: '/seasonal-summer.png',
    badge: '☀️ Summer Edition',
    themeColor: 'amber',
    startMonth: 3,
    startDay: 1,
    endMonth: 5,
    endDay: 31,
  },
  {
    id: 'backtoschool',
    name: 'Back to School Bundle',
    description: 'Capture those first day smiles, graduation moments, and school year memories. Perfect for students of all ages.',
    basePrice: 150,
    image: '/seasonal-default.png',
    badge: '🎓 School Season',
    themeColor: 'blue',
    startMonth: 6,
    startDay: 1,
    endMonth: 7,
    endDay: 31,
  },
  {
    id: 'halloween',
    name: 'Spooky Snapshots',
    description: 'Capture your costumes, decorations, and Halloween party memories. Trick-or-treat your walls with festive prints.',
    basePrice: 150,
    image: '/seasonal-halloween.png',
    badge: '🎃 Halloween Special',
    themeColor: 'orange',
    startMonth: 10,
    startDay: 1,
    endMonth: 10,
    endDay: 31,
  },
  {
    id: 'christmas',
    name: 'Holiday Gift Set',
    description: 'The perfect stocking stuffer. Print family memories for gifts, or create festive wall displays for the season.',
    basePrice: 250,
    image: '/seasonal-christmas.png',
    badge: '🎄 Holiday Edition',
    themeColor: 'green',
    startMonth: 11,
    startDay: 1,
    endMonth: 12,
    endDay: 25,
  },
  {
    id: 'newyear',
    name: 'New Year, New Memories',
    description: 'Start the year by printing your favorite moments. Make 2025 memorable with tangible keepsakes.',
    basePrice: 180,
    image: '/seasonal-default.png',
    badge: '🎆 New Year Special',
    themeColor: 'purple',
    startMonth: 12,
    startDay: 26,
    endMonth: 1,
    endDay: 15,
  },
];

const defaultConfig: SeasonalConfig = {
  id: 'default',
  name: 'Creative Collection',
  description: 'Special themed prints updated throughout the year. Check back often for limited-time offerings and seasonal surprises!',
  basePrice: 100,
  image: '/seasonal-default.png',
  badge: '✨ Limited Edition',
  themeColor: 'accent',
  startMonth: 0,
  startDay: 0,
  endMonth: 0,
  endDay: 0,
};

function isDateInRange(
  date: Date,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number
): boolean {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // Handle跨年 ranges (e.g., Dec 26 - Jan 15)
  if (startMonth > endMonth || (startMonth === endMonth && startDay > endDay)) {
    // Range crosses year boundary
    const isAfterStart = month > startMonth || (month === startMonth && day >= startDay);
    const isBeforeEnd = month < endMonth || (month === endMonth && day <= endDay);
    return isAfterStart || isBeforeEnd;
  }

  // Normal range within same year
  const isAfterStart = month > startMonth || (month === startMonth && day >= startDay);
  const isBeforeEnd = month < endMonth || (month === endMonth && day <= endDay);
  return isAfterStart && isBeforeEnd;
}

export function getSeasonalConfig(overrideSeason?: string): SeasonalConfig {
  // Check for URL override first (for testing)
  if (typeof window !== 'undefined' && !overrideSeason) {
    const params = new URLSearchParams(window.location.search);
    const seasonParam = params.get('season');
    if (seasonParam) {
      const config = seasonalConfigs.find((s) => s.id === seasonParam);
      if (config) return config;
    }
  }

  // Check for explicit override
  if (overrideSeason) {
    const config = seasonalConfigs.find((s) => s.id === overrideSeason);
    if (config) return config;
  }

  // Check current date
  const now = new Date();
  
  for (const config of seasonalConfigs) {
    if (isDateInRange(now, config.startMonth, config.startDay, config.endMonth, config.endDay)) {
      return config;
    }
  }

  return defaultConfig;
}

export function getAllSeasons(): SeasonalConfig[] {
  return [...seasonalConfigs, defaultConfig];
}
