import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { CartItem } from '../types';

const generateSupabaseId = (fallback: string) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${fallback}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

export const syncCartToSupabase = async (
  cart: CartItem[],
  options: {
    currentUserId?: string | null;
    currentUserEmail?: string | null;
    sessionToken?: string | null;
  } = {}
) => {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const targetUserId = options.currentUserId ?? null;
    const sessionToken = options.sessionToken ?? null;

    if (targetUserId && targetUserId.trim()) {
      await supabase.from('cart_items').delete().eq('user_id', targetUserId);
    } else if (sessionToken && sessionToken.trim()) {
      await supabase.from('cart_items').delete().eq('session_token', sessionToken);
    }

    if (cart.length === 0) {
      return;
    }

    const payload = cart.map((item) => ({
      id: item.id && item.id.trim() ? item.id : generateSupabaseId('cart-item'),
      user_id: targetUserId && targetUserId.trim() ? targetUserId : null,
      session_token: targetUserId && targetUserId.trim() ? null : (sessionToken && sessionToken.trim() ? sessionToken : null),
      product_id: item.productId,
      variant_id: item.selectedVariant?.id ?? null,
      quantity: item.quantity,
      customization_data: item.customization && Object.keys(item.customization).length > 0 ? item.customization : null
    }));

    const { error } = await supabase.from('cart_items').insert(payload);

    if (error) {
      console.warn('[Supabase Cart] Cart sync note:', error.message);
      alert('Supabase Sync Error: ' + error.message);
    } else {
      console.log(`[Supabase Cart] ${cart.length} cart item(s) synced.`);
      // Optional: alert('Supabase Sync Success!');
    }
  } catch (error: any) {
    console.warn('[Supabase Cart] Error syncing cart:', error?.message || error);
    alert('Supabase Sync Exception: ' + (error?.message || error));
  }
};
