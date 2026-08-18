import { supabase, isSupabaseConfigured } from './supabaseClient';
import { SellerProfile, User } from '../types';

/**
 * Saves created Seller Shop Application directly to Supabase `seller_profiles` and `users` tables
 */
export const syncSellerToSupabase = async (seller: SellerProfile, currentUser?: User | null) => {
  if (!isSupabaseConfigured) {
    console.log('[Supabase Seller] Supabase not configured; seller stored in local state.');
    return;
  }

  try {
    // 1. Find or create user account in `users` table
    let userUuid: string | null = null;
    const userEmail = currentUser?.email || `${seller.slug}@seller.shehunnar.pk`;

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail.toLowerCase().trim())
      .maybeSingle();

    if (existingUser?.id) {
      userUuid = existingUser.id;
      // Update role to seller
      await supabase.from('users').update({ role: 'seller' }).eq('id', userUuid);
    } else {
      // Create user
    const { data: newUser } = await supabase
        .from('users')
        .insert({
          name: seller.cnicName || seller.shopName,
          email: userEmail.toLowerCase().trim(),
          phone: seller.socialLinks?.whatsapp || '+92 300 0000000',
          role: 'seller',
          avatar_url: seller.logo || null
        })
        .select('id')
        .maybeSingle();

      if (newUser?.id) {
        userUuid = newUser.id;
      }
    }

    if (!userUuid) {
      console.warn('[Supabase Seller] Could not find or create user for seller profile.');
      return;
    }

    // 2. Insert into `seller_profiles` table
    const { data: sellerData, error: sellerError } = await supabase
      .from('seller_profiles')
      .insert({
        user_id: userUuid,
        shop_name: seller.shopName,
        slug: seller.slug,
        specialization: seller.specialization || 'Handmade Jewelry',
        about: seller.about || null,
        location: seller.location || 'Pakistan',
        logo_url: seller.logo || null,
        banner_url: seller.banner || null,
        rating: seller.rating || 5.0,
        review_count: seller.reviewCount || 0,
        product_count: seller.productCount || 0,
        completed_orders: seller.completedOrders || 0,
        verification_status: seller.verificationStatus || 'pending',
        verification_docs_uploaded: seller.verificationDocsUploaded ?? true,
        seller_type: seller.sellerType || 'individual',
        cnic_number: seller.cnicNumber || null,
        cnic_name: seller.cnicName || null,
        cnic_front_url: seller.cnicFrontUrl || null,
        cnic_back_url: seller.cnicBackUrl || null,
        bank_title: seller.bankTitle || null,
        pickup_address: seller.pickupAddress || null,
        commission_rate: seller.commissionRate || 10.0,
        shipping_fee: seller.shippingFee || 200.0,
        free_shipping_threshold: seller.freeShippingThreshold || null,
        payout_method: seller.payoutMethod || 'Bank Transfer',
        account_details: seller.accountDetails || null,
        instagram_url: seller.socialLinks?.instagram || null,
        facebook_url: seller.socialLinks?.facebook || null,
        whatsapp_number: seller.socialLinks?.whatsapp || null,
        seller_email: userEmail.toLowerCase().trim(),
        seller_phone: seller.socialLinks?.whatsapp || null,
        cheque_proof_url: (seller as any).chequeProofUrl || null
      })
      .select('id')
      .single();

    if (sellerError) {
      console.warn('[Supabase Seller] Seller profile insert note:', sellerError.message);
    } else {
      console.log(`✅ [Supabase Seller] Shop '${seller.shopName}' synced to seller_profiles (ID: ${sellerData?.id})`);
    }
  } catch (err: any) {
    console.error('[Supabase Seller] Error syncing seller to Supabase:', err.message || err);
  }
};
