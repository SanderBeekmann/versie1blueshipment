import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import '../styles/admin.css';

const statusLabels = {
  nieuw: 'Nieuw',
  in_behandeling: 'In behandeling',
  offerte: 'Offerte',
  gewonnen: 'Gewonnen',
  verloren: 'Verloren',
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function DashboardPage() {
  const { adminUser } = useAuth();
  const [stats, setStats] = useState({ total: 0, nieuw: 0, gewonnen: 0, deze_week: 0 });
  const [recent, setRecent] = useState([]);
  const [openTasks, setOpenTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [intakesRes, recentRes, tasksRes] = await Promise.all([
        supabase.from('intakes').select('status, created_at'),
        supabase.from('intakes').select('id, naam, email, status, diensten, created_at').order('created_at', { ascending: false }).limit(8),
        supabase.from('crm_tasks').select('id, title, due_date, intake_id, intakes(naam)').eq('completed', false).order('due_date', { ascending: true }).limit(5),
      ]);

      if (intakesRes.data) {
        const all = intakesRes.data;
        setStats({
          total: all.length,
          nieuw: all.filter(i => i.status === 'nieuw').length,
          gewonnen: all.filter(i => i.status === 'gewonnen').length,
          deze_week: all.filter(i => new Date(i.created_at) >= weekAgo).length,
        });
      }

      if (recentRes.data) setRecent(recentRes.data);
      if (tasksRes.data) setOpenTasks(tasksRes.data);

      setLoading(false);
    }
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Goedemorgen' : hour < 18 ? 'Goedemiddag' : 'Goedenavond';

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">{greeting}{adminUser?.naam ? `, ${adminUser.naam.split(' ')[0]}` : ''}</h1>
        <p className="admin-page-subtitle">Overzicht van recente activiteit en openstaande taken</p>
      </div>

      {loading ? (
        <div className="admin-loading" style={{ minHeight: 200 }}>
          <div className="admin-loading-spinner" />
        </div>
      ) : (
        <>
          <div className="admin-kpi-grid">
            <div className="admin-kpi-card">
              <div className="admin-kpi-label">Totaal intakes</div>
              <div className="admin-kpi-value">{stats.total}</div>
            </div>
            <div className="admin-kpi-card">
              <div className="admin-kpi-label">Nieuw</div>
              <div className="admin-kpi-value" style={{ color: '#2563eb' }}>{stats.nieuw}</div>
              <div className="admin-kpi-meta">Wachten op opvolging</div>
            </div>
            <div className="admin-kpi-card">
              <div className="admin-kpi-label">Deze week</div>
              <div className="admin-kpi-value">{stats.deze_week}</div>
              <div className="admin-kpi-meta">Afgelopen 7 dagen</div>
            </div>
            <div className="admin-kpi-card">
              <div className="admin-kpi-label">Gewonnen</div>
              <div className="admin-kpi-value" style={{ color: '#16a34a' }}>{stats.gewonnen}</div>
            </div>
            <div className="admin-kpi-card">
              <div className="admin-kpi-label">Conversieratio</div>
              <div className="admin-kpi-value" style={{ color: stats.total > 0 && stats.gewonnen / stats.total >= 0.1 ? '#16a34a' : '#0f172a' }}>
                {stats.total > 0 ? Math.round((stats.gewonnen / stats.total) * 100) : 0}%
              </div>
              <div className="admin-kpi-meta">Nieuw → Gewonnen</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
            <div className="admin-table-wrapper">
              <div className="admin-table-header">
                <h2 className="admin-table-title">Recente intakes</h2>
                <Link to="/admin/intakes" className="admin-btn admin-btn--secondary admin-btn--sm">Alle intakes</Link>
              </div>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Naam</th>
                      <th>Diensten</th>
                      <th>Status</th>
                      <th>Datum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8', fontSize: 13 }}>Nog geen intakes</td></tr>
                    ) : recent.map(intake => (
                      <tr key={intake.id}>
                        <td>
                          <Link to={`/admin/intakes/${intake.id}`} className="admin-table-link">
                            {intake.naam || intake.email}
                          </Link>
                        </td>
                        <td style={{ color: '#64748b', fontSize: 12 }}>
                          {Array.isArray(intake.diensten) ? intake.diensten.join(', ') : '—'}
                        </td>
                        <td>
                          <span className={`admin-badge admin-badge--${intake.status}`}>
                            {statusLabels[intake.status] || intake.status}
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>
                          {formatDate(intake.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Openstaande taken</h2>
                <Link to="/admin/crm" className="admin-btn admin-btn--secondary admin-btn--sm">Alle taken</Link>
              </div>
              <div className="admin-card-body" style={{ padding: 0 }}>
                {openTasks.length === 0 ? (
                  <div className="admin-empty" style={{ padding: '32px 20px' }}>
                    <div className="admin-empty-text">Geen openstaande taken</div>
                  </div>
                ) : openTasks.map(task => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                  return (
                    <div key={task.id} style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a', marginBottom: 4 }}>
                        {task.title}
                      </div>
                      {task.intakes?.naam && (
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {task.intakes.naam}
                        </div>
                      )}
                      {task.due_date && (
                        <div style={{ fontSize: 11, color: isOverdue ? '#dc2626' : '#94a3b8', marginTop: 4 }}>
                          {isOverdue ? 'Verlopen: ' : 'Voor: '}{formatDate(task.due_date)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
