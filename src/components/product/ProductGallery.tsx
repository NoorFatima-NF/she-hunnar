import React, { useState } from 'react';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, title }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const displayImages = !images || images.length === 0 ? [''] : images;

  return (
    <div className="space-y-4">
      {/* Main Image View */}
      <div className="relative aspect-square bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 group">
        <ImageWithFallback
          src={displayImages[selectedIndex]}
          alt={`${title} - view ${selectedIndex + 1}`}
          className="w-full h-full object-cover object-center cursor-zoom-in"
          onClick={() => setIsZoomOpen(true)}
        />

        <button
          onClick={() => setIsZoomOpen(true)}
          className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-white text-stone-800 rounded-full shadow-sm text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ZoomIn size={16} />
          <span>Zoom</span>
        </button>

        {displayImages.length > 1 && (
          <>
            <button
              onClick={() =>
                setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-stone-800 rounded-full shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() =>
                setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-stone-800 rounded-full shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Bar */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                selectedIndex === idx
                  ? 'border-amber-800 ring-2 ring-amber-800/20'
                  : 'border-stone-200 opacity-70 hover:opacity-100'
              }`}
            >
              <ImageWithFallback src={img} alt={`thumb ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Lightbox Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl">
            <ImageWithFallback
              src={displayImages[selectedIndex]}
              alt={title}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
