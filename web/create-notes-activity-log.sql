-- Create order_notes table for append-only notes with full history
CREATE TABLE IF NOT EXISTS order_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    note_type TEXT NOT NULL CHECK (note_type IN ('internal', 'about_customer')),
    note_content TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON order_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notes_created_at ON order_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_notes_note_type ON order_notes(note_type);

-- Enable RLS
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Admins and operators can view all notes
CREATE POLICY "Admins and operators can view all order notes"
    ON order_notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'operator')
        )
    );

-- Policy: Admins and operators can insert notes
CREATE POLICY "Admins and operators can insert order notes"
    ON order_notes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'operator')
        )
    );

-- Grant access
GRANT ALL ON order_notes TO authenticated;

-- Add artwork file URL field to orders if not exists
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS artwork_file_url TEXT;

COMMENT ON TABLE order_notes IS 'Append-only log of all notes added to orders. Notes cannot be edited, only new ones can be added.';
COMMENT ON COLUMN order_notes.note_type IS 'internal: private operator notes, about_customer: notes about the customer';
