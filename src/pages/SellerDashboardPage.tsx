import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product, SubOrder, JewelryCategory } from '../types';
import { formatPKR } from '../utils/format';
import {
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Truck,
  Star,
  Sparkles,
  X,
  MessageSquare,
  Settings
} from 'lucide-react';

interface SellerDashboardPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const SellerDashboardPage: React.FC<SellerDashboardPageProps> = ({ onNavigate }) => {
  const {
    sellers,
    products,
    orders,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSubOrderStatus,
    replyToReview,
    reviews
  } = useMarketplace();

  // Pick seller profile (default to Noor Jewelry Studio for testing)
  const seller = sellers[0];

  const sellerProducts = products.filter((p) => p.sellerId === seller.id);

  // Extract sub-orders for this seller
  const sellerSubOrders: { sub: SubOrder; masterDate: string; masterCustomer: string }[] = [];
  orders.forEach((o) => {
    o.subOrders.forEach((sub) => {
      if (sub.sellerId === seller.id) {
        sellerSubOrders.push({
          sub,
          masterDate: o.createdAt,
          masterCustomer: o.customerName
        });
      }
    });
  });

  const sellerReviews = reviews.filter((r) => sellerProducts.some((p) => p.id === r.productId));

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'reviews' | 'settings'>('products');

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<JewelryCategory>('Earrings');
  const [price, setPrice] = useState<number>(3500);
  const [stock, setStock] = useState<number>(10);
  const [material, setMaterial] = useState('925 Sterling Silver');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [isCustomizable, setIsCustomizable] = useState(true);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
  );

  // Tracking Modal State
  const [selectedSubOrderId, setSelectedSubOrderId] = useState<string | null>(null);
  const [trackingCodeInput, setTrackingCodeInput] = useState('');

  // Review Reply State
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !shortDesc) return;

    addProduct({
      sellerId: seller.id,
      sellerShopName: seller.shopName,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, ''),
      category,
      price,
      material,
      stock,
      images: [imageUrl],
      shortDescription: shortDesc,
      fullDescription: fullDesc || shortDesc,
      isCustomizable,
      customizationConfig: isCustomizable
        ? {
            allowText: true,
            textLabel: 'Custom Name / Engraving',
            maxCharacters: 15,
            allowFontSelection: true,
            fonts: ['Urdu Nastaliq', 'English Cursive']
          }
        : undefined,
      productionTimeDays: 3
    });

    setIsAddModalOpen(false);
    setTitle('');
    setShortDesc('');
  };

  const handleSaveTracking = (subId: string) => {
    if (!trackingCodeInput) return;
    updateSubOrderStatus(subId, 'shipped', trackingCodeInput);
    setSelectedSubOrderId(null);
    setTrackingCodeInput('');
  };

  const handleSendReviewReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    replyToReview(reviewId, replyText);
    setReplyingReviewId(null);
    setReplyText('');
  };

  const totalEarnings = sellerSubOrders
    .filter((s) => s.sub.status === 'Delivered' || s.sub.status === 'Shipped')
    .reduce((acc, s) => acc + (s.sub.totalAmount || s.sub.total || 0) * 0.9, 0); // 90% payout after 10% commission

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Seller Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-4">
          <img
            src={seller.logo}
            alt={seller.shopName}
            className="w-16 h-16 rounded-full border-2 border-stone-700 object-cover shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold">{seller.shopName}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full">
                Craft Studio
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              {seller.specialization} • {seller.location}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('shopfront', seller.slug)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-xl border border-white/20 transition-colors"
        >
          View Public Shopfront
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
          <div className="flex justify-between text-stone-500">
            <span>Net Earnings (90% Payout)</span>
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-stone-900">
            {formatPKR(totalEarnings)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
          <div className="flex justify-between text-stone-500">
            <span>Sub-Orders Assigned</span>
            <ShoppingBag size={16} className="text-amber-800" />
          </div>
          <p className="font-serif text-2xl font-bold text-stone-900">
            {sellerSubOrders.length} orders
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
          <div className="flex justify-between text-stone-500">
            <span>Active Products</span>
            <Package size={16} className="text-amber-800" />
          </div>
          <p className="font-serif text-2xl font-bold text-stone-900">
            {sellerProducts.length} items
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
          <div className="flex justify-between text-stone-500">
            <span>Shop Rating</span>
            <Star size={16} className="text-amber-500 fill-amber-500" />
          </div>
          <p className="font-serif text-2xl font-bold text-stone-900">
            {seller.rating.toFixed(1)} ★ ({seller.reviewCount})
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-2 flex flex-wrap gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-amber-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Package size={15} />
          <span>My Jewelry Listings ({sellerProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-amber-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <ShoppingBag size={15} />
          <span>Assigned Orders ({sellerSubOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'reviews'
              ? 'bg-amber-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Star size={15} />
          <span>Customer Reviews ({sellerReviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-amber-900 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Settings size={15} />
          <span>Shop Settings</span>
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-200">
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Jewelry Inventory & Listings
            </h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-amber-900 text-white hover:bg-amber-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <Plus size={16} />
              <span>Add New Jewelry Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellerProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs p-4 space-y-3">
                <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 relative">
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 bg-stone-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                    {p.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">{p.category}</p>
                  <h4 className="font-serif font-bold text-stone-900 text-sm truncate">{p.title}</h4>
                  <div className="flex justify-between items-baseline pt-1 text-xs font-bold">
                    <span>{formatPKR(p.price)}</span>
                    <span className="text-stone-500 font-normal">Stock: {p.stock} units</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                    title="Delete product"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {sellerSubOrders.length > 0 ? (
            sellerSubOrders.map(({ sub, masterDate, masterCustomer }) => (
              <div key={sub.id} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3 text-xs">
                  <div>
                    <span className="font-mono font-bold text-amber-900">{sub.subOrderId || sub.id}</span>
                    <span className="text-stone-400 ml-2">• Customer: {masterCustomer}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full capitalize">
                      Status: {sub.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {sub.items.map((i, idx) => (
                    <div key={i.id || i.productId || idx} className="p-3 bg-stone-50 rounded-xl space-y-1">
                      <div className="flex justify-between font-semibold text-stone-900">
                        <span>{i.quantity}x {i.productTitle}</span>
                        <span>{formatPKR(i.price * i.quantity)}</span>
                      </div>
                      {i.customization && (
                        <div className="text-[11px] text-amber-900 font-medium">
                          Custom Details: Text: "{i.customization.customText}" | Font: {i.customization.selectedFont} | Stone: {i.customization.selectedStone}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Status Update Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-200 text-xs">
                  <span className="font-bold text-stone-900">
                    Order Total: {formatPKR(sub.totalAmount || sub.total || 0)} (Net Payout: {formatPKR((sub.totalAmount || sub.total || 0) * 0.9)})
                  </span>

                  <div className="flex items-center gap-2">
                    {sub.status === 'Pending' && (
                      <button
                        onClick={() => updateSubOrderStatus(sub.id, 'Processing')}
                        className="px-3.5 py-1.5 bg-amber-900 text-white rounded-xl font-bold"
                      >
                        Start Crafting / Production
                      </button>
                    )}

                    {sub.status === 'Processing' && (
                      <button
                        onClick={() => setSelectedSubOrderId(sub.id)}
                        className="px-3.5 py-1.5 bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1"
                      >
                        <Truck size={14} />
                        <span>Add TCS Tracking & Dispatch</span>
                      </button>
                    )}

                    {sub.status === 'Shipped' && (
                      <button
                        onClick={() => updateSubOrderStatus(sub.id, 'Delivered')}
                        className="px-3.5 py-1.5 bg-stone-900 text-white rounded-xl font-bold"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-500 text-center py-8">No sub-orders received yet.</p>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {sellerReviews.map((rev) => (
            <div key={rev.id} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 text-xs shadow-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-stone-900">{rev.customerName}</span>
                <span className="text-[10px] text-stone-400">{rev.date}</span>
              </div>
              <p className="text-stone-700">{rev.reviewText}</p>
              {rev.sellerReply ? (
                <div className="p-3 bg-amber-50 rounded-xl text-amber-950">
                  <span className="font-bold block">Your Reply:</span>
                  <p>{rev.sellerReply}</p>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <input
                    type="text"
                    placeholder="Type a polite thank you or care reply..."
                    value={replyingReviewId === rev.id ? replyText : ''}
                    onChange={(e) => {
                      setReplyingReviewId(rev.id);
                      setReplyText(e.target.value);
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs"
                  />
                  <button
                    onClick={() => handleSendReviewReply(rev.id)}
                    className="px-4 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-xl"
                  >
                    Send Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4 border border-stone-200 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif font-bold text-stone-900 text-lg">Add New Jewelry Listing</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X size={20} className="text-stone-400 hover:text-stone-600" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-800">Jewelry Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handmade Silver Emerald Pendant"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as JewelryCategory)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  >
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Price (PKR)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Material</label>
                  <input
                    type="text"
                    required
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800">Image URL</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-800">Short Description</label>
                <textarea
                  rows={2}
                  required
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-900 text-white font-bold rounded-xl hover:bg-amber-950"
                >
                  Publish Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {selectedSubOrderId && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 border border-stone-200 shadow-2xl">
            <h3 className="font-serif font-bold text-stone-900 text-base">Enter TCS / Courier Tracking Code</h3>
            <input
              type="text"
              placeholder="e.g. TCS-77291039"
              value={trackingCodeInput}
              onChange={(e) => setTrackingCodeInput(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedSubOrderId(null)}
                className="px-3 py-2 text-xs font-semibold text-stone-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveTracking(selectedSubOrderId)}
                className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold"
              >
                Save & Dispatch Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
