-- Migration: Add description column to subthemes table
ALTER TABLE subthemes ADD COLUMN IF NOT EXISTS description TEXT;
