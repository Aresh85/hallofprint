-- Create sundries_templates table for preloaded/reusable sundries
CREATE TABLE IF NOT EXISTS sundries_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  default_quantity INTEGER DEFAULT 1,
  default_unit_price DECIMAL(10, 2) NOT NULL,
  category TEXT, -- e.g., 'setup', 'rush', 'design', 'finishing'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_sundries_templates_active ON sundries_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_sundries_templates_category ON sundries_templates(category);

-- Add comments
COMMENT ON TABLE sundries_templates IS 'Template library for common sundry items that can be quickly added to orders';
COMMENT ON COLUMN sundries_templates.name IS 'Short name of the sundry (e.g., Rush Fee, Setup Fee)';
COMMENT ON COLUMN sundries_templates.description IS 'Detailed description shown to customers';
COMMENT ON COLUMN sundries_templates.default_unit_price IS 'Default price in GBP';
COMMENT ON COLUMN sundries_templates.category IS 'Category for organization (setup, rush, design, finishing)';
COMMENT ON COLUMN sundries_templates.is_active IS 'Whether this template is active and available for use';

-- Enable RLS
ALTER TABLE sundries_templates ENABLE ROW LEVEL SECURITY;

-- Policies: Only admins and operators can manage templates
CREATE POLICY "Admins and operators can view sundries templates"
  ON sundries_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'operator')
    )
  );

CREATE POLICY "Admins and operators can insert sundries templates"
  ON sundries_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'operator')
    )
  );

CREATE POLICY "Admins and operators can update sundries templates"
  ON sundries_templates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'operator')
    )
  );

CREATE POLICY "Admins and operators can delete sundries templates"
  ON sundries_templates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'operator')
    )
  );

-- Insert some default templates
INSERT INTO sundries_templates (name, description, default_quantity, default_unit_price, category, is_active) VALUES
('Rush Fee', 'Priority processing for faster turnaround', 1, 50.00, 'rush', true),
('Setup Fee', 'Initial setup and preparation', 1, 25.00, 'setup', true),
('Design Work', 'Custom design services', 1, 75.00, 'design', true),
('Artwork Correction', 'Correction and adjustment of artwork files', 1, 35.00, 'design', true),
('Finishing - Lamination', 'Lamination finishing service', 1, 15.00, 'finishing', true),
('Finishing - Binding', 'Document binding service', 1, 10.00, 'finishing', true),
('Delivery Surcharge', 'Additional delivery cost', 1, 20.00, 'delivery', true),
('Additional Proofs', 'Extra proof copies beyond standard', 1, 15.00, 'setup', true)
ON CONFLICT DO NOTHING;

-- Verify
SELECT * FROM sundries_templates ORDER BY category, name;
