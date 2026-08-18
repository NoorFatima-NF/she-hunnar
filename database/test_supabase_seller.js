import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bopodzkhdrrdegnsvdgq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YZL6cQs187vtSndsSAj-hA_0XgktYU6';

console.log('Testing Supabase Seller Profile Insert...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSellerInsert() {
  // 1. Create test user in users table
  const testEmail = `seller-${Date.now()}@example.com`;
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      name: 'Noor Crafts Owner',
      email: testEmail,
      phone: '03001234567',
      role: 'seller'
    })
    .select()
    .single();

  if (userError) {
    console.error('❌ User insert failed:', userError);
    return;
  }
  console.log('✅ User created:', userData.id);

  // 2. Create seller profile
  const testSeller = {
    user_id: userData.id,
    shop_name: 'Noor Crafts Studio',
    slug: `noor-crafts-${Date.now()}`,
    specialization: 'Handmade Jewelry',
    about: 'Artisan silver and gemstone jewelry studio in Lahore.',
    location: 'Lahore, Pakistan',
    rating: 5.0,
    review_count: 0,
    product_count: 0,
    completed_orders: 0,
    verification_status: 'pending',
    verification_docs_uploaded: true,
    seller_type: 'individual',
    cnic_name: 'Noor Fatima',
    cnic_number: '35201-1234567-1',
    commission_rate: 10.0,
    shipping_fee: 200.0,
    payout_method: 'Bank Transfer'
  };

  const { data: sellerData, error: sellerError } = await supabase
    .from('seller_profiles')
    .insert(testSeller)
    .select();

  if (sellerError) {
    console.error('❌ Seller profile insert failed:', sellerError);
  } else {
    console.log('✅ Seller profile inserted successfully into Supabase!', sellerData);
  }
}

testSellerInsert();
