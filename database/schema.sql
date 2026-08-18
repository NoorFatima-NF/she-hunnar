-- ==============================================================================
-- SHE HUNNAR - HANDMADE JEWELRY & CRAFT MULTI-VENDOR MARKETPLACE
-- COMPLETE DATABASE SCHEMA (PostgreSQL / Supabase / Neon Compatible)
-- SAFE TO RUN MULTIPLE TIMES (IDEMPOTENT)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ENUM TYPES (Safe Creation)
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'seller', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE seller_type AS ENUM ('individual', 'business');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('draft', 'pending', 'published', 'rejected', 'out_of_stock');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
      'Pending',
      'Confirmed',
      'Processing',
      'Ready to Ship',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Return Requested',
      'Returned',
      'Refunded'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('COD', 'Bank Transfer', 'Easypaisa', 'JazzCash', 'Online Card');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('Pending', 'Paid', 'Failed', 'Refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payout_status AS ENUM ('Pending', 'Approved', 'Paid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE custom_request_status AS ENUM ('Submitted', 'In Review', 'Quoted', 'In Production', 'Completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==============================================================================
-- 2. USERS & PROFILES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(50),
    role user_role DEFAULT 'customer',
    avatar_url TEXT,
    google_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- User Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- ==============================================================================
-- 3. SELLER PROFILES & SHOPS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS seller_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    about TEXT,
    location VARCHAR(255),
    logo_url TEXT,
    banner_url TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    review_count INTEGER DEFAULT 0,
    product_count INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    verification_status verification_status DEFAULT 'pending',
    verification_docs_uploaded BOOLEAN DEFAULT FALSE,
    seller_type seller_type DEFAULT 'individual',
    cnic_number VARCHAR(50),
    cnic_name VARCHAR(255),
    cnic_front_url TEXT,
    cnic_back_url TEXT,
    bank_title VARCHAR(255),
    pickup_address TEXT,
    commission_rate NUMERIC(5, 2) DEFAULT 10.00, -- 10%
    shipping_fee NUMERIC(10, 2) DEFAULT 200.00,  -- Default PKR 200
    free_shipping_threshold NUMERIC(10, 2),       -- e.g. Free shipping over PKR 3000
    payout_method VARCHAR(100) DEFAULT 'Bank Transfer',
    account_details TEXT,
    instagram_url VARCHAR(255),
    facebook_url VARCHAR(255),
    whatsapp_number VARCHAR(50),
    seller_email VARCHAR(255),          -- Contact email from registration
    seller_phone VARCHAR(50),           -- Contact phone from registration
    cheque_proof_url TEXT,              -- Bank account proof (cancelled cheque / statement)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seller_slug ON seller_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_seller_status ON seller_profiles(verification_status);

-- ==============================================================================
-- 4. CATEGORIES & PRODUCTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100) NOT NULL, -- E.g. Jewelry, Bags, Calligraphy
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    material VARCHAR(255) NOT NULL,      -- E.g. 925 Sterling Silver, Polymer Clay
    metal_type VARCHAR(100),
    stone_type VARCHAR(100),
    color VARCHAR(100),
    occasion VARCHAR(100),
    short_description TEXT,
    full_description TEXT,
    price NUMERIC(10, 2) NOT NULL,       -- PKR
    original_price NUMERIC(10, 2),       -- PKR (for discounts)
    stock INTEGER NOT NULL DEFAULT 1,
    sku VARCHAR(100) UNIQUE NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}', -- Array of image URLs
    video_url TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    review_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    is_new BOOLEAN DEFAULT TRUE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_customizable BOOLEAN DEFAULT FALSE,
    production_time_days INTEGER DEFAULT 3,
    care_instructions TEXT,
    handmade_process TEXT,
    status product_status DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_name);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Product Variants (Sizes, Chains, Colors)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,          -- E.g. "Silver / Size 7"
    price NUMERIC(10, 2) NOT NULL,       -- PKR
    stock INTEGER NOT NULL DEFAULT 0,
    sku VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

-- Product Customization Configuration
CREATE TABLE IF NOT EXISTS product_customization_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    allow_text BOOLEAN DEFAULT FALSE,
    text_label VARCHAR(100),
    max_characters INTEGER DEFAULT 20,
    allow_font_selection BOOLEAN DEFAULT FALSE,
    fonts TEXT[] DEFAULT '{}',
    allow_stone_selection BOOLEAN DEFAULT FALSE,
    stones TEXT[] DEFAULT '{}',
    allow_reference_upload BOOLEAN DEFAULT FALSE,
    allow_note BOOLEAN DEFAULT FALSE,
    note_label VARCHAR(100)
);

-- ==============================================================================
-- 5. CART & WISHLIST
-- ==============================================================================

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255),          -- For guest visitors
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    customization_data JSONB,            -- Stores custom note, font, stone, text
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart_items(session_token);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- ==============================================================================
-- 6. ORDERS & SPLIT SUB-ORDERS (MULTI-VENDOR ESCROW)
-- ==============================================================================

-- Master Order (Customer facing master invoice)
CREATE TABLE IF NOT EXISTS master_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. ORD-10023
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    
    -- Delivery Address Snapshot
    shipping_address_line TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_province VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,

    -- Payment Details & Safepay Integration
    payment_method payment_method NOT NULL DEFAULT 'COD',
    payment_status payment_status NOT NULL DEFAULT 'Pending',
    payment_proof_url TEXT,
    safepay_tracker VARCHAR(255),        -- Safepay Session Tracker ID (e.g. track_xxx)
    safepay_signature TEXT,              -- Safepay HMAC-SHA256 signature
    transaction_ref VARCHAR(255),        -- Transaction reference
    payment_verified_at TIMESTAMP WITH TIME ZONE,

    -- Financial Breakdown
    total_items INTEGER NOT NULL DEFAULT 1,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    total_shipping NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(10, 2) NOT NULL,
    coupon_code VARCHAR(50),

    master_status order_status DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_master_orders_number ON master_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_master_orders_customer ON master_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_master_orders_payment_status ON master_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_master_orders_safepay ON master_orders(safepay_tracker);

-- Seller Sub-Orders (Split by maker studio)
CREATE TABLE IF NOT EXISTS seller_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. SO-10023-A
    master_order_id UUID NOT NULL REFERENCES master_orders(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE RESTRICT,
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    status order_status DEFAULT 'Pending',
    
    -- Fulfillment & Tracking
    courier_name VARCHAR(100),           -- TCS, Leopards, PostEx, Trax, M&P
    tracking_number VARCHAR(100),
    tracking_url TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seller_orders_master ON seller_orders(master_order_id);
CREATE INDEX IF NOT EXISTS idx_seller_orders_seller ON seller_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_orders_status ON seller_orders(status);

-- Order Items (Line Items)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_order_id UUID NOT NULL REFERENCES seller_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_title VARCHAR(255) NOT NULL,
    product_image TEXT NOT NULL,
    variant_name VARCHAR(255),
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    customization_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_suborder ON order_items(seller_order_id);

-- ==============================================================================
-- 7. REVIEWS, COUPONS & DISCOUNTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT TRUE,
    images TEXT[] DEFAULT '{}',
    seller_reply TEXT,
    seller_reply_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type discount_type NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC(10, 2) NOT NULL, -- e.g. 15 for 15% or 500 for PKR 500
    min_spend NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_discount NUMERIC(10, 2),
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_seller_id UUID REFERENCES seller_profiles(id) ON DELETE CASCADE,
    usage_limit INTEGER,
    times_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- ==============================================================================
-- 8. MESSAGING & NOTIFICATIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, seller_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_role user_role NOT NULL,
    text TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_role user_role NOT NULL,
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_seller_id UUID REFERENCES seller_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_seller ON notifications(target_seller_id);

-- ==============================================================================
-- 9. SELLER PAYOUTS, RETURNS & CUSTOM REQUESTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS seller_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    period VARCHAR(100) NOT NULL,
    status payout_status DEFAULT 'Pending',
    payout_method VARCHAR(100) NOT NULL,
    account_details TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS return_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    master_order_id UUID NOT NULL REFERENCES master_orders(id) ON DELETE CASCADE,
    seller_order_id UUID NOT NULL REFERENCES seller_orders(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    reason VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Requested',
    images TEXT[] DEFAULT '{}',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS custom_jewelry_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    jewelry_type VARCHAR(100) NOT NULL,
    budget_pkr NUMERIC(10, 2) NOT NULL,
    preferred_material VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reference_images TEXT[] DEFAULT '{}',
    preferred_seller_id UUID REFERENCES seller_profiles(id) ON DELETE SET NULL,
    status custom_request_status DEFAULT 'Submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 10. PLATFORM SETTINGS & CONFIGURATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commission_rate NUMERIC(5, 2) DEFAULT 10.00, -- Global default commission %
    announcement_text TEXT DEFAULT 'Free nationwide shipping on orders over PKR 3,500! • Supporting female craft makers across Pakistan',
    currency VARCHAR(10) DEFAULT 'PKR',
    min_payout_amount NUMERIC(10, 2) DEFAULT 1000.00,
    support_email VARCHAR(255) DEFAULT 'support@shehunnar.pk',
    support_phone VARCHAR(50) DEFAULT '+92 300 1234567',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 11. AUTOMATIC UPDATED_AT TRIGGER
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_users_modtime ON users;
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_seller_profiles_modtime ON seller_profiles;
CREATE TRIGGER update_seller_profiles_modtime BEFORE UPDATE ON seller_profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_products_modtime ON products;
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_master_orders_modtime ON master_orders;
CREATE TRIGGER update_master_orders_modtime BEFORE UPDATE ON master_orders FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_seller_orders_modtime ON seller_orders;
CREATE TRIGGER update_seller_orders_modtime BEFORE UPDATE ON seller_orders FOR EACH ROW EXECUTE FUNCTION update_modified_column();
