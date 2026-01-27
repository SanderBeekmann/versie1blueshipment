# Netlify Functions - Email Service

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Configureer de volgende environment variables in Netlify:

1. Ga naar je Netlify dashboard
2. Selecteer je site
3. Ga naar **Site settings** > **Environment variables**
4. Voeg de volgende variabelen toe:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=info@blueshipment.nl
SALES_TO_EMAIL=blueshipsales@gmail.com
```

**Opmerkingen:**
- `RESEND_API_KEY`: Haal je API key op van https://resend.com/api-keys
- `FROM_EMAIL`: Moet een geverifieerd email adres zijn in je Resend account
- `SALES_TO_EMAIL`: Optioneel, standaard is `blueshipsales@gmail.com`

### 3. Resend Domain Verification

Zorg ervoor dat je domain geverifieerd is in Resend voordat je emails kunt versturen.

## Function: sendFunnelEmail

### Endpoint
`/.netlify/functions/sendFunnelEmail`

### Method
`POST` only (returns 405 for other methods)

### Request Body

```json
{
  "email": "user@example.com",        // Required
  "firstName": "John",                 // Optional
  "answers": {                         // Required (can be empty object)
    "name": "John Doe",
    "company": "Example BV",
    "phone": "+31 6 12345678",
    "website": "https://example.nl",
    "verkoopkanaal": "bol.com",
    "diensten": ["Productlistings", "Automatiseren"],
    "shipmentVolume": "50–250",
    "grootsteUitdaging": "Logistiek"
  }
}
```

### Response

**Success (200):**
```json
{
  "ok": true
}
```

**Error (400/500):**
```json
{
  "ok": false,
  "error": "Error message"
}
```

### Emails Sent

1. **User Confirmation Email**
   - To: User's email
   - Subject: "Bevestiging: we hebben je aanvraag ontvangen"
   - Contains confirmation message and Calendly link

2. **Sales Lead Email**
   - To: `SALES_TO_EMAIL` (or blueshipsales@gmail.com)
   - Subject: "Nieuwe funnel aanvraag: <naam of email>"
   - Reply-To: User's email
   - Contains all form data and JSON block

## Testing Locally

Voor lokale testing met Netlify Dev:

```bash
npm install -g netlify-cli
netlify dev
```

De function is dan beschikbaar op `http://localhost:8888/.netlify/functions/sendFunnelEmail`
