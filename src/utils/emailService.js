/**
 * Email service utility
 * Sends form data via Supabase Edge Function (Resend API + Database storage)
 */

export const sendFunnelEmail = async (formData) => {
  try {
    if (!formData.email || !formData.email.trim()) {
      return { success: false, error: 'Email is required' };
    }

    const payload = {
      email: formData.email.trim(),
      firstName: formData.name || undefined,
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

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const apiEndpoint = `${supabaseUrl}/functions/v1/send-funnel-email`;

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
    return { success: result.ok === true, method: 'supabase', leadId: result.leadId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};
