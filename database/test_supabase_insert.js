import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bopodzkhdrrdegnsvdgq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YZL6cQs187vtSndsSAj-hA_0XgktYU6';

console.log('Testing Supabase with URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const testOrder = {
    order_number: `ORD-TEST-${Date.now()}`,
    customer_name: 'Noor Fatima Test',
    customer_email: 'test@example.com',
    customer_phone: '03001234567',
    shipping_address_line: 'House 123, Street 4, Phase 5 DHA',
    shipping_city: 'Lahore',
    shipping_province: 'Punjab',
    shipping_postal_code: '54000',
    payment_method: 'Online Card',
    payment_status: 'Paid',
    total_items: 2,
    subtotal: 4500.00,
    total_shipping: 200.00,
    grand_total: 4700.00,
    master_status: 'Pending'
  };

  const { data, error } = await supabase.from('master_orders').insert(testOrder).select();

  if (error) {
    console.error('❌ Insert failed:', error);
  } else {
    console.log('✅ Insert successful! Data in Supabase:', data);
  }
}

testInsert();
