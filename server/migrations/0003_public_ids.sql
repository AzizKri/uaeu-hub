-- Migration to add public_id columns for URL-safe identifiers
-- These replace sequential integer IDs in public-facing URLs

-- Add public_id columns
ALTER TABLE user ADD COLUMN public_id TEXT;
ALTER TABLE post ADD COLUMN public_id TEXT;
ALTER TABLE comment ADD COLUMN public_id TEXT;
ALTER TABLE subcomment ADD COLUMN public_id TEXT;
ALTER TABLE community ADD COLUMN public_id TEXT;

-- Create unique indexes for public_id lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_public_id ON user(public_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_public_id ON post(public_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_comment_public_id ON comment(public_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subcomment_public_id ON subcomment(public_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_community_public_id ON community(public_id);
