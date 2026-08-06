import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/product/ProductCard';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { formatPKR } from '../utils/format';
import {
  Sparkles,
  ArrowRight,
  Store,
  ChevronRight,
  Search,
  ShieldCheck,
  Truck,
  Heart
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { products, categories } = useMarketplace();
  const [heroSearch, setHeroSearch] = useState('');

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      onNavigate('shop', heroSearch.trim());
    }
  };

  return (
    <div className="space-y-16 pb-16 pt-2">
      {/* HERO SECTION - LIGHT WARM IVORY & AMBER THEME */}
      <section className="relative bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-stone-100 text-stone-900 overflow-hidden rounded-3xl mx-4 sm:mx-8 border border-amber-200/80 shadow-lg">
        {/* Soft Background Overlay */}
        <div className="absolute inset-0 z-0 opacity-20 mix-blend-multiply">
          <img
            src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1800&q=80"
            alt="Handmade Products Hero"
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-amber-50/90 to-orange-50/60" />
        </div>

        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-14 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Hero Content & Search */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300/80 text-[11px] font-bold tracking-widest uppercase shadow-xs">
              <Sparkles size={13} className="text-amber-700 animate-pulse-slow" />
              <span>Pakistan's Multi-Vendor Handmade Marketplace</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-tight">
              Authentic Crafts, <br />
              <span className="gold-gradient-text italic font-normal">Made to Be Yours.</span>
            </h1>

            <p className="text-stone-600 text-xs sm:text-sm max-w-xl leading-relaxed font-medium">
              Discover one-of-a-kind handmade jewelry, tote bags, custom calligraphy, home decor, soy candles, keychains, and flower bouquets crafted by independent Pakistani makers.
            </p>

            {/* In-Hero Quick Search Bar */}
            <form onSubmit={handleHeroSearch} className="max-w-xl relative pt-1">
              <div className="relative flex items-center bg-white p-1.5 rounded-2xl shadow-md border border-amber-200">
                <Search size={18} className="text-stone-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search jewelry, tote bags, calligraphy, soy candles..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold text-xs transition-all shadow-md shrink-0 flex items-center gap-1.5"
                >
                  <span>Search</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('shop')}
                className="px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-full font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 active:scale-95 border border-amber-700"
              >
                <span>Explore All Categories</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => onNavigate('become-a-seller')}
                className="px-6 py-3 bg-white hover:bg-amber-50 text-stone-800 border border-stone-300/80 rounded-full font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2"
              >
                <Store size={15} className="text-amber-800" />
                <span>Open Your Seller Shop</span>
              </button>
            </div>

            {/* Quick Stats Row */}
            <div className="pt-6 border-t border-amber-200/70 grid grid-cols-3 gap-4 text-stone-800 max-w-lg">
              <div>
                <p className="font-serif text-xl sm:text-2xl font-bold text-amber-900">450+</p>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-0.5">Verified Sellers</p>
              </div>
              <div>
                <p className="font-serif text-xl sm:text-2xl font-bold text-amber-900">5,000+</p>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-0.5">Unique Crafts</p>
              </div>
              <div>
                <p className="font-serif text-xl sm:text-2xl font-bold text-amber-900">4.9 ★</p>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-0.5">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Category Showcase Cards */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="grid grid-cols-2 gap-3 relative">
              {/* Category Card 1: Jewelry */}
              <div
                onClick={() => onNavigate('shop', 'Jewelry')}
                className="group relative bg-white border border-amber-200/80 rounded-2xl overflow-hidden p-2.5 shadow-md cursor-pointer hover:scale-103 hover:border-amber-400 transition-all"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 relative">
                  <ImageWithFallback
                    src={categories[0]?.image}
                    alt={categories[0]?.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 bg-amber-900/90 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs border border-amber-700/30">
                    Craft Jewelry
                  </span>
                </div>
                <p className="text-xs font-serif font-bold text-stone-900 mt-2 truncate">Jewelry & Ornaments</p>
              </div>

              {/* Category Card 2: Bags */}
              <div
                onClick={() => onNavigate('shop', 'Bags')}
                className="group relative bg-white border border-amber-200/80 rounded-2xl overflow-hidden p-2.5 shadow-md cursor-pointer hover:scale-103 hover:border-amber-400 transition-all translate-y-3"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 relative">
                  <ImageWithFallback
                    src={categories[1]?.image}
                    alt={categories[1]?.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 bg-amber-900/90 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs border border-amber-700/30">
                    Handwoven
                  </span>
                </div>
                <p className="text-xs font-serif font-bold text-stone-900 mt-2 truncate">Bags & Clutches</p>
              </div>

              {/* Category Card 3: Calligraphy */}
              <div
                onClick={() => onNavigate('shop', 'Calligraphy')}
                className="group relative bg-white border border-amber-200/80 rounded-2xl overflow-hidden p-2.5 shadow-md cursor-pointer hover:scale-103 hover:border-amber-400 transition-all -translate-y-2"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 relative">
                  <ImageWithFallback
                    src={categories[3]?.image}
                    alt={categories[3]?.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 bg-amber-900/90 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs border border-amber-700/30">
                    Art Frame
                  </span>
                </div>
                <p className="text-xs font-serif font-bold text-stone-900 mt-2 truncate">Calligraphy Canvas</p>
              </div>

              {/* Category Card 4: Candles */}
              <div
                onClick={() => onNavigate('shop', 'Candles')}
                className="group relative bg-white border border-amber-200/80 rounded-2xl overflow-hidden p-2.5 shadow-md cursor-pointer hover:scale-103 hover:border-amber-400 transition-all translate-y-1"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 relative">
                  <ImageWithFallback
                    src={categories[4]?.image}
                    alt={categories[4]?.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 bg-amber-900/90 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs border border-amber-700/30">
                    Aroma
                  </span>
                </div>
                <p className="text-xs font-serif font-bold text-stone-900 mt-2 truncate">Soy Candles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              Curated Collections
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-2">
              Explore Handmade Categories
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 transition-colors"
          >
            <span>View All Categories</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => onNavigate('shop', cat.name)}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden p-3 luxury-card-shadow transition-all duration-300 cursor-pointer text-center space-y-3"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 relative">
                <ImageWithFallback
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <span className="absolute bottom-2 right-2 bg-stone-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {cat.count} items
                </span>
              </div>
              <div>
                <p className="font-serif text-sm font-bold text-stone-900 group-hover:text-amber-900 truncate">
                  {cat.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              Handpicked Essentials
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-2">
              Featured Handmade Products
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1"
          >
            <span>View Full Catalogue</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              Fresh Off The Workbench
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-2">
              New Craft Arrivals
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1"
          >
            <span>Explore All New</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* BECOME A SELLER CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 luxury-card-shadow">
          <div className="space-y-3 text-left max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              Seller Portal
            </span>
            <h3 className="font-serif text-3xl font-bold text-stone-900">
              Turn Your Handcrafts Into a Thriving Business.
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
              Open your shop on She Hunnar. List your handmade jewelry, bags, home decor, calligraphy, soy candles, keychains, and flower bouquets, reach customers across Pakistan, and receive direct 100% transparent payouts.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-4">
            <button
              onClick={() => onNavigate('become-a-seller')}
              className="px-8 py-4 bg-amber-900 hover:bg-amber-950 text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-md transition-all border border-amber-800 active:scale-95"
            >
              Open Your Seller Shop
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
