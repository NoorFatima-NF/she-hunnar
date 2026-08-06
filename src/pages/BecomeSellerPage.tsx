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
  CreditCard,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  AlertCircle,
  Lock
} from 'lucide-react';

interface BecomeSellerPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const BecomeSellerPage: React.FC<BecomeSellerPageProps> = ({ onNavigate }) => {
  const { submitSellerApplication } = useMarketplace();

  const [step, setStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Step 1: Account & Contact State
  const [sellerType, setSellerType] = useState<'individual' | 'business'>('individual');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Step 2: Store Profile & Address
  const [shopName, setShopName] = useState('');
  const [primaryCategory, setPrimaryCategory] = useState('Jewelry');
  const [about, setAbout] = useState('');
  const [locationCity, setLocationCity] = useState('Lahore');
  const [province, setProvince] = useState('Punjab');
  const [pickupAddress, setPickupAddress] = useState('');
  const [instagram, setInstagram] = useState('');

  // Step 3: CNIC Identity Verification (Daraz Style)
  const [cnicName, setCnicName] = useState('');
  const [cnicNumber, setCnicNumber] = useState('');
  const [cnicFrontUrl, setCnicFrontUrl] = useState(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
  );
  const [cnicBackUrl, setCnicBackUrl] = useState(
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80'
  );

  // Step 4: Bank Account & Financial Info
  const [bankTitle, setBankTitle] = useState('');
  const [bankName, setBankName] = useState('Meezan Bank Ltd');
  const [accountNumber, setAccountNumber] = useState('');
  const [chequeProofUrl, setChequeProofUrl] = useState(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
  );

  // Step 5: Shipping & Rules
  const [shippingFee, setShippingFee] = useState<number>(250);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(4500);
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);

  // Form Validation & Errors
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Brand Default Media
  const defaultLogo =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
  const defaultBanner =
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80';

  const handleSendOtp = () => {
    if (!phone.trim() || phone.length < 10) {
      setErrorMsg('Please enter a valid Pakistani mobile number (+92 3XX XXXXXXX).');
      return;
    }
    setErrorMsg(null);
    setIsOtpSent(true);
    setOtpCode('8492'); // Simulated OTP
  };

  const handleVerifyOtp = () => {
    if (otpCode === '8492' || otpCode.trim().length === 4) {
      setIsOtpVerified(true);
      setErrorMsg(null);
    } else {
      setErrorMsg('Invalid verification code. Please enter 8492 to verify.');
    }
  };

  const handleStep1Next = () => {
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please fill in all personal contact details.');
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!shopName.trim() || !pickupAddress.trim() || !about.trim()) {
      setErrorMsg('Please provide your shop name, description, and pickup address.');
      return;
    }
    if (!cnicName) setCnicName(fullName);
    if (!bankTitle) setBankTitle(fullName);
    setErrorMsg(null);
    setStep(3);
  };

  const handleStep3Next = () => {
    if (!cnicName.trim() || !cnicNumber.trim() || cnicNumber.length < 13) {
      setErrorMsg('Please enter your 13-digit CNIC Number (e.g. 35201-1234567-1).');
      return;
    }
    setErrorMsg(null);
    setStep(4);
  };

  const handleStep4Next = () => {
    if (!bankTitle.trim() || !accountNumber.trim()) {
      setErrorMsg('Please provide your Bank Account Title and IBAN / Account Number.');
      return;
    }
    setErrorMsg(null);
    setStep(5);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      setErrorMsg('Please accept the Seller Agreement Terms & Conditions to complete registration.');
      return;
    }

    const fullLocation = `${locationCity}, ${province}`;
    const formattedAccountDetails = `${bankName} | Title: ${bankTitle} | A/C: ${accountNumber}`;

    submitSellerApplication({
      userId: `u-seller-${Date.now()}`,
      shopName,
      slug: shopName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, ''),
      specialization: `${primaryCategory} & Handmade Crafts`,
      about,
      location: fullLocation,
      logo: defaultLogo,
      banner: defaultBanner,
      commissionRate: 10,
      shippingFee,
      freeShippingThreshold,
      payoutMethod: bankName,
      accountDetails: formattedAccountDetails,
      sellerType,
      cnicNumber,
      cnicName,
      cnicFrontUrl,
      cnicBackUrl,
      bankTitle,
      pickupAddress: `${pickupAddress}, ${locationCity}`,
      socialLinks: { instagram }
    });

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in zoom-in-95">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle size={44} className="animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Registration Submitted Successfully
          </span>
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            Welcome to She Hunnar Seller Center!
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Your shop <span className="font-bold text-stone-900">"{shopName}"</span> registration has been received. You can now access your Seller Dashboard immediately, add handmade items to inventory, and start selling across Pakistan!
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2 text-amber-950">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <ShieldCheck size={16} />
            <span>Verification Status: Pending Verification</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Our artisan onboarding team will verify your CNIC ({cnicNumber}) and Bank details within 24 hours. Your products can be listed right away!
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('seller-dashboard')}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-900 to-stone-900 hover:from-amber-950 hover:to-stone-950 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <Store size={16} />
            <span>Open Seller Dashboard</span>
          </button>
          <button
            onClick={() => onNavigate('shop')}
            className="w-full sm:w-auto px-6 py-3.5 border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold rounded-xl text-xs transition-colors"
          >
            Explore Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner - Daraz Style */}
      <div className="bg-gradient-to-r from-stone-950 via-amber-950 to-stone-900 text-stone-100 rounded-3xl p-8 sm:p-10 relative overflow-hidden border border-amber-900/40 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase tracking-widest rounded-md shadow-xs">
              Daraz Style Onboarding
            </span>
            <span className="text-xs text-amber-200/80 font-medium">100% Verified Seller Portal</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
            Register Your Seller Shop on She Hunnar
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed font-light">
            Sell your handmade jewelry, bags, home decor, calligraphy, soy candles, keychains, and flower bouquets directly to buyers across Pakistan. Transparent 10% commission & bi-monthly automated bank payouts.
          </p>
        </div>
      </div>

      {/* Stepper Progress Bar (Daraz 5-Step Indicator) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
        <div className="grid grid-cols-5 text-center text-[11px] sm:text-xs font-bold text-stone-400 gap-1">
          <div className={`space-y-1 ${step >= 1 ? 'text-amber-900 font-extrabold' : ''}`}>
            <div className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-amber-900 text-white shadow-xs' : 'bg-stone-100 text-stone-500'}`}>
              1
            </div>
            <span className="hidden sm:block">Account</span>
          </div>
          <div className={`space-y-1 ${step >= 2 ? 'text-amber-900 font-extrabold' : ''}`}>
            <div className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-amber-900 text-white shadow-xs' : 'bg-stone-100 text-stone-500'}`}>
              2
            </div>
            <span className="hidden sm:block">Store Profile</span>
          </div>
          <div className={`space-y-1 ${step >= 3 ? 'text-amber-900 font-extrabold' : ''}`}>
            <div className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-amber-900 text-white shadow-xs' : 'bg-stone-100 text-stone-500'}`}>
              3
            </div>
            <span className="hidden sm:block">CNIC ID</span>
          </div>
          <div className={`space-y-1 ${step >= 4 ? 'text-amber-900 font-extrabold' : ''}`}>
            <div className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${step >= 4 ? 'bg-amber-900 text-white shadow-xs' : 'bg-stone-100 text-stone-500'}`}>
              4
            </div>
            <span className="hidden sm:block">Bank Account</span>
          </div>
          <div className={`space-y-1 ${step >= 5 ? 'text-amber-900 font-extrabold' : ''}`}>
            <div className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${step >= 5 ? 'bg-amber-900 text-white shadow-xs' : 'bg-stone-100 text-stone-500'}`}>
              5
            </div>
            <span className="hidden sm:block">Shipping</span>
          </div>
        </div>

        <div className="w-full bg-stone-100 h-2 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-800 to-amber-900 h-full transition-all duration-500 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Message Alert */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs flex items-center gap-3 animate-in fade-in">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Main Multi-Step Onboarding Form */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-6">
        {/* STEP 1: ACCOUNT TYPE & MOBILE VERIFICATION */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Step 1: Seller Account & Contact Details
                </h3>
                <p className="text-xs text-stone-500">Choose seller account type and verify mobile number</p>
              </div>
              <User className="text-amber-800 hidden sm:block" size={24} />
            </div>

            {/* Seller Account Type Selection */}
            <div className="space-y-2">
              <label className="font-bold text-xs text-stone-800 uppercase tracking-wider">
                Select Seller Account Type *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div
                  onClick={() => setSellerType('individual')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    sellerType === 'individual'
                      ? 'border-amber-800 bg-amber-50/50 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className={sellerType === 'individual' ? 'text-amber-900' : 'text-stone-400'} size={20} />
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">Individual / Local Artisan</h4>
                      <p className="text-[11px] text-stone-500">Personal seller account with CNIC verification</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setSellerType('business')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    sellerType === 'business'
                      ? 'border-amber-800 bg-amber-50/50 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building className={sellerType === 'business' ? 'text-amber-900' : 'text-stone-400'} size={20} />
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">Corporate / Business Seller</h4>
                      <p className="text-[11px] text-stone-500">Registered business with NTN & Company registration</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-800 ml-1">Full Legal Name (as per CNIC) *</label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sana Malik"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 focus:outline-none focus:border-amber-800 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800 ml-1">Email Address *</label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-3 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="sana.malik@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 focus:outline-none focus:border-amber-800 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Number & Phone OTP Verification */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 text-xs">
              <label className="font-bold text-stone-900 block">Pakistani Mobile Number (SMS Verification) *</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 flex items-center">
                  <Phone size={16} className="absolute left-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="+92 300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 focus:outline-none font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-950 text-white font-bold rounded-xl transition-all shrink-0"
                >
                  {isOtpSent ? 'Resend SMS OTP' : 'Send Verification OTP'}
                </button>
              </div>

              {isOtpSent && (
                <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row items-center gap-2 animate-in fade-in">
                  <input
                    type="text"
                    placeholder="Enter 4-digit OTP (Type 8492)"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full sm:w-48 bg-white border border-stone-300 rounded-xl p-2.5 text-center font-bold tracking-widest focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className={`px-5 py-2.5 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                      isOtpVerified
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-800 text-white hover:bg-amber-900'
                    }`}
                  >
                    {isOtpVerified ? <CheckCircle size={14} /> : null}
                    <span>{isOtpVerified ? 'Phone Verified ✓' : 'Verify Code'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={handleStep1Next}
                className="px-7 py-3 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95"
              >
                <span>Continue to Store Profile</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: STORE PROFILE & WAREHOUSE PICKUP ADDRESS */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Step 2: Store Profile & Pickup Warehouse Address
                </h3>
                <p className="text-xs text-stone-500">Provide store branding & order pickup address for couriers</p>
              </div>
              <Store className="text-amber-800 hidden sm:block" size={24} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-800 ml-1">Store / Shop Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Noor Crafts Studio"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800 ml-1">Primary Craft Category *</label>
                <select
                  value={primaryCategory}
                  onChange={(e) => setPrimaryCategory(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none font-medium"
                >
                  <option value="Jewelry">Jewelry & Ornaments</option>
                  <option value="Bags">Bags & Clutches</option>
                  <option value="Home Decor">Home Decor & Crafts</option>
                  <option value="Calligraphy">Calligraphy Canvas</option>
                  <option value="Candles">Soy Candles</option>
                  <option value="Keychains">Keychains</option>
                  <option value="Bouquets">Flower Bouquets</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-800 ml-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lahore"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800 ml-1">Province *</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none font-medium"
                >
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Islamabad ICT">Islamabad ICT</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-stone-800 ml-1">Courier Pickup Address (Warehouse / Studio) *</label>
              <input
                type="text"
                required
                placeholder="House / Shop #, Street, Block, Area..."
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none font-medium"
              />
              <span className="text-[11px] text-stone-400 block ml-1">TCS, CallCourier & M&P will pick up customer orders from this address.</span>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-stone-800 ml-1">Store Story / About Craft *</label>
              <textarea
                rows={3}
                required
                placeholder="Tell customers about your handmade crafting experience, materials used, and artisan background..."
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none font-medium"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStep2Next}
                className="px-7 py-3 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95"
              >
                <span>Continue to CNIC Verification</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: IDENTITY & CNIC VERIFICATION (DARAZ STYLE) */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Step 3: Identity Card (CNIC) Verification
                </h3>
                <p className="text-xs text-stone-500">Provide CNIC details for seller verification & fraud prevention</p>
              </div>
              <ShieldCheck className="text-amber-800 hidden sm:block" size={24} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-800 ml-1">CNIC Holder Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full name as printed on CNIC"
                  value={cnicName}
                  onChange={(e) => setCnicName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800 ml-1">13-Digit CNIC Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 35201-1234567-1"
                  value={cnicNumber}
                  onChange={(e) => setCnicNumber(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none font-medium tracking-wider"
                />
              </div>
            </div>

            {/* CNIC Document Image Upload Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                <label className="font-bold text-stone-800 block">CNIC Front Photo Upload *</label>
                <div className="h-32 bg-white rounded-xl overflow-hidden border border-dashed border-stone-300 relative flex items-center justify-center">
                  {cnicFrontUrl ? (
                    <img src={cnicFrontUrl} alt="CNIC Front" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2 text-stone-400">
                      <Upload size={24} className="mx-auto mb-1" />
                      <span className="text-[10px]">Click to upload CNIC front</span>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={cnicFrontUrl}
                  onChange={(e) => setCnicFrontUrl(e.target.value)}
                  className="w-full text-[11px] bg-white border border-stone-200 rounded-lg p-1.5"
                />
              </div>

              <div className="space-y-2 p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                <label className="font-bold text-stone-800 block">CNIC Back Photo Upload *</label>
                <div className="h-32 bg-white rounded-xl overflow-hidden border border-dashed border-stone-300 relative flex items-center justify-center">
                  {cnicBackUrl ? (
                    <img src={cnicBackUrl} alt="CNIC Back" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2 text-stone-400">
                      <Upload size={24} className="mx-auto mb-1" />
                      <span className="text-[10px]">Click to upload CNIC back</span>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={cnicBackUrl}
                  onChange={(e) => setCnicBackUrl(e.target.value)}
                  className="w-full text-[11px] bg-white border border-stone-200 rounded-lg p-1.5"
                />
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-center gap-2">
              <Lock size={16} className="shrink-0 text-amber-700" />
              <span>Your CNIC documents are securely encrypted and used strictly for identity verification.</span>
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStep3Next}
                className="px-7 py-3 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95"
              >
                <span>Continue to Bank Account Details</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: BANK ACCOUNT & PAYOUT DETAILS */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Step 4: Earnings Bank Account & Payout Details
                </h3>
                <p className="text-xs text-stone-500">Provide bank or mobile wallet details for order payout deposits</p>
              </div>
              <CreditCard className="text-amber-800 hidden sm:block" size={24} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-800 ml-1">Account Title (Must match CNIC) *</label>
                <input
                  type="text"
                  required
                  placeholder="Name as registered on bank account"
                  value={bankTitle}
                  onChange={(e) => setBankTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800 ml-1">Bank / Mobile Wallet Name *</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none font-medium"
                >
                  <option value="Meezan Bank Ltd">Meezan Bank Ltd</option>
                  <option value="Habib Bank Ltd (HBL)">Habib Bank Ltd (HBL)</option>
                  <option value="United Bank Ltd (UBL)">United Bank Ltd (UBL)</option>
                  <option value="Bank Alfalah">Bank Alfalah</option>
                  <option value="MCB Bank">MCB Bank</option>
                  <option value="Easypaisa Mobile Wallet">Easypaisa Mobile Wallet</option>
                  <option value="JazzCash Mobile Wallet">JazzCash Mobile Wallet</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-stone-800 ml-1">Account Number / 24-Digit IBAN *</label>
              <input
                type="text"
                required
                placeholder="e.g. PK36 MEZN 0001 0002 9310 2310"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none font-medium tracking-wider"
              />
            </div>

            {/* Upload Cheque / Bank Proof */}
            <div className="space-y-2 p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs">
              <label className="font-bold text-stone-800 block">Bank Account Proof (Cancelled Cheque / Statement Screenshot) *</label>
              <div className="h-28 bg-white rounded-xl overflow-hidden border border-dashed border-stone-300 flex items-center justify-center">
                {chequeProofUrl ? (
                  <img src={chequeProofUrl} alt="Bank Proof" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2 text-stone-400">
                    <Upload size={20} className="mx-auto mb-1" />
                    <span className="text-[10px]">Upload cheque photo</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-1 text-stone-700">
              <span className="font-bold text-stone-900 block">Platform Commission & Payout Schedule</span>
              <p className="text-[11px] leading-relaxed">
                She Hunnar retains a 10% platform fee on successfully delivered customer orders. Payouts are transferred automatically twice a month (15th and 30th) directly into your bank or mobile wallet.
              </p>
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStep4Next}
                className="px-7 py-3 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95"
              >
                <span>Continue to Final Review</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SHIPPING RULES & FINAL CONFIRMATION */}
        {step === 5 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in fade-in">
            <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Step 5: Shipping Rules & Final Registration
                </h3>
                <p className="text-xs text-stone-500">Confirm store shipping settings and accept seller terms</p>
              </div>
              <Truck className="text-amber-800 hidden sm:block" size={24} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-800 ml-1">Default Shipping Fee per Order (PKR) *</label>
                <input
                  type="number"
                  required
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800 ml-1">Free Shipping Order Threshold (PKR) *</label>
                <input
                  type="number"
                  required
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Summary Review Box (Daraz Style) */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 text-xs">
              <span className="font-bold text-stone-900 text-sm block border-b border-stone-200 pb-2">
                Application Review Summary
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-700">
                <p><span className="font-bold text-stone-900">Store Name:</span> {shopName}</p>
                <p><span className="font-bold text-stone-900">Owner Name:</span> {fullName}</p>
                <p><span className="font-bold text-stone-900">Mobile Phone:</span> {phone} (Verified ✓)</p>
                <p><span className="font-bold text-stone-900">CNIC Number:</span> {cnicNumber}</p>
                <p><span className="font-bold text-stone-900">Bank Account:</span> {bankName} ({bankTitle})</p>
                <p><span className="font-bold text-stone-900">Pickup Address:</span> {pickupAddress}, {locationCity}</p>
              </div>
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="pt-2 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded text-amber-800 focus:ring-amber-800"
                />
                <span className="text-stone-700 font-medium leading-relaxed">
                  I agree to the <span className="font-bold text-stone-900">She Hunnar Seller Center Service Agreement</span>, 10% platform commission policy, and confirm that all submitted identity (CNIC) and bank details belong to me.
                </span>
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-9 py-3.5 bg-gradient-to-r from-amber-900 to-stone-900 hover:from-amber-950 hover:to-stone-950 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <CheckCircle size={16} />
                <span>Submit & Launch Seller Shop</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BecomeSellerPage;
