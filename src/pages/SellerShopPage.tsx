import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/product/ProductCard';
import {
  CheckCircle,
  MapPin,
  Star,
  Package,
  MessageSquare,
  Sparkles,
  Share2
} from 'lucide-react';

interface SellerShopPageProps {
  slug: string;
  onNavigate: (view: string, param?: string) => void;
}

export const SellerShopPage: React.FC<SellerShopPageProps> = ({ slug, onNavigate }) => {
  const { sellers, products, sendMessage, showToast } = useMarketplace();

  const seller = sellers.find((s) => s.slug === slug || s.id === slug) || sellers[0];
  const sellerProducts = products.filter((p) => p.sellerId === seller.id && p.status === 'published');

  const [selectedCat, setSelectedCat] = useState<string>('All');

  const categoriesInShop = Array.from(new Set(sellerProducts.map((p) => p.category)));

  const filteredProducts = selectedCat === 'All'
    ? sellerProducts
    : sellerProducts.filter((p) => p.category === selectedCat);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Shop link copied to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner & Header Box */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        {/* Shop Cover Banner */}
        <div className="h-48 sm:h-64 bg-stone-200 relative overflow-hidden">
          <img
            src={seller.banner}
            alt={seller.shopName}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-stone-950/20" />
        </div>

        {/* Shop Info Header Area */}
        <div className="p-6 sm:p-8 relative pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-16 mb-4">
            <div className="flex items-end gap-4">
              <img
                src={seller.logo}
                alt={seller.shopName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white object-cover shadow-md bg-white shrink-0"
              />
              <div className="space-y-1 pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                    {seller.shopName}
                  </h1>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle size={12} className="text-emerald-600" /> Verified Seller
                  </span>
                </div>
                <p className="text-xs font-bold text-amber-900">
                  {seller.specialization}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-700 transition-colors"
                title="Share Shop Link"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Meta & Bio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-stone-200 text-xs">
            <div className="md:col-span-2 space-y-2">
              <h3 className="font-serif font-bold text-stone-900 text-sm">
                About the Maker & Studio
              </h3>
              <p className="text-stone-600 leading-relaxed font-light">
                {seller.about}
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2.5 font-medium">
              <div className="flex items-center justify-between text-stone-700">
                <span className="text-stone-400">Location:</span>
                <span className="font-semibold text-stone-900 flex items-center gap-1">
                  <MapPin size={13} className="text-amber-800" /> {seller.location}
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-700">
                <span className="text-stone-400">Artisan Rating:</span>
                <span className="font-semibold text-stone-900 flex items-center gap-1">
                  <Star size={13} className="text-amber-500 fill-amber-500" /> {seller.rating.toFixed(1)} ({seller.reviewCount} reviews)
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-700">
                <span className="text-stone-400">Completed Orders:</span>
                <span className="font-semibold text-stone-900">
                  {seller.completedOrders} orders fulfilled
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-700">
                <span className="text-stone-400">Shipping Policy:</span>
                <span className="font-semibold text-stone-900">
                  Rs. {seller.shippingFee} (Free over Rs. {seller.freeShippingThreshold})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Category Tabs */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="text-stone-400 mr-2 uppercase tracking-wider text-[10px]">Filter Shop Items:</span>
        <button
          onClick={() => setSelectedCat('All')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            selectedCat === 'All'
              ? 'bg-amber-900 text-white shadow-2xs font-bold'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          All Items ({sellerProducts.length})
        </button>
        {categoriesInShop.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              selectedCat === cat
                ? 'bg-amber-900 text-white shadow-2xs font-bold'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-xs text-stone-500">
          No products listed in this shop category yet.
        </div>
      )}
    </div>
  );
};
