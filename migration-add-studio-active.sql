-- Migration: Add is_active column to studios table
-- Run this in your Supabase SQL Editor if you already have the studios table created

-- Add is_active column to existing studios table
ALTER TABLE studios ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Set all existing studios to active
UPDATE studios SET is_active = TRUE WHERE is_active IS NULL;
