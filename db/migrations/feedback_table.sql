-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'addressed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON feedback(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS feedback_status_idx ON feedback(status);

-- Enable RLS (Row Level Security)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback table
-- Allow users to insert their own feedback
CREATE POLICY insert_own_feedback ON feedback
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own feedback
CREATE POLICY read_own_feedback ON feedback
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to read all feedback
CREATE POLICY admin_read_all_feedback ON feedback
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Allow admins to update all feedback (for status changes)
CREATE POLICY admin_update_all_feedback ON feedback
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Allow service role to manage all feedback
CREATE POLICY service_role_manage_all_feedback ON feedback
  USING (true)
  WITH CHECK (true);

-- Function to update timestamp on feedback update
CREATE OR REPLACE FUNCTION update_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on feedback update
CREATE TRIGGER update_feedback_timestamp_trigger
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_timestamp(); 