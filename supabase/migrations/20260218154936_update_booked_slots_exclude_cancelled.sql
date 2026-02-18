/*
  # Update booked_slots view: sluit geannuleerde intakes uit

  ## Wijzigingen
  - De booked_slots view toont nu alleen intakes die NIET geannuleerd zijn
  - Status 'geannuleerd' en 'afgewezen' sluiten het tijdslot niet meer af
  - Zo kan een tijdslot opnieuw beschikbaar worden na annulering

  ## Veiligheid
  - Nog steeds geen persoonsgegevens in de view
  - security_barrier blijft actief
*/

DROP VIEW IF EXISTS booked_slots;

CREATE VIEW booked_slots
WITH (security_barrier = true)
AS
  SELECT
    preferred_date,
    preferred_time
  FROM intakes
  WHERE preferred_date IS NOT NULL
    AND preferred_time IS NOT NULL
    AND status NOT IN ('geannuleerd', 'afgewezen');

REVOKE ALL ON booked_slots FROM PUBLIC;
REVOKE ALL ON booked_slots FROM anon;
REVOKE ALL ON booked_slots FROM authenticated;

GRANT SELECT ON booked_slots TO anon;
GRANT SELECT ON booked_slots TO authenticated;
