/*
  # Beveilig booked_slots view

  ## Doel
  De booked_slots view wordt gebruikt door de publieke funnel (CalendarPicker) om te weten
  welke tijdslots al bezet zijn. De view mag NOOIT persoonsgegevens teruggeven.

  ## Wijzigingen
  - Hermaak de booked_slots view zodat hij enkel datum + tijd bevat (geen id, naam, bedrijf, etc.)
  - Markeer de view als SECURITY DEFINER zodat hij altijd met beperkte rechten draait
  - Verleen expliciet SELECT-toegang aan de anon rol (publiek leesbaar voor de funnel)
  - Trek alle andere privileges in zodat de view niet uitgebreid kan worden met persoonsgegevens

  ## Veiligheidsgarantie
  Zelfs als de intakes-tabel in de toekomst uitgebreid wordt, kan de funnel nooit meer
  kolommen opvragen dan de view definieert. De reden van een blokkade is ook nooit
  afleidbaar via deze view.
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
    AND preferred_time IS NOT NULL;

REVOKE ALL ON booked_slots FROM PUBLIC;
REVOKE ALL ON booked_slots FROM anon;
REVOKE ALL ON booked_slots FROM authenticated;

GRANT SELECT ON booked_slots TO anon;
GRANT SELECT ON booked_slots TO authenticated;
