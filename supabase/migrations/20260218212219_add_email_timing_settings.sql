/*
  # Add email_timing_settings table

  ## Summary
  Stores configurable delays for automated follow-up emails.
  Replaces hardcoded values (48h, 72h, 5 days) in the process-followups edge function.

  ## New Tables
  - `email_timing_settings`
    - `key` (text, primary key) — identifier for the timing rule
    - `label` (text) — human-readable description shown in admin UI
    - `hours` (integer) — delay in hours after intake creation/status change
    - `enabled` (boolean) — whether this rule is active
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Authenticated admin users can SELECT and UPDATE (checked via admin_users.email = auth.jwt()->>'email')
  - Service role has full access

  ## Seed Data
  Three default rules matching current hardcoded values:
  1. followup_lead_nieuw: 48h — Follow-up naar lead na nieuw intake
  2. followup_intern_nieuw: 72h — Interne herinnering intake staat op nieuw
  3. followup_lead_offerte: 120h (5 days) — Follow-up naar lead na offerte
*/

CREATE TABLE IF NOT EXISTS email_timing_settings (
  key text PRIMARY KEY,
  label text NOT NULL,
  hours integer NOT NULL DEFAULT 48,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_timing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read timing settings"
  ON email_timing_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.actief = true
    )
  );

CREATE POLICY "Admins can update timing settings"
  ON email_timing_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.actief = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.actief = true
    )
  );

CREATE POLICY "Service role full access to timing settings"
  ON email_timing_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

INSERT INTO email_timing_settings (key, label, hours, enabled) VALUES
  ('followup_lead_nieuw', 'Follow-up naar lead (status: nieuw)', 48, true),
  ('followup_intern_nieuw', 'Interne herinnering (status: nieuw)', 72, true),
  ('followup_lead_offerte', 'Follow-up naar lead (status: offerte)', 120, true)
ON CONFLICT (key) DO NOTHING;
