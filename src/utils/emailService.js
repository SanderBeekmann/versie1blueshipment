/**
 * Email service utility
 * Sends form data to blueshipsales@gmail.com
 */

export const sendFunnelEmail = async (formData) => {
  try {
    // Format email content
    const emailSubject = `Nieuwe Intake Funnel Inzending - ${formData.name || 'Geen naam'}`;
    
    const emailBody = `
Nieuwe intake funnel inzending ontvangen:

VERKOOPKANAAL:
${formData.verkoopkanaal || 'Niet ingevuld'}

DIENSTEN:
${formData.diensten && formData.diensten.length > 0 ? formData.diensten.join(', ') : 'Geen diensten geselecteerd'}

SHIPMENT VOLUME:
${formData.shipmentVolume || 'Niet ingevuld'}

GROOTSTE UITDAGING:
${formData.grootsteUitdaging || 'Niet ingevuld'}

CONTACTGEGEVENS:
Naam: ${formData.name || 'Niet ingevuld'}
Bedrijf: ${formData.company || 'Niet ingevuld'}
E-mail: ${formData.email || 'Niet ingevuld'}
Telefoon: ${formData.phone || 'Niet ingevuld'}
Website: ${formData.website || 'Niet ingevuld'}

---
Verzonden op: ${new Date().toLocaleString('nl-NL')}
    `.trim();

    // Try to send via mailto (works in most browsers)
    // This opens the user's email client with pre-filled data
    const mailtoLink = `mailto:blueshipsales@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Use a hidden link to trigger mailto without navigation issues
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Return success - mailto will open email client
    // Note: This requires user interaction, so it's not fully automatic
    // For production, consider using a service like EmailJS, Formspree, or your own backend
    return { success: true, method: 'mailto' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send email using a webhook service (like Formspree, Web3Forms, etc.)
 * This is a more reliable solution than mailto
 */
export const sendFunnelEmailWebhook = async (formData) => {
  try {
    // Using Web3Forms as an example - replace with your webhook URL
    // You can use services like:
    // - Web3Forms: https://web3forms.com
    // - Formspree: https://formspree.io
    // - Your own backend endpoint
    
    const webhookUrl = 'https://api.web3forms.com/submit'; // Replace with your webhook
    
    const payload = {
      access_key: 'YOUR_ACCESS_KEY', // Replace with your access key
      subject: `Nieuwe Intake Funnel Inzending - ${formData.name || 'Geen naam'}`,
      from_name: formData.name || 'Intake Funnel',
      email: formData.email || 'noreply@blueshipment.nl',
      message: `
VERKOOPKANAAL: ${formData.verkoopkanaal || 'Niet ingevuld'}

DIENSTEN: ${formData.diensten && formData.diensten.length > 0 ? formData.diensten.join(', ') : 'Geen diensten geselecteerd'}

SHIPMENT VOLUME: ${formData.shipmentVolume || 'Niet ingevuld'}

GROOTSTE UITDAGING: ${formData.grootsteUitdaging || 'Niet ingevuld'}

CONTACTGEGEVENS:
Naam: ${formData.name || 'Niet ingevuld'}
Bedrijf: ${formData.company || 'Niet ingevuld'}
E-mail: ${formData.email || 'Niet ingevuld'}
Telefoon: ${formData.phone || 'Niet ingevuld'}
Website: ${formData.website || 'Niet ingevuld'}
      `.trim()
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    const result = await response.json();
    return { success: result.success || true, method: 'webhook' };
  } catch (error) {
    console.error('Error sending email via webhook:', error);
    // Fallback to mailto
    return sendFunnelEmail(formData);
  }
};
