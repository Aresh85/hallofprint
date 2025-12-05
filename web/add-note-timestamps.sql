-- Add metadata tracking for notes

-- Add columns to track when notes were last updated and by whom
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS operator_notes_updated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS operator_notes_updated_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS operator_customer_notes_updated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS operator_customer_notes_updated_by UUID REFERENCES user_profiles(id);

-- Create function to log activity when orders are updated
CREATE OR REPLACE FUNCTION log_order_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_user_name TEXT;
  v_description TEXT;
BEGIN
  -- Get the user's name
  SELECT full_name INTO v_user_name
  FROM user_profiles
  WHERE id = auth.uid();

  -- Log different types of changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_activity_log (order_id, activity_type, description, created_by)
    VALUES (NEW.id, 'status_change', 
            'Status changed from ' || OLD.status || ' to ' || NEW.status || ' by ' || COALESCE(v_user_name, 'Unknown'),
            auth.uid());
  END IF;

  IF OLD.production_status IS DISTINCT FROM NEW.production_status THEN
    INSERT INTO order_activity_log (order_id, activity_type, description, created_by)
    VALUES (NEW.id, 'production_status_change',
            'Production status changed from ' || COALESCE(OLD.production_status, 'none') || ' to ' || COALESCE(NEW.production_status, 'none') || ' by ' || COALESCE(v_user_name, 'Unknown'),
            auth.uid());
  END IF;

  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO order_activity_log (order_id, activity_type, description, created_by)
    VALUES (NEW.id, 'priority_change',
            'Priority changed from ' || COALESCE(OLD.priority, 'normal') || ' to ' || COALESCE(NEW.priority, 'normal') || ' by ' || COALESCE(v_user_name, 'Unknown'),
            auth.uid());
  END IF;

  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO order_activity_log (order_id, activity_type, description, created_by)
    VALUES (NEW.id, 'assignment_change',
            'Order assigned to ' || COALESCE(NEW.assigned_to, 'nobody') || ' by ' || COALESCE(v_user_name, 'Unknown'),
            auth.uid());
  END IF;

  IF OLD.operator_notes IS DISTINCT FROM NEW.operator_notes THEN
    INSERT INTO order_activity_log (order_id, activity_type, description, created_by)
    VALUES (NEW.id, 'note_added',
            'Internal note added/updated by ' || COALESCE(v_user_name, 'Unknown'),
            auth.uid());
  END IF;

  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
    INSERT INTO order_activity_log (order_id, activity_type, description, created_by)
    VALUES (NEW.id, 'payment_status_change',
            'Payment status changed from ' || OLD.payment_status || ' to ' || NEW.payment_status,
            auth.uid());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for activity logging
DROP TRIGGER IF EXISTS trigger_log_order_activity ON orders;
CREATE TRIGGER trigger_log_order_activity
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION log_order_activity();

-- Create function to log sundry additions
CREATE OR REPLACE FUNCTION log_sundry_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_user_name TEXT;
BEGIN
  SELECT full_name INTO v_user_name
  FROM user_profiles
  WHERE id = NEW.added_by;

  INSERT INTO order_activity_log (order_id, activity_type, description, created_by)
  VALUES (NEW.order_id, 'sundry_added',
          'Added sundry: ' || NEW.description || ' (£' || NEW.total_price || ') by ' || COALESCE(v_user_name, 'Unknown'),
          NEW.added_by);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for sundry logging
DROP TRIGGER IF EXISTS trigger_log_sundry_activity ON order_sundries;
CREATE TRIGGER trigger_log_sundry_activity
AFTER INSERT ON order_sundries
FOR EACH ROW
EXECUTE FUNCTION log_sundry_activity();

-- Verify columns added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('operator_notes_updated_at', 'operator_notes_updated_by', 'operator_customer_notes_updated_at', 'operator_customer_notes_updated_by');
