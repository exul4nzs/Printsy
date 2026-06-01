'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  CloudUpload,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  ImageIcon,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { saveDesign } from '@/lib/api';
import { useCartStore } from '@/lib/store';

// ── Pricing (matches backend) ──────────────────────────────
interface PrintSize {
  id: string;
  label: string;
  dims: string;
  price: number; // in pesos
  aspectRatio: number; // width / height
}

const PRINT_SIZES: PrintSize[] = [
  { id: '2x3', label: '2x3', dims: '2 × 3 inches', price: 15, aspectRatio: 2 / 3 },
  { id: '4R', label: '4R', dims: '4 × 6 inches', price: 25, aspectRatio: 2 / 3 },
  { id: '5R', label: '5R', dims: '5 × 7 inches', price: 35, aspectRatio: 5 / 7 },
  { id: '8R', label: '8R', dims: '8 × 10 inches', price: 55, aspectRatio: 4 / 5 },
  { id: 'A4', label: 'A4', dims: '8.27 × 11.69 inches', price: 65, aspectRatio: 8.27 / 11.69 },
];

const MAX_FILE_SIZE_MB = 20;

// ── Helpers ─────────────────────────────────────────────────

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export default function EditorPage() {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.addItem);

  // Photo state
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoNatural, setPhotoNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(100);
  const [dragOver, setDragOver] = useState(false);

  // Options state
  const [selectedSize, setSelectedSize] = useState<PrintSize>(PRINT_SIZES[1]); // default 4R
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fabric canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<{ canvas: unknown } | null>(null);

  // ── File handling ──────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, or WebP).');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const img = await loadImage(dataUrl);
        setPhotoSrc(dataUrl);
        setPhotoFile(file);
        setPhotoNatural({ w: img.naturalWidth, h: img.naturalHeight });
        setZoom(100);
      };
      reader.readAsDataURL(file);
    } catch {
      setError('Failed to read the image. Please try another file.');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const clearPhoto = () => {
    setPhotoSrc(null);
    setPhotoFile(null);
    setPhotoNatural(null);
    setZoom(100);
  };

  // ── Canvas rendering with Fabric.js ────────────────────────

  useEffect(() => {
    if (!photoSrc || !canvasRef.current || !photoNatural) return;

    let cancelled = false;

    // Dynamic import of fabric (client-side only)
    import('fabric')
      .then((fabricModule) => {
        if (cancelled || !canvasRef.current) return;

        const { fabric } = fabricModule as any;

        // Clean up previous canvas
        if (fabricRef.current) {
          (fabricRef.current.canvas as any).dispose();
          fabricRef.current = null;
        }

        const fCanvas = new fabric.Canvas(canvasRef.current, {
          selection: false,
          backgroundColor: '#f5f5f5',
        });

        // Calculate canvas dimensions based on selected print size
        const maxDim = 600;
        const aspect = selectedSize.aspectRatio;
        let canvasW: number, canvasH: number;
        if (aspect >= 1) {
          canvasW = maxDim;
          canvasH = maxDim / aspect;
        } else {
          canvasH = maxDim;
          canvasW = maxDim * aspect;
        }

        fCanvas.setWidth(canvasW);
        fCanvas.setHeight(canvasH);

        // Load image onto canvas
        fabric.Image.fromURL(
          photoSrc,
          (img: any) => {
            if (cancelled) return;

            const scaleX = canvasW / img.width!;
            const scaleY = canvasH / img.height!;
            const scale = Math.max(scaleX, scaleY); // cover mode

            img.set({
              left: canvasW / 2,
              top: canvasH / 2,
              originX: 'center',
              originY: 'center',
              scaleX: scale * (zoom / 100),
              scaleY: scale * (zoom / 100),
              selectable: false,
            });

            fCanvas.add(img);
            fCanvas.renderAll();
            fabricRef.current = { canvas: fCanvas };
          },
          { crossOrigin: 'anonymous' },
        );
      })
      .catch(console.error);

    return () => {
      cancelled = true;
      if (fabricRef.current) {
        try {
          (fabricRef.current.canvas as any).dispose();
        } catch {}
        fabricRef.current = null;
      }
    };
  }, [photoSrc, selectedSize, photoNatural]);

  // Update zoom live on the Fabric canvas
  useEffect(() => {
    if (!fabricRef.current || !photoNatural) return;
    try {
      const fCanvas = fabricRef.current.canvas as any;
      const objs = fCanvas.getObjects();
      if (objs.length === 0) return;
      const img = objs[0];
      const baseScaleX = fCanvas.width / photoNatural.w;
      const baseScaleY = fCanvas.height / photoNatural.h;
      const baseScale = Math.max(baseScaleX, baseScaleY);
      img.set({
        scaleX: baseScale * (zoom / 100),
        scaleY: baseScale * (zoom / 100),
      });
      fCanvas.renderAll();
    } catch {}
  }, [zoom, photoNatural]);

  // ── Actions ────────────────────────────────────────────────

  const handleProceed = async () => {
    if (!photoSrc || !photoFile) {
      setError('Please upload a photo first.');
      return;
    }
    if (photoNatural && (photoNatural.w < 300 || photoNatural.h < 300)) {
      setError('Photo resolution is too low. Minimum 300×300 pixels.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Save the design via the existing API
      const designConfig = { size: selectedSize.id, zoom };
      const design = await saveDesign('', designConfig, photoFile);

      // Add to cart
      addToCart({
        product: {
          id: '',
          name: `Photo Print — ${selectedSize.label}`,
          description: `High-quality photo print, ${selectedSize.dims}`,
          base_price: selectedSize.price,
          product_type: 'photo_print',
          is_active: true,
          created_at: new Date().toISOString(),
        },
        variant: {
          id: selectedSize.id,
          size: selectedSize.label,
          stock_quantity: 999,
          price_adjustment: 0,
          total_price: selectedSize.price,
          is_active: true,
        },
        design,
        quantity,
        unit_price: selectedSize.price,
        total_price: selectedSize.price * quantity,
        customerPhotos: design?.preview_image_url ? [design.preview_image_url] : [photoSrc],
      });

      router.push('/checkout');
    } catch (err) {
      console.error('Failed to proceed:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const unitPrice = selectedSize.price;
  const totalPrice = unitPrice * quantity;

  return (
    <div className="min-h-screen bg-off-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-warm-gray-900 mb-2">Photo Print Editor</h1>
        <p className="text-warm-gray-600 mb-8">
          Upload your photo, pick a size, and order professional prints.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left — Photo upload + canvas (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Upload area */}
            {!photoSrc ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'relative aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all',
                  dragOver
                    ? 'border-accent bg-accent/5 scale-[1.01]'
                    : 'border-warm-gray-300 bg-warm-gray-50 hover:border-accent/50 hover:bg-accent/5',
                )}
              >
                <CloudUpload className={cn('w-16 h-16 mb-4', dragOver ? 'text-accent' : 'text-warm-gray-400')} />
                <span className="font-semibold text-lg text-warm-gray-700">
                  Drag & drop your photo here
                </span>
                <span className="text-sm text-warm-gray-500 mt-1">or click to browse (PNG, JPG, WebP)</span>
                <span className="text-xs text-warm-gray-400 mt-2">Max {MAX_FILE_SIZE_MB} MB · Min 300×300px</span>
              </div>
            ) : (
              <div className="relative">
                {/* Fabric canvas replaces the raw image preview */}
                <div className="rounded-2xl overflow-hidden border border-warm-gray-200 bg-warm-gray-50 flex items-center justify-center">
                  <canvas ref={canvasRef} className="max-w-full" />
                </div>
                <button
                  onClick={clearPhoto}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  title="Remove photo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Zoom control */}
            {photoSrc && (
              <div className="card p-4 flex items-center gap-4">
                <span className="text-sm font-semibold text-warm-gray-700 shrink-0">Zoom</span>
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className="p-2 bg-warm-gray-100 rounded-lg hover:bg-warm-gray-200 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={zoom}
                  onChange={(e) => setZoom(parseInt(e.target.value))}
                  className="flex-1 accent-accent h-2 bg-warm-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                  className="p-2 bg-warm-gray-100 rounded-lg hover:bg-warm-gray-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm font-mono w-12 text-center bg-accent/10 text-accent font-bold py-1 rounded">
                  {zoom}%
                </span>
              </div>
            )}

            {/* Photo info */}
            {photoNatural && (
              <p className="text-xs text-warm-gray-400">
                <ImageIcon className="w-3 h-3 inline mr-1" />
                Original: {photoNatural.w} × {photoNatural.h}px
                {photoNatural.w < 600 || photoNatural.h < 600 ? (
                  <span className="text-amber-600 ml-2">Low resolution — print quality may be affected.</span>
                ) : (
                  <span className="text-green-600 ml-2">Good resolution ✓</span>
                )}
              </p>
            )}
          </div>

          {/* Right — Options (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Size selector */}
            <div className="card p-6">
              <h3 className="font-bold text-lg text-warm-gray-900 mb-4">Print Size</h3>
              <div className="space-y-2">
                {PRINT_SIZES.map((size) => {
                  const active = selectedSize.id === size.id;
                  return (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left',
                        active
                          ? 'border-accent bg-accent/5 shadow-sm'
                          : 'border-warm-gray-100 bg-white hover:border-accent/30',
                      )}
                    >
                      <div>
                        <span className={cn('font-bold block', active ? 'text-accent' : 'text-warm-gray-900')}>
                          {size.label}
                        </span>
                        <span className="text-xs text-warm-gray-500">{size.dims}</span>
                      </div>
                      <span className={cn('font-bold', active ? 'text-accent' : 'text-warm-gray-700')}>
                        {formatPrice(size.price)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Aspect ratio hint */}
              <div className="mt-3 p-3 bg-warm-gray-50 rounded-xl text-xs text-warm-gray-500">
                Aspect ratio:{' '}
                <span className="font-mono font-bold text-warm-gray-700">
                  {selectedSize.aspectRatio.toFixed(2)}
                </span>{' '}
                — your photo will be cropped to fit.
              </div>
            </div>

            {/* Quantity */}
            <div className="card p-6">
              <h3 className="font-bold text-lg text-warm-gray-900 mb-4">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-xl bg-warm-gray-100 flex items-center justify-center hover:bg-warm-gray-200 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-3xl font-bold text-warm-gray-900 w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(20, quantity + 1))}
                  className="w-12 h-12 rounded-xl bg-warm-gray-100 flex items-center justify-center hover:bg-warm-gray-200 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <span className="text-sm text-warm-gray-500 ml-2">Max 20</span>
              </div>
            </div>

            {/* Price summary + CTA */}
            <div className="card p-6 space-y-4">
              <div className="flex justify-between text-sm text-warm-gray-600">
                <span>
                  {selectedSize.label} × {quantity}
                </span>
                <span>{formatPrice(unitPrice)} each</span>
              </div>
              <div className="border-t border-warm-gray-200 pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-warm-gray-900">Total</span>
                  <span className="text-accent">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button
                onClick={handleProceed}
                disabled={!photoSrc || saving}
                className={cn(
                  'w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all',
                  'bg-accent hover:bg-accent-600 text-white shadow-lg hover:shadow-xl',
                  (!photoSrc || saving) && 'opacity-50 cursor-not-allowed',
                )}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {!photoSrc && (
                <p className="text-xs text-warm-gray-500 text-center">Upload a photo to continue.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
