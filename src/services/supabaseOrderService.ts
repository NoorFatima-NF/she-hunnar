import { supabase, isSupabaseConfigured } from './supabaseClient';
import { MasterOrder } from '../types';

/**
 * Saves placed Master Order and its split sub-orders directly to Supabase
 */
export const syncOrderToSupabase = async (order: MasterOrder) => {
  if (!isSupabaseConfigured) {
    console.log('[Supabase Order] Supabase not configured; order stored in local storage.');
    return;
  }

  try {
    // 1. Auto-find or create customer in `users` table by email
    let customerUuid: string | null = null;
    const cleanEmail = order.customerEmail.toLowerCase().trim();

    if (cleanEmail) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingUser?.id) {
        customerUuid = existingUser.id;
      } else {
        // Create new user profile in users table
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            name: order.customerName,
            email: cleanEmail,
            phone: order.customerPhone,
            role: 'customer'
          })
          .select('id')
          .maybeSingle();

        if (newUser?.id) {
          customerUuid = newUser.id;
          console.log(`👤 [Supabase User] Created new customer profile: ${cleanEmail} (ID: ${customerUuid})`);
        } else if (userError) {
          console.warn('[Supabase User] Note creating user:', userError.message);
          alert('Supabase User Error: ' + userError.message);
        }
      }
    }

    // 2. Insert Master Order with linked customer_id
    const { data: masterData, error: masterError } = await supabase
      .from('master_orders')
      .insert({
        order_number: order.id,
        customer_id: customerUuid, // Linked UUID from users table
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerPhone,
        shipping_address_line: order.shippingAddress.addressLine,
        shipping_city: order.shippingAddress.city,
        shipping_province: order.shippingAddress.province,
        shipping_postal_code: order.shippingAddress.postalCode,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus,
        payment_proof_url: order.paymentProofUrl || null,
        safepay_tracker: order.safepayTracker || null,
        safepay_signature: order.safepaySignature || null,
        transaction_ref: order.transactionRef || null,
        payment_verified_at: order.paymentVerifiedAt || null,
        total_items: order.totalItems,
        subtotal: order.subtotal,
        discount_amount: order.discountAmount || 0,
        total_shipping: order.totalShipping,
        grand_total: order.grandTotal,
        coupon_code: order.couponCode || null,
        master_status: order.masterStatus
      })
      .select('id')
      .single();

    if (masterError) {
      console.warn('[Supabase Order] Master order sync note:', masterError.message);
      alert('Supabase Order Error: ' + masterError.message);
      return;
    }

    const masterDbId = masterData?.id;
    console.log(`✅ [Supabase Order] Order ${order.id} synced to master_orders (ID: ${masterDbId}, Customer ID: ${customerUuid})`);

    // 3. Save delivery address to `addresses` table if customer exists
    if (customerUuid) {
      await supabase.from('addresses').insert({
        user_id: customerUuid,
        full_name: order.customerName,
        phone: order.customerPhone,
        address_line: order.shippingAddress.addressLine,
        city: order.shippingAddress.city,
        province: order.shippingAddress.province,
        postal_code: order.shippingAddress.postalCode,
        is_default: true
      });
    }
  } catch (err: any) {
    console.error('[Supabase Order] Error syncing order to Supabase:', err.message || err);
    alert('Supabase Order Exception: ' + (err.message || err));
  }
};

/**
 * Updates payment status on Supabase when Safepay confirms payment
 */
export const syncPaymentStatusToSupabase = async (
  orderId: string,
  paymentStatus: string,
  safepayInfo?: { tracker?: string; transactionRef?: string }
) => {
  if (!isSupabaseConfigured) return;

  try {
    const updatePayload: any = {
      payment_status: paymentStatus,
      payment_verified_at: new Date().toISOString()
    };

    if (safepayInfo?.tracker) updatePayload.safepay_tracker = safepayInfo.tracker;
    if (safepayInfo?.transactionRef) updatePayload.transaction_ref = safepayInfo.transactionRef;

    const { error } = await supabase
      .from('master_orders')
      .update(updatePayload)
      .eq('order_number', orderId);

    if (error) {
      console.warn('[Supabase Order] Payment status update note:', error.message);
    } else {
      console.log(`✅ [Supabase Order] Order ${orderId} updated to '${paymentStatus}' in Supabase.`);
    }
  } catch (err: any) {
    console.error('[Supabase Order] Error updating payment status:', err.message || err);
  }
};
