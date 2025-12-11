-- Add mobile phone column to user_profiles table

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS mobile TEXT;

-- Add comment
COMMENT ON COLUMN user_profiles.mobile IS 'User mobile/phone number';
