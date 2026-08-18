import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { formatPKR } from '../utils/format';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Building,
  Smartphone,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Store,
  User,
  MapPin
} from 'lucide-react';

import { SafepayCheckoutModal } from '../components/common/SafepayCheckoutModal';

interface CheckoutPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { cart, currentUser, getCartGroupedBySeller, placeOrder, updateOrderPaymentStatus } = useMarketplace();

  // Multi-step Checkout Step state (Step 1: Shipping -> Step 2: Payment -> Step 3: Review Order)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Safepay Modal State
  const [isSafepayModalOpen, setIsSafepayModalOpen] = useState(false);
  const [safepaySessionData, setSafepaySessionData] = useState<{
    orderId: string;
    trackerToken: string;
    checkoutUrl?: string;
  } | null>(null);

  // Contact & Address
  const defaultAddr = currentUser?.addresses?.[0];
  const [fullName, setFullName] = useState(defaultAddr?.fullName || currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(defaultAddr?.phone || currentUser?.phone || '');

  const [addressLine, setAddressLine] = useState(defaultAddr?.addressLine || 'House 42-B, Street 12, Phase 5 DHA');
  const [city, setCity] = useState(defaultAddr?.city || 'Lahore');
  const [province, setProvince] = useState(defaultAddr?.province || 'Punjab');
  const [postalCode, setPostalCode] = useState(defaultAddr?.postalCode || '54000');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<
    'COD' | 'Bank Transfer' | 'Easypaisa' | 'JazzCash' | 'Online Card'
  >('COD');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [isProcessingSafepay, setIsProcessingSafepay] = useState(false);

  const [stepError, setStepError] = useState<string | null>(null);

  const groupedCart = getCartGroupedBySeller();

  let subtotal = 0;
  let totalShipping = 0;

  groupedCart.forEach((group) => {
    subtotal += group.subtotal;
    totalShipping += group.shippingFee;
  });

  const grandTotal = subtotal + totalShipping;

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !addressLine.trim() || !city.trim()) {
      setStepError('Please complete all required shipping fields.');
      return;
    }
    setStepError(null);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setStepError(null);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalPlaceOrder = async () => {
    if (!fullName || !phone || !addressLine || !city) {
      setCurrentStep(1);
      return;
    }

    // If Online Card (Safepay) is selected, initiate Safepay Hosted Checkout session
    if (paymentMethod === 'Online Card') {
      try {
        setIsProcessingSafepay(true);
        setStepError(null);

        // Pre-create the master order in context
        const createdOrder = placeOrder({
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          addressLine,
          city,
          province,
          postalCode,
          paymentMethod: 'Online Card',
          paymentProofUrl: paymentProofUrl || undefined
        });

        const successRedirect = `${window.location.origin}/?payment=safepay_success&orderId=${encodeURIComponent(
          createdOrder.id
        )}`;
        const cancelRedirect = `${window.location.origin}/?payment=safepay_cancel&orderId=${encodeURIComponent(
          createdOrder.id
        )}`;

        // Request backend to initialize Safepay session with SAFEPAY_SECRET_KEY
        const response = await fetch('/api/safepay/create-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId: createdOrder.id,
            amount: grandTotal,
            currency: 'PKR',
            customer: {
              name: fullName,
              email,
              phone
            },
            successUrl: successRedirect,
            cancelUrl: cancelRedirect
          })
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.token) {
          throw new Error(data.error || 'Failed to initialize Safepay checkout session.');
        }

        // Open Safepay Hosted Checkout 3D Secure modal
        setSafepaySessionData({
          orderId: createdOrder.id,
          trackerToken: data.token,
          checkoutUrl: data.checkoutUrl
        });
        setIsProcessingSafepay(false);
        setIsSafepayModalOpen(true);
        return;
      } catch (err: any) {
        console.error('[CheckoutPage] Safepay checkout error:', err);
        setIsProcessingSafepay(false);
        setStepError(
          err.message || 'Could not connect to Safepay gateway. Please try another payment method or try again.'
        );
        return;
      }
    }

    const createdOrder = placeOrder({
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      addressLine,
      city,
      province,
      postalCode,
      paymentMethod,
      paymentProofUrl: paymentProofUrl || undefined
    });

    onNavigate('order-confirmation', createdOrder.id);
  };

  if (cart.length === 0) {
    onNavigate('cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Secure Checkout
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Complete your order step by step. Master order will split automatically per seller.
        </p>
      </div>

      {/* STEPPER PROGRESS INDICATOR */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 luxury-card-shadow">
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
          {/* Step 1 Pill */}
          <div
            onClick={() => setCurrentStep(1)}
            className={`py-3 px-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
              currentStep === 1
                ? 'bg-amber-900 text-white shadow-sm'
                : currentStep > 1
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-stone-100 text-stone-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">1</span>
            <span className="hidden sm:inline">Shipping Details</span>
          </div>

          {/* Step 2 Pill */}
          <div
            onClick={() => {
              if (fullName && phone && addressLine) setCurrentStep(2);
            }}
            className={`py-3 px-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
              currentStep === 2
                ? 'bg-amber-900 text-white shadow-sm'
                : currentStep > 2
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">2</span>
            <span className="hidden sm:inline">Payment Method</span>
          </div>

          {/* Step 3 Pill */}
          <div
            onClick={() => {
              if (fullName && phone && addressLine) setCurrentStep(3);
            }}
            className={`py-3 px-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
              currentStep === 3
                ? 'bg-amber-900 text-white shadow-sm'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">3</span>
            <span className="hidden sm:inline">Review & Order</span>
          </div>
        </div>
      </div>

      {stepError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl font-medium">
          ⚠️ {stepError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Step Body Container */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: SHIPPING DETAILS */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Next} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 luxury-card-shadow">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <MapPin size={20} className="text-amber-800" />
                <h3 className="font-serif font-bold text-stone-900 text-lg">
                  Step 1 of 3: Delivery Address & Customer Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-amber-700 font-medium"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-amber-700 font-medium"
                    placeholder="name@example.com"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-stone-800">Phone Number (For Delivery SMS & TCS Courier) *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-amber-700 font-medium"
                    placeholder="+92 3XX XXXXXXX"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-stone-800">Complete House / Street Address *</label>
                  <input
                    type="text"
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-amber-700 font-medium"
                    placeholder="House No., Street Name, Block / Phase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-amber-700 font-medium"
                    placeholder="Lahore, Karachi, Islamabad..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Province *</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-amber-700 font-medium"
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa (KP)</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Islamabad Capital Territory">Islamabad (ICT)</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    <option value="Azad Jammu & Kashmir">Azad Kashmir</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => onNavigate('cart')}
                  className="px-5 py-3 text-stone-600 font-bold text-xs hover:text-stone-900 flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Back to Cart
                </button>

                <button
                  type="submit"
                  className="px-7 py-3.5 bg-amber-900 hover:bg-amber-950 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <span>Proceed to Payment Method</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Next} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 luxury-card-shadow">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <CreditCard size={20} className="text-amber-800" />
                <h3 className="font-serif font-bold text-stone-900 text-lg">
                  Step 2 of 3: Select Payment Method
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                {/* Online Card / Safepay Hosted Checkout */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'Online Card'
                      ? 'bg-amber-50/80 border-amber-800 ring-1 ring-amber-800/30'
                      : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Online Card'}
                    onChange={() => setPaymentMethod('Online Card')}
                    className="mt-1 text-amber-800"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <p className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                        <ShieldCheck size={16} className="text-emerald-700" />
                        <span>Online Card (Safepay Hosted Checkout)</span>
                      </p>
                      <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md text-[10px] tracking-wide uppercase">
                        Safepay Sandbox
                      </span>
                    </div>
                    <p className="text-stone-500 text-xs">
                      Pay securely via official Safepay Hosted Checkout with 3D-Secure protection. Supports Visa, Mastercard, PayPak, and digital wallets.
                    </p>
                    <div className="pt-1 flex items-center gap-1.5 text-[10px] font-semibold text-stone-600">
                      <span className="px-1.5 py-0.5 bg-white border border-stone-200 rounded">Visa</span>
                      <span className="px-1.5 py-0.5 bg-white border border-stone-200 rounded">Mastercard</span>
                      <span className="px-1.5 py-0.5 bg-white border border-stone-200 rounded">PayPak</span>
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded flex items-center gap-1">
                        <ShieldCheck size={11} /> 100% Encrypted
                      </span>
                    </div>
                  </div>
                </label>

                {/* COD */}
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'bg-amber-50/80 border-amber-800 ring-1 ring-amber-800/30'
                    : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 text-amber-800"
                  />
                  <div>
                    <p className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                      <Truck size={16} className="text-amber-800" /> Cash on Delivery (COD)
                    </p>
                    <p className="text-stone-500 text-xs mt-0.5">
                      Pay cash upon doorstep courier delivery across Pakistan.
                    </p>
                  </div>
                </label>

                {/* Bank Transfer */}
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'Bank Transfer'
                    ? 'bg-amber-50/80 border-amber-800 ring-1 ring-amber-800/30'
                    : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Bank Transfer'}
                    onChange={() => setPaymentMethod('Bank Transfer')}
                    className="mt-1 text-amber-800"
                  />
                  <div className="flex-1 space-y-2">
                    <p className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                      <Building size={16} className="text-amber-800" /> Direct Bank Transfer (IBAN)
                    </p>
                    <p className="text-stone-500 text-xs">
                      Transfer to She Hunnar Escrow Account (Meezan Bank IBAN: PK36MEZN00018820192).
                    </p>
                    {paymentMethod === 'Bank Transfer' && (
                      <div className="pt-2 space-y-1">
                        <label className="font-bold text-stone-800 block text-xs">
                          Payment Proof / Receipt Link (Optional)
                        </label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={paymentProofUrl}
                          onChange={(e) => setPaymentProofUrl(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </label>

                {/* Easypaisa */}
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'Easypaisa'
                    ? 'bg-amber-50/80 border-amber-800 ring-1 ring-amber-800/30'
                    : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Easypaisa'}
                    onChange={() => setPaymentMethod('Easypaisa')}
                    className="mt-1 text-amber-800"
                  />
                  <div>
                    <p className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                      <Smartphone size={16} className="text-emerald-700" /> Easypaisa Mobile Wallet
                    </p>
                    <p className="text-stone-500 text-xs mt-0.5">
                      Send to Easypaisa: 0312-9876543 (She Hunnar Marketplace).
                    </p>
                  </div>
                </label>

                {/* JazzCash */}
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'JazzCash'
                    ? 'bg-amber-50/80 border-amber-800 ring-1 ring-amber-800/30'
                    : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'JazzCash'}
                    onChange={() => setPaymentMethod('JazzCash')}
                    className="mt-1 text-amber-800"
                  />
                  <div>
                    <p className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
                      <Smartphone size={16} className="text-rose-700" /> JazzCash Mobile Wallet
                    </p>
                    <p className="text-stone-500 text-xs mt-0.5">
                      Send to JazzCash: 0300-1234567 (She Hunnar Marketplace).
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-3 text-stone-600 font-bold text-xs hover:text-stone-900 flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Back to Shipping
                </button>

                <button
                  type="submit"
                  className="px-7 py-3.5 bg-amber-900 hover:bg-amber-950 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <span>Review & Finalize Order</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: REVIEW & PLACE ORDER */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 luxury-card-shadow">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-amber-800" />
                  <h3 className="font-serif font-bold text-stone-900 text-lg">
                    Step 3 of 3: Final Order Review
                  </h3>
                </div>
              </div>

              {/* Review Customer & Address Box */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm">Delivery Information</span>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-amber-900 font-bold text-[11px] underline"
                  >
                    Edit Shipping
                  </button>
                </div>
                <p className="text-stone-800 font-medium">{fullName} ({phone})</p>
                <p className="text-stone-600">{addressLine}, {city}, {province} - {postalCode}</p>
                <p className="text-stone-500">{email}</p>
              </div>

              {/* Review Payment Method Box */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm">Selected Payment</span>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-amber-900 font-bold text-[11px] underline"
                  >
                    Edit Payment
                  </button>
                </div>
                <p className="text-stone-800 font-bold">{paymentMethod}</p>
              </div>

              {/* Review Items Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                  Ordered Items ({cart.length})
                </h4>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-stone-50 p-3 space-y-2 text-xs">
                  {cart.map((item) => (
                    <div key={item.id} className="pt-2 flex items-center justify-between text-stone-800">
                      <div>
                        <p className="font-bold text-stone-900">{item.productTitle}</p>
                        <p className="text-[11px] text-stone-500">Qty: {item.quantity} • Seller: {item.sellerShopName}</p>
                      </div>
                      <span className="font-bold text-stone-900">{formatPKR(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-3 text-stone-600 font-bold text-xs hover:text-stone-900 flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Back to Payment
                </button>

                <button
                  type="button"
                  disabled={isProcessingSafepay}
                  onClick={handleFinalPlaceOrder}
                  className="px-9 py-4 bg-amber-900 hover:bg-amber-950 disabled:bg-stone-400 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isProcessingSafepay ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting to Safepay...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>
                        {paymentMethod === 'Online Card'
                          ? 'Proceed to Safepay Checkout'
                          : 'Confirm & Place Order Now'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-6 space-y-6 sticky top-24 luxury-card-shadow">
          <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-200 pb-3">
            Fulfillment Summary
          </h3>

          <div className="space-y-4 max-h-72 overflow-y-auto text-xs">
            {groupedCart.map((group) => (
              <div key={group.sellerId} className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
                <div className="font-bold text-stone-900 flex items-center gap-1 text-[11px]">
                  <Store size={13} className="text-amber-800" />
                  <span>Fulfillment by {group.sellerShopName}</span>
                </div>
                <div className="space-y-1 divide-y divide-stone-200/60">
                  {group.items.map((item) => (
                    <div key={item.id} className="pt-1 flex justify-between text-stone-700">
                      <span className="truncate pr-2">{item.quantity}x {item.productTitle}</span>
                      <span className="font-bold text-stone-900 shrink-0">{formatPKR(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-stone-500 flex justify-between pt-1 border-t border-stone-200">
                  <span>Shipping:</span>
                  <span>{group.shippingFee === 0 ? 'FREE' : formatPKR(group.shippingFee)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs text-stone-600 border-t border-stone-200 pt-4 font-medium">
            <div className="flex justify-between text-stone-600">
              <span>Items Subtotal:</span>
              <span className="font-bold text-stone-900">{formatPKR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Total Shipping Fee:</span>
              <span className="font-bold text-stone-900">{formatPKR(totalShipping)}</span>
            </div>
            <div className="flex justify-between text-stone-900 font-bold text-base pt-2 border-t border-stone-200">
              <span>Grand Total:</span>
              <span className="font-sans text-xl text-amber-950 font-extrabold">{formatPKR(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safepay Hosted Checkout Modal */}
      {safepaySessionData && (
        <SafepayCheckoutModal
          isOpen={isSafepayModalOpen}
          orderId={safepaySessionData.orderId}
          amount={grandTotal}
          customerName={fullName}
          customerEmail={email}
          trackerToken={safepaySessionData.trackerToken}
          checkoutUrl={safepaySessionData.checkoutUrl}
          onSuccess={(data) => {
            updateOrderPaymentStatus(data.orderId, 'Paid', {
              tracker: data.tracker,
              transactionRef: data.signature || data.tracker
            });
            setIsSafepayModalOpen(false);
            onNavigate('order-confirmation', data.orderId);
          }}
          onCancel={() => setIsSafepayModalOpen(false)}
        />
      )}
    </div>
  );
};
