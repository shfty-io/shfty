# Supabase Security Fixes

This document explains the security fixes applied to address warnings in the Supabase database.

## Function Search Path Mutable Warnings

The main security issue was related to "Function Search Path Mutable" warnings. These occur when PostgreSQL functions don't have a fixed search path, which can potentially lead to SQL injection vulnerabilities.

### What was fixed:

All functions were updated to include `SET search_path = ''` in their definition, which:

1. Prevents SQL injection attacks via search path manipulation
2. Requires explicit schema qualification for all table references (e.g., `public.users` instead of just `users`)
3. Follows Supabase's security best practices

### Implementation Details:

For each function, we:
1. First drop the existing function using `DROP FUNCTION IF EXISTS function_name(param_types) CASCADE`
2. Then recreate the function with the same logic but with `SET search_path = ''` added
3. Update table references to include the schema name (e.g., `public.table_name`)

The `CASCADE` option is important because some functions have triggers or other objects dependent on them. Using `CASCADE` ensures that:
- Dependent objects like triggers are also dropped
- The function can be recreated without errors
- The triggers will be recreated after the function is updated

This approach ensures that:
- We don't get errors if the function signature has changed
- We don't get errors about dependent objects
- The function is properly recreated with the secure search path
- All table references work correctly with the empty search path

### Functions that were fixed:

- `update_feedback_timestamp()` (has trigger dependency)
- `handle_new_user()` (has trigger dependency)
- `toggle_like()`
- `increment_product_view()`
- `increment_product_purchase()`
- `increment_view_count()`
- `cleanup_codebases_bucket()`
- `manage_codebases_bucket()`
- `calculate_trending_score()`
- `set_updated_at()`
- `update_updated_at_column()`
- `delete_user()`
- `ensure_user_profile()`

## Row Level Security Policy Fixes

The schema also includes Row Level Security (RLS) policies to control access to tables. We've improved the policy creation code to be more robust.

### What was fixed:

The policy creation code was updated to:

1. Check if a policy already exists before attempting to create it
2. Handle both cases where the 'status' column exists or doesn't exist
3. Prevent "policy already exists" errors when running the schema multiple times

This makes the schema idempotent - it can be run multiple times without errors, which is important for database migrations and updates.

## Authentication Security Warnings

Two authentication-related security warnings were also addressed:

### 1. Auth OTP Long Expiry

**Issue**: The OTP (One-Time Password) expiry time was set to more than the recommended 1 hour.

**Fix**: Updated the OTP expiry time to 1 hour (3600 seconds) in the auth configuration.

### 2. Leaked Password Protection Disabled

**Issue**: The HaveIBeenPwned.org password check was disabled, which could allow users to use compromised passwords.

**Fix**: Enabled the leaked password protection feature in the auth configuration.

### Implementation Details:

The auth security fixes script:
1. First checks the current settings to avoid unnecessary updates
2. Only updates the OTP expiry if it's currently greater than 3600 seconds
3. Only enables the HIBP check if it's currently disabled
4. Provides feedback about what changes were made or if no changes were needed

## How to Apply These Fixes

1. The function fixes and RLS policy improvements are included in the main `schema.sql` file and will be applied when the schema is deployed.

2. For the authentication security fixes, run the `auth_security_fixes.sql` script in the Supabase SQL Editor:

```sql
-- Run this in the Supabase SQL Editor
\i db/auth_security_fixes.sql
```

## Verification

After applying these fixes, the security warnings in the Supabase dashboard should be resolved. You can verify this by:

1. Checking the Supabase dashboard for any remaining warnings
2. Running the verification query at the end of the `auth_security_fixes.sql` file to confirm the auth settings
3. Testing the functions to ensure they still work as expected with the new search path settings

## Additional Security Recommendations

1. Regularly review and update your Row Level Security (RLS) policies
2. Consider implementing Multi-Factor Authentication (MFA) for sensitive operations
3. Regularly audit database access and permissions
4. Keep your Supabase instance updated to the latest version 