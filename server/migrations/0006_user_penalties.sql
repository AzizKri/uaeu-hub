-- Add suspension and ban columns to user table
ALTER TABLE user ADD COLUMN suspended_until INTEGER DEFAULT NULL;
ALTER TABLE user ADD COLUMN is_banned BOOLEAN DEFAULT FALSE;

-- Create index for efficient penalty checks
CREATE INDEX IF NOT EXISTS idx_user_penalties ON user (is_banned, suspended_until);
