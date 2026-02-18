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

const TIMING_KEY_BY_TEMPLATE_TYPE = {
  followup_lead: 'followup_lead_nieuw',
  followup_intern: 'followup_intern_nieuw',
};

const TIMING_DESC_BY_KEY = {
  followup_lead_nieuw: 'Verstuur als intake na X uur nog op "Nieuw" staat.',
  followup_intern_nieuw: 'Stuur intern een herinnering als intake na X uur nog niet is opgevolgd.',
  followup_lead_offerte: 'Verstuur als offerte na X uur nog niet is geaccepteerd.',
};

function formatHours(hours) {
  if (hours < 24) return `${hours} uur`;
  const days = hours / 24;
  return days === Math.floor(days) ? `${days} dag${days !== 1 ? 'en' : ''}` : `${hours} uur`;
}

function TemplatesTab() {
  const [templates, setTemplates] = useState([]);
  const [timingSettings, setTimingSettings] = useState({});
  const [localTiming, setLocalTiming] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingTemplate, setSavingTemplate] = useState(null);
  const [savedTemplate, setSavedTemplate] = useState(null);
  const [savingTiming, setSavingTiming] = useState(null);
  const [savedTiming, setSavedTiming] = useState(null);

  useEffect(() => {
    Promise.all([
      supabase.from('email_templates').select('*').order('type'),
      supabase.from('email_timing_settings').select('*'),
    ]).then(([{ data: tplData }, { data: timData }]) => {
      setTemplates(tplData || []);
      const tMap = {};
      const lMap = {};
      (timData || []).forEach(r => {
        tMap[r.key] = r;
        lMap[r.key] = { hours: r.hours, enabled: r.enabled };
      });
      setTimingSettings(tMap);
      setLocalTiming(lMap);
      setLoading(false);
    });
  }, []);

  const updateTemplate = (id, field, value) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const saveTemplate = async (template) => {
    setSavingTemplate(template.id);
    await supabase.from('email_templates')
      .update({ subject: template.subject, intro: template.intro, enabled: template.enabled })
      .eq('id', template.id);
    setSavingTemplate(null);
    setSavedTemplate(template.id);
    setTimeout(() => setSavedTemplate(null), 2000);
  };

  const toggleTemplateEnabled = async (template) => {
    const newEnabled = !template.enabled;
    updateTemplate(template.id, 'enabled', newEnabled);
    await supabase.from('email_templates').update({ enabled: newEnabled }).eq('id', template.id);
  };

  const updateLocalTiming = (key, field, value) => {
    setLocalTiming(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const saveTimingSetting = async (key) => {
    setSavingTiming(key);
    const val = localTiming[key];
    await supabase.from('email_timing_settings')
      .update({ hours: Number(val.hours), enabled: val.enabled, updated_at: new Date().toISOString() })
      .eq('key', key);
    setSavingTiming(null);
    setSavedTiming(key);
    setTimeout(() => setSavedTiming(null), 2000);
  };

  const toggleTimingEnabled = async (key) => {
    const newEnabled = !localTiming[key]?.enabled;
    updateLocalTiming(key, 'enabled', newEnabled);
    await supabase.from('email_timing_settings')
      .update({ enabled: newEnabled, updated_at: new Date().toISOString() })
      .eq('key', key);
  };

  const offerteTiming = timingSettings['followup_lead_offerte'];
  const offerteLocal = localTiming['followup_lead_offerte'];

  const flowSteps = [
    {
      icon: '📥', label: 'Intake ingediend', sub: 'Klant vult formulier in', timing: null, color: '#2563eb', enabled: true,
    },
    {
      icon: '⚡', label: 'Bevestiging & signaal', sub: 'Direct verstuurd', timing: 'Onmiddellijk', color: '#16a34a', enabled: true,
    },
    {
      icon: '📧', label: 'Follow-up lead', sub: 'Als intake nog "Nieuw" is', timingKey: 'followup_lead_nieuw', color: '#ea580c',
    },
    {
      icon: '🔔', label: 'Interne herinnering', sub: 'Als intake nog niet opgepakt', timingKey: 'followup_intern_nieuw', color: '#dc2626',
    },
    {
      icon: '📋', label: 'Follow-up offerte', sub: 'Als offerte lang open staat', timingKey: 'followup_lead_offerte', color: '#0369a1',
    },
    {
      icon: '🕘', label: 'Dagelijkse check', sub: 'Elke dag om 09:00 UTC', timing: 'Dagelijks', color: '#64748b', enabled: true,
    },
  ];

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Templates & Timing</h2>
        </div>
        <div className="admin-card-body">
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 0, marginBottom: 4 }}>
            Pas per automatische e-mail de tekst, het onderwerp en de verzenddatum aan. De follow-up check draait dagelijks om 09:00 UTC.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>Laden...</div>
          ) : (
            <>
              {templates.map((template, idx) => {
                const timingKey = TIMING_KEY_BY_TEMPLATE_TYPE[template.type];
                const timing = timingKey ? localTiming[timingKey] : null;
                const isDisabledByTiming = timing && timing.enabled === false;
                const isDisabledByTemplate = template.enabled === false;
                const isDisabled = isDisabledByTemplate || isDisabledByTiming;

                return (
                  <div key={template.id} style={{
                    padding: '24px 0',
                    borderTop: idx === 0 ? '1px solid #f1f5f9' : '1px solid #e2e8f0',
                    marginTop: idx === 0 ? 16 : 0,
                    opacity: isDisabled ? 0.65 : 1,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                          {TYPE_LABELS[template.type] || template.type}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{template.type}</div>
                      </div>
                      <button
                        onClick={() => toggleTemplateEnabled(template)}
                        style={{
                          flexShrink: 0,
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

                    {timingKey && timing && (
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        padding: '14px 16px',
                        marginTop: 4,
                        marginBottom: 16,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Timing</div>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                              {TIMING_DESC_BY_KEY[timingKey]}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleTimingEnabled(timingKey)}
                            style={{
                              flexShrink: 0,
                              display: 'flex', alignItems: 'center', gap: 5,
                              padding: '3px 9px', borderRadius: 20,
                              border: timing.enabled ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                              background: timing.enabled ? '#f0fdf4' : '#f8fafc',
                              color: timing.enabled ? '#16a34a' : '#94a3b8',
                              fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            <span style={{
                              width: 7, height: 7, borderRadius: '50%',
                              background: timing.enabled ? '#16a34a' : '#cbd5e1',
                              display: 'inline-block',
                            }} />
                            {timing.enabled ? 'Actief' : 'Uit'}
                          </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 12, color: '#64748b' }}>Verstuur na</span>
                          <input
                            type="number"
                            min={1}
                            max={720}
                            className="admin-form-input"
                            value={timing.hours}
                            onChange={e => updateLocalTiming(timingKey, 'hours', e.target.value)}
                            style={{ width: 72, textAlign: 'center', padding: '5px 8px', fontSize: 13 }}
                          />
                          <span style={{ fontSize: 12, color: '#64748b' }}>uur</span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>({formatHours(Number(timing.hours))})</span>
                          <button
                            className="admin-btn admin-btn--sm"
                            onClick={() => saveTimingSetting(timingKey)}
                            disabled={savingTiming === timingKey}
                            style={{ background: '#e0f2fe', border: '1px solid #bae6fd', color: '#0369a1', marginLeft: 2 }}
                          >
                            {savingTiming === timingKey ? 'Opslaan...' : 'Opslaan'}
                          </button>
                          {savedTiming === timingKey && (
                            <span style={{ fontSize: 11, color: '#16a34a' }}>Opgeslagen</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button
                        className="admin-btn admin-btn--primary admin-btn--sm"
                        onClick={() => saveTemplate(template)}
                        disabled={savingTemplate === template.id}
                      >
                        {savingTemplate === template.id ? 'Opslaan...' : 'Template opslaan'}
                      </button>
                      {savedTemplate === template.id && (
                        <span style={{ fontSize: 12, color: '#16a34a' }}>Opgeslagen</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {offerteTiming && offerteLocal && (
                <div style={{ padding: '24px 0', borderTop: '1px solid #e2e8f0', opacity: offerteLocal.enabled ? 1 : 0.65 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Follow-up na offerte</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>followup_lead_offerte — geen aanpasbare template, vaste tekst</div>
                    </div>
                    <button
                      onClick={() => toggleTimingEnabled('followup_lead_offerte')}
                      style={{
                        flexShrink: 0,
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px', borderRadius: 20,
                        border: offerteLocal.enabled ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        background: offerteLocal.enabled ? '#f0fdf4' : '#f8fafc',
                        color: offerteLocal.enabled ? '#16a34a' : '#94a3b8',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: offerteLocal.enabled ? '#16a34a' : '#cbd5e1',
                        display: 'inline-block',
                      }} />
                      {offerteLocal.enabled ? 'Actief' : 'Uitgeschakeld'}
                    </button>
                  </div>

                  <div style={{
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 8, padding: '14px 16px',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Timing</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>
                      {TIMING_DESC_BY_KEY['followup_lead_offerte']}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Verstuur na</span>
                      <input
                        type="number"
                        min={1}
                        max={720}
                        className="admin-form-input"
                        value={offerteLocal.hours}
                        onChange={e => updateLocalTiming('followup_lead_offerte', 'hours', e.target.value)}
                        style={{ width: 72, textAlign: 'center', padding: '5px 8px', fontSize: 13 }}
                      />
                      <span style={{ fontSize: 12, color: '#64748b' }}>uur</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>({formatHours(Number(offerteLocal.hours))})</span>
                      <button
                        className="admin-btn admin-btn--sm"
                        onClick={() => saveTimingSetting('followup_lead_offerte')}
                        disabled={savingTiming === 'followup_lead_offerte'}
                        style={{ background: '#e0f2fe', border: '1px solid #bae6fd', color: '#0369a1', marginLeft: 2 }}
                      >
                        {savingTiming === 'followup_lead_offerte' ? 'Opslaan...' : 'Opslaan'}
                      </button>
                      {savedTiming === 'followup_lead_offerte' && (
                        <span style={{ fontSize: 11, color: '#16a34a' }}>Opgeslagen</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>

      <div style={{ width: 240, flexShrink: 0 }}>
        <div className="admin-card" style={{ position: 'sticky', top: 24 }}>
          <div className="admin-card-header" style={{ paddingBottom: 12 }}>
            <h2 className="admin-card-title" style={{ fontSize: 13 }}>E-mailflow</h2>
          </div>
          <div className="admin-card-body" style={{ padding: '8px 16px 16px' }}>
            {flowSteps.map((step, idx) => {
              const timingVal = step.timingKey ? localTiming[step.timingKey] : null;
              const isOff = timingVal ? timingVal.enabled === false : false;
              const dotColor = isOff ? '#cbd5e1' : step.color;

              return (
                <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: isOff ? '#f1f5f9' : `${step.color}18`,
                      border: `2px solid ${dotColor}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, flexShrink: 0,
                    }}>
                      {step.icon}
                    </div>
                    {idx < flowSteps.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 16, background: '#e2e8f0', margin: '2px 0' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 14, paddingTop: 2 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isOff ? '#94a3b8' : '#0f172a', lineHeight: 1.3 }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{step.sub}</div>
                    {(step.timing || timingVal) && (
                      <div style={{
                        display: 'inline-block',
                        marginTop: 4,
                        fontSize: 10, fontWeight: 600,
                        background: isOff ? '#f1f5f9' : '#f8fafc',
                        border: `1px solid ${isOff ? '#e2e8f0' : dotColor + '40'}`,
                        color: isOff ? '#94a3b8' : dotColor,
                        borderRadius: 4,
                        padding: '2px 6px',
                      }}>
                        {step.timing
                          ? step.timing
                          : isOff
                            ? 'Uitgeschakeld'
                            : `Na ${formatHours(Number(timingVal.hours))}`}
                      </div>
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

export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState('queue');

  const tabs = [
    { id: 'queue', label: 'Wachtrij' },
    { id: 'templates', label: 'Templates & Timing' },
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
    </div>
  );
}
