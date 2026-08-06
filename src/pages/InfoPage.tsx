import React from 'react';
import { ShieldCheck, Heart, Truck, Sparkles } from 'lucide-react';

interface InfoPageProps {
  type: string;
  onNavigate: (view: string, param?: string) => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({ type, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {type === 'about' && (
        <div className="space-y-6">
          <div className="bg-stone-900 text-stone-100 rounded-3xl p-8 sm:p-12 text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
              Our Mission
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold">About She Hunnar Marketplace</h1>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-8 space-y-4 text-stone-700 text-xs sm:text-sm leading-relaxed font-light">
            <p className="font-serif text-lg font-bold text-stone-900">
              Connecting Independent Pakistani Craft Creators, Weavers & Women Makers with Appreciative Customers Worldwide.
            </p>
            <p>
              She Hunnar was built to celebrate female entrepreneurship and slow craftsmanship. Across Pakistan—from Lahore’s heritage workshops to Quetta’s handwoven textiles and home studios in Karachi—skilled makers create breathtaking handmade products with passion.
            </p>
            <p>
              Our multi-vendor platform empowers sellers by providing them with dedicated online storefronts, automated sub-order fulfillment, fair commission models, and direct access to customers who cherish authentic handmade products.
            </p>
          </div>
        </div>
      )}

      {type === 'guarantee' && (
        <div className="space-y-6">
          <div className="bg-stone-900 text-stone-100 rounded-3xl p-8 sm:p-12 text-center space-y-3">
            <ShieldCheck size={36} className="text-amber-400 mx-auto" />
            <h1 className="font-serif text-3xl sm:text-4xl font-bold">100% Handmade Guarantee</h1>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-8 space-y-4 text-stone-700 text-xs sm:text-sm leading-relaxed font-light">
            <p>
              Every single piece listed on She Hunnar is verified to be created by hand using authentic materials—whether milk cotton yarns, natural clays, soy wax, terracotta, or sterling silver.
            </p>
            <p>
              We rigorously audit seller applications to eliminate mass-manufactured or factory-imported items, ensuring you always receive genuine handmade products.
            </p>
          </div>
        </div>
      )}

      {type === 'shipping' && (
        <div className="space-y-6">
          <div className="bg-stone-900 text-stone-100 rounded-3xl p-8 sm:p-12 text-center space-y-3">
            <Truck size={36} className="text-amber-400 mx-auto" />
            <h1 className="font-serif text-3xl sm:text-4xl font-bold">Shipping & TCS Delivery</h1>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-8 space-y-4 text-stone-700 text-xs sm:text-sm leading-relaxed font-light">
            <p>
              Orders are dispatched directly from the individual seller's studio in Lahore, Karachi, Rawalpindi, or Peshawar via TCS, Leopard, or M&P couriers.
            </p>
            <p>
              Once your product passes quality inspection or bespoke crafting (usually 2-4 business days), a tracking code is generated and attached to your sub-order. Standard delivery takes 2 to 4 working days across major Pakistan cities.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
