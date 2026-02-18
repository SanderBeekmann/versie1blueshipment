/*
  # Automatische follow-up cron job

  ## Doel
  Dagelijks de process-followups Edge Function aanroepen via pg_cron.
  Dit zorgt voor automatische follow-up e-mails bij:
  - Intakes die 48u op "nieuw" staan zonder reactie (follow-up naar lead)
  - Intakes die 72u op "nieuw" staan (interne herinnering naar team)
  - Intakes met status "offerte" die 5 dagen oud zijn (follow-up naar lead)

  ## Instellingen
  - Frequentie: elke dag om 09:00 UTC
  - Roept de Supabase Edge Function aan via net.http_post
  - Vereist pg_cron en pg_net extensies

  ## Noot
  pg_net is vereist voor HTTP calls vanuit pg_cron.
  Beide extensies zijn standaard beschikbaar in Supabase.
*/

-- Activeer benodigde extensies
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Verwijder bestaande job indien aanwezig
SELECT cron.unschedule('blueshipment-followup-daily')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'blueshipment-followup-daily'
);

-- Plan dagelijkse follow-up verwerking om 09:00 UTC
SELECT cron.schedule(
  'blueshipment-followup-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/process-followups',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
