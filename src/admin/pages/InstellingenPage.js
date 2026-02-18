import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import '../styles/admin.css';

const TYPE_LABELS = {
  klant_bevestiging: 'Bevestiging aan klant',
  intern_signaal: 'Intern lead signaal',
  followup_lead: 'Follow-up naar lead',
  followup_intern: 'Interne herinnering',
  herinnering: 'Kennismakingsherinnering',
};

export default function InstellingenPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    supabase.from('email_templates').select('*').order('type').then(({ data }) => {
      setTemplates(data || []);
      setLoading(false);
    });
  }, []);

  const updateTemplate = (id, field, value) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const saveTemplate = async (template) => {
    setSaving(template.id);
    await supabase.from('email_templates')
      .update({ subject: template.subject, intro: template.intro, enabled: template.enabled })
      .eq('id', template.id);
    setSaving(null);
    setSaved(template.id);
    setTimeout(() => setSaved(null), 2000);
  };

  const toggleEnabled = async (template) => {
    const newEnabled = !template.enabled;
    updateTemplate(template.id, 'enabled', newEnabled);
    await supabase.from('email_templates')
      .update({ enabled: newEnabled })
      .eq('id', template.id);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Instellingen</h1>
        <p className="admin-page-subtitle">E-mail templates en systeeminstellingen</p>
      </div>

      <div style={{ maxWidth: 720 }}>
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">E-mail templates</h2>
          </div>
          <div className="admin-card-body">
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 0, marginBottom: 20 }}>
              Pas de onderwerpen en intro-teksten aan voor automatische e-mails. De volledige layout en structuur worden automatisch opgebouwd.
            </p>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>Laden...</div>
            ) : templates.map(template => (
              <div key={template.id} style={{ padding: '20px 0', borderTop: '1px solid #f1f5f9', opacity: template.enabled === false ? 0.6 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    {TYPE_LABELS[template.type] || template.type}
                    <span style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8', marginLeft: 8 }}>({template.type})</span>
                  </div>
                  <button
                    onClick={() => toggleEnabled(template)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      borderRadius: 20,
                      border: template.enabled !== false ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      background: template.enabled !== false ? '#f0fdf4' : '#f8fafc',
                      color: template.enabled !== false ? '#16a34a' : '#94a3b8',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: template.enabled !== false ? '#16a34a' : '#cbd5e1',
                      display: 'inline-block',
                    }} />
                    {template.enabled !== false ? 'Actief' : 'Uitgeschakeld'}
                  </button>
                </div>

                <div className="admin-form-field">
                  <label className="admin-form-label">Onderwerp</label>
                  <input
                    className="admin-form-input"
                    value={template.subject}
                    onChange={(e) => updateTemplate(template.id, 'subject', e.target.value)}
                  />
                </div>

                <div className="admin-form-field">
                  <label className="admin-form-label">Intro tekst</label>
                  <textarea
                    className="admin-form-textarea"
                    value={template.intro}
                    onChange={(e) => updateTemplate(template.id, 'intro', e.target.value)}
                    rows={3}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    className="admin-btn admin-btn--primary admin-btn--sm"
                    onClick={() => saveTemplate(template)}
                    disabled={saving === template.id}
                  >
                    {saving === template.id ? 'Opslaan...' : 'Opslaan'}
                  </button>
                  {saved === template.id && (
                    <span style={{ fontSize: 12, color: '#16a34a' }}>Opgeslagen</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Integraties</h2>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Resend (e-mail)</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Automatische e-mails na intake en follow-ups</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 20, padding: '3px 10px' }}>
                  Geconfigureerd
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Supabase</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Database, auth en opslag</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 20, padding: '3px 10px' }}>
                  Actief
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
