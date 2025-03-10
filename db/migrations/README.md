# Database Migrations

This directory contains SQL migration scripts for updating the database schema.

## How to Apply Migrations

### Using Supabase CLI

If you have the Supabase CLI installed, you can apply migrations using:

```bash
supabase db push
```

### Manual Application

You can also apply migrations manually through the Supabase SQL Editor:

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the migration file
5. Run the query

## Migration Files

- `add_new_technologies.sql`: Adds new technology options to the product_technology enum

## Important Notes

- Always back up your database before applying migrations
- Test migrations in a development environment before applying to production
- Some enum modifications may require special handling in PostgreSQL 