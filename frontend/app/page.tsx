'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import SeasonalProductCard from '@/components/SeasonalProductCard';
import CustomerAvatarStack from '@/components/CustomerAvatarStack';
import TestimonialsSection from '@/components/TestimonialsSection';
import { Product } from '@/types';
import { getProducts } from '@/lib/api';
import { toast } from 'sonner';
import {
  Camera,
  Zap,
  Wallet,
  Award,
  Upload,
  Ruler,
  CreditCard,
  Facebook,
  Send,
  Github,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/lib/store';
import LoginModal from '@/components/auth/LoginModal';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts('photo_print');
        setProducts(data);
      } catch {
        toast.error('Failed to load products. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-off-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-soft-beige via-white to-accent/5 py-20 lg:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-accent/5 rounded-full blur-2xl animate-float" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent font-bold px-4 py-2 rounded-full mb-8">
              <Star className="w-4 h-4" />
              <span>Premium Photo Printing</span>
            </div>

            <h1 className="font-serif text-5xl lg:text-7xl font-bold text-warm-gray-900 mb-6 tracking-tight leading-tight">
              Print your memories
            </h1>

            <p className="text-xl lg:text-2xl text-warm-gray-500 mb-10 leading-relaxed font-medium">
              Premium photo prints, delivered with care.
              <br className="hidden sm:block" />
              <span className="text-accent italic">&ldquo;Where some memories deserve more than a screen&rdquo;</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!user ? (
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="btn-primary px-10 py-5 text-xl font-black shadow-xl hover:shadow-accent/20 transition-all hover:scale-105 flex items-center gap-2"
                >
                  Start Printing
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <Link
                  href="/editor"
                  className="btn-primary px-10 py-5 text-xl font-black shadow-xl hover:shadow-accent/20 transition-all hover:scale-105 flex items-center gap-2"
                >
                  Start Printing
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              <Link
                href="#features"
                className="btn-secondary px-10 py-5 text-xl font-bold hover:bg-warm-gray-200 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-warm-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="font-serif text-4xl font-bold text-warm-gray-900 mb-4">
                Our Print Options
              </h2>
              <p className="text-lg text-warm-gray-600 font-medium">
                Choose from a variety of professional photo sizes. Every print is handled with care.
              </p>
            </div>
            <CustomerAvatarStack count={4} />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <Skeleton className="w-full h-48 rounded-none" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-6" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-8 w-1/4" />
                      <Skeleton className="h-10 w-24 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {products.length === 0 ? (
                <>
                  <ProductCard
                    product={
                      {
                        id: 'p1',
                        name: 'Mini Album Keychain',
                        description:
                          'A pocket-sized memory you can carry anywhere. Perfect for family photos.',
                        base_price: 150,
                        product_type: 'photo_print',
                        thumbnail: '/keychain.png',
                      } as any
                    }
                  />
                  <ProductCard
                    product={
                      {
                        id: 'p2',
                        name: 'Standard Photo Prints (4R)',
                        description: 'High-quality glossy prints for your photo albums.',
                        base_price: 10,
                        product_type: 'photo_print',
                        thumbnail: '/prints.png',
                      } as any
                    }
                  />
                  <SeasonalProductCard />
                </>
              ) : (
                <>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                  <SeasonalProductCard />
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-warm-gray-900 mb-4">
              Why Choose Printsy?
            </h2>
            <p className="text-lg text-warm-gray-500 max-w-2xl mx-auto">
              We make it easy to turn your digital memories into beautiful, tangible prints.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-10 hover:border-accent/30 border-2 border-transparent transition-all hover:-translate-y-1 group">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-bold text-2xl text-warm-gray-900 mb-3">Fast Prints</h3>
              <p className="text-warm-gray-600 text-lg leading-relaxed">
                Quick turnaround on every order. Your photos are printed and ready before you know it.
              </p>
            </div>

            <div className="card p-10 hover:border-accent/30 border-2 border-transparent transition-all hover:-translate-y-1 group">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wallet className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-bold text-2xl text-warm-gray-900 mb-3">Local Payment via GCash</h3>
              <p className="text-warm-gray-600 text-lg leading-relaxed">
                Pay easily with GCash — the wallet you already use every day. No credit card needed.
              </p>
            </div>

            <div className="card p-10 hover:border-accent/30 border-2 border-transparent transition-all hover:-translate-y-1 group">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-bold text-2xl text-warm-gray-900 mb-3">Premium Quality</h3>
              <p className="text-warm-gray-600 text-lg leading-relaxed">
                Archival-grade photo paper with vibrant, fade-resistant inks. Prints that last for years.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-warm-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-warm-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-warm-gray-500 max-w-2xl mx-auto">
              Three simple steps to turn your photos into beautiful prints.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] border-t-2 border-dashed border-accent/20" />

            <div className="relative text-center group">
              <div className="w-32 h-32 mx-auto bg-white rounded-full shadow-card flex items-center justify-center mb-6 group-hover:shadow-card-hover group-hover:-translate-y-1 transition-all border-4 border-accent/10 group-hover:border-accent/30">
                <Upload className="w-12 h-12 text-accent" />
              </div>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
                1
              </div>
              <h3 className="font-bold text-xl text-warm-gray-900 mb-2">Upload</h3>
              <p className="text-warm-gray-600 max-w-xs mx-auto">
                Choose your favorite photo and upload it. We support PNG, JPG, and WebP.
              </p>
            </div>

            <div className="relative text-center group">
              <div className="w-32 h-32 mx-auto bg-white rounded-full shadow-card flex items-center justify-center mb-6 group-hover:shadow-card-hover group-hover:-translate-y-1 transition-all border-4 border-accent/10 group-hover:border-accent/30">
                <Ruler className="w-12 h-12 text-accent" />
              </div>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
                2
              </div>
              <h3 className="font-bold text-xl text-warm-gray-900 mb-2">Choose Size</h3>
              <p className="text-warm-gray-600 max-w-xs mx-auto">
                Pick from 5 premium sizes, from 2&times;3 wallet prints to A4 posters.
              </p>
            </div>

            <div className="relative text-center group">
              <div className="w-32 h-32 mx-auto bg-white rounded-full shadow-card flex items-center justify-center mb-6 group-hover:shadow-card-hover group-hover:-translate-y-1 transition-all border-4 border-accent/10 group-hover:border-accent/30">
                <CreditCard className="w-12 h-12 text-accent" />
              </div>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
                3
              </div>
              <h3 className="font-bold text-xl text-warm-gray-900 mb-2">Pay &amp; Print</h3>
              <p className="text-warm-gray-600 max-w-xs mx-auto">
                Pay with GCash or card. We&apos;ll print and deliver your memories to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Footer */}
      <footer className="bg-warm-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 lg:col-span-1">
              <span className="font-serif text-3xl font-bold mb-6 block italic">Printsy</span>
              <p className="text-warm-gray-400 text-base max-w-md leading-relaxed">
                &ldquo;Where some memories deserve more than a screen. Print them, feel them, and make them
                last 💕&rdquo;
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Contact Us</h4>
              <ul className="space-y-3 text-warm-gray-400">
                <li>Facebook: Printsy</li>
                <li>Telegram: @hercheysss15</li>
                <li>Nueva Ext., Purok Perlas, Surigao City</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Legal</h4>
              <ul className="space-y-3 text-warm-gray-400">
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>Refund Policy</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-warm-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-warm-gray-400 text-sm font-medium">
              &copy; 2026 Printsy by Hercheys. All rights reserved.
            </p>
            <div className="flex gap-5">
              <a
                href="https://www.facebook.com/profile.php?id=61581537887386"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-warm-gray-800 flex items-center justify-center text-warm-gray-400 hover:text-accent hover:bg-warm-gray-700 transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://t.me/hercheysss15"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-warm-gray-800 flex items-center justify-center text-warm-gray-400 hover:text-accent hover:bg-warm-gray-700 transition-all hover:scale-110"
                aria-label="Telegram"
              >
                <Send className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-warm-gray-800 flex items-center justify-center text-warm-gray-400 hover:text-accent hover:bg-warm-gray-700 transition-all hover:scale-110"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </div>
  );
}
