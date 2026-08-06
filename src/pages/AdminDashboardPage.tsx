import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { formatPKR } from '../utils/format';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  Tag,
  Star,
  Plus
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const {
    sellers,
    products,
    orders,
    coupons,
    approveSeller,
    rejectSeller,
    updateProduct,
    deleteProduct,
    addCoupon
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'sellers' | 'products' | 'orders' | 'coupons'>('sellers');

  // Coupon form state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [discountVal, setDiscountVal] = useState(10);
  const [minSpend, setMinSpend] = useState(2000);

  const pendingSellers = sellers.filter((s) => s.verificationStatus === 'pending');
  const approvedSellers = sellers.filter((s) => s.verificationStatus === 'approved');

  const totalGMV = orders.reduce((acc, o) => acc + o.grandTotal, 0);
  const totalCommissionRevenue = totalGMV * 0.10; // 10% commission

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;

    addCoupon({
      code: newCouponCode.toUpperCase(),
      discountType: 'percentage',
      discountValue: discountVal,
      minSpend,
      active: true
    });

    setNewCouponCode('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck size={24} className="text-amber-400" />
            <h1 className="font-serif text-2xl font-bold">She Hunnar Admin Governance</h1>
          </div>
          <p className="text-xs text-stone-400">
            Seller verification, product moderation, sub-order tracking & commission payouts.
          </p>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
          <span className="text-stone-400 font-normal">Gross Merchandise Value (GMV)</span>
          <p className="font-serif text-2xl font-bold text-stone-900">{formatPKR(totalGMV)}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
          <span className="text-stone-400 font-normal">Platform Commission (10%)</span>
          <p className="font-serif text-2xl font-bold text-emerald-800">{formatPKR(totalCommissionRevenue)}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
          <span className="text-stone-400 font-normal">Verified Craft Shops</span>
          <p className="font-serif text-2xl font-bold text-stone-900">{approvedSellers.length} verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
          <span className="text-stone-400 font-normal">Pending Shop Approvals</span>
          <p className="font-serif text-2xl font-bold text-amber-900">{pendingSellers.length} applications</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-stone-200 p-2 flex flex-wrap gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('sellers')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'sellers'
              ? 'bg-amber-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Store size={15} />
          <span>Artisan Moderation ({pendingSellers.length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-amber-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <ShoppingBag size={15} />
          <span>Product Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-amber-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <DollarSign size={15} />
          <span>Master Orders Audit ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'coupons'
              ? 'bg-amber-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Tag size={15} />
          <span>Coupons & Promotions ({coupons.length})</span>
        </button>
      </div>

      {/* Sellers Tab */}
      {activeTab === 'sellers' && (
        <div className="space-y-6">
          {pendingSellers.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-amber-950 text-base flex items-center gap-2">
                <span>Pending Verification Applications</span>
                <span className="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded-full">
                  {pendingSellers.length}
                </span>
              </h3>

              <div className="space-y-4">
                {pendingSellers.map((sel) => (
                  <div key={sel.id} className="bg-white rounded-2xl border border-amber-300 p-6 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={sel.logo} alt={sel.shopName} className="w-12 h-12 rounded-full object-cover border" />
                        <div>
                          <h4 className="font-serif font-bold text-stone-900 text-sm">{sel.shopName}</h4>
                          <p className="text-stone-500">{sel.specialization} • {sel.location}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => approveSeller(sel.id)}
                          className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 flex items-center gap-1"
                        >
                          <CheckCircle size={14} />
                          <span>Approve Artisan</span>
                        </button>
                        <button
                          onClick={() => rejectSeller(sel.id)}
                          className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1"
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 font-light">{sel.about}</p>
                    <div className="text-[11px] text-stone-500 font-medium bg-stone-50 p-3 rounded-xl">
                      Payout Info: {sel.payoutMethod} ({sel.accountDetails})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Artisans Table */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Verified Marketplace Artisans ({approvedSellers.length})
            </h3>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase font-bold text-[10px]">
                    <th className="py-2.5">Shop Name</th>
                    <th className="py-2.5">Specialization</th>
                    <th className="py-2.5">Location</th>
                    <th className="py-2.5">Rating</th>
                    <th className="py-2.5">Completed Orders</th>
                    <th className="py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                  {approvedSellers.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 font-bold text-stone-900 flex items-center gap-2">
                        <img src={s.logo} alt={s.shopName} className="w-8 h-8 rounded-full object-cover" />
                        <span>{s.shopName}</span>
                      </td>
                      <td className="py-3">{s.specialization}</td>
                      <td className="py-3">{s.location}</td>
                      <td className="py-3">{s.rating.toFixed(1)} ★ ({s.reviewCount})</td>
                      <td className="py-3">{s.completedOrders} orders</td>
                      <td className="py-3">
                        <button
                          onClick={() => onNavigate('shopfront', s.slug)}
                          className="text-amber-900 font-bold hover:underline"
                        >
                          View Shop
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h3 className="font-serif font-bold text-stone-900 text-base">
            Platform Product Catalog ({products.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {products.map((p) => (
              <div key={p.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-serif font-bold text-stone-900">{p.title}</h4>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="text-rose-600 text-xs font-bold"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-[11px] text-stone-500">Shop: {p.sellerShopName} • Category: {p.category}</p>
                <div className="flex justify-between font-bold text-stone-900">
                  <span>{formatPKR(p.price)}</span>
                  <button
                    onClick={() => updateProduct(p.id, { isFeatured: !p.isFeatured })}
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      p.isFeatured ? 'bg-amber-200 text-amber-950 font-bold' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {p.isFeatured ? '★ Featured' : 'Feature on Home'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateCoupon} className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 text-xs">
            <h3 className="font-serif font-bold text-stone-900 text-base">Create Promo Coupon</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-stone-800">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EID15"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800">Discount Percentage (%)</label>
                <input
                  type="number"
                  required
                  value={discountVal}
                  onChange={(e) => setDiscountVal(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800">Min Order Spend (PKR)</label>
                <input
                  type="number"
                  required
                  value={minSpend}
                  onChange={(e) => setMinSpend(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-900 text-white rounded-xl font-bold flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>Create Coupon</span>
            </button>
          </form>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3 text-xs">
            <h3 className="font-serif font-bold text-stone-900 text-base">Active Coupons</h3>
            <div className="space-y-2">
              {coupons.map((c) => (
                <div key={c.id} className="p-3 bg-stone-50 rounded-xl flex justify-between font-medium">
                  <span className="font-mono font-bold text-amber-900">{c.code}</span>
                  <span>{c.discountValue}% OFF (Min Spend: {formatPKR(c.minSpend)})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
