import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { JewelryCategory } from '../types';
import { Sparkles, CheckCircle, Upload, Gem, Heart } from 'lucide-react';

interface CustomJewelryPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CustomJewelryPage: React.FC<CustomJewelryPageProps> = ({ onNavigate }) => {
  const { sellers, categories, submitCustomRequest } = useMarketplace();

  const [customerName, setCustomerName] = useState('Sana Malik');
  const [customerEmail, setCustomerEmail] = useState('sana.malik@example.com');
  const [customerPhone, setCustomerPhone] = useState('+923214567890');
  const [jewelryType, setJewelryType] = useState<JewelryCategory>('Personalized Jewelry');
  const [budgetPKR, setBudgetPKR] = useState<number>(5000);
  const [preferredMaterial, setPreferredMaterial] = useState('925 Sterling Silver');
  const [description, setDescription] = useState('');
  const [preferredSellerId, setPreferredSellerId] = useState('');

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    submitCustomRequest({
      customerId: 'c-101',
      customerName,
      customerEmail,
      customerPhone,
      jewelryType,
      budgetPKR,
      preferredMaterial,
      description,
      preferredSellerId: preferredSellerId || undefined
    });

    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Header */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-8 sm:p-12 text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 text-amber-300 border border-amber-400/20 text-xs font-semibold rounded-full uppercase tracking-wider">
          <Sparkles size={14} /> Custom & Bespoke Atelier
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold">
          Create Something Personal
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
          Commission a custom Urdu calligraphy frame, custom knitted crochet bag, custom scented soy candle, custom resin art, or personalized jewelry set with our master craft makers.
        </p>
      </div>

      {/* Examples Showcase Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center mx-auto">
            <Sparkles size={22} />
          </div>
          <h3 className="font-serif font-bold text-stone-900 text-sm">Custom Calligraphy</h3>
          <p className="text-xs text-stone-500 font-light">
            Urdu Nastaliq or Thuluth canvas frames, clay dishes & custom nameplates.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center mx-auto">
            <Gem size={22} />
          </div>
          <h3 className="font-serif font-bold text-stone-900 text-sm">Handwoven Crochet & Bags</h3>
          <p className="text-xs text-stone-500 font-light">
            Bespoke color palettes, yarn choices, and sizes for bags, pouches & blankets.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center mx-auto">
            <Heart size={22} />
          </div>
          <h3 className="font-serif font-bold text-stone-900 text-sm">Decor, Candles & Gifts</h3>
          <p className="text-xs text-stone-500 font-light">
            Custom scented soy wax candles, resin keychains, and eternal flower bouquets.
          </p>
        </div>
      </div>

      {/* Request Form */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs">
        {submitted ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle size={32} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              Custom Request Submitted!
            </h3>
            <p className="text-xs text-stone-600 max-w-md mx-auto">
              Our sellers have received your design specs. You will receive quotes and direct messages in your account inbox within 24 hours.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold text-stone-800"
              >
                Submit Another Request
              </button>
              <button
                onClick={() => onNavigate('account')}
                className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800"
              >
                View My Account
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-200 pb-3">
              Submit Bespoke Custom Craft Quote Request
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">WhatsApp / Phone Number</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">Product Category</label>
                <select
                  value={jewelryType}
                  onChange={(e) => setJewelryType(e.target.value as JewelryCategory)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">Target Budget (PKR)</label>
                <input
                  type="number"
                  required
                  value={budgetPKR}
                  onChange={(e) => setBudgetPKR(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">Preferred Material / Craft Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cotton Yarn / Terracotta Clay / Soy Wax / 925 Silver / Resin"
                  value={preferredMaterial}
                  onChange={(e) => setPreferredMaterial(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">Select Specific Craft Store (Optional)</label>
                <select
                  value={preferredSellerId}
                  onChange={(e) => setPreferredSellerId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                >
                  <option value="">-- Open to All Relevant Sellers --</option>
                  {sellers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shopName} ({s.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-stone-800">
                  Detailed Design Description & Instructions
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Provide details: Color preference, dimensions, text/names, custom motifs or reference image description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-8 py-3.5 bg-amber-900 text-white rounded-xl text-xs font-bold hover:bg-amber-950 flex items-center gap-2 shadow-md active:scale-95"
              >
                <Sparkles size={16} />
                <span>Submit Bespoke Request</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
