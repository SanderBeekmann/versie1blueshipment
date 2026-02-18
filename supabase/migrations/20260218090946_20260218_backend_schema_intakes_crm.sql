/*
  # BlueShipment Backend Schema — Fase 1: Intakes & CRM

  ## Doel
  Volledige backend infrastructuur voor lead- en klantbeheer, intake opslag,
  notities, taken en admin gebruikers.

  ## Nieuwe tabellen

  ### intakes
  Slaat alle funnel-antwoorden op als één record per aanvraag.
  - Volledige funnel data: verkoopkanaal, diensten, shipment_volume, uitdaging
  - Contactgegevens: naam, email, telefoon, bedrijf, website
  - Workflow: status, assigned_to, consent
  - Tijdstempels: created_at, updated_at

  ### admin_users
  Teamleden met rollen (admin, sales, operations, content).
  Gekoppeld aan Supabase Auth via auth.uid().

  ### crm_notes
  Interne notities per intake of contact.

  ### crm_tasks
  Opvolgtaken met deadline en toewijzing aan teamlid.

  ### email_logs
  Log van alle verstuurde e-mails met status sent/failed.

  ### email_templates
  Aanpasbare teksten per mailtype (onderwerp, intro).

  ## Security
  - RLS ingeschakeld op alle tabellen
  - Intakes: publiek aanmaken (funnel), lezen/bewerken alleen admin
  - Overige tabellen: alleen authenticated admin users
  - email_logs: service role voor schrijven, admin voor lezen

  ## Indexen
  - intakes: status, created_at, email
  - email_logs: intake_id, status
*/

-- ============================================================
-- ADMIN USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  naam text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  rol text NOT NULL DEFAULT 'sales' CHECK (rol IN ('admin', 'sales', 'operations', 'content')),
  actief boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users kunnen eigen profiel lezen"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin users kunnen eigen profiel bijwerken"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins kunnen alle gebruikers lezen"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.rol = 'admin'
    )
  );

CREATE POLICY "Admins kunnen gebruikers aanmaken"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.rol = 'admin'
    )
  );

-- ============================================================
-- INTAKES
-- ============================================================
CREATE TABLE IF NOT EXISTS intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verkoopkanaal text NOT NULL DEFAULT '',
  diensten text[] NOT NULL DEFAULT '{}',
  shipment_volume integer NOT NULL DEFAULT 0,
  grootste_uitdaging text NOT NULL DEFAULT '',
  naam text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  telefoon text NOT NULL DEFAULT '',
  bedrijf text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'nieuw' CHECK (status IN ('nieuw', 'in_behandeling', 'offerte', 'gewonnen', 'verloren')),
  assigned_to uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Iedereen kan een intake aanmaken"
  ON intakes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users kunnen intakes lezen"
  ON intakes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true
    )
  );

CREATE POLICY "Authenticated users kunnen intakes bijwerken"
  ON intakes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true
    )
  );

CREATE INDEX IF NOT EXISTS intakes_status_idx ON intakes(status);
CREATE INDEX IF NOT EXISTS intakes_created_at_idx ON intakes(created_at DESC);
CREATE INDEX IF NOT EXISTS intakes_email_idx ON intakes(email);

-- ============================================================
-- CRM NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id uuid REFERENCES intakes(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users kunnen notities lezen"
  ON crm_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true
    )
  );

CREATE POLICY "Admin users kunnen notities aanmaken"
  ON crm_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true
    )
  );

CREATE POLICY "Auteur kan eigen notitie verwijderen"
  ON crm_notes FOR DELETE
  TO authenticated
  USING (
    auth.uid() = author_id
  );

-- ============================================================
-- CRM TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id uuid REFERENCES intakes(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  due_date timestamptz,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users kunnen taken lezen"
  ON crm_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true
    )
  );

CREATE POLICY "Admin users kunnen taken aanmaken"
  ON crm_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true
    )
  );

CREATE POLICY "Admin users kunnen taken bijwerken"
  ON crm_tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true
    )
  );

CREATE POLICY "Aanmaker kan taak verwijderen"
  ON crm_tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- ============================================================
-- EMAIL LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id uuid REFERENCES intakes(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT '' CHECK (type IN ('klant_bevestiging', 'intern_signaal', 'followup_lead', 'followup_intern', 'herinnering')),
  recipient text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  error_message text NOT NULL DEFAULT '',
  resend_id text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users kunnen email logs lezen"
  ON email_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true
    )
  );

CREATE INDEX IF NOT EXISTS email_logs_intake_id_idx ON email_logs(intake_id);
CREATE INDEX IF NOT EXISTS email_logs_status_idx ON email_logs(status);

-- ============================================================
-- EMAIL TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text UNIQUE NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  intro text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users kunnen templates lezen"
  ON email_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true
    )
  );

CREATE POLICY "Admins kunnen templates bijwerken"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true AND au.rol = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true AND au.rol = 'admin'
    )
  );

-- Standaard templates
INSERT INTO email_templates (type, subject, intro) VALUES
  ('klant_bevestiging', 'Bedankt voor je aanvraag bij BlueShipment', 'Bedankt voor het invullen van onze intake. We hebben je gegevens ontvangen en nemen binnenkort contact met je op.'),
  ('intern_signaal', 'Nieuwe intake aanvraag', 'Er is een nieuwe intake binnengekomen via de website. Zie hieronder de details.'),
  ('followup_lead', 'Heb je nog vragen? — BlueShipment', 'Je hebt onlangs een aanvraag ingediend bij BlueShipment. We willen graag weten of we je ergens mee kunnen helpen.'),
  ('herinnering', 'Herinnering: kennismakingsgesprek morgen', 'Dit is een herinnering voor je kennismakingsgesprek met BlueShipment morgen.')
ON CONFLICT (type) DO NOTHING;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER intakes_updated_at
  BEFORE UPDATE ON intakes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER crm_tasks_updated_at
  BEFORE UPDATE ON crm_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
