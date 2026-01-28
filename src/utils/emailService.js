/**
 * Email service utility
 * Sends form data via Netlify Function (Resend API)
 */

export const sendFunnelEmail = async (formData) => {
  try {
    // Validate email
    if (!formData.email || !formData.email.trim()) {
      return { success: false, error: 'Email is required' };
    }

    // Prepare payload for Netlify Function
    // The function expects: email (required), firstName (optional), answers (object, required)
    const payload = {
      email: formData.email.trim(),
      firstName: formData.name || undefined,
      answers: {
        // Contact information
        name: formData.name || '',
        company: formData.company || '',
        email: formData.email || '',
        phone: formData.phone || '',
        website: formData.website || '',
        // Funnel answers
        verkoopkanaal: formData.verkoopkanaal || '',
        diensten: formData.diensten || [],
        shipmentVolume: formData.shipmentVolume || '',
        grootsteUitdaging: formData.grootsteUitdaging || ''
      }
    };

    // Call Netlify Function
    const apiEndpoint = '/.netlify/functions/sendFunnelEmail';

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to send email`);
    }

    const result = await response.json();
    return { success: result.ok === true, method: 'resend' };
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw - allow flow to continue even if email fails
    return { success: false, error: error.message };
  }
};
