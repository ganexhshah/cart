-- User Settings Table
-- This table stores user preferences and application settings

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  currency VARCHAR(10) DEFAULT 'INR',
  auto_save BOOLEAN DEFAULT true,
  compact_mode BOOLEAN DEFAULT false,
  show_tips BOOLEAN DEFAULT true,
  analytics_tracking BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  system_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Add comments for documentation
COMMENT ON TABLE user_settings IS 'Stores user preferences and application settings';
COMMENT ON COLUMN user_settings.language IS 'User preferred language (ISO 639-1 code)';
COMMENT ON COLUMN user_settings.timezone IS 'User timezone (IANA timezone identifier)';
COMMENT ON COLUMN user_settings.date_format IS 'Preferred date format for display';
COMMENT ON COLUMN user_settings.currency IS 'Preferred currency code (ISO 4217)';
COMMENT ON COLUMN user_settings.auto_save IS 'Whether to automatically save changes';
COMMENT ON COLUMN user_settings.compact_mode IS 'Whether to use compact UI layout';
COMMENT ON COLUMN user_settings.show_tips IS 'Whether to show helpful tips and hints';
COMMENT ON COLUMN user_settings.analytics_tracking IS 'Whether to allow anonymous analytics tracking';
COMMENT ON COLUMN user_settings.marketing_emails IS 'Whether to receive marketing emails';
COMMENT ON COLUMN user_settings.system_notifications IS 'Whether to receive system notifications';