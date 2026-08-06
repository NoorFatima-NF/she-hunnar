import React from 'react';
import { SellerProfile } from '../../types';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { CheckCircle, MapPin, Star, Package, ArrowRight } from 'lucide-react';

interface SellerCardProps {
  seller: SellerProfile;
  onNavigate: (view: string, param?: string) => void;
}

export const SellerCard: React.FC<SellerCardProps> = ({ seller, onNavigate }) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
      <div>
        {/* Banner */}
        <div className="h-24 bg-stone-200 relative overflow-hidden">
          <ImageWithFallback
            src={seller.banner}
            alt={seller.shopName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-stone-900/20" />
        </div>

        {/* Logo & Header Info */}
        <div className="px-5 relative pt-0 pb-3">
          <div className="flex items-end justify-between -mt-8 mb-3">
            <ImageWithFallback
              src={seller.logo}
              alt={seller.shopName}
              className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-sm bg-white"
            />
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle size={12} className="text-emerald-600" /> Verified Seller
            </span>
          </div>

          <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-1.5 group-hover:text-amber-900 transition-colors">
            {seller.shopName}
          </h3>

          <p className="text-xs font-medium text-amber-800 mt-0.5">
            {seller.specialization}
          </p>

          <div className="flex items-center gap-3 text-xs text-stone-500 mt-2 font-medium">
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-stone-400" />
              {seller.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-stone-700 font-semibold">
              <Star size={13} className="text-amber-500 fill-amber-500" />
              {seller.rating.toFixed(1)} ({seller.reviewCount})
            </span>
          </div>

          <p className="text-xs text-stone-600 line-clamp-2 mt-3 leading-relaxed">
            {seller.about}
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
        <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
          <Package size={13} className="text-stone-400" />
          <span>{seller.productCount} Handmade Items</span>
        </div>

        <button
          onClick={() => onNavigate('shopfront', seller.slug)}
          className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
        >
          <span>Visit Shop</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
