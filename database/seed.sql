-- ==============================================================================
-- SHE HUNNAR MARKETPLACE - INITIAL SEED DATA (PostgreSQL)
-- ==============================================================================

-- 1. Default Categories
INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
('Jewelry', 'jewelry', 'Handcrafted silver necklaces, gemstone rings, crystal bracelets & artisan earrings.', 1, true),
('Bags', 'bags', 'Handwoven tote bags, embroidered clutches, macrame shoulder bags & artisanal purses.', 2, true),
('Home Decor', 'home-decor', 'Hand-painted ceramics, woven wall hangings, brass candle holders & resin wood coasters.', 3, true),
('Calligraphy', 'calligraphy', 'Hand-scripted Islamic calligraphy frames, Urdu script canvas art & gold leaf parchment.', 4, true),
('Candles', 'candles', 'Hand-poured soy wax candles, scented aromatherapy jars & sculpted bubble candles.', 5, true),
('Keychains', 'keychains', 'Handmade resin floral keychains, engraved wooden tags, macrame charms & beaded wristlets.', 6, true),
('Bouquets', 'bouquets', 'Everlasting handmade crochet floral bouquets, dried pampas arrangements & ribbon flower bunches.', 7, true)
ON CONFLICT (name) DO NOTHING;

-- 2. Platform Settings
INSERT INTO platform_settings (commission_rate, announcement_text, currency, min_payout_amount)
VALUES (10.00, 'Free nationwide shipping on handcrafted orders over PKR 3,500! • Supporting female artisans across Pakistan', 'PKR', 1000.00);

-- 3. Default Admin User (Password: Admin@123)
INSERT INTO users (id, name, email, password_hash, phone, role) VALUES
('a0000000-0000-0000-0000-000000000001', 'She Hunnar Admin', 'admin@shehunnar.pk', '$2a$12$e8Y...sample_hash', '+92 300 0000000', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 4. Initial Sample Coupons
INSERT INTO coupons (code, discount_type, discount_value, min_spend, max_discount, expiry_date, is_active) VALUES
('WELCOME10', 'percentage', 10.00, 2000.00, 1000.00, '2027-12-31 23:59:59+00', true),
('CRAFT500', 'fixed', 500.00, 3500.00, 500.00, '2027-12-31 23:59:59+00', true)
ON CONFLICT (code) DO NOTHING;
