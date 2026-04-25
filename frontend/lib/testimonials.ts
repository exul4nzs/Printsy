export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  location: string;
  rating: number;
  text: string;
  orderType: string;
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Maria Santos',
    avatar: '/testimonials/customer-1.jpg',
    location: 'Surigao City',
    rating: 5,
    text: 'Love my mini album keychain! Perfect gift for my boyfriend. Quality is amazing! 💕',
    orderType: 'Mini Album Keychain',
  },
  {
    id: '2',
    name: 'Juan Dela Cruz',
    avatar: '/testimonials/customer-2.jpg',
    location: 'Surigao City',
    rating: 5,
    text: 'Fast service and the prints look professional. Will definitely order again!',
    orderType: 'Standard Photo Prints',
  },
  {
    id: '3',
    name: 'Anna Reyes',
    avatar: '/testimonials/customer-3.jpg',
    location: 'Surigao City',
    rating: 5,
    text: 'The GCash payment was so convenient. Photos came out better than expected! 📸',
    orderType: 'Large Format Print',
  },
  {
    id: '4',
    name: 'Mark Garcia',
    avatar: '/testimonials/customer-4.jpg',
    location: 'Surigao City',
    rating: 5,
    text: 'Great communication via Telegram. They helped me choose the right sizes.',
    orderType: 'Premium Photo Print',
  },
];

export function getFeaturedTestimonials(count: number = 4): Testimonial[] {
  return testimonials.slice(0, count);
}
