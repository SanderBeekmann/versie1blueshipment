/**
 * Email service utility
 * Sends form data via Formspree
 */

export const sendFunnelEmail = async (formData) => {
  try {
    if (!formData.email || !formData.email.trim()) {
      return { success: false, error: 'Email is required' };
    }

    const formspreeEndpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT;

    if (!formspreeEndpoint) {
      console.error('VITE_FORMSPREE_ENDPOINT is not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const timestamp = new Date().toLocaleString('nl-NL', {
      timeZone: 'Europe/Amsterdam',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const dienstenList = Array.isArray(formData.diensten)
      ? formData.diensten.join(', ')
      : '';

    const summary = `
Nieuwe lead aanvraag - ${timestamp}

Contactgegevens:
- Naam: ${formData.name || 'Niet ingevuld'}
- Bedrijf: ${formData.company || 'Niet ingevuld'}
- E-mail: ${formData.email}
- Telefoon: ${formData.phone || 'Niet ingevuld'}
- Website: ${formData.website || 'Niet ingevuld'}

Verkoop & Diensten:
- Verkoopkanaal: ${formData.verkoopkanaal || 'Niet ingevuld'}
- Gewenste diensten: ${dienstenList || 'Niet ingevuld'}
- Shipment volume: ${formData.shipmentVolume || 'Niet ingevuld'} per maand

Uitdaging:
${formData.grootsteUitdaging || 'Niet ingevuld'}
    `.trim();

    const payload = {
      name: formData.name || '',
      email: formData.email.trim(),
      phone: formData.phone || '',
      company: formData.company || '',
      website: formData.website || '',
      verkoopkanaal: formData.verkoopkanaal || '',
      diensten: formData.diensten || [],
      shipmentVolume: formData.shipmentVolume || '',
      grootsteUitdaging: formData.grootsteUitdaging || '',
      timestamp: timestamp,
      summary: summary,
      answers: {
        name: formData.name || '',
        company: formData.company || '',
        email: formData.email || '',
        phone: formData.phone || '',
        website: formData.website || '',
        verkoopkanaal: formData.verkoopkanaal || '',
        diensten: formData.diensten || [],
        shipmentVolume: formData.shipmentVolume || '',
        grootsteUitdaging: formData.grootsteUitdaging || ''
      }
    };

    const response = await fetch(formspreeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to send email`);
    }

    return { success: true, method: 'formspree' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};
