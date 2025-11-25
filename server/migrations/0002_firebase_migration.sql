-- Migration to support Firebase Authentication
-- Adds firebase_uid column to user table

PRAGMA foreign_keys = off;

-- Add firebase_uid column to user table
ALTER TABLE user ADD COLUMN firebase_uid TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_firebase_uid ON user(firebase_uid);

-- Update auth_provider enum to include firebase
-- Note: SQLite doesn't have enum, but we'll ensure consistency in application code

PRAGMA foreign_keys = on;

