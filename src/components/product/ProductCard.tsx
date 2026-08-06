import React from 'react';
import { Product } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatPKR } from '../../utils/format';
import { StarRating } from '../common/StarRating';
import { Badge } from '../common/Badge';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { Heart, ShoppingBag, Sparkles, CheckCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onNavigate: (view: string, param?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { toggleWishlist, isInWishlist, addToCart } = useMarketplace();
  const inWishlist = isInWishlist(product.id);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden luxury-card-shadow transition-all duration-300 flex flex-col relative">
      {/* Product Image Area */}
      <div className="relative aspect-square bg-stone-100 overflow-hidden cursor-pointer" onClick={() => onNavigate('product', product.slug)}>
        <ImageWithFallback
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 items-start">
          {product.isBestseller && (
            <span className="px-2.5 py-1 bg-amber-500/90 text-amber-950 text-[10px] font-extrabold uppercase tracking-wider rounded-md shadow-xs backdrop-blur-xs flex items-center gap-1 border border-amber-300">
              ★ Bestseller
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-1 bg-emerald-700/90 text-emerald-50 text-[10px] font-extrabold uppercase tracking-wider rounded-md shadow-xs backdrop-blur-xs border border-emerald-500">
              New Craft
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 shadow-sm ${
            inWishlist
              ? 'bg-rose-50 text-rose-600 border border-rose-200 scale-105'
              : 'bg-white/90 hover:bg-white text-stone-600 hover:text-stone-900 border border-stone-200 hover:scale-110'
          }`}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={17} className={inWishlist ? 'fill-rose-600' : ''} />
        </button>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Seller Shop Link */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('shopfront', product.sellerId);
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:text-amber-950 cursor-pointer transition-colors"
          >
            <span className="truncate">{product.sellerShopName}</span>
            <CheckCircle size={12} className="text-amber-600 shrink-0" />
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onNavigate('product', product.slug)}
            className="font-serif text-base font-bold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-2 cursor-pointer leading-tight"
          >
            {product.title}
          </h3>

          {/* Category & Material Subtag */}
          <p className="text-[11px] text-stone-500 truncate font-medium">
            {product.material}
          </p>
        </div>

        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          {/* Ratings */}
          <StarRating rating={product.rating} count={product.reviewCount} size={13} />

          {/* Stock state */}
          {product.stock <= 0 && (
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
              Out of Stock
            </span>
          )}
        </div>

        {/* Pricing & Add to Cart Button */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans text-base font-extrabold text-stone-950">
                {formatPKR(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-stone-400 line-through font-medium">
                  {formatPKR(product.originalPrice)}
                </span>
              )}
            </div>
            {discountPercent && (
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Save {discountPercent}%
              </span>
            )}
          </div>

          <button
            onClick={() => {
              addToCart(product, 1);
              onNavigate('cart');
            }}
            disabled={product.stock <= 0}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
              product.stock <= 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-stone-950 hover:bg-amber-900 text-white'
            }`}
          >
            <ShoppingBag size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
