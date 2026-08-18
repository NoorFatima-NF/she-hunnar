-- ==============================================================================
-- SHE HUNNAR - MIGRATION: Add Missing Seller Profile Columns
-- Run this in Supabase SQL Editor to add new columns to seller_profiles table
-- ==============================================================================

-- Add seller contact email column
ALTER TABLE seller_profiles
  ADD COLUMN IF NOT EXISTS seller_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS seller_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS cheque_proof_url TEXT;

-- Confirm
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'seller_profiles'
ORDER BY ordinal_position;
