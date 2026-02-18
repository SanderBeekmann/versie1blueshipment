import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import '../styles/admin.css';

const STATUS_OPTIONS = ['nieuw', 'in_behandeling', 'offerte', 'gewonnen', 'verloren'];
const STATUS_LABELS = {
  nieuw: 'Nieuw',
  in_behandeling: 'In behandeling',
  offerte: 'Offerte',
  gewonnen: 'Gewonnen',
  verloren: 'Verloren',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function IntakeDetailPage() {
  const { id } = useParams();
  const { adminUser } = useAuth();
  const navigate = useNavigate();

  const [intake, setIntake] = useState(null);
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const [newTask, setNewTask] = useState({ title: '', due_date: '' });
  const [savingTask, setSavingTask] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = useCallback(async () => {
    const [intakeRes, notesRes, tasksRes, logsRes] = await Promise.all([
      supabase.from('intakes').select('*').eq('id', id).maybeSingle(),
      supabase.from('crm_notes').select('*, admin_users(naam)').eq('intake_id', id).order('created_at', { ascending: false }),
      supabase.from('crm_tasks').select('*, admin_users!crm_tasks_assigned_to_fkey(naam)').eq('intake_id', id).order('created_at', { ascending: false }),
      supabase.from('email_logs').select('*').eq('intake_id', id).order('created_at', { ascending: false }),
    ]);

    if (!intakeRes.data) { navigate('/admin/intakes'); return; }
    setIntake(intakeRes.data);
    setNotes(notesRes.data || []);
    setTasks(tasksRes.data || []);
    setEmailLogs(logsRes.data || []);
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (status) => {
    setUpdatingStatus(true);
    await supabase.from('intakes').update({ status }).eq('id', id);
    setIntake(prev => ({ ...prev, status }));
    setUpdatingStatus(false);
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    const { data } = await supabase
      .from('crm_notes')
      .insert({ intake_id: id, author_id: adminUser.id, content: newNote.trim() })
      .select('*, admin_users(naam)')
      .single();
    if (data) setNotes(prev => [data, ...prev]);
    setNewNote('');
    setSavingNote(false);
  };

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    setSavingTask(true);
    const { data } = await supabase
      .from('crm_tasks')
      .insert({
        intake_id: id,
        created_by: adminUser.id,
        assigned_to: adminUser.id,
        title: newTask.title.trim(),
        due_date: newTask.due_date || null,
      })
      .select('*, admin_users!crm_tasks_assigned_to_fkey(naam)')
      .single();
    if (data) setTasks(prev => [data, ...prev]);
    setNewTask({ title: '', due_date: '' });
    setSavingTask(false);
  };

  const toggleTask = async (task) => {
    const completed = !task.completed;
    await supabase.from('crm_tasks').update({ completed, completed_at: completed ? new Date().toISOString() : null }).eq('id', task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed } : t));
  };

  if (loading) return <div className="admin-loading" style={{ minHeight: 300 }}><div className="admin-loading-spinner" /></div>;
  if (!intake) return null;

  return (
    <div>
      <Link to="/admin/intakes" className="admin-back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Terug naar intakes
      </Link>

      <div className="intake-pipeline-bar">
        {STATUS_OPTIONS.map((s, idx) => {
          const currentIdx = STATUS_OPTIONS.indexOf(intake.status);
          const isActive = s === intake.status;
          const isDone = idx < currentIdx;
          const isNext = idx === currentIdx + 1;
          const isLast = idx === STATUS_OPTIONS.length - 1;
          return (
            <React.Fragment key={s}>
              <button
                className={`pipeline-step${isActive ? ' pipeline-step--active' : ''}${isDone ? ' pipeline-step--done' : ''}${isNext ? ' pipeline-step--next' : ''}`}
                data-status={s}
                onClick={() => !isActive && !updatingStatus && updateStatus(s)}
                disabled={updatingStatus || isActive}
                title={`Zet op ${STATUS_LABELS[s]}`}
              >
                {isDone && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5, flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
                {STATUS_LABELS[s]}
              </button>
              {!isLast && (
                <svg className={`pipeline-arrow${isDone || isActive ? ' pipeline-arrow--active' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{intake.naam || intake.email}</h1>
          <p className="admin-page-subtitle">Aangemeld op {formatDate(intake.created_at)}</p>
        </div>
      </div>

      <div className="admin-detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Notities */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Notities</h2>
            </div>
            <div className="admin-card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <textarea
                  className="admin-form-textarea"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Schrijf een notitie..."
                  rows={3}
                  onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) addNote(); }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={addNote} disabled={savingNote || !newNote.trim()}>
                    {savingNote ? 'Opslaan...' : 'Notitie toevoegen'}
                  </button>
                </div>
              </div>
              {notes.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>Nog geen notities</p>
              ) : notes.map(note => (
                <div key={note.id} style={{ padding: '12px 0', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{note.content}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                    {note.admin_users?.naam || 'Teamlid'} · {formatDate(note.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Taken */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Taken</h2>
            </div>
            <div className="admin-card-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                  className="admin-form-input"
                  style={{ flex: 1, minWidth: 180 }}
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Omschrijving taak..."
                  onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }}
                />
                <input
                  type="date"
                  className="admin-form-input"
                  style={{ width: 140 }}
                  value={newTask.due_date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                />
                <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={addTask} disabled={savingTask || !newTask.title.trim()}>
                  Toevoegen
                </button>
              </div>
              {tasks.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>Geen taken</p>
              ) : tasks.map(task => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderTop: '1px solid #f1f5f9' }}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task)}
                    style={{ marginTop: 2, cursor: 'pointer', accentColor: '#2563eb' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: task.completed ? '#94a3b8' : '#0f172a', textDecoration: task.completed ? 'line-through' : 'none' }}>
                      {task.title}
                    </div>
                    {task.due_date && (
                      <div style={{ fontSize: 11, color: !task.completed && new Date(task.due_date) < new Date() ? '#dc2626' : '#94a3b8', marginTop: 3 }}>
                        Voor {new Date(task.due_date).toLocaleDateString('nl-NL')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* E-mail logs */}
          {emailLogs.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">E-mail log</h2>
              </div>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr><th>Type</th><th>Ontvanger</th><th>Status</th><th>Datum</th></tr>
                  </thead>
                  <tbody>
                    {emailLogs.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontSize: 12 }}>{log.type}</td>
                        <td style={{ fontSize: 12 }}>{log.recipient}</td>
                        <td><span className={`admin-badge admin-badge--${log.status}`}>{log.status}</span></td>
                        <td style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(log.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Rechter kolom: contactgegevens + funnel data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="admin-card">
            <div className="admin-card-header"><h2 className="admin-card-title">Contactgegevens</h2></div>
            <div className="admin-card-body">
              <div className="admin-field-row">
                <span className="admin-field-label">Naam</span>
                <span className="admin-field-value">{intake.naam || '—'}</span>
              </div>
              <div className="admin-field-row">
                <span className="admin-field-label">E-mail</span>
                <span className="admin-field-value"><a href={`mailto:${intake.email}`}>{intake.email}</a></span>
              </div>
              <div className="admin-field-row">
                <span className="admin-field-label">Telefoon</span>
                <span className="admin-field-value"><a href={`tel:${intake.telefoon}`}>{intake.telefoon || '—'}</a></span>
              </div>
              <div className="admin-field-row">
                <span className="admin-field-label">Bedrijf</span>
                <span className="admin-field-value">{intake.bedrijf || '—'}</span>
              </div>
              <div className="admin-field-row">
                <span className="admin-field-label">Website</span>
                <span className="admin-field-value">
                  {intake.website ? <a href={intake.website} target="_blank" rel="noreferrer">{intake.website}</a> : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header"><h2 className="admin-card-title">Funnel antwoorden</h2></div>
            <div className="admin-card-body">
              <div className="admin-field-row">
                <span className="admin-field-label">Verkoopkanaal</span>
                <span className="admin-field-value">{intake.verkoopkanaal || '—'}</span>
              </div>
              <div className="admin-field-row">
                <span className="admin-field-label">Diensten</span>
                <span className="admin-field-value">
                  {Array.isArray(intake.diensten) && intake.diensten.length > 0
                    ? intake.diensten.map(d => (
                      <span key={d} style={{ display: 'inline-block', background: '#eff6ff', color: '#1d4ed8', fontSize: 11, fontWeight: 600, borderRadius: 4, padding: '2px 8px', marginRight: 4, marginBottom: 4 }}>{d}</span>
                    ))
                    : '—'}
                </span>
              </div>
              <div className="admin-field-row">
                <span className="admin-field-label">Shipments / maand</span>
                <span className="admin-field-value" style={{ fontWeight: 600, fontSize: 18, color: '#0f172a' }}>
                  {intake.shipment_volume ?? '—'}
                </span>
              </div>
              <div className="admin-field-row">
                <span className="admin-field-label">Grootste uitdaging</span>
                <span className="admin-field-value">{intake.grootste_uitdaging || '—'}</span>
              </div>
              {intake.preferred_date && (
                <div className="admin-field-row">
                  <span className="admin-field-label">Voorkeursdatum</span>
                  <span className="admin-field-value" style={{ color: '#0070ff', fontWeight: 600 }}>
                    {new Date(intake.preferred_date + 'T00:00:00').toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {intake.preferred_time && ` om ${intake.preferred_time}`}
                  </span>
                </div>
              )}
              <div className="admin-field-row">
                <span className="admin-field-label">Consent</span>
                <span className="admin-field-value">{intake.consent ? '✓ Ja' : '✗ Nee'}</span>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header"><h2 className="admin-card-title">Metadata</h2></div>
            <div className="admin-card-body">
              <div className="admin-field-row">
                <span className="admin-field-label">Intake ID</span>
                <span className="admin-field-value" style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>{intake.id}</span>
              </div>
              <div className="admin-field-row">
                <span className="admin-field-label">Aangemeld</span>
                <span className="admin-field-value">{formatDate(intake.created_at)}</span>
              </div>
              <div className="admin-field-row">
                <span className="admin-field-label">Laatste update</span>
                <span className="admin-field-value">{formatDate(intake.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
