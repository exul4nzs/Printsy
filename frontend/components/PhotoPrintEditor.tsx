'use client';

import { useState, useRef, useEffect } from 'react';
import { CloudUpload, Trash2, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PhotoPrintEditorProps {
  productId: string;
  onExport?: (dataUrl: string, json: unknown) => void;
  onClear?: () => void;
  className?: string;
}

export default function PhotoPrintEditor({
  productId,
  onExport,
  onClear,
  className,
}: PhotoPrintEditorProps) {
  const [image, setImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = `photo-upload-${productId}`;

  // Notify parent of changes
  useEffect(() => {
    if (image) {
      onExport?.(image, { type: 'photo', src: image, zoom });
    }
  }, [image, zoom, onExport]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setZoom(100);
    onClear?.();
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="relative aspect-square md:aspect-[4/3] bg-warm-gray-100 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-warm-gray-300 transition-all hover:border-accent/50">
        {image ? (
          <div className="relative w-full h-full flex items-center justify-center bg-white">
            <img
              src={image}
              alt="Preview"
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})` }}
            />
            <button
              onClick={clearImage}
              className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
              title="Remove photo"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-3 text-warm-gray-500 hover:text-accent transition-colors p-8 text-center"
          >
            <CloudUpload className="w-16 h-16 opacity-50" />
            <div>
              <span className="block font-semibold text-lg">Click to upload photo</span>
              <span className="text-sm opacity-75">PNG, JPG or WebP</span>
            </div>
          </button>
        )}
        <input
          id={inputId}
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {image && (
        <div className="card p-4 flex flex-col sm:flex-row items-center gap-4">
          <span className="text-sm font-semibold text-warm-gray-700 shrink-0">Adjust Zoom</span>
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-2 bg-warm-gray-100 rounded-lg hover:bg-warm-gray-200 transition-colors"
            >
              <Minimize className="w-4 h-4" />
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
              <Maximize className="w-4 h-4" />
            </button>
            <span className="text-sm font-mono w-12 text-center bg-accent/10 text-accent font-bold py-1 rounded">
              {zoom}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
