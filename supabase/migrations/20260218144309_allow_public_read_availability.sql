/*
  # Allow public read on availability_blocks

  The intake funnel (unauthenticated visitors) needs to read blocked slots to
  prevent double bookings. We also need public read on intakes preferred slots
  so the funnel can check existing bookings.

  ## Changes
  - Add anon SELECT policy on availability_blocks
  - Add anon SELECT policy restricted to preferred_date and preferred_time columns on intakes
    (via a view to avoid exposing full PII)

  ## Notes
  We create a minimal public view `booked_slots` that only exposes date+time
  combinations from intakes, so the funnel can detect conflicts without
  accessing any personal data.
*/

CREATE POLICY "Public can read availability blocks"
  ON availability_blocks FOR SELECT
  TO anon
  USING (true);

CREATE OR REPLACE VIEW booked_slots AS
  SELECT preferred_date, preferred_time
  FROM intakes
  WHERE preferred_date IS NOT NULL AND preferred_time IS NOT NULL;

GRANT SELECT ON booked_slots TO anon;
GRANT SELECT ON booked_slots TO authenticated;
