-- Create quote_requests table for general work quote requests
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Customer Information
  customer_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  
  -- Project Details
  project_title VARCHAR(500) NOT NULL,
  project_description TEXT NOT NULL,
  quantity VARCHAR(100),
  deadline DATE,
  budget_range VARCHAR(100),
  
  -- Additional Details
  specifications TEXT,
  file_urls TEXT[], -- Array of file URLs if they upload files
  
  -- Price Match & Company Account
  price_match_requested BOOLEAN DEFAULT FALSE,
  competitor_url VARCHAR(500),
  company_account_requested BOOLEAN DEFAULT FALSE,
  
  -- Status Management
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'quoted', 'accepted', 'rejected', 'converted_to_order')),
  admin_notes TEXT,
  quoted_price DECIMAL(10, 2),
  quote_valid_until DATE,
  
  -- Order Conversion
  order_id UUID REFERENCES orders(id),
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX idx_quote_requests_status ON quote_requests(status);
CREATE INDEX idx_quote_requests_created_at ON quote_requests(created_at DESC);
CREATE INDEX idx_quote_requests_email ON quote_requests(email);

-- Enable RLS (Row Level Security)
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert quote requests (public form submission)
CREATE POLICY "Anyone can submit quote requests"
  ON quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can view their own requests
CREATE POLICY "Users can view their own quote requests"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Policy: Service role can do everything (for admin dashboard)
CREATE POLICY "Service role has full access"
  ON quote_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quote_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_quote_requests_timestamp
  BEFORE UPDATE ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_requests_updated_at();
