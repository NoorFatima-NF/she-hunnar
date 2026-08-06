import React, { useState, useMemo } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/product/ProductCard';
import { JewelryCategory } from '../types';
import { isProductInCategory } from '../utils/categoryUtils';
import {
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Search
} from 'lucide-react';

interface ShopPageProps {
  initialCategory?: string;
  initialSearch?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory,
  initialSearch,
  onNavigate
}) => {
  const { products, categories, sellers } = useMarketplace();

  const [selectedCat, setSelectedCat] = useState<string>(initialCategory || 'All');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('All');
  const [selectedSeller, setSelectedSeller] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [onlyCustomizable, setOnlyCustomizable] = useState<boolean>(false);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>(initialSearch || '');
  const [sortBy, setSortBy] = useState<string>('featured');

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Sync state when props change (e.g. clicking navbar category while already on ShopPage)
  React.useEffect(() => {
    if (initialCategory) setSelectedCat(initialCategory);
    if (initialSearch !== undefined) setSearchFilter(initialSearch);
  }, [initialCategory, initialSearch]);

  // Extract unique materials for which products are actually available
  const materialsList = useMemo(() => {
    const counts = new Map<string, number>();
    const availableProducts = selectedCat === 'All'
      ? products
      : products.filter((p) => isProductInCategory(p, selectedCat));

    availableProducts.forEach((p) => {
      if (p.material && p.material.trim()) {
        const mat = p.material.trim();
        counts.set(mat, (counts.get(mat) || 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, selectedCat]);

  // Reset selectedMaterial if it is no longer available in the current category/filter
  React.useEffect(() => {
    if (
      selectedMaterial !== 'All' &&
      !materialsList.some((m) => m.name.toLowerCase() === selectedMaterial.toLowerCase())
    ) {
      setSelectedMaterial('All');
    }
  }, [materialsList, selectedMaterial]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCat !== 'All' && !isProductInCategory(p, selectedCat)) return false;

      // Material filter
      if (selectedMaterial !== 'All' && !p.material.toLowerCase().includes(selectedMaterial.toLowerCase()))
        return false;

      // Seller filter
      if (selectedSeller !== 'All' && p.sellerId !== selectedSeller) return false;

      // Price filter
      if (p.price < minPrice || p.price > maxPrice) return false;

      // Customizable filter
      if (onlyCustomizable && !p.isCustomizable) return false;

      // In stock filter
      if (onlyInStock && p.stock <= 0) return false;

      // Search keyword filter
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.shortDescription.toLowerCase().includes(q);
        const matchCategory = p.category.toLowerCase().includes(q);
        const matchSeller = p.sellerShopName.toLowerCase().includes(q);
        const matchMaterial = p.material.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCategory && !matchSeller && !matchMaterial)
          return false;
      }

      return true;
    });
  }, [
    products,
    selectedCat,
    selectedMaterial,
    selectedSeller,
    minPrice,
    maxPrice,
    onlyCustomizable,
    onlyInStock,
    searchFilter
  ]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const copy = [...filteredProducts];
    if (sortBy === 'price-low') {
      return copy.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-high') {
      return copy.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'newest') {
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (sortBy === 'bestselling') {
      return copy.sort((a, b) => b.salesCount - a.salesCount);
    }
    if (sortBy === 'rating') {
      return copy.sort((a, b) => b.rating - a.rating);
    }
    return copy; // default 'featured'
  }, [filteredProducts, sortBy]);

  const resetFilters = () => {
    setSelectedCat('All');
    setSelectedMaterial('All');
    setSelectedSeller('All');
    setMinPrice(0);
    setMaxPrice(30000);
    setOnlyCustomizable(false);
    setOnlyInStock(false);
    setSearchFilter('');
    setSortBy('featured');
  };

  const activeFiltersCount =
    (selectedCat !== 'All' ? 1 : 0) +
    (selectedMaterial !== 'All' ? 1 : 0) +
    (selectedSeller !== 'All' ? 1 : 0) +
    (minPrice > 0 || maxPrice < 30000 ? 1 : 0) +
    (onlyCustomizable ? 1 : 0) +
    (onlyInStock ? 1 : 0) +
    (searchFilter ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-stone-100 rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-stone-800 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 text-amber-300 border border-amber-400/20 text-xs font-bold uppercase tracking-widest rounded-full">
            <Sparkles size={13} /> Handmade Crafts Catalogue
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
            {selectedCat === 'All' ? 'Explore All Handmade Products' : `${selectedCat} Collection`}
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed max-w-2xl">
            Authentic handmade jewelry, handwoven bags, home decor, custom calligraphy, soy candles, keychains, and flower bouquets directly from independent Pakistani makers.
          </p>

          {/* Quick Category Filter Pills */}
          <div className="pt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCat('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCat === 'All'
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20'
              }`}
            >
              All ({products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedCat(c.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCat === c.name
                    ? 'bg-amber-400 text-amber-950 shadow-sm'
                    : 'bg-white/10 text-stone-300 hover:bg-white/20'
                }`}
              >
                {c.name} ({c.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Filter & Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block bg-white rounded-2xl border border-stone-200 p-6 space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center gap-2 font-serif font-bold text-stone-900 text-base">
              <SlidersHorizontal size={18} className="text-amber-800" />
              <span>Filter Products</span>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Reset ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Search Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Keyword Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Title, material, shop..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 pl-8 pr-3 text-xs focus:outline-none focus:border-amber-800"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-stone-400" />
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Product Category
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto text-xs">
              <button
                onClick={() => setSelectedCat('All')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                  selectedCat === 'All'
                    ? 'bg-amber-100/80 font-bold text-amber-950'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                All Categories ({products.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCat(c.name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex justify-between ${
                    selectedCat === c.name
                      ? 'bg-amber-100/80 font-bold text-amber-950'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-stone-400 font-normal">({c.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-stone-800 uppercase tracking-wider">
              <span>Price Range (PKR)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-stone-400">Min Rs.</span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-stone-400">Max Rs.</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Material */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Primary Material
            </label>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs text-stone-800 focus:outline-none"
            >
              <option value="All">All Available Materials</option>
              {materialsList.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} ({m.count} {m.count === 1 ? 'item' : 'items'})
                </option>
              ))}
            </select>
          </div>

          {/* Seller Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Craft Store
            </label>
            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs text-stone-800 focus:outline-none"
            >
              <option value="All">All Stores</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shopName}
                </option>
              ))}
            </select>
          </div>

          {/* Checkbox Toggles */}
          <div className="space-y-2 pt-2 border-t border-stone-200 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyCustomizable}
                onChange={(e) => setOnlyCustomizable(e.target.checked)}
                className="rounded text-amber-800 focus:ring-amber-800"
              />
              <span className="font-semibold text-stone-800 flex items-center gap-1">
                <Sparkles size={13} className="text-amber-600" /> Customizable Only
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded text-amber-800 focus:ring-amber-800"
              />
              <span className="font-semibold text-stone-800">In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort & Mobile Filter Toggle Bar */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-stone-600 font-medium">
              Showing <span className="font-bold text-stone-900">{sortedProducts.length}</span> handmade items
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Trigger Button */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold text-stone-800 flex items-center gap-1.5"
              >
                <Filter size={14} />
                <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                <span className="hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-medium focus:outline-none focus:border-amber-800"
                >
                  <option value="featured">Featured First</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="bestselling">Best Selling</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Badges Strip */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-stone-400 font-medium">Active filters:</span>
              {selectedCat !== 'All' && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-semibold">
                  Category: {selectedCat}
                  <X size={12} className="cursor-pointer" onClick={() => setSelectedCat('All')} />
                </span>
              )}
              {selectedMaterial !== 'All' && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-semibold">
                  Material: {selectedMaterial}
                  <X size={12} className="cursor-pointer" onClick={() => setSelectedMaterial('All')} />
                </span>
              )}
              {onlyCustomizable && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-semibold">
                  Customizable Only
                  <X size={12} className="cursor-pointer" onClick={() => setOnlyCustomizable(false)} />
                </span>
              )}
              {searchFilter && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-semibold">
                  "{searchFilter}"
                  <X size={12} className="cursor-pointer" onClick={() => setSearchFilter('')} />
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-xs text-rose-600 underline font-semibold ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Grid of Products */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <Search size={28} />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                No Handmade Products Found
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                We couldn't find any items matching your selected filters. Try clearing your filters or searching for different keywords.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-xs font-bold hover:bg-stone-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
