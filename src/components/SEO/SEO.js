import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

function SEO({ 
  title, 
  description, 
  image, 
  type = 'website',
  structuredData,
  canonicalUrl 
}) {
  const location = useLocation();
  const siteUrl = 'https://blueshipment.nl'; // Update with actual domain
  const fullUrl = canonicalUrl || `${siteUrl}${location.pathname}`;
  const ogImage = image || `${siteUrl}/og-image.jpg`; // Update with actual OG image path
  const fullTitle = title ? `${title} | BlueShipment` : 'BlueShipment - Jouw bol.com Partner';
  const fullDescription = description || 'BlueShipment is jouw all-in bol.com partner. Wij helpen je met productlistings, automatisering, fulfilment en software om je bol.com business te laten groeien.';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="BlueShipment" />
      <meta property="og:locale" content="nl_NL" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

export default SEO;
