/*
  # BlueShipment Backend Schema — Fase 2: Blog/Resources

  ## Doel
  Content module voor het publiceren van blog posts en resources voor SEO.

  ## Nieuwe tabellen

  ### blog_posts
  Volledige blog post data inclusief SEO-velden, status workflow en content blokken.
  - Slug als unieke URL-identifier
  - Status workflow: concept → gepland → live → gearchiveerd
  - Volledige SEO ondersteuning: meta_title, meta_description, og_image_url, canonical_url
  - Content opgeslagen als JSONB (blokken: heading, paragraph, list, cta)
  - Categorisatie via category en tags array
  - Koppeling aan admin_users als auteur

  ## Security
  - Blog posts: publiek lezen (alleen live posts via view), schrijven alleen content/admin rol
  - Aparte view voor publieke frontend: alleen live posts
*/

-- ============================================================
-- BLOG POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  content jsonb NOT NULL DEFAULT '[]',
  meta_title text NOT NULL DEFAULT '',
  meta_description text NOT NULL DEFAULT '',
  og_image_url text NOT NULL DEFAULT '',
  canonical_url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'concept' CHECK (status IN ('concept', 'gepland', 'live', 'gearchiveerd')),
  published_at timestamptz,
  author_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  read_time text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Iedereen kan live blog posts lezen"
  ON blog_posts FOR SELECT
  TO anon, authenticated
  USING (status = 'live');

CREATE POLICY "Admin users kunnen alle blog posts lezen"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true
    )
  );

CREATE POLICY "Content en admin kunnen blog posts aanmaken"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true
        AND au.rol IN ('admin', 'content')
    )
  );

CREATE POLICY "Content en admin kunnen blog posts bijwerken"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true
        AND au.rol IN ('admin', 'content')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true
        AND au.rol IN ('admin', 'content')
    )
  );

CREATE POLICY "Admins kunnen blog posts verwijderen"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.actief = true AND au.rol = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts(status);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts(published_at DESC);

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- MIGREER BESTAANDE BLOG POST
-- Voeg de bestaande hardcoded post toe als startdata
-- ============================================================
INSERT INTO blog_posts (
  slug,
  title,
  subtitle,
  excerpt,
  content,
  meta_title,
  meta_description,
  status,
  published_at,
  read_time,
  category,
  tags
) VALUES (
  'van-dropshipping-naar-voorraad-fulfilment',
  'Van dropshipping naar voorraad',
  'Waarom fulfilment dé volgende stap is voor bol.com verkopers',
  'Dropshipper op bol.com? Ontdek waarom verkoop vanuit voorraad via fulfilment de slimme overstap is voor groei, betrouwbaarheid en hogere ranking.',
  '[
    {"type": "paragraph", "text": "Veel bol.com verkopers zijn begonnen met dropshipping. Het is laagdrempelig, snel te starten en vereist geen grote investering in voorraad. Maar naarmate je shop groeit, loop je tegen steeds dezelfde problemen aan: lange levertijden, beperkte controle en toenemende druk vanuit bol.com."},
    {"type": "paragraph", "text": "Steeds meer dropshippers maken daarom de overstap naar verkoop vanuit eigen voorraad. Fulfilment speelt daarin een cruciale rol. In dit artikel lees je waarom bol.com afstand neemt van dropshipping, wat verkoop vanuit voorraad oplevert en hoe fulfilment je helpt om die overstap soepel en schaalbaar te maken."},
    {"type": "heading", "level": 3, "text": "Waarom dropshipping steeds minder werkt op bol.com"},
    {"type": "paragraph", "text": "Dropshipping lijkt aantrekkelijk, maar sluit steeds minder goed aan bij de eisen van bol.com en de verwachtingen van klanten."},
    {"type": "heading", "level": 3, "text": "Verkoop vanuit voorraad: de logische volgende stap"},
    {"type": "paragraph", "text": "Verkoop vanuit eigen voorraad geeft je direct meer controle. Je bepaalt zelf waar je voorraad ligt, hoe snel je levert en hoe retouren worden afgehandeld."},
    {"type": "heading", "level": 3, "text": "Conclusie"},
    {"type": "paragraph", "text": "Dropshipping is vaak een goede start, maar geen eindstation. Voor bol.com verkopers die willen groeien, controle willen terugpakken en willen voldoen aan de eisen van het platform, is verkoop vanuit voorraad via fulfilment de volgende stap."}
  ]'::jsonb,
  'Van dropshipping naar voorraad verkopen op bol.com | Fulfilment gids',
  'Dropshipper op bol.com? Ontdek waarom verkoop vanuit voorraad via fulfilment de slimme overstap is voor groei, betrouwbaarheid en hogere ranking.',
  'live',
  '2025-01-15 00:00:00+00',
  '8 min',
  'Fulfilment',
  ARRAY['bol.com', 'dropshipping', 'fulfilment', 'voorraad']
) ON CONFLICT (slug) DO NOTHING;
