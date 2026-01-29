-- Add Google OAuth support to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Update existing users to allow null passwords (for Google OAuth users)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;