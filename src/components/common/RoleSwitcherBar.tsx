import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { UserCheck, Store, ShieldAlert, Sparkles } from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const {
    activeRole,
    setActiveRole,
    activeSellerShopId,
    setActiveSellerShopId,
    sellers
  } = useMarketplace();

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 z-50">
      <div className="flex items-center gap-2 font-medium">
        <Sparkles size={13} className="text-indigo-400 animate-pulse" />
        <span className="text-slate-300 hidden sm:inline">Role Simulator:</span>
        <span className="text-indigo-300 font-semibold uppercase tracking-wider text-[11px]">
          {activeRole === 'customer' ? 'Customer View' : activeRole === 'seller' ? 'Seller Workspace' : 'Marketplace Admin'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveRole('customer')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            activeRole === 'customer'
              ? 'bg-slate-100 text-slate-950 font-semibold shadow-xs'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <UserCheck size={12} />
          <span>Customer</span>
        </button>

        <button
          onClick={() => setActiveRole('seller')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            activeRole === 'seller'
              ? 'bg-indigo-600 text-white font-semibold shadow-xs'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Store size={12} />
          <span>Seller Studio</span>
        </button>

        {activeRole === 'seller' && (
          <select
            value={activeSellerShopId}
            onChange={(e) => setActiveSellerShopId(e.target.value)}
            className="bg-slate-800 text-indigo-200 border border-slate-700 text-xs rounded px-2 py-0.5 focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.shopName} ({s.location.split(',')[0]})
              </option>
            ))}
          </select>
        )}

        <button
          onClick={() => setActiveRole('admin')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            activeRole === 'admin'
              ? 'bg-indigo-900 text-indigo-100 border border-indigo-500 font-semibold shadow-xs'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <ShieldAlert size={12} />
          <span>Admin Portal</span>
        </button>
      </div>
    </div>
  );
};
