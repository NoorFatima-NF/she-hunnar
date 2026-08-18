-- ==============================================================================
-- MINIMAL MARKETPLACE SCHEMA FOR THIS APP
-- Only keeps the tables the website actually uses.
-- SQL is designed to work with the app's string-based IDs like p-..., s-..., cart-...
-- ==============================================================================

-- 1) Optional cleanup for truly unused tables
DROP TABLE IF EXISTS seller_payouts;
DROP TABLE IF EXISTS return_requests;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS messages;

-- 2) Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3) Core tables
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
  avatar_url TEXT,
  google_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  specialization TEXT NOT NULL,
  about TEXT,
  location TEXT,
  logo_url TEXT,
  banner_url TEXT,
  rating NUMERIC(3,2) DEFAULT 5.00,
  review_count INTEGER DEFAULT 0,
  product_count INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending','approved','rejected','suspended')),
  verification_docs_uploaded BOOLEAN DEFAULT FALSE,
  seller_type TEXT DEFAULT 'individual' CHECK (seller_type IN ('individual','business')),
  cnic_number TEXT,
  cnic_name TEXT,
  cnic_front_url TEXT,
  cnic_back_url TEXT,
  bank_title TEXT,
  pickup_address TEXT,
  commission_rate NUMERIC(5,2) DEFAULT 10.00,
  shipping_fee NUMERIC(10,2) DEFAULT 200.00,
  free_shipping_threshold NUMERIC(10,2),
  payout_method TEXT DEFAULT 'Bank Transfer',
  account_details TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  whatsapp_number TEXT,
  seller_email TEXT,
  seller_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  seller_id TEXT REFERENCES seller_profiles(id) ON DELETE CASCADE,
  seller_shop_name TEXT,
  seller_logo TEXT,
  category TEXT,
  material TEXT,
  metal_type TEXT,
  stone_type TEXT,
  color TEXT,
  occasion TEXT,
  short_description TEXT,
  full_description TEXT,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  rating NUMERIC(3,2) DEFAULT 5.00,
  review_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_customizable BOOLEAN DEFAULT FALSE,
  production_time_days INTEGER DEFAULT 7,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft','pending','published','rejected','out_of_stock')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_customization_configs (
  id TEXT PRIMARY KEY,
  product_id TEXT UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  allow_text BOOLEAN DEFAULT FALSE,
  text_label TEXT,
  max_characters INTEGER,
  allow_font_selection BOOLEAN DEFAULT FALSE,
  fonts TEXT[] DEFAULT '{}',
  allow_stone_selection BOOLEAN DEFAULT FALSE,
  stones TEXT[] DEFAULT '{}',
  allow_reference_upload BOOLEAN DEFAULT FALSE,
  allow_note BOOLEAN DEFAULT FALSE,
  note_label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_token TEXT,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  customization_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS master_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address_line TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_province TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'COD' CHECK (payment_method IN ('COD','Bank Transfer','Easypaisa','JazzCash','Online Card')),
  payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending','Paid','Failed','Refunded')),
  payment_proof_url TEXT,
  safepay_tracker TEXT,
  safepay_signature TEXT,
  transaction_ref TEXT,
  payment_verified_at TIMESTAMPTZ,
  total_items INTEGER NOT NULL DEFAULT 1,
  subtotal NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total_shipping NUMERIC(10,2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(10,2) NOT NULL,
  coupon_code TEXT,
  master_status TEXT DEFAULT 'Pending' CHECK (master_status IN ('Pending','Confirmed','Processing','Ready to Ship','Shipped','Out for Delivery','Delivered','Cancelled','Return Requested','Returned','Refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_orders (
  id TEXT PRIMARY KEY,
  sub_order_number TEXT UNIQUE NOT NULL,
  master_order_id TEXT REFERENCES master_orders(id) ON DELETE CASCADE,
  seller_id TEXT REFERENCES seller_profiles(id) ON DELETE CASCADE,
  subtotal NUMERIC(10,2) NOT NULL,
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending','Confirmed','Processing','Ready to Ship','Shipped','Out for Delivery','Delivered','Cancelled','Return Requested','Returned','Refunded')),
  courier_name TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  seller_order_id TEXT REFERENCES seller_orders(id) ON DELETE CASCADE,
  product_id TEXT,
  product_title TEXT NOT NULL,
  product_image TEXT NOT NULL,
  variant_name TEXT,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  customization_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  customer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT TRUE,
  images TEXT[] DEFAULT '{}',
  seller_reply TEXT,
  seller_reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage','fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_spend NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(10,2),
  expiry_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  applicable_seller_id TEXT,
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  target_role TEXT DEFAULT 'customer' CHECK (target_role IN ('customer','seller','admin')),
  target_seller_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_jewelry_requests (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  category TEXT,
  item_type TEXT,
  preferred_metal TEXT,
  preferred_stone TEXT,
  budget NUMERIC(10,2),
  notes TEXT,
  reference_images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Submitted' CHECK (status IN ('Submitted','In Review','Quoted','In Production','Completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_settings (
  id TEXT PRIMARY KEY,
  platform_commission NUMERIC(5,2) DEFAULT 10.00,
  announcement_text TEXT,
  currency TEXT DEFAULT 'PKR',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4) Safe permissions for storefront use
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_customization_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS master_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS seller_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS custom_jewelry_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS platform_settings ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.users TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.addresses TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.seller_profiles TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.products TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.product_variants TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.product_customization_configs TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cart_items TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.wishlist_items TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.master_orders TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.seller_orders TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_items TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.product_reviews TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.coupons TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notifications TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.custom_jewelry_requests TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_settings TO anon, authenticated, service_role;

-- 5) Public policies for the storefront app
DROP POLICY IF EXISTS "public_users_all_access" ON public.users;
CREATE POLICY "public_users_all_access"
ON public.users
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_addresses_all_access" ON public.addresses;
CREATE POLICY "public_addresses_all_access"
ON public.addresses
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_seller_profiles_all_access" ON public.seller_profiles;
CREATE POLICY "public_seller_profiles_all_access"
ON public.seller_profiles
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_categories_all_access" ON public.categories;
CREATE POLICY "public_categories_all_access"
ON public.categories
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_products_select_access" ON public.products;
CREATE POLICY "public_products_select_access"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "public_products_write_access" ON public.products;
CREATE POLICY "public_products_write_access"
ON public.products
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "public_products_update_access" ON public.products;
CREATE POLICY "public_products_update_access"
ON public.products
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_product_variants_all_access" ON public.product_variants;
CREATE POLICY "public_product_variants_all_access"
ON public.product_variants
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_product_customization_configs_all_access" ON public.product_customization_configs;
CREATE POLICY "public_product_customization_configs_all_access"
ON public.product_customization_configs
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_cart_all_access" ON public.cart_items;
CREATE POLICY "public_cart_all_access"
ON public.cart_items
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_wishlist_all_access" ON public.wishlist_items;
CREATE POLICY "public_wishlist_all_access"
ON public.wishlist_items
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_orders_all_access" ON public.master_orders;
CREATE POLICY "public_orders_all_access"
ON public.master_orders
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_seller_orders_all_access" ON public.seller_orders;
CREATE POLICY "public_seller_orders_all_access"
ON public.seller_orders
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_order_items_all_access" ON public.order_items;
CREATE POLICY "public_order_items_all_access"
ON public.order_items
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_product_reviews_all_access" ON public.product_reviews;
CREATE POLICY "public_product_reviews_all_access"
ON public.product_reviews
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_coupons_all_access" ON public.coupons;
CREATE POLICY "public_coupons_all_access"
ON public.coupons
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_notifications_all_access" ON public.notifications;
CREATE POLICY "public_notifications_all_access"
ON public.notifications
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_custom_jewelry_requests_all_access" ON public.custom_jewelry_requests;
CREATE POLICY "public_custom_jewelry_requests_all_access"
ON public.custom_jewelry_requests
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_platform_settings_all_access" ON public.platform_settings;
CREATE POLICY "public_platform_settings_all_access"
ON public.platform_settings
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
