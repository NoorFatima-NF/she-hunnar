import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { formatPKR } from '../utils/format';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Store,
  Tag
} from 'lucide-react';

interface CartPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    getCartGroupedBySeller,
    coupons
  } = useMarketplace();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const groupedCart = getCartGroupedBySeller();

  let subtotal = 0;
  let totalShipping = 0;

  groupedCart.forEach((group) => {
    subtotal += group.subtotal;
    totalShipping += group.shippingFee;
  });

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon) {
    const coupon = coupons.find((c) => c.code.toUpperCase() === appliedCoupon.toUpperCase() && c.active);
    if (coupon && subtotal >= coupon.minSpend) {
      if (coupon.discountType === 'percentage') {
        discountAmount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        discountAmount = coupon.discountValue;
      }
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + totalShipping);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const coupon = coupons.find((c) => c.code.toUpperCase() === couponInput.trim().toUpperCase() && c.active);
    if (!coupon) {
      alert('Invalid or expired coupon code.');
      return;
    }

    if (subtotal < coupon.minSpend) {
      alert(`Minimum order spend of ${formatPKR(coupon.minSpend)} required for this coupon.`);
      return;
    }

    setAppliedCoupon(coupon.code.toUpperCase());
    setCouponInput('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
          <ShoppingBag size={36} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900">
          Your Cart is Empty
        </h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Explore handcrafted necklaces, rings, earrings, and custom artisan jewelry from independent makers across Pakistan.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-8 py-3.5 bg-stone-900 text-white rounded-full text-xs font-bold hover:bg-stone-800 transition-colors shadow-sm"
        >
          Explore Handmade Jewelry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Shopping Cart ({cart.reduce((s, i) => s + i.quantity, 0)} items)
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Multi-vendor cart grouped by seller store. Separate shipping rules apply per seller.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Grouped Items */}
        <div className="lg:col-span-8 space-y-6">
          {groupedCart.map((group) => (
            <div
              key={group.sellerId}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs space-y-4 p-5"
            >
              {/* Seller Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Store size={18} className="text-amber-800" />
                  <span className="font-serif font-bold text-stone-900 text-sm">
                    Items from {group.sellerShopName}
                  </span>
                </div>
                <div className="text-xs text-stone-600 font-medium">
                  Shipping: {group.shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE Shipping</span>
                  ) : (
                    formatPKR(group.shippingFee)
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-stone-100">
                {group.items.map((item) => (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start gap-4">
                    <ImageWithFallback
                      src={item.productImage}
                      alt={item.productTitle}
                      className="w-20 h-20 object-cover rounded-xl border border-stone-200 shrink-0"
                    />

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <h4
                        onClick={() => onNavigate('product', item.productId)}
                        className="font-serif font-bold text-stone-900 text-xs sm:text-sm hover:text-amber-900 cursor-pointer truncate"
                      >
                        {item.productTitle}
                      </h4>

                      {item.selectedVariant && (
                        <p className="text-[11px] text-stone-500 font-medium">
                          Variant: {item.selectedVariant.name}
                        </p>
                      )}

                      {/* Customization Details Summary */}
                      {item.customization && (
                        <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2 text-[11px] space-y-0.5 text-amber-950 font-medium">
                          <p className="flex items-center gap-1 font-bold">
                            <Sparkles size={11} className="text-amber-700" /> Custom Details:
                          </p>
                          {item.customization.customText && (
                            <p>Text: "{item.customization.customText}"</p>
                          )}
                          {item.customization.selectedFont && (
                            <p>Font: {item.customization.selectedFont}</p>
                          )}
                          {item.customization.selectedStone && (
                            <p>Stone: {item.customization.selectedStone}</p>
                          )}
                          {item.customization.customNote && (
                            <p>Note: "{item.customization.customNote}"</p>
                          )}
                        </div>
                      )}

                      <p className="text-xs font-bold text-stone-900">
                        {formatPKR(item.price)}
                      </p>
                    </div>

                    {/* Quantity Controls & Remove */}
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end justify-between w-full sm:w-auto">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white p-1">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-stone-100 text-stone-600 rounded"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-xs font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-stone-100 text-stone-600 rounded"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal Footer */}
              <div className="pt-3 border-t border-stone-100 flex justify-between items-center text-xs font-semibold text-stone-800">
                <span>Store Subtotal ({group.items.length} items):</span>
                <span>{formatPKR(group.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-6 space-y-6 sticky top-24">
          <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-200 pb-3">
            Order Summary
          </h3>

          {/* Coupon Code Input */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1">
              <Tag size={13} className="text-amber-800" /> Apply Coupon
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Try ZAVERI10 or ARTISAN500"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800"
              >
                Apply
              </button>
            </div>
            {appliedCoupon && (
              <p className="text-[11px] text-emerald-700 font-bold flex items-center justify-between pt-1">
                <span>Coupon "{appliedCoupon}" Applied</span>
                <span className="cursor-pointer underline" onClick={() => setAppliedCoupon(null)}>
                  Remove
                </span>
              </p>
            )}
          </form>

          {/* Cost Breakdown */}
          <div className="space-y-2.5 text-xs text-stone-600 border-t border-b border-stone-200 py-4 font-medium">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <span className="text-stone-900 font-semibold">{formatPKR(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping Fee (Multi-Vendor):</span>
              <span className="text-stone-900 font-semibold">{formatPKR(totalShipping)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Coupon Discount:</span>
                <span>-{formatPKR(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-stone-100 text-sm font-bold text-stone-950">
              <span>Grand Total:</span>
              <span className="text-xl font-sans">{formatPKR(grandTotal)}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('checkout')}
            className="w-full py-4 bg-amber-900 hover:bg-amber-950 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </button>

          <div className="text-[11px] text-stone-400 text-center space-y-1">
            <ShieldCheck size={16} className="text-emerald-600 mx-auto" />
            <p>100% Safe Checkout with COD, Bank Transfer & Easypaisa</p>
          </div>
        </div>
      </div>
    </div>
  );
};
