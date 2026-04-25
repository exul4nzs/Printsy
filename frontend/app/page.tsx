'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import SeasonalProductCard from '@/components/SeasonalProductCard';
import CustomerAvatarStack from '@/components/CustomerAvatarStack';
import TestimonialsSection from '@/components/TestimonialsSection';
import { Product } from '@/types';
import { getProducts } from '@/lib/api';
import { Loader2, Camera, Star, ShieldCheck, Facebook, Send } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts('photo_print');
        setProducts(data);
      } catch (err) {
        setError('Failed to load products');
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
      <section className="relative bg-white py-20 lg:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent font-bold px-4 py-2 rounded-full mb-8 animate-bounce">
              <Star className="w-4 h-4" />
              <span>Premium Photo Printing</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-warm-gray-900 mb-8 tracking-tight leading-tight">
              Where some memories deserve <br />
              <span className="text-accent italic">more than a screen.</span>
            </h1>
            
            <p className="text-xl text-warm-gray-600 mb-10 leading-relaxed font-medium">
              "Print them, feel them, and make them last 💕"
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#gallery"
                className="btn-primary px-10 py-5 text-xl font-black shadow-xl hover:shadow-accent/20 transition-all hover:scale-105"
              >
                Explore Gallery
              </a>
              <a
                href="#features"
                className="btn-secondary px-10 py-5 text-xl font-bold hover:bg-warm-gray-200 transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-warm-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black text-warm-gray-900 mb-4">
                Our Print Options
              </h2>
              <p className="text-lg text-warm-gray-600 font-medium">
                Choose from a variety of professional photo sizes. Every print is handled with care.
              </p>
            </div>
            <CustomerAvatarStack count={4} />
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-24 bg-white rounded-3xl shadow-xl border border-red-100">
              <p className="text-red-600 font-bold text-lg mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {products.length === 0 ? (
                // Placeholder Products + Dynamic Seasonal Card
                <>
                  <ProductCard product={{
                    id: 'p1', 
                    name: 'Mini Album Keychain', 
                    description: 'A pocket-sized memory you can carry anywhere. Perfect for family photos.', 
                    base_price: 150, 
                    product_type: 'photo_print',
                    thumbnail: '/keychain.png'
                  } as any} />
                  <ProductCard product={{
                    id: 'p2', 
                    name: 'Standard Photo Prints (4R)', 
                    description: 'High-quality glossy prints for your photo albums.', 
                    base_price: 10, 
                    product_type: 'photo_print',
                    thumbnail: '/prints.png'
                  } as any} />
                  <SeasonalProductCard />
                </>
              ) : (
                // API Products + Dynamic Seasonal Card
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
          <div className="grid md:grid-cols-2 gap-12">
            <div className="card p-10 hover:border-accent/30 border-2 border-transparent transition-all group">
              <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Camera className="w-10 h-10 text-accent" />
              </div>
              <h3 className="font-black text-2xl text-warm-gray-900 mb-4">
                Crystal Clear
              </h3>
              <p className="text-warm-gray-600 text-lg leading-relaxed">
                We use high-resolution professional printers to ensure every detail of your memory is preserved.
              </p>
            </div>
            
            <div className="card p-10 hover:border-accent/30 border-2 border-transparent transition-all group">
              <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Star className="w-10 h-10 text-accent" />
              </div>
              <h3 className="font-black text-2xl text-warm-gray-900 mb-4">
                Premium Paper
              </h3>
              <p className="text-warm-gray-600 text-lg leading-relaxed">
                Choose between glossy or matte finishes on high-quality photo paper that lasts for years.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Footer */}
      <footer className="bg-warm-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <span className="font-black text-3xl mb-6 block italic">Printsy</span>
              <p className="text-warm-gray-400 text-lg max-w-md">
                "Where some memories deserve more than a screen. Print them, feel them, and make them last 💕"
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Contact Us</h4>
              <ul className="space-y-4 text-warm-gray-400">
                <li>Facebook: Printsy</li>
                <li>Telegram: @hercheysss15</li>
                <li>Nueva Ext., Purok Perlas, Surigao City</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Legal</h4>
              <ul className="space-y-4 text-warm-gray-400">
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>Refund Policy</li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-warm-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-warm-gray-400 text-sm font-medium">
              © 2026 Printsy by Hercheys. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a 
                href="https://www.facebook.com/profile.php?id=61581537887386" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-warm-gray-400 hover:text-accent transition-all hover:scale-110"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a 
                href="https://t.me/hercheysss15" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-warm-gray-400 hover:text-accent transition-all hover:scale-110"
              >
                <Send className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
