-- Create artwork_submissions table for standalone artwork uploads
CREATE TABLE IF NOT EXISTS artwork_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    notes TEXT,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    file_url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'converted_to_order', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    converted_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add artwork tracking fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS artwork_received BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS artwork_url TEXT,
ADD COLUMN IF NOT EXISTS artwork_submitted_at TIMESTAMPTZ;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_artwork_submissions_status ON artwork_submissions(status);
CREATE INDEX IF NOT EXISTS idx_artwork_submissions_user_id ON artwork_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_artwork_submissions_created_at ON artwork_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_artwork_received ON orders(artwork_received);

-- Enable RLS (Row Level Security)
ALTER TABLE artwork_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own submissions
CREATE POLICY "Users can view own artwork submissions"
    ON artwork_submissions FOR SELECT
    USING (
        auth.uid() = user_id
    );

-- Policy: Users can insert their own submissions
CREATE POLICY "Users can insert own artwork submissions"
    ON artwork_submissions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

-- Policy: Admins and operators can view all submissions
CREATE POLICY "Admins and operators can view all artwork submissions"
    ON artwork_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'operator')
        )
    );

-- Policy: Admins and operators can update submissions
CREATE POLICY "Admins and operators can update artwork submissions"
    ON artwork_submissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'operator')
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_artwork_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_artwork_submissions_updated_at
    BEFORE UPDATE ON artwork_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_artwork_submissions_updated_at();

-- Grant access
GRANT SELECT, INSERT ON artwork_submissions TO anon;
GRANT ALL ON artwork_submissions TO authenticated;

COMMENT ON TABLE artwork_submissions IS 'Stores standalone artwork submissions that can be converted into orders';
COMMENT ON COLUMN artwork_submissions.status IS 'pending: awaiting review, reviewing: being reviewed, approved: ready to convert, converted_to_order: already converted, rejected: not accepted';
