/*
  # Fix infinite recursion in admin_users RLS policies

  ## Problem
  The policy "Admins kunnen alle gebruikers lezen" uses a subquery that
  references the admin_users table itself, causing infinite recursion when
  PostgreSQL tries to evaluate the policy.

  ## Fix
  Replace the recursive policy with a security definer function that bypasses
  RLS when checking admin status, breaking the recursion cycle.

  ## Changes
  - Drop the recursive SELECT policy for admins
  - Create a security definer function `is_admin()` that checks admin status without RLS
  - Recreate the policy using the safe function
*/

DROP POLICY IF EXISTS "Admins kunnen alle gebruikers lezen" ON admin_users;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND rol = 'admin'
  );
$$;

CREATE POLICY "Admins kunnen alle gebruikers lezen"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (is_admin());
