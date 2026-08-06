import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Store,
  CheckCircle,
  Upload,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Building,
  Truck,
  CreditCard
} from 'lucide-react';

interface BecomeSellerPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const BecomeSellerPage: React.FC<BecomeSellerPageProps> = ({ onNavigate }) => {
  const { submitSellerApplication } = useMarketplace();

  const [step, setStep] = useState<number>(1);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [shopName, setShopName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [about, setAbout] = useState('');
  const [location, setLocation] = useState('Lahore, Punjab');
  const [instagram, setInstagram] = useState('');

  const [logoUrl, setLogoUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  );
  const [bannerUrl, setBannerUrl] = useState(
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80'
  );

  const [payoutMethod, setPayoutMethod] = useState('Meezan Bank Ltd');
  const [accountDetails, setAccountDetails] = useState('IBAN: PK36MEZN00010002931023');

  const [shippingFee, setShippingFee] = useState<number>(250);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(4500);

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !specialization || !about) return;

    submitSellerApplication({
      userId: `u-${Date.now()}`,
      shopName,
      slug: shopName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, ''),
      specialization,
      about,
      location,
      logo: logoUrl,
      banner: bannerUrl,
      commissionRate: 10,
      shippingFee,
      freeShippingThreshold,
      payoutMethod,
      accountDetails,
      socialLinks: { instagram }
    });

    onNavigate('seller-dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Hero Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-8 sm:p-12 text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 text-amber-300 border border-amber-400/20 text-xs font-semibold rounded-full uppercase tracking-wider">
          <Sparkles size={14} /> Seller Onboarding Portal
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold">
          Open Your Handmade Craft Shop
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
          Join Pakistan’s dedicated handmade marketplace. List your handcrafted products (jewelry, bags, home decor, calligraphy, soy candles, keychains, and flower bouquets), manage custom orders, and reach customers nationwide with 100% transparent payouts.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
          <span className={step >= 1 ? 'text-amber-900 font-bold' : ''}>1. Account</span>
          <span className={step >= 2 ? 'text-amber-900 font-bold' : ''}>2. Shop Details</span>
          <span className={step >= 3 ? 'text-amber-900 font-bold' : ''}>3. Brand Assets</span>
          <span className={step >= 4 ? 'text-amber-900 font-bold' : ''}>4. Payouts</span>
          <span className={step >= 5 ? 'text-amber-900 font-bold' : ''}>5. Shipping</span>
        </div>
        <div className="w-full bg-stone-100 h-2 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-amber-800 h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Multi-Step Form */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-200 pb-3">
              Step 1: Maker Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayesha Khan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="ayesha@studio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-stone-800">WhatsApp / Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+92 300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-amber-900 text-white rounded-xl text-xs font-bold hover:bg-amber-950 flex items-center gap-2"
              >
                <span>Continue to Shop Info</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-200 pb-3">
              Step 2: Seller Shop Profile
            </h3>
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">Shop Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Noor Crafts Studio"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">Craft & Product Specialization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handmade Crochet Bags, Soy Candles & Calligraphy"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">Location (City, Province)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lahore, Punjab"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">About Your Craft & Studio Story</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your handmade process, materials used, and crafting experience..."
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">Instagram Handle (Optional)</label>
                <input
                  type="text"
                  placeholder="@noorcrafts_studio"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-amber-900 text-white rounded-xl text-xs font-bold hover:bg-amber-950 flex items-center gap-2"
              >
                <span>Continue to Brand Assets</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-200 pb-3">
              Step 3: Brand Logo & Cover Banner
            </h3>
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">Shop Logo URL</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
                <div className="flex items-center gap-3 pt-2">
                  <img src={logoUrl} alt="Logo preview" className="w-12 h-12 rounded-full object-cover border border-stone-200" />
                  <span className="text-[11px] text-stone-400">Preview logo icon</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="font-bold text-stone-800">Shop Cover Banner URL</label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
                <div className="h-20 bg-stone-100 rounded-xl overflow-hidden border border-stone-200 mt-2">
                  <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2.5 bg-amber-900 text-white rounded-xl text-xs font-bold hover:bg-amber-950 flex items-center gap-2"
              >
                <span>Continue to Payout Info</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-200 pb-3">
              Step 4: Earnings Payout Account
            </h3>
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">Preferred Payout Method</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                >
                  <option value="Meezan Bank Ltd">Meezan Bank Ltd</option>
                  <option value="Habib Bank Ltd (HBL)">Habib Bank Ltd (HBL)</option>
                  <option value="Easypaisa">Easypaisa Mobile Wallet</option>
                  <option value="JazzCash">JazzCash Mobile Wallet</option>
                  <option value="Bank Alfalah">Bank Alfalah</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">Account / IBAN Details</label>
                <input
                  type="text"
                  required
                  placeholder="IBAN: PK36MEZN0001000..."
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 leading-relaxed text-[11px]">
                <p className="font-bold">Platform Commission Note:</p>
                <p>She Hunnar charges a transparent 10% commission on completed sales. Payouts are transferred twice monthly directly to your chosen bank or wallet account.</p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="px-6 py-2.5 bg-amber-900 text-white rounded-xl text-xs font-bold hover:bg-amber-950 flex items-center gap-2"
              >
                <span>Continue to Shipping Rules</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <form onSubmit={handleCompleteSubmit} className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-200 pb-3">
              Step 5: Shipping Rules & Final Submit
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">Standard Shipping Fee (PKR)</label>
                <input
                  type="number"
                  required
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">Free Shipping Threshold (PKR)</label>
                <input
                  type="number"
                  required
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-stone-900 block">Verification Summary</span>
              <p className="text-stone-600">
                Upon submitting, your shop profile will be sent to the moderation team for verification. You will be able to start adding products to your shop immediately in pending status.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-amber-900 text-white rounded-xl text-xs font-bold hover:bg-amber-950 flex items-center gap-2 shadow-md active:scale-95"
              >
                <CheckCircle size={16} />
                <span>Submit Seller Application</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
