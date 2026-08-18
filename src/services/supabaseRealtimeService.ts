import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface RealtimeSubscriptionHandlers {
  onNewMessage?: (payload: any) => void;
  onOrderUpdated?: (payload: any) => void;
  onProductChanged?: (payload: any) => void;
  onNewNotification?: (payload: any) => void;
}

/**
 * Subscribes to Supabase Realtime changes across She Hunnar tables
 */
export const subscribeToMarketplaceRealtime = (handlers: RealtimeSubscriptionHandlers) => {
  if (!isSupabaseConfigured) {
    return () => {}; // Return no-op cleanup if Supabase not configured yet
  }

  const channel = supabase.channel('marketplace-realtime');

  if (handlers.onNewMessage) {
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => handlers.onNewMessage?.(payload.new)
    );
  }

  if (handlers.onOrderUpdated) {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'master_orders' },
      (payload) => handlers.onOrderUpdated?.(payload.new)
    );
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'seller_orders' },
      (payload) => handlers.onOrderUpdated?.(payload.new)
    );
  }

  if (handlers.onProductChanged) {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      (payload) => handlers.onProductChanged?.(payload.new)
    );
  }

  if (handlers.onNewNotification) {
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      (payload) => handlers.onNewNotification?.(payload.new)
    );
  }

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('⚡ [Supabase Realtime] Connected and listening to live marketplace events.');
    }
  });

  return () => {
    supabase.removeChannel(channel);
  };
};
