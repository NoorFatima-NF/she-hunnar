-- ==============================================================================
-- SAFE PUBLIC ACCESS FOR THIS APP (Run in Supabase SQL Editor)
-- Keeps RLS enabled while allowing the app's anon key to work for storefront data.
-- This is safer than disabling RLS on every table.
-- ==============================================================================

-- 1. Enable RLS on the tables the storefront uses.
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

-- 2. Allow the app to insert/store cart data even when the IDs are app-managed strings.
ALTER TABLE IF EXISTS cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;
ALTER TABLE IF EXISTS cart_items DROP CONSTRAINT IF EXISTS cart_items_variant_id_fkey;
ALTER TABLE IF EXISTS cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;
ALTER TABLE IF EXISTS cart_items ALTER COLUMN product_id TYPE TEXT USING product_id::TEXT;
ALTER TABLE IF EXISTS cart_items ALTER COLUMN variant_id TYPE TEXT USING variant_id::TEXT;
ALTER TABLE IF EXISTS cart_items ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE IF EXISTS cart_items ALTER COLUMN session_token TYPE TEXT USING session_token::TEXT;

ALTER TABLE IF EXISTS wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_product_id_fkey;
ALTER TABLE IF EXISTS wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_user_id_fkey;
ALTER TABLE IF EXISTS wishlist_items ALTER COLUMN product_id TYPE TEXT USING product_id::TEXT;
ALTER TABLE IF EXISTS wishlist_items ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 3. Grant only the access the app needs.
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

-- 4. Public policies for storefront access.
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

DROP POLICY IF EXISTS "public_orders_all_access" ON public.master_orders;
CREATE POLICY "public_orders_all_access"
ON public.master_orders
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
