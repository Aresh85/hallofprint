-- Create order_files table to store file metadata
CREATE TABLE IF NOT EXISTS order_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by UUID REFERENCES user_profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_order_files_order_id ON order_files(order_id);
CREATE INDEX IF NOT EXISTS idx_order_files_uploaded_by ON order_files(uploaded_by);

-- Enable RLS
ALTER TABLE order_files ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow authenticated users to view order files
CREATE POLICY "Users can view order files for their orders"
  ON order_files FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Allow operators and admins to view all order files
CREATE POLICY "Operators can view all order files"
  ON order_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('operator', 'admin')
    )
  );

-- Allow authenticated users to upload files for their orders
CREATE POLICY "Users can upload files for their orders"
  ON order_files FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Allow operators and admins to upload files for any order
CREATE POLICY "Operators can upload files for any order"
  ON order_files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('operator', 'admin')
    )
  );

-- Allow operators and admins to delete order files
CREATE POLICY "Operators can delete order files"
  ON order_files FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('operator', 'admin')
    )
  );

COMMENT ON TABLE order_files IS 'Stores metadata about files uploaded for orders';
COMMENT ON COLUMN order_files.file_size IS 'File size in bytes';
COMMENT ON COLUMN order_files.uploaded_by IS 'User who uploaded the file';
