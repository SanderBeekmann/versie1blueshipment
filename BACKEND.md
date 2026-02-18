# BlueShipment Backend — Technisch Overzicht

## Doel

Een volwaardige backend op de bestaande website waarmee BlueShipment:
- Leads en klanten centraal beheert
- Intake aanvragen uit de funnel opslaat
- Automatische e-mails stuurt (bevestiging + intern signaal)
- Follow-up flows uitvoert op basis van tijd en status
- Blog/resources publiceert voor SEO
- Alles beheert via een beveiligde admin omgeving

---

## Tech Stack

| Laag | Technologie |
|---|---|
| Frontend + Admin | React (bestaand project) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage |
| E-mail | Resend via Supabase Edge Functions |
| Scheduled jobs | Supabase pg_cron |
| Hosting | Netlify (bestaand) |

---

## Database Schema

### `intakes`
Alle funnel-antwoorden per aanvraag.

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid PK | Uniek ID |
| verkoopkanaal | text | Geselecteerd verkoopkanaal |
| diensten | text[] | Gekozen diensten (array) |
| shipment_volume | integer | Slider waarde |
| grootste_uitdaging | text | Optioneel vrij tekstveld |
| naam | text | Verplicht |
| email | text | Verplicht |
| telefoon | text | Verplicht |
| bedrijf | text | Optioneel |
| website | text | Optioneel |
| consent | boolean | Checkbox bevestiging |
| status | text | nieuw / in_behandeling / offerte / gewonnen / verloren |
| assigned_to | uuid FK → admin_users | Toegewezen teamlid |
| created_at | timestamptz | Aanmaakdatum |
| updated_at | timestamptz | Laatste update |

### `crm_contacts`
Contactpersonen, los van intakes.

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid PK | |
| intake_id | uuid FK → intakes | Optionele koppeling |
| naam | text | |
| email | text | |
| telefoon | text | |
| bedrijf | text | |
| website | text | |
| tags | text[] | bijv. bol.com seller, high volume |
| status | text | lead / klant / inactief |
| created_at | timestamptz | |

### `crm_notes`
Interne notities per intake of contact.

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid PK | |
| intake_id | uuid FK | |
| contact_id | uuid FK | |
| author_id | uuid FK → admin_users | |
| content | text | |
| created_at | timestamptz | |

### `crm_tasks`
Opvolgtaken voor teamleden.

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid PK | |
| intake_id | uuid FK | |
| contact_id | uuid FK | |
| assigned_to | uuid FK → admin_users | |
| title | text | |
| due_date | timestamptz | |
| completed | boolean | |
| created_at | timestamptz | |

### `blog_posts`
Content voor de resources/SEO pagina.

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid PK | |
| slug | text UNIQUE | URL-vriendelijk ID |
| title | text | Zichtbare titel |
| subtitle | text | Optionele ondertitel |
| excerpt | text | Samenvatting voor overzichtspagina |
| content | jsonb | Blokken-structuur (headings, paragraphs, CTAs) |
| meta_title | text | SEO titel |
| meta_description | text | SEO meta description |
| og_image_url | text | Open Graph afbeelding |
| canonical_url | text | Optionele canonical URL |
| category | text | Categorie |
| tags | text[] | Tags |
| status | text | concept / gepland / live / gearchiveerd |
| published_at | timestamptz | Publicatiedatum |
| author_id | uuid FK → admin_users | |
| read_time | text | bijv. "8 min" |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `email_logs`
Log van alle verstuurde e-mails.

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid PK | |
| intake_id | uuid FK | |
| type | text | klant_bevestiging / intern_signaal / followup |
| recipient | text | E-mailadres ontvanger |
| subject | text | Onderwerp |
| status | text | sent / failed |
| error_message | text | Bij mislukking |
| resend_id | text | ID van Resend |
| created_at | timestamptz | |

### `email_templates`
Aanpasbare teksten per mailtype.

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid PK | |
| type | text UNIQUE | bijv. klant_bevestiging |
| subject | text | Onderwerp |
| intro | text | Inleidende tekst |
| updated_at | timestamptz | |

### `admin_users`
Teamleden met rol.

| Kolom | Type | Beschrijving |
|---|---|---|
| id | uuid PK (= auth.uid) | |
| naam | text | |
| email | text | |
| rol | text | admin / sales / operations / content |
| actief | boolean | |
| created_at | timestamptz | |

---

## Admin Omgeving — Routes

| Route | Pagina | Rol |
|---|---|---|
| /admin/login | Inlogpagina | Publiek |
| /admin | Dashboard (KPI's + recente aanvragen) | Alle rollen |
| /admin/intakes | Overzicht alle intakes + filters | sales, admin |
| /admin/intakes/:id | Intake detail + notities + taken | sales, admin |
| /admin/crm | Pipeline view leads/klanten | sales, admin |
| /admin/crm/:id | Klantprofiel | sales, admin |
| /admin/content | Blog beheer | content, admin |
| /admin/content/nieuw | Nieuwe blog post | content, admin |
| /admin/content/:id | Blog post bewerken | content, admin |
| /admin/instellingen | Team + e-mail templates | admin |

---

## E-mail Flows

### Direct na intake submit
1. **Mail aan klant** — bevestiging met samenvatting funnel-antwoorden
2. **Mail intern** — lead signaal met alle details + link naar admin

### Automatische follow-ups (pg_cron)
| Trigger | Actie |
|---|---|
| Intake nieuw > 48u, geen gesprek gepland | Follow-up mail naar lead |
| Gesprek gepland | Herinnering 24u van tevoren |
| Status = offerte, geen reactie na 5 dagen | Follow-up mail |
| Intake blijft nieuw > 72u | Interne reminder aan teamlid |

---

## Rollen & Beveiliging

- Alle admin routes beveiligd via Supabase Auth
- RLS op elke tabel: alleen `authenticated` met juiste rol
- `admin_users.rol` bepaalt toegang via `auth.jwt() -> app_metadata`
- Edge Functions gebruiken `SUPABASE_SERVICE_ROLE_KEY` (nooit client-side)

---

## Implementatiefasen

### Fase 1 — Fundament (database + auth)
- [ ] Database migraties aanmaken
- [ ] Supabase Auth instellen voor teamleden
- [ ] Admin routes beveiligen in React

### Fase 2 — Intake + e-mail
- [ ] IntakeFunnel loskoppelen van Formspree → opslaan in Supabase
- [ ] Edge Function: e-mail via Resend na submit
- [ ] Email logs opslaan

### Fase 3 — Admin dashboard
- [ ] Login pagina
- [ ] Dashboard met KPI's
- [ ] Intakes overzicht + detail + filters
- [ ] CRM pipeline view

### Fase 4 — Blog module
- [ ] Blog posts tabel koppelen aan frontend
- [ ] Admin: aanmaken / bewerken / publiceren
- [ ] ResourcesPage en BlogDetailPage dynamisch maken

### Fase 5 — Follow-ups & rapportage
- [ ] pg_cron jobs instellen
- [ ] Follow-up Edge Functions
- [ ] Rapportage dashboard met grafieken

---

## Proces Flow (volledig)

```
Bezoeker vult funnel in
        ↓
Validatie client-side (bestaand)
        ↓
POST naar Supabase (intakes tabel)
        ↓
Trigger Edge Function
        ↓
    ┌───────────────────┬──────────────────┐
    ↓                                      ↓
Mail naar klant                     Mail naar team
(Resend)                            (Resend)
    ↓                                      ↓
Log in email_logs               Log in email_logs
        ↓
Admin dashboard toont nieuwe intake
        ↓
Teamlid volgt op (notities, taken, status)
        ↓
pg_cron checkt dagelijks open intakes
        ↓
Automatische follow-ups indien nodig
```
