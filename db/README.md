# Database Management

This directory contains the database schema, migrations, and related documentation for the Market application.

## Structure

- `schema.sql`: Contains the complete database schema including tables, functions, and triggers
- `migrations/`: Directory containing numbered migration files
- `functions/`: (Future) Directory for complex database functions
- `policies/`: (Future) Directory for Row Level Security (RLS) policies

## Tables

1. `profiles`: User profiles linked to auth.users
2. `products`: Product listings
3. `purchases`: Product purchase records
4. `likes`: Product likes/bookmarks
5. `seller_accounts`: Seller-specific information
6. `repository_access`: Repository access management
7. `reports`: Product reporting system

## Key Functions

1. `handle_new_user()`: Automatically creates a profile when a new user signs up
2. `toggle_like()`: Toggles product likes
3. `increment_product_view()`: Increments product view count
4. `increment_product_purchase()`: Increments product purchase count

## Best Practices for Migrations

1. Include all SQL directly in the migration file - do not use `\i` or other psql meta-commands as they don't work in Supabase's SQL editor

2. Always use `IF EXISTS` when dropping objects and `IF NOT EXISTS` when creating them:
   ```sql
   DROP FUNCTION IF EXISTS my_function;
   CREATE TABLE IF NOT EXISTS my_table;
   ```

3. Always drop and recreate functions to ensure the latest version:
   ```sql
   DROP FUNCTION IF EXISTS my_function CASCADE;
   CREATE OR REPLACE FUNCTION my_function() ...
   ```

4. Always drop existing policies before creating new ones:
   ```sql
   DROP POLICY IF EXISTS "My Policy" ON my_table;
   CREATE POLICY "My Policy" ON my_table ...
   ```

5. Use `CREATE OR REPLACE` for functions and views when possible

6. For enums, wrap creation in exception handling:
   ```sql
   DO $$ BEGIN
       CREATE TYPE my_enum AS ENUM ('value1', 'value2');
   EXCEPTION
       WHEN duplicate_object THEN null;
   END $$;
   ```

7. When dropping functions that have dependencies (like triggers), use CASCADE:
   ```sql
   DROP FUNCTION IF EXISTS my_function CASCADE;
   ```

## Applying Migrations

To apply a new migration in Supabase:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of the latest migration file
3. Execute the SQL commands

## Adding New Migrations

1. Create a new file in `migrations/` with the format `XXXXX_description.sql`
2. Add the migration SQL with appropriate up/down commands
3. Test the migration locally if possible
4. Apply to production using the Supabase SQL Editor

## Row Level Security (RLS)

The database uses RLS to secure data access:

- Profiles are publicly readable but only updatable by the owner
- Products are publicly readable but only updatable by the seller
- Purchases are only visible to the buyer and seller
- More policies can be found in the schema and migrations

## Troubleshooting

If the `handle_new_user` trigger isn't creating profiles:

1. Check if the trigger is properly installed:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. Verify the function permissions:
   ```sql
   SELECT proname, prosecdef FROM pg_proc WHERE proname = 'handle_new_user';
   ```

3. Check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

4. Check function definition:
   ```sql
   SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'handle_new_user';
   ```

5. Monitor function execution:
   ```sql
   SELECT * FROM pg_stat_user_functions WHERE funcname = 'handle_new_user';
   ``` 