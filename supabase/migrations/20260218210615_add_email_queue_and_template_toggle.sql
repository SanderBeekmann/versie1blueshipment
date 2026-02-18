/*
  # E-mail wachtrij en template beheer

  ## Doel
  Maakt het mogelijk om geplande follow-up e-mails inzichtelijk te maken
  en te beheren vanuit het admin dashboard.

  ## Nieuwe tabel: email_queue
  Elke rij vertegenwoordigt een geplande e-mail die nog verstuurd moet worden.
  De `process-followups` functie schrijft hier entries in, zodat admins deze
  kunnen inzien, aanpassen of annuleren voordat ze verstuurd worden.

  ### Kolommen
  - id: unieke identifier
  - intake_id: koppeling naar de intake
  - type: e-mailtype (followup_lead, followup_intern, herinnering, etc.)
  - recipient: ontvanger e-mailadres
  - subject: onderwerp (aanpasbaar door admin)
  - body_html: volledige HTML-inhoud (aanpasbaar door admin)
  - scheduled_at: wanneer de mail verstuurd wordt
  - status: pending / cancelled / sent / failed
  - cancelled_at: wanneer geannuleerd
  - cancelled_by: wie geannuleerd heeft
  - sent_at: wanneer verstuurd
  - created_at: aanmaakdatum

  ## Wijziging op email_templates
  - Kolom `enabled` toegevoegd (boolean, standaard true)
  - Als `enabled = false` worden er geen nieuwe queue-entries aangemaakt voor dat type

  ## Beveiliging
  - RLS ingeschakeld op email_queue
  - Alleen authenticated admins mogen lezen/schrijven
  - admin_users tabel heeft id als primary key (geen user_id kolom)
*/

-- Voeg enabled kolom toe aan email_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_templates' AND column_name = 'enabled'
  ) THEN
    ALTER TABLE email_templates ADD COLUMN enabled boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- Maak email_queue tabel aan
CREATE TABLE IF NOT EXISTS email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id uuid REFERENCES intakes(id) ON DELETE CASCADE,
  type text NOT NULL,
  recipient text NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL DEFAULT '',
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  cancelled_at timestamptz,
  cancelled_by uuid REFERENCES auth.users(id),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins kunnen email_queue lezen"
  ON email_queue FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND admin_users.actief = true
    )
  );

CREATE POLICY "Admins kunnen email_queue bijwerken"
  ON email_queue FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND admin_users.actief = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND admin_users.actief = true
    )
  );

CREATE POLICY "Service role kan email_queue beheren"
  ON email_queue FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index voor snelle queries op status en scheduled_at
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_at ON email_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_intake_id ON email_queue(intake_id);
