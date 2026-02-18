/*
  # Add preferred_date to intakes table

  ## Summary
  Adds a `preferred_date` column to the `intakes` table to store the preferred
  meeting date chosen by the lead in step 5 of the intake funnel.

  ## Changes
  - `intakes`: new nullable column `preferred_date` (date) — the date the lead
    prefers for the introductory meeting with Timo.

  ## Notes
  - Column is nullable so existing rows are not affected.
  - No RLS changes needed; existing policies on `intakes` already cover this column.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'intakes' AND column_name = 'preferred_date'
  ) THEN
    ALTER TABLE intakes ADD COLUMN preferred_date date;
  END IF;
END $$;
