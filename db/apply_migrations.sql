-- Apply migrations in the correct order
-- First add admin column to profiles (this doesn't depend on feedback table)
\echo 'Running migration: add_admin_column.sql'
\i migrations/add_admin_column.sql

-- Then create the feedback table and its policies
\echo 'Running migration: create_feedback_table.sql'
\i migrations/create_feedback_table.sql

-- Display completion message
\echo 'All migrations applied successfully!' 