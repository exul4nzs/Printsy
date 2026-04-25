'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import PhotoPrintEditor from '@/components/PhotoPrintEditor';
import { Product, PhotoPrintVariant, PhotoPrintProduct } from '@/types';
import { getProduct, getProductVariants, saveDesign } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft, Loader2, ShoppingBag, Check } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<PhotoPrintProduct | null>(null);
  const [variants, setVariants] = useState<PhotoPrintVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<PhotoPrintVariant | null>(null);
  const [designData, setDesignData] = useState<{ dataUrl: string; json: unknown } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAdded, setShowAdded] = useState(false);
  
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, variantsData] = await Promise.all([
          getProduct(id as string),
          getProductVariants(id as string),
        ]);
        setProduct(productData as PhotoPrintProduct);
        setVariants(variantsData);
        if (variantsData.length > 0) {
          // Default to 4R or the first one
          const defaultVariant = variantsData.find(v => v.size === '4R') || variantsData[0];
          setSelectedVariant(defaultVariant);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDesignSave = (dataUrl: string, json: unknown) => {
    setDesignData({ dataUrl, json });
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;

    setSaving(true);
    
    let design = null;
    if (designData) {
      try {
        const response = await fetch(designData.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'photo-print.png', { type: 'image/png' });
        
        design = await saveDesign(product.id, designData.json, file);
      } catch (error) {
        console.error('Failed to save photo:', error);
      }
    }

    addToCart({
      product,
      variant: selectedVariant,
      design: design || undefined,
      quantity: 1,
      unit_price: selectedVariant.total_price,
      total_price: selectedVariant.total_price,
    });

    setSaving(false);
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white">
        <Header />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-off-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-warm-gray-600 font-medium">Product not found</p>
          <Link href="/" className="btn-primary mt-6 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-warm-gray-600 hover:text-accent font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Preview/Editor */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-warm-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-warm-gray-600 leading-relaxed">{product.description}</p>
            </div>
            
            <PhotoPrintEditor
              productId={String(product.id)}
              onExport={handleDesignSave}
              className="mb-6"
            />
          </div>

          {/* Right Column - Options */}
          <div className="space-y-8">
            {/* Size Selection */}
            <div className="card p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl text-warm-gray-900">
                  Select Print Size
                </h3>
                <span className="text-sm bg-accent/10 text-accent font-bold px-3 py-1 rounded-full">
                  High Quality
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`
                        flex flex-col items-center py-4 rounded-2xl border-2 transition-all
                        ${isSelected
                          ? 'bg-accent border-accent text-white shadow-lg scale-105'
                          : 'bg-white border-warm-gray-100 text-warm-gray-700 hover:border-accent/30 hover:bg-accent/5'
                        }
                      `}
                    >
                      <span className="font-bold text-lg">{variant.size}</span>
                      <span className={`text-xs opacity-75 ${isSelected ? 'text-white' : 'text-warm-gray-500'}`}>
                        {formatPrice(variant.total_price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price & Add to Cart */}
            <div className="card p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-warm-gray-500 text-sm font-medium block">Price for {selectedVariant?.size}</span>
                  <span className="text-4xl font-black text-accent">
                    {formatPrice(selectedVariant?.total_price || product.base_price)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-warm-gray-400 text-xs line-through block">P 50.00</span>
                  <span className="text-emerald-600 text-xs font-bold block">Best Deal</span>
                </div>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || saving}
                className={`
                  w-full bg-accent hover:bg-accent-600 text-white py-5 rounded-2xl font-black text-xl 
                  flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all
                  ${(!selectedVariant || saving) && 'opacity-50 cursor-not-allowed'}
                `}
              >
                {saving ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : showAdded ? (
                  <>
                    <Check className="w-6 h-6" />
                    Added to Order
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-6 h-6" />
                    Add to Cart
                  </>
                )}
              </button>
              
              <p className="text-xs text-warm-gray-400 text-center">
                Free shipping on orders above P 500!
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-warm-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-warm-gray-700">Glossy Finish</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-warm-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-warm-gray-700">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
