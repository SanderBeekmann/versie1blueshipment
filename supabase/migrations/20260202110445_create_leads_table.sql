/*
  # Lead Management System

  1. New Tables
    - `leads`
      - `id` (uuid, primary key) - Unique lead identifier
      - `email` (text, not null) - Lead email address
      - `name` (text) - Contact name
      - `company` (text) - Company name
      - `phone` (text) - Phone number
      - `website` (text) - Company website
      - `verkoopkanaal` (text) - Sales channel
      - `diensten` (jsonb) - Services array
      - `shipment_volume` (text) - Monthly shipment volume
      - `grootste_uitdaging` (text) - Biggest challenge description
      - `status` (text, default 'new') - Lead status (new, contacted, qualified, lost)
      - `source` (text, default 'website') - Lead source
      - `email_sent` (boolean, default false) - Confirmation email sent
      - `created_at` (timestamptz) - Record creation time
      - `updated_at` (timestamptz) - Last update time
  
  2. Indexes
    - Email index for quick lookup
    - Created_at index for time-based queries
    - Status index for filtering
  
  3. Security
    - Enable RLS on `leads` table
    - Only service role can read/write (internal use only)
    - No public access to sensitive lead data
  
  4. Notes
    - Leads are created via Edge Function only
    - Email confirmation tracked per lead
    - Status workflow: new → contacted → qualified/lost
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  company text,
  phone text,
  website text,
  verkoopkanaal text,
  diensten jsonb DEFAULT '[]'::jsonb,
  shipment_volume text,
  grootste_uitdaging text,
  status text DEFAULT 'new',
  source text DEFAULT 'website',
  email_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Only service role can access (no public access)
CREATE POLICY "Service role only"
  ON leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop first if exists)
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
  CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;