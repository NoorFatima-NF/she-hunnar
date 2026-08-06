import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductGallery } from '../components/product/ProductGallery';
import { StarRating } from '../components/common/StarRating';
import { Badge } from '../components/common/Badge';
import { ProductCard } from '../components/product/ProductCard';
import { formatPKR } from '../utils/format';
import {
  Heart,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  MessageSquare,
  CheckCircle,
  Plus,
  Minus,
  Star,
  X
} from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (view: string, param?: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, onNavigate }) => {
  const {
    products,
    sellers,
    reviews,
    addToCart,
    toggleWishlist,
    isInWishlist,
    sendMessage,
    addReview
  } = useMarketplace();

  const product = products.find((p) => p.slug === slug || p.id === slug) || products[0];
  const seller = sellers.find((s) => s.id === product.sellerId);
  const productReviews = reviews.filter((r) => r.productId === product.id);
  const inWishlist = isInWishlist(product.id);

  // Variant state
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants && product.variants.length > 0 ? product.variants[0].id : ''
  );
  const [quantity, setQuantity] = useState<number>(1);

  // Tabs state
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'process' | 'shipping'>('details');

  // Review Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newReviewText, setNewReviewText] = useState('');

  // Message Modal state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const activePrice = selectedVariant ? selectedVariant.price : product.price;

  const discountPercent =
    product.originalPrice && product.originalPrice > activePrice
      ? Math.round(((product.originalPrice - activePrice) / product.originalPrice) * 100)
      : null;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariantId);
    onNavigate('cart');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    addReview({
      productId: product.id,
      productTitle: product.title,
      customerId: 'c-101',
      customerName: 'Sana Malik',
      rating: newRating,
      reviewText: newReviewText,
      verifiedPurchase: true
    });

    setIsReviewModalOpen(false);
    setNewReviewText('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendMessage(product.sellerId, messageText);
    setIsMessageModalOpen(false);
    setMessageText('');
  };

  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.sellerId === product.sellerId))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Top Product Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Gallery */}
        <div className="lg:col-span-6">
          <ProductGallery images={product.images} title={product.title} />
        </div>

        {/* Right Info Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Category & Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="stone">{product.category}</Badge>
            {product.isBestseller && <Badge variant="gold">★ Bestseller</Badge>}
            {product.isNew && <Badge variant="emerald">New Arrival</Badge>}
          </div>

          {/* Title */}
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
            {product.title}
          </h1>

          {/* Seller Shop Banner Box */}
          {seller && (
            <div className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <img
                  src={seller.logo}
                  alt={seller.shopName}
                  className="w-10 h-10 rounded-full object-cover border border-stone-200"
                />
                <div>
                  <div
                    onClick={() => onNavigate('shopfront', seller.slug)}
                    className="flex items-center gap-1 font-serif text-sm font-bold text-stone-900 hover:text-amber-900 cursor-pointer"
                  >
                    <span>{seller.shopName}</span>
                    <CheckCircle size={14} className="text-amber-600" />
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Artisan in {seller.location} • {seller.rating} ★ ({seller.reviewCount} reviews)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMessageModalOpen(true)}
                className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl text-xs font-semibold text-stone-800 flex items-center gap-1 shadow-2xs"
              >
                <MessageSquare size={13} />
                <span>Message</span>
              </button>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={product.rating} count={product.reviewCount} size={16} />
            <span className="text-xs text-stone-400">|</span>
            <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
            </span>
          </div>

          {/* Price Box */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-baseline justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Price (Inclusive of all taxes)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-2xl sm:text-3xl font-bold text-stone-950">
                  {formatPKR(activePrice)}
                </span>
                {product.originalPrice && product.originalPrice > activePrice && (
                  <span className="text-sm text-stone-400 line-through">
                    {formatPKR(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {discountPercent && (
              <span className="bg-emerald-100 text-emerald-900 font-bold text-xs px-3 py-1.5 rounded-full">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs text-stone-600 leading-relaxed font-light">
            {product.shortDescription}
          </p>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Select Option / Size
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                      selectedVariantId === v.id
                        ? 'bg-amber-900 text-white border-amber-900 font-semibold shadow-2xs'
                        : 'bg-white text-stone-800 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {v.name} ({formatPKR(v.price)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-stone-300 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-lg"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 text-xs font-bold text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-lg"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Wishlist Toggle */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-xl border transition-all ${
                  inWishlist
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
                }`}
                title="Wishlist"
              >
                <Heart size={20} className={inWishlist ? 'fill-rose-600' : ''} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                product.stock <= 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-900 via-stone-900 to-stone-950 hover:from-amber-950 hover:to-black text-white'
              }`}
            >
              <ShoppingBag size={18} />
              <span>Add to Cart</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-200 text-center text-[11px] text-stone-600 font-medium">
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <ShieldCheck size={18} className="text-amber-800 mx-auto" />
              <span>100% Genuine Silver/Materials</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <Truck size={18} className="text-amber-800 mx-auto" />
              <span>Dispatch in {product.productionTimeDays} Days</span>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <RotateCcw size={18} className="text-amber-800 mx-auto" />
              <span>Artisan Return Protection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
        <div className="flex border-b border-stone-200 overflow-x-auto gap-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-amber-800 text-amber-950 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Full Specifications
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'care'
                ? 'border-amber-800 text-amber-950 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Item Care Instructions
          </button>
          <button
            onClick={() => setActiveTab('process')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'process'
                ? 'border-amber-800 text-amber-950 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Handmade Crafting Process
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'shipping'
                ? 'border-amber-800 text-amber-950 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Shipping & Dispatch Policy
          </button>
        </div>

        <div className="text-xs leading-relaxed text-stone-700 space-y-4">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <p>{product.fullDescription}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-semibold text-stone-900">{product.category}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Material</span>
                  <span className="font-semibold text-stone-900">{product.material}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">SKU</span>
                  <span className="font-semibold text-stone-900">{product.sku}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Craft Time</span>
                  <span className="font-semibold text-stone-900">{product.productionTimeDays} Days</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-2">
              <h4 className="font-bold text-stone-900">Keeping Your Handmade Piece Beautiful:</h4>
              <p>{product.careInstructions || 'Keep in dry area away from direct moisture. Clean gently with soft cloth.'}</p>
            </div>
          )}

          {activeTab === 'process' && (
            <div className="space-y-2">
              <h4 className="font-bold text-stone-900">From studio to your hands:</h4>
              <p>{product.handmadeProcess || 'Hand crafted, assembled or woven using traditional tools.'}</p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-2">
              <h4 className="font-bold text-stone-900">Delivery Timelines across Pakistan:</h4>
              <p>
                Each item is made or hand-inspected in {seller?.location || 'Pakistan'}. Ships via TCS or Leopard Courier within {product.productionTimeDays} days of order confirmation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Customer Reviews ({productReviews.length})
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={product.rating} count={product.reviewCount} size={16} />
              <span className="text-xs text-stone-500">Based on verified purchases</span>
            </div>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-4 py-2 bg-stone-900 text-white hover:bg-stone-800 rounded-xl text-xs font-bold transition-colors"
          >
            Write a Review
          </button>
        </div>

        {/* Reviews List */}
        {productReviews.length > 0 ? (
          <div className="space-y-4">
            {productReviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-stone-900">{rev.customerName}</span>
                    {rev.verifiedPurchase && (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400">{rev.date}</span>
                </div>

                <StarRating rating={rev.rating} showText={false} size={14} />

                <p className="text-xs text-stone-700 leading-relaxed font-light">
                  {rev.reviewText}
                </p>

                {rev.sellerReply && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs">
                    <p className="font-bold text-amber-950">
                      Response from {product.sellerShopName}:
                    </p>
                    <p className="text-stone-700 mt-0.5">{rev.sellerReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-500 py-4">
            No customer reviews yet. Be the first to review this artisan creation!
          </p>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h3 className="font-serif text-2xl font-bold text-stone-900">
            More Handmade Jewelry You May Love
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif font-bold text-stone-900 text-lg">Write a Review</h3>
              <button onClick={() => setIsReviewModalOpen(false)}>
                <X size={20} className="text-stone-400 hover:text-stone-600" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Your Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-amber-500"
                    >
                      <Star size={22} className={star <= newRating ? 'fill-amber-500' : 'text-stone-300'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Review Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details about craftsmanship, packaging, and fit..."
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-xs font-semibold rounded-xl text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-900 text-white text-xs font-bold rounded-xl hover:bg-amber-950"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Seller Modal */}
      {isMessageModalOpen && seller && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                Message {seller.shopName}
              </h3>
              <button onClick={() => setIsMessageModalOpen(false)}>
                <X size={20} className="text-stone-400 hover:text-stone-600" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Your Message / Customization Question
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={`Ask ${seller.shopName} about customization options, size adjustments, or bulk wedding orders...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMessageModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-xs font-semibold rounded-xl text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-900 text-white text-xs font-bold rounded-xl hover:bg-amber-950"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
