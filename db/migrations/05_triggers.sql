-- Migration: 05_triggers.sql
-- Description: Set up database triggers

-- Trigger for handling new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger to update timestamp on feedback update
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS update_feedback_timestamp_trigger ON feedback;
    CREATE TRIGGER update_feedback_timestamp_trigger
      BEFORE UPDATE ON feedback
      FOR EACH ROW
      EXECUTE FUNCTION update_feedback_timestamp();
  END IF;
END
$$; 