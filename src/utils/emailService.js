import { supabase } from '../lib/supabase';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

const triggerEmailEdgeFunction = async (intakeId) => {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-intake-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ intakeId }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('Edge function error:', text);
    }
  } catch (err) {
    console.error('Edge function call failed:', err);
  }
};

export const sendFunnelEmail = async (formData) => {
  try {
    if (!formData.email || !formData.email.trim()) {
      return { success: false, error: 'E-mail is verplicht' };
    }

    const shipmentVolume = parseInt(formData.shipmentVolume) || 0;

    const { data, error } = await supabase
      .from('intakes')
      .insert({
        verkoopkanaal: formData.verkoopkanaal || '',
        diensten: Array.isArray(formData.diensten) ? formData.diensten : [],
        shipment_volume: shipmentVolume,
        grootste_uitdaging: formData.grootsteUitdaging || '',
        naam: formData.name || '',
        email: formData.email.trim().toLowerCase(),
        telefoon: formData.phone || '',
        bedrijf: formData.company || '',
        website: formData.website || '',
        consent: formData.awareOfTimeReservation === true,
        status: 'nieuw',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: error.message };
    }

    triggerEmailEdgeFunction(data.id);

    return { success: true, intakeId: data.id };
  } catch (err) {
    console.error('sendFunnelEmail error:', err);
    return { success: false, error: err.message };
  }
};
