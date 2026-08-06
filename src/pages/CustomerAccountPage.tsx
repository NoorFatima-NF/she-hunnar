import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/product/ProductCard';
import { AuthModal } from '../components/common/AuthModal';
import { formatPKR } from '../utils/format';
import {
  User,
  ShoppingBag,
  Sparkles,
  Heart,
  MessageSquare,
  MapPin,
  Clock,
  Package,
  Store,
  ChevronRight,
  LogOut,
  UserPlus
} from 'lucide-react';

interface CustomerAccountPageProps {
  initialTab?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const CustomerAccountPage: React.FC<CustomerAccountPageProps> = ({ initialTab, onNavigate }) => {
  const {
    currentUser,
    orders,
    customRequests,
    wishlist,
    products,
    messages,
    logoutUser
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'orders' | 'custom' | 'wishlist' | 'messages' | 'addresses'>(
    (initialTab as any) || 'orders'
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  React.useEffect(() => {
    if (initialTab && ['orders', 'custom', 'wishlist', 'messages', 'addresses'].includes(initialTab)) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center font-serif text-3xl font-bold shadow-md">
          <User size={36} className="text-amber-800" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-stone-900">Sign In to Your Account</h1>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            Sign in or create a new account to view your orders, track TCS deliveries, and manage your wishlist.
          </p>
        </div>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-8 py-3.5 bg-amber-900 hover:bg-amber-950 text-white font-bold rounded-2xl text-xs transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
        >
          <User size={16} />
          <span>Sign In / Create Account</span>
        </button>
      </div>
    );
  }

  const customerOrders = orders.filter(
    (o) =>
      o.customerId === currentUser.id ||
      (o.customerEmail && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
  );
  const customerCustomReqs = customRequests.filter(
    (r) =>
      r.customerId === currentUser.id ||
      (r.customerEmail && r.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
  );
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Account Profile Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-900 text-white font-serif font-bold text-2xl flex items-center justify-center shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              {currentUser.name}
            </h1>
            <p className="text-xs text-stone-500">{currentUser.email} • {currentUser.phone || '+92 321 4567890'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={logoutUser}
            className="px-4 py-2 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-stone-200"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>

          <button
            onClick={() => onNavigate('become-a-seller')}
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Store size={14} />
            <span>Open Seller Shop</span>
          </button>
        </div>
      </div>

      {/* Account Tab Navigation */}
      <div className="bg-white rounded-2xl border border-stone-200 p-2 flex flex-wrap gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-amber-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <ShoppingBag size={15} />
          <span>My Orders ({customerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'custom'
              ? 'bg-amber-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Sparkles size={15} />
          <span>Bespoke Requests ({customerCustomReqs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'wishlist'
              ? 'bg-amber-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Heart size={15} />
          <span>Wishlist ({wishlistProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'messages'
              ? 'bg-amber-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <MessageSquare size={15} />
          <span>Seller Messages ({messages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'addresses'
              ? 'bg-amber-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <MapPin size={15} />
          <span>Saved Addresses</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {customerOrders.length > 0 ? (
              customerOrders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3 text-xs">
                    <div>
                      <span className="font-mono font-bold text-amber-900">{ord.id}</span>
                      <span className="text-stone-400 ml-2">• Placed on {ord.createdAt.split('T')[0]}</span>
                    </div>
                    <div className="text-stone-900 font-bold">
                      Grand Total: {formatPKR(ord.grandTotal)} ({ord.paymentMethod})
                    </div>
                  </div>

                  <div className="space-y-3">
                    {ord.sellerOrders?.map((sub) => (
                      <div key={sub.id} className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-stone-900 flex items-center gap-1">
                            <Store size={14} className="text-amber-800" /> {sub.sellerShopName}
                          </span>
                          <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded capitalize">
                            {sub.status.replace('_', ' ')}
                          </span>
                        </div>
                        {sub.trackingCode && (
                          <div className="text-[11px] text-emerald-800 font-semibold">
                            TCS Tracking Code: <span className="font-mono">{sub.trackingCode}</span>
                          </div>
                        )}
                        <div className="space-y-1">
                          {sub.items.map((i) => (
                            <div key={i.id} className="flex justify-between text-stone-700">
                              <span>{i.quantity}x {i.productTitle}</span>
                              <span className="font-semibold">{formatPKR(i.price * i.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500 py-8 text-center">No orders placed yet.</p>
            )}
          </div>
        )}

        {/* Custom Requests Tab */}
        {activeTab === 'custom' && (
          <div className="space-y-4">
            {customerCustomReqs.length > 0 ? (
              customerCustomReqs.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 text-xs shadow-xs">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                    <div>
                      <span className="font-serif font-bold text-stone-900 text-sm">{req.jewelryType}</span>
                      <span className="text-stone-400 ml-2">• Target Budget: {formatPKR(req.budgetPKR)}</span>
                    </div>
                    <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded capitalize">
                      {req.status}
                    </span>
                  </div>
                  <p className="text-stone-700 leading-relaxed font-light">{req.description}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500 py-8 text-center">No custom requests submitted yet.</p>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlistProducts.map((p) => (
                  <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 py-8 text-center">Your wishlist is empty.</p>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            {messages.length > 0 ? (
              messages.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl border border-stone-200 p-4 space-y-2 text-xs shadow-xs">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                    <span className="font-bold text-stone-900">{m.senderName}</span>
                    <span className="text-[10px] text-stone-400">{m.timestamp}</span>
                  </div>
                  <p className="text-stone-700 font-light">{m.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500 py-8 text-center">No messages exchanged yet.</p>
            )}
          </div>
        )}

        {/* Saved Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentUser.addresses?.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-900">{a.fullName}</span>
                  {a.isDefault && (
                    <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-stone-600">{a.addressLine}</p>
                <p className="text-stone-600">{a.city}, {a.province} {a.postalCode}</p>
                <p className="text-stone-600">Phone: {a.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
