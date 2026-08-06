import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Logo } from '../common/Logo';
import { AuthModal } from '../common/AuthModal';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Store,
  Menu,
  X,
  Gem,
  Bell,
  Sparkles,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { formatPKR } from '../../utils/format';

interface NavbarProps {
  onNavigate: (view: string, param?: string) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  const {
    currentUser,
    cart,
    wishlist,
    notifications,
    products,
    sellers,
    categories,
    activeRole,
    currentSellerShop,
    logoutUser
  } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  // Search autocomplete matches
  const filteredProducts = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.material.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const filteredSellers = searchQuery.trim()
    ? sellers
        .filter(
          (s) =>
            s.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.specialization.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('shop', searchQuery);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-900/10 shadow-xs">
        {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 sm:py-3 min-h-[5.5rem] gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className="group text-left"
            >
              <Logo size="md" variant="light" />
            </button>
          </div>

          {/* Wide Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search handmade products, bags, calligraphy, home decor..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-11 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-left animate-in fade-in slide-in-from-top-2">
                {filteredProducts.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                      Product Matches
                    </p>
                    <div className="space-y-1.5">
                      {filteredProducts.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => {
                            onNavigate('product', prod.slug);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <img
                            src={prod.images[0]}
                            alt={prod.title}
                            className="w-10 h-10 object-cover rounded-md border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-900 truncate">
                              {prod.title}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {prod.sellerShopName} • {formatPKR(prod.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredSellers.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                      Craft Shops
                    </p>
                    <div className="space-y-1.5">
                      {filteredSellers.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            onNavigate('shopfront', s.slug);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <img
                            src={s.logo}
                            alt={s.shopName}
                            className="w-8 h-8 object-cover rounded-full border border-slate-200"
                          />
                          <div>
                            <p className="text-xs font-medium text-slate-900">
                              {s.shopName}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {s.location}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredProducts.length === 0 && filteredSellers.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No items found matching "{searchQuery}".
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Currency Indicator */}
            <div className="hidden sm:flex items-center text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              PKR (Rs)
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('account', 'wishlist')}
              className="relative p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
              title="Wishlist"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2"
              title="Shopping Cart"
            >
              <ShoppingBag size={20} />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {totalCartCount}
                </span>
              )}
              <span className="hidden lg:inline text-xs font-semibold text-slate-900">
                {formatPKR(totalCartAmount)}
              </span>
            </button>

            {/* Sign In vs My Account Button */}
            {!currentUser ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 border border-amber-700"
              >
                <User size={15} />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('account')}
                  className="flex items-center gap-2 p-1.5 text-stone-700 hover:text-amber-900 hover:bg-stone-100 rounded-lg transition-colors text-xs font-semibold"
                  title="Customer Account & Orders"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-900 text-amber-50 flex items-center justify-center font-bold text-xs shadow-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline font-bold text-stone-800">{currentUser.name}</span>
                </button>
                <button
                  onClick={logoutUser}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}

            {activeRole === 'seller' && (
              <button
                onClick={() => onNavigate('seller-dashboard')}
                className="flex items-center gap-2 px-3.5 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Store size={15} />
                <span className="hidden sm:inline">
                  {currentSellerShop ? currentSellerShop.shopName : 'Seller Dashboard'}
                </span>
              </button>
            )}

            {activeRole === 'admin' && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="flex items-center gap-2 px-3.5 py-2 bg-stone-900 text-stone-100 hover:bg-stone-800 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>Admin Control</span>
              </button>
            )}

            {/* Mobile Hamburger Menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Categories Nav Strip */}
      <div className="border-t border-stone-200/80 bg-stone-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-6 py-3 overflow-x-auto no-scrollbar text-xs font-semibold text-stone-600">
            <button
              onClick={() => onNavigate('shop')}
              className="font-bold text-stone-900 hover:text-amber-900 transition-colors whitespace-nowrap"
            >
              All Categories
            </button>
            <button
              onClick={() => onNavigate('shop', 'Jewelry')}
              className="hover:text-amber-900 transition-colors whitespace-nowrap"
            >
              Jewelry
            </button>
            <button
              onClick={() => onNavigate('shop', 'Bags')}
              className="hover:text-amber-900 transition-colors whitespace-nowrap"
            >
              Bags & Clutches
            </button>
            <button
              onClick={() => onNavigate('shop', 'Home Decor')}
              className="hover:text-amber-900 transition-colors whitespace-nowrap"
            >
              Home Decor
            </button>
            <button
              onClick={() => onNavigate('shop', 'Calligraphy')}
              className="hover:text-amber-900 transition-colors whitespace-nowrap"
            >
              Calligraphy
            </button>
            <button
              onClick={() => onNavigate('shop', 'Candles')}
              className="hover:text-amber-900 transition-colors whitespace-nowrap"
            >
              Soy Candles
            </button>
            <button
              onClick={() => onNavigate('shop', 'Keychains')}
              className="hover:text-amber-900 transition-colors whitespace-nowrap"
            >
              Keychains
            </button>
            <button
              onClick={() => onNavigate('shop', 'Bouquets')}
              className="hover:text-amber-900 transition-colors whitespace-nowrap"
            >
              Flower Bouquets
            </button>
            <span className="text-stone-300">|</span>
            <button
              onClick={() => onNavigate('become-a-seller')}
              className="hover:text-amber-900 whitespace-nowrap text-amber-900 font-bold"
            >
              Open Your Shop
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-4 shadow-lg animate-in fade-in">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search jewelry, shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-800 focus:outline-none"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            {!currentUser ? (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 bg-amber-800 text-white font-bold rounded-lg text-left col-span-2 flex items-center justify-center gap-2 shadow-xs"
              >
                <User size={16} />
                <span>Sign In / Create Account</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate('account');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 bg-amber-900 text-white font-bold rounded-lg text-left col-span-2 flex items-center gap-2"
              >
                <User size={16} />
                <span>My Account ({currentUser.name})</span>
              </button>
            )}
            <button
              onClick={() => {
                onNavigate('shop');
                setIsMobileMenuOpen(false);
              }}
              className="p-2 bg-stone-100 rounded text-stone-800 hover:bg-stone-200 text-left font-bold"
            >
              Shop All Products
            </button>

            <button
              onClick={() => {
                onNavigate('become-a-seller');
                setIsMobileMenuOpen(false);
              }}
              className="p-2 bg-stone-900 text-white rounded font-bold text-left col-span-2 flex items-center justify-center gap-1"
            >
              <Store size={14} className="text-amber-300" />
              <span>Open Your Seller Shop</span>
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-900 uppercase tracking-wider text-[10px]">
              Categories
            </p>
            {categories.slice(0, 8).map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  onNavigate('shop', c.name);
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-1 hover:text-indigo-600"
              >
                {c.name} ({c.count})
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
    </>
  );
};
