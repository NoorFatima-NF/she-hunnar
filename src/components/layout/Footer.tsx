import React from 'react';
import { Logo } from '../common/Logo';
import { Gem, Heart, ShieldCheck, Truck, RefreshCw, Lock, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      {/* Platform Value Props Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-stone-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-stone-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-100">Verified Sellers</p>
              <p className="text-[11px] text-stone-400">100% genuine handmade products</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-100">Nationwide Express</p>
              <p className="text-[11px] text-stone-400">TCS & M&P delivery to all cities</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-100">Secure Payments</p>
              <p className="text-[11px] text-stone-400">COD, Bank Transfer, Easypaisa</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 shrink-0">
              <RefreshCw size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-100">Seller Protection</p>
              <p className="text-[11px] text-stone-400">Fair returns & custom ordering</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8 text-xs">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4 pr-4">
          <Logo size="md" variant="dark" />
          <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
            Pakistan’s premier multi-vendor marketplace dedicated to authentic handmade products, jewelry, bags, home decor, calligraphy, soy candles, keychains, and flower bouquets. Connecting independent craft creators directly with customers worldwide.
          </p>
          <div className="pt-2">
            <p className="text-[11px] font-semibold text-stone-200 uppercase tracking-wider mb-2">
              Currency & Region
            </p>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-stone-800 rounded border border-stone-700 text-stone-300 text-xs">
              🇵🇰 Pakistan (PKR - Rs)
            </span>
          </div>
        </div>

        {/* Shop Categories */}
        <div className="space-y-3">
          <h4 className="text-stone-100 font-semibold uppercase tracking-wider text-[11px]">
            Shop Categories
          </h4>
          <ul className="space-y-2 text-stone-400">
            <li>
              <button onClick={() => onNavigate('shop', 'Jewelry')} className="hover:text-amber-400">
                Jewelry
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', 'Bags')} className="hover:text-amber-400">
                Bags & Clutches
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', 'Home Decor')} className="hover:text-amber-400">
                Home Decor
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', 'Calligraphy')} className="hover:text-amber-400">
                Calligraphy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', 'Candles')} className="hover:text-amber-400">
                Candles
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', 'Keychains')} className="hover:text-amber-400">
                Keychains
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', 'Flower Bouquet')} className="hover:text-amber-400">
                Flower Bouquet
              </button>
            </li>
          </ul>
        </div>

        {/* For Sellers */}
        <div className="space-y-3">
          <h4 className="text-stone-100 font-semibold uppercase tracking-wider text-[11px]">
            Craft Sellers
          </h4>
          <ul className="space-y-2 text-stone-400">
            <li>
              <button onClick={() => onNavigate('become-a-seller')} className="hover:text-amber-400 text-amber-300 font-medium">
                Open Your Seller Shop
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('seller-dashboard')} className="hover:text-amber-400">
                Seller Dashboard Login
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('info', 'seller-guidelines')} className="hover:text-amber-400">
                Seller Guidelines
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('info', 'commission-policy')} className="hover:text-amber-400">
                Payouts & Commission
              </button>
            </li>
          </ul>
        </div>

        {/* Customer & Company */}
        <div className="space-y-3">
          <h4 className="text-stone-100 font-semibold uppercase tracking-wider text-[11px]">
            Customer Support
          </h4>
          <ul className="space-y-2 text-stone-400">
            <li>
              <button onClick={() => onNavigate('account')} className="hover:text-amber-400">
                My Account
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('account', 'orders')} className="hover:text-amber-400">
                Order History & Tracking
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('info', 'shipping')} className="hover:text-amber-400">
                Shipping & Delivery
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('info', 'returns')} className="hover:text-amber-400">
                Returns & Refund Policy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('info', 'faq')} className="hover:text-amber-400">
                FAQ & Help Center
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('info', 'privacy')} className="hover:text-amber-400">
                Privacy & Terms
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-4">
        <p>© {new Date().getFullYear()} She Hunnar Handmade Marketplace. All rights reserved.</p>
        <div className="flex items-center gap-1 text-stone-400">
          <span>Crafted with passion for independent makers across Pakistan</span>
          <Heart size={12} className="text-rose-500 fill-rose-500 ml-1" />
        </div>
      </div>
    </footer>
  );
};
