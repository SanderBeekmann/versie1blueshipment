/*
  # Add DELETE policy for intakes table

  Allows admin users to delete intake records.
  Previously only SELECT, INSERT, and UPDATE policies existed — DELETE was missing, causing silent failures.
*/

CREATE POLICY "Authenticated admins kunnen intakes verwijderen"
  ON intakes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true
    )
  );
