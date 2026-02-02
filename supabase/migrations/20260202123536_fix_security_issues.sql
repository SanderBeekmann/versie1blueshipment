/*
  # Fix Security Issues

  1. Indexes
    - Remove unused indexes on leads table (idx_leads_email, idx_leads_created_at, idx_leads_status)
    - These indexes are not being used as the table is currently not queried
    - Can be re-added later if query patterns emerge

  2. Function Security
    - Fix mutable search_path on update_updated_at_column function
    - Add SECURITY DEFINER and explicit SET search_path
    - This prevents potential security vulnerabilities from search_path manipulation

  3. Auth DB Connection Strategy
    - Note: The Auth DB connection strategy should be changed from fixed number to percentage-based
    - This cannot be fixed via SQL migration
    - Action required: In Supabase Dashboard → Settings → Database → Connection Pooling
    - Change Auth connection pooling from "10 connections" to percentage-based allocation
*/

-- Remove unused indexes
DROP INDEX IF EXISTS idx_leads_email;
DROP INDEX IF EXISTS idx_leads_created_at;
DROP INDEX IF EXISTS idx_leads_status;

-- Recreate function with proper security settings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;