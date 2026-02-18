import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import '../styles/admin.css';

const TYPE_LABELS = {
  klant_bevestiging: 'Bevestiging aan klant',
  intern_signaal: 'Intern lead signaal',
  followup_lead: 'Follow-up naar lead',
  followup_intern: 'Interne herinnering',
  herinnering: 'Kennismakingsherinnering',
};

const STATUS_CONFIG = {
  pending: { label: 'Gepland', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  cancelled: { label: 'Geannuleerd', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  sent: { label: 'Verstuurd', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  failed: { label: 'Mislukt', bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 600,
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
      borderRadius: 20,
      padding: '3px 10px',
    }}>
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatRelative(dateStr) {
  if (!dateStr) return '';
  const diff = new Date(dateStr) - new Date();
  const hours = Math.round(diff / 3600000);
  if (hours < 0) return 'verleden';
  if (hours < 1) return 'binnen een uur';
  if (hours < 24) return `over ${hours} uur`;
  const days = Math.round(hours / 24);
  return `over ${days} dag${days !== 1 ? 'en' : ''}`;
}

function QueueTab() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [preview, setPreview] = useState(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    const query = supabase
      .from('email_queue')
      .select(`*, intakes(naam, bedrijf, email)`)
      .order('scheduled_at', { ascending: true });

    if (filter !== 'all') query.eq('status', filter);

    const { data } = await query;
    setQueue(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const cancelEmail = async (id) => {
    if (!window.confirm('Weet je zeker dat je deze mail wil annuleren?')) return;
    setCancelling(id);
    await supabase.from('email_queue').update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    }).eq('id', id);
    setCancelling(null);
    fetchQueue();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditData({ subject: item.subject, body_html: item.body_html });
  };

  const saveEdit = async (id) => {
    setSaving(id);
    await supabase.from('email_queue').update({
      subject: editData.subject,
      body_html: editData.body_html,
    }).eq('id', id);
    setSaving(null);
    setEditingId(null);
    fetchQueue();
  };

  const pendingCount = queue.filter(q => q.status === 'pending').length;

  return (
    <>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {['pending', 'sent', 'cancelled', 'failed', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: filter === f ? '1px solid #2563eb' : '1px solid #e2e8f0',
              background: filter === f ? '#eff6ff' : '#fff',
              color: filter === f ? '#2563eb' : '#64748b',
              fontSize: 13,
              fontWeight: filter === f ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {f === 'pending' ? `Gepland${pendingCount > 0 && filter !== 'pending' ? ` (${pendingCount})` : ''}` :
             f === 'sent' ? 'Verstuurd' :
             f === 'cancelled' ? 'Geannuleerd' :
             f === 'failed' ? 'Mislukt' : 'Alle'}
          </button>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontSize: 13 }}>Laden...</div>
          ) : queue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>&#x2709;&#xfe0f;</div>
              <div style={{ fontSize: 14, color: '#64748b' }}>
                {filter === 'pending' ? 'Geen geplande e-mails' : 'Geen e-mails gevonden'}
              </div>
            </div>
          ) : (
            <div>
              {queue.map((item, idx) => (
                <div key={item.id} style={{ borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none', padding: '20px 24px' }}>
                  {editingId === item.id ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <StatusBadge status={item.status} />
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>
                          {TYPE_LABELS[item.type] || item.type} &bull; {item.recipient}
                        </span>
                      </div>
                      <div className="admin-form-field">
                        <label className="admin-form-label">Onderwerp</label>
                        <input
                          className="admin-form-input"
                          value={editData.subject}
                          onChange={e => setEditData(d => ({ ...d, subject: e.target.value }))}
                        />
                      </div>
                      <div className="admin-form-field">
                        <label className="admin-form-label">HTML-inhoud</label>
                        <textarea
                          className="admin-form-textarea"
                          value={editData.body_html}
                          onChange={e => setEditData(d => ({ ...d, body_html: e.target.value }))}
                          rows={10}
                          style={{ fontFamily: 'monospace', fontSize: 12 }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="admin-btn admin-btn--primary admin-btn--sm"
                          onClick={() => saveEdit(item.id)}
                          disabled={saving === item.id}
                        >
                          {saving === item.id ? 'Opslaan...' : 'Opslaan'}
                        </button>
                        <button
                          className="admin-btn admin-btn--sm"
                          onClick={() => setEditingId(null)}
                          style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b' }}
                        >
                          Annuleren
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <StatusBadge status={item.status} />
                          <span style={{
                            fontSize: 11, fontWeight: 500, color: '#64748b',
                            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 7px',
                          }}>
                            {TYPE_LABELS[item.type] || item.type}
                          </span>
                          {item.status === 'pending' && (
                            <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 500 }}>
                              {formatRelative(item.scheduled_at)}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.subject}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          Aan: <span style={{ color: '#2563eb' }}>{item.recipient}</span>
                          {item.intakes && (
                            <span style={{ marginLeft: 8 }}>
                              &bull; {item.intakes.naam}{item.intakes.bedrijf ? ` (${item.intakes.bedrijf})` : ''}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                          {item.status === 'pending' ? `Gepland op ${formatDate(item.scheduled_at)}` :
                           item.status === 'sent' ? `Verstuurd op ${formatDate(item.sent_at)}` :
                           item.status === 'cancelled' ? `Geannuleerd op ${formatDate(item.cancelled_at)}` :
                           `Aangemaakt op ${formatDate(item.created_at)}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => setPreview(item)}
                          style={{
                            padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
                            background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                          }}
                        >
                          Preview
                        </button>
                        {item.status === 'pending' && (
                          <>
                            <button
                              onClick={() => startEdit(item)}
                              style={{
                                padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
                                background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                              }}
                            >
                              Bewerken
                            </button>
                            <button
                              onClick={() => cancelEmail(item.id)}
                              disabled={cancelling === item.id}
                              style={{
                                padding: '5px 12px', borderRadius: 6, border: '1px solid #fecaca',
                                background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                              }}
                            >
                              {cancelling === item.id ? '...' : 'Annuleren'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 12, width: '100%', maxWidth: 680,
              maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{preview.subject}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Aan: {preview.recipient}</div>
              </div>
              <button onClick={() => setPreview(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8', padding: '0 4px' }}>
                &times;
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {preview.body_html ? (
                <iframe
                  srcDoc={preview.body_html}
                  style={{ width: '100%', height: '100%', minHeight: 400, border: 'none' }}
                  title="E-mail preview"
                />
              ) : (
                <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  Geen HTML-inhoud beschikbaar voor deze e-mail.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const FLOW_STEPS = [
  {
    key: 'intake_submitted',
    icon: '📥',
    label: 'Intake ingediend',
    description: 'Klant vult het formulier in op de website.',
    timing: null,
    emails: [],
    color: '#2563eb',
  },
  {
    key: 'instant_emails',
    icon: '⚡',
    label: 'Direct verstuurde e-mails',
    description: 'Worden direct na het indienen verstuurd — niet instelbaar.',
    timing: 'Onmiddellijk',
    emails: [
      { type: 'klant_bevestiging', label: 'Bevestiging aan klant', recipient: 'klant' },
      { type: 'intern_signaal', label: 'Intern lead signaal', recipient: 'intern team' },
    ],
    color: '#16a34a',
  },
  {
    key: 'followup_lead_nieuw',
    icon: '📧',
    label: 'Follow-up naar lead',
    description: 'Verstuurd als intake nog op status "Nieuw" staat na de ingestelde tijd.',
    timingKey: 'followup_lead_nieuw',
    emails: [
      { type: 'followup_lead', label: 'Follow-up naar lead', recipient: 'klant' },
    ],
    color: '#ea580c',
  },
  {
    key: 'followup_intern_nieuw',
    icon: '🔔',
    label: 'Interne herinnering',
    description: 'Herinnering aan het team als de intake nog niet is opgevolgd.',
    timingKey: 'followup_intern_nieuw',
    emails: [
      { type: 'followup_intern', label: 'Interne herinnering', recipient: 'intern team' },
    ],
    color: '#dc2626',
  },
  {
    key: 'followup_lead_offerte',
    icon: '📋',
    label: 'Follow-up na offerte',
    description: 'Verstuurd als intake al een tijdje op status "Offerte" staat.',
    timingKey: 'followup_lead_offerte',
    emails: [
      { type: 'followup_lead', label: 'Follow-up offerte', recipient: 'klant' },
    ],
    color: '#7c3aed',
  },
  {
    key: 'cron',
    icon: '🕘',
    label: 'Dagelijkse verwerking',
    description: 'De follow-up check draait elke dag om 09:00 UTC via een automatische taak.',
    timing: 'Dagelijks 09:00 UTC',
    emails: [],
    color: '#64748b',
  },
];

function formatHours(hours) {
  if (hours < 24) return `${hours} uur`;
  const days = hours / 24;
  return days === Math.floor(days) ? `${days} dag${days !== 1 ? 'en' : ''}` : `${hours} uur`;
}

function TimingTab() {
  const [settings, setSettings] = useState([]);
  const [localSettings, setLocalSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    supabase.from('email_timing_settings').select('*').then(({ data }) => {
      const rows = data || [];
      setSettings(rows);
      const local = {};
      rows.forEach(r => { local[r.key] = { hours: r.hours, enabled: r.enabled }; });
      setLocalSettings(local);
      setLoading(false);
    });
  }, []);

  const updateLocal = (key, field, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const saveSetting = async (key) => {
    setSaving(key);
    const val = localSettings[key];
    await supabase.from('email_timing_settings')
      .update({ hours: Number(val.hours), enabled: val.enabled, updated_at: new Date().toISOString() })
      .eq('key', key);
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  };

  const toggleEnabled = async (key) => {
    const newEnabled = !localSettings[key]?.enabled;
    updateLocal(key, 'enabled', newEnabled);
    await supabase.from('email_timing_settings')
      .update({ enabled: newEnabled, updated_at: new Date().toISOString() })
      .eq('key', key);
  };

  return (
    <div>
      <div style={{ maxWidth: 760 }}>
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">Huidige e-mailflow</h2>
          </div>
          <div className="admin-card-body" style={{ padding: '8px 24px 24px' }}>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8, marginBottom: 24 }}>
              Zo werkt de automatische e-mailflow van begin tot eind. De timing van follow-ups is instelbaar via de instellingen hieronder.
            </p>
            <div style={{ position: 'relative' }}>
              {FLOW_STEPS.map((step, idx) => {
                const timingVal = step.timingKey ? localSettings[step.timingKey] : null;
                const isDisabled = timingVal && timingVal.enabled === false;

                return (
                  <div key={step.key} style={{ display: 'flex', gap: 16, marginBottom: idx < FLOW_STEPS.length - 1 ? 0 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: isDisabled ? '#e2e8f0' : step.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, flexShrink: 0, zIndex: 1, position: 'relative',
                      }}>
                        {step.icon}
                      </div>
                      {idx < FLOW_STEPS.length - 1 && (
                        <div style={{ width: 2, flex: 1, minHeight: 24, background: '#e2e8f0', margin: '2px 0' }} />
                      )}
                    </div>

                    <div style={{ flex: 1, paddingBottom: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: isDisabled ? '#94a3b8' : '#0f172a' }}>
                          {step.label}
                        </span>
                        {step.timing && (
                          <span style={{
                            fontSize: 11, fontWeight: 600,
                            background: '#f8fafc', border: '1px solid #e2e8f0',
                            color: '#475569', borderRadius: 4, padding: '2px 7px',
                          }}>
                            {step.timing}
                          </span>
                        )}
                        {timingVal && !loading && (
                          <span style={{
                            fontSize: 11, fontWeight: 600,
                            background: isDisabled ? '#f1f5f9' : '#eff6ff',
                            border: isDisabled ? '1px solid #e2e8f0' : '1px solid #bfdbfe',
                            color: isDisabled ? '#94a3b8' : '#2563eb',
                            borderRadius: 4, padding: '2px 7px',
                          }}>
                            {isDisabled ? 'Uitgeschakeld' : `Na ${formatHours(timingVal.hours)}`}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, marginBottom: step.emails.length > 0 ? 8 : 0 }}>
                        {step.description}
                      </div>
                      {step.emails.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {step.emails.map(email => (
                            <span key={email.type} style={{
                              fontSize: 11, padding: '3px 9px', borderRadius: 4,
                              background: '#f8fafc', border: '1px solid #e2e8f0',
                              color: '#475569',
                            }}>
                              {email.label} &rarr; {email.recipient}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Timing instellen</h2>
          </div>
          <div className="admin-card-body">
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 0, marginBottom: 20 }}>
              Stel per follow-up in na hoeveel uur deze verstuurd wordt. De check draait dagelijks om 09:00 UTC.
            </p>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>Laden...</div>
            ) : settings.map((setting, idx) => {
              const local = localSettings[setting.key] || { hours: setting.hours, enabled: setting.enabled };
              const step = FLOW_STEPS.find(s => s.timingKey === setting.key);

              return (
                <div key={setting.key} style={{ padding: '20px 0', borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none', opacity: local.enabled ? 1 : 0.6 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        {step ? step.label : setting.key}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {step ? step.description : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleEnabled(setting.key)}
                      style={{
                        flexShrink: 0,
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px', borderRadius: 20,
                        border: local.enabled ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        background: local.enabled ? '#f0fdf4' : '#f8fafc',
                        color: local.enabled ? '#16a34a' : '#94a3b8',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: local.enabled ? '#16a34a' : '#cbd5e1',
                        display: 'inline-block',
                      }} />
                      {local.enabled ? 'Actief' : 'Uitgeschakeld'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: '#475569' }}>Verstuur na</span>
                      <input
                        type="number"
                        min={1}
                        max={720}
                        className="admin-form-input"
                        value={local.hours}
                        onChange={e => updateLocal(setting.key, 'hours', e.target.value)}
                        style={{ width: 80, textAlign: 'center' }}
                      />
                      <span style={{ fontSize: 13, color: '#475569' }}>uur</span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>({formatHours(Number(local.hours))})</span>
                    </div>
                    <button
                      className="admin-btn admin-btn--primary admin-btn--sm"
                      onClick={() => saveSetting(setting.key)}
                      disabled={saving === setting.key}
                    >
                      {saving === setting.key ? 'Opslaan...' : 'Opslaan'}
                    </button>
                    {saved === setting.key && (
                      <span style={{ fontSize: 12, color: '#16a34a' }}>Opgeslagen</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplatesTab() {
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
    await supabase.from('email_templates').update({ enabled: newEnabled }).eq('id', template.id);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="admin-card">
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
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 20,
                    border: template.enabled !== false ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                    background: template.enabled !== false ? '#f0fdf4' : '#f8fafc',
                    color: template.enabled !== false ? '#16a34a' : '#94a3b8',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
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
    </div>
  );
}

export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState('queue');

  const tabs = [
    { id: 'queue', label: 'Wachtrij' },
    { id: 'templates', label: 'Templates' },
    { id: 'timing', label: 'Timing & Flow' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">E-mails</h1>
        <p className="admin-page-subtitle">Geplande en verstuurde automatische e-mails</p>
      </div>

      <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid #e2e8f0' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
              background: 'none',
              color: activeTab === tab.id ? '#2563eb' : '#64748b',
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'queue' && <QueueTab />}
      {activeTab === 'templates' && <TemplatesTab />}
      {activeTab === 'timing' && <TimingTab />}
    </div>
  );
}
