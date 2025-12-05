-- ENHANCE ORDERS TABLE FOR PRINT SHOP MANAGEMENT

-- Add new columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS operator_notes TEXT,
ADD COLUMN IF NOT EXISTS customer_notes TEXT,
ADD COLUMN IF NOT EXISTS operator_customer_notes TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_status TEXT,
ADD COLUMN IF NOT EXISTS production_status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS assigned_to TEXT,
ADD COLUMN IF NOT EXISTS proof_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS proof_url TEXT,
ADD COLUMN IF NOT EXISTS artwork_received BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS artwork_url TEXT;

-- Create sundries table for additional charges
CREATE TABLE IF NOT EXISTS order_sundries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  added_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create order notes/activity log table
CREATE TABLE IF NOT EXISTS order_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'status_change', 'note_added', 'sundry_added', etc.
  description TEXT NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE order_sundries ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_activity_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage sundries" ON order_sundries;
DROP POLICY IF EXISTS "Admins can view activity log" ON order_activity_log;
DROP POLICY IF EXISTS "Admins can add to activity log" ON order_activity_log;

-- RLS Policies for order_sundries
CREATE POLICY "Admins can manage sundries"
ON order_sundries FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'operator')
  )
);

-- RLS Policies for order_activity_log
CREATE POLICY "Admins can view activity log"
ON order_activity_log FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'operator')
  )
);

CREATE POLICY "Admins can add to activity log"
ON order_activity_log FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'operator')
  )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_sundries_order_id ON order_sundries(order_id);
CREATE INDEX IF NOT EXISTS idx_order_activity_log_order_id ON order_activity_log(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_production_status ON orders(production_status);
CREATE INDEX IF NOT EXISTS idx_orders_priority ON orders(priority);
CREATE INDEX IF NOT EXISTS idx_orders_due_date ON orders(due_date);

-- Create function to update order total when sundries added
CREATE OR REPLACE FUNCTION update_order_total_with_sundries()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET 
    subtotal = subtotal + NEW.total_price,
    total = (subtotal + NEW.total_price) + tax
  WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for sundries
DROP TRIGGER IF EXISTS trigger_update_order_total ON order_sundries;
CREATE TRIGGER trigger_update_order_total
AFTER INSERT ON order_sundries
FOR EACH ROW
EXECUTE FUNCTION update_order_total_with_sundries();

-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('order_sundries', 'order_activity_log');

-- Verify columns added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('operator_notes', 'customer_notes', 'stripe_payment_intent_id', 'production_status', 'priority', 'due_date');
