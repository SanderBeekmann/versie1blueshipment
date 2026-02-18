/*
  # Update cron jobs: aparte schedule-scan en verzending

  ## Doel
  Het e-mailproces wordt gesplitst in twee aparte cron jobs:

  1. **Schedule-scan** (elk uur): Scant alle actieve intakes en plant
     e-mails die binnen 7 dagen verstuurd moeten worden in de wachtrij,
     met een exacte scheduled_at datum/tijd op basis van created_at + ingestelde uren.

  2. **Verzending** (elk uur): Verstuurt alle wachtrij-items waarvan
     scheduled_at <= nu is.

  ## Wijzigingen
  - Oude dagelijkse job 'blueshipment-followup-daily' vervangen
  - Nieuwe job 'blueshipment-followup-schedule' elk uur (?mode=schedule)
  - Nieuwe job 'blueshipment-followup-send' elk uur (?mode=send)

  ## Resultaat
  Admins zien e-mails al dagen van tevoren in de wachtrij staan met
  exacte verzenddatum en -tijd, en kunnen deze nog annuleren of aanpassen.
*/

-- Verwijder de oude dagelijkse job
SELECT cron.unschedule('blueshipment-followup-daily')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'blueshipment-followup-daily'
);

-- Verwijder eventuele bestaande nieuwe jobs
SELECT cron.unschedule('blueshipment-followup-schedule')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'blueshipment-followup-schedule'
);

SELECT cron.unschedule('blueshipment-followup-send')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'blueshipment-followup-send'
);

-- Plan de schedule-scan elk uur (minuut 0)
SELECT cron.schedule(
  'blueshipment-followup-schedule',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/process-followups?mode=schedule',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Plan de verzending elk uur (minuut 5, zodat schedule altijd eerst klaar is)
SELECT cron.schedule(
  'blueshipment-followup-send',
  '5 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/process-followups?mode=send',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
