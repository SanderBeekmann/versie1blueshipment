/*
  # Availability system + preferred_time on intakes

  ## Summary
  1. Adds `preferred_time` (text, e.g. "09:00") to the `intakes` table so the
     chosen time slot is stored alongside the preferred date.
  2. Creates a new `availability_blocks` table where admins can mark specific
     date+time combinations as blocked (already booked or unavailable).

  ## New Tables
  - `availability_blocks`
    - `id` (uuid, pk)
    - `block_date` (date) — the date being blocked
    - `block_time` (text) — the time slot being blocked, e.g. "09:00"
    - `reason` (text, nullable) — optional internal note
    - `created_at` (timestamptz)
    - UNIQUE constraint on (block_date, block_time) — prevents duplicates

  ## Modified Tables
  - `intakes`: new nullable column `preferred_time` (text)

  ## Security
  - RLS enabled on `availability_blocks`
  - Authenticated users (admins) can SELECT, INSERT, DELETE
  - No public access
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'intakes' AND column_name = 'preferred_time'
  ) THEN
    ALTER TABLE intakes ADD COLUMN preferred_time text;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS availability_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_date date NOT NULL,
  block_time text NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (block_date, block_time)
);

ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view availability blocks"
  ON availability_blocks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert availability blocks"
  ON availability_blocks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can delete availability blocks"
  ON availability_blocks FOR DELETE
  TO authenticated
  USING (true);
