import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useMarketplace();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md bg-stone-900 text-stone-100 px-4 py-3 rounded-lg shadow-xl border border-stone-800 flex items-start gap-3 animate-slide-up">
      <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
      <div className="text-xs leading-relaxed font-medium">
        {toastMessage}
      </div>
    </div>
  );
};
