-- Price Match Requests Table
CREATE TABLE IF NOT EXISTS price_match_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  product_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  competitor_name TEXT NOT NULL,
  competitor_price TEXT NOT NULL,
  competitor_url TEXT NOT NULL,
  additional_info TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_price_match_created_at ON price_match_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_match_status ON price_match_requests(status);
CREATE INDEX IF NOT EXISTS idx_price_match_email ON price_match_requests(email);

-- Enable Row Level Security
ALTER TABLE price_match_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to do everything (for webhooks)
CREATE POLICY "Enable all access for service role" ON price_match_requests
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_price_match_requests_updated_at
  BEFORE UPDATE ON price_match_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
