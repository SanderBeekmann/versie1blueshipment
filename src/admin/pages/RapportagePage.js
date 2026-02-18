import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import '../styles/admin.css';

function formatWeek(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

export default function RapportagePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: intakes } = await supabase
        .from('intakes')
        .select('id, status, verkoopkanaal, diensten, shipment_volume, created_at')
        .order('created_at', { ascending: false });

      if (!intakes) { setLoading(false); return; }

      const kanaalCount = {};
      const dienstCount = {};
      const statusCount = {};
      const volumeRanges = { '0–50': 0, '51–250': 0, '251–1000': 0, '1001–10000': 0 };
      const weeklyCount = {};

      intakes.forEach(intake => {
        kanaalCount[intake.verkoopkanaal] = (kanaalCount[intake.verkoopkanaal] || 0) + 1;
        statusCount[intake.status] = (statusCount[intake.status] || 0) + 1;

        if (Array.isArray(intake.diensten)) {
          intake.diensten.forEach(d => {
            dienstCount[d] = (dienstCount[d] || 0) + 1;
          });
        }

        const vol = intake.shipment_volume || 0;
        if (vol <= 50) volumeRanges['0–50']++;
        else if (vol <= 250) volumeRanges['51–250']++;
        else if (vol <= 1000) volumeRanges['251–1000']++;
        else volumeRanges['1001–10000']++;

        const weekStart = new Date(intake.created_at);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        weeklyCount[weekKey] = (weeklyCount[weekKey] || 0) + 1;
      });

      const recentIntakes = intakes.filter(i => new Date(i.created_at) >= thirtyDaysAgo);
      const weeklyData = Object.entries(weeklyCount)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-8)
        .map(([date, count]) => ({ date, count }));

      setData({
        total: intakes.length,
        recent30: recentIntakes.length,
        kanaalCount,
        dienstCount,
        statusCount,
        volumeRanges,
        weeklyData,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="admin-loading" style={{ minHeight: 200 }}><div className="admin-loading-spinner" /></div>;
  if (!data) return null;

  const maxWeekly = Math.max(...data.weeklyData.map(w => w.count), 1);
  const maxKanaal = Math.max(...Object.values(data.kanaalCount), 1);
  const maxDienst = Math.max(...Object.values(data.dienstCount), 1);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Rapportage</h1>
        <p className="admin-page-subtitle">Inzicht in intakes en conversie</p>
      </div>

      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Totaal intakes</div>
          <div className="admin-kpi-value">{data.total}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Afgelopen 30 dagen</div>
          <div className="admin-kpi-value">{data.recent30}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Gewonnen</div>
          <div className="admin-kpi-value" style={{ color: '#16a34a' }}>{data.statusCount.gewonnen || 0}</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Conversieratio</div>
          <div className="admin-kpi-value">
            {data.total > 0 ? Math.round(((data.statusCount.gewonnen || 0) / data.total) * 100) : 0}%
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="admin-card">
          <div className="admin-card-header"><h2 className="admin-card-title">Intakes per week</h2></div>
          <div className="admin-card-body">
            {data.weeklyData.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>Geen data</p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
                {data.weeklyData.map(({ date, count }) => (
                  <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{count}</span>
                    <div
                      style={{
                        width: '100%',
                        background: '#2563eb',
                        borderRadius: '3px 3px 0 0',
                        height: `${(count / maxWeekly) * 80}px`,
                        minHeight: count > 0 ? 4 : 0,
                        opacity: 0.8,
                      }}
                    />
                    <span style={{ fontSize: 9, color: '#94a3b8', whiteSpace: 'nowrap' }}>{formatWeek(date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header"><h2 className="admin-card-title">Status verdeling</h2></div>
          <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { key: 'nieuw', label: 'Nieuw', color: '#2563eb' },
              { key: 'in_behandeling', label: 'In behandeling', color: '#d97706' },
              { key: 'offerte', label: 'Offerte', color: '#059669' },
              { key: 'gewonnen', label: 'Gewonnen', color: '#16a34a' },
              { key: 'verloren', label: 'Verloren', color: '#dc2626' },
            ].map(({ key, label, color }) => {
              const count = data.statusCount[key] || 0;
              const pct = data.total > 0 ? (count / data.total) * 100 : 0;
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#374151' }}>{label}</span>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>{count}</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: 4, height: 6 }}>
                    <div style={{ background: color, height: 6, borderRadius: 4, width: `${pct}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        <div className="admin-card">
          <div className="admin-card-header"><h2 className="admin-card-title">Verkoopkanaal</h2></div>
          <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(data.kanaalCount).sort(([, a], [, b]) => b - a).map(([kanaal, count]) => (
              <div key={kanaal}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#374151' }}>{kanaal}</span>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>{count}</span>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: 4, height: 6 }}>
                  <div style={{ background: '#0ea5e9', height: 6, borderRadius: 4, width: `${(count / maxKanaal) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header"><h2 className="admin-card-title">Populairste diensten</h2></div>
          <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(data.dienstCount).sort(([, a], [, b]) => b - a).map(([dienst, count]) => (
              <div key={dienst}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#374151' }}>{dienst}</span>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>{count}</span>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: 4, height: 6 }}>
                  <div style={{ background: '#8b5cf6', height: 6, borderRadius: 4, width: `${(count / maxDienst) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header"><h2 className="admin-card-title">Shipments range</h2></div>
          <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(data.volumeRanges).map(([range, count]) => {
              const maxVol = Math.max(...Object.values(data.volumeRanges), 1);
              return (
                <div key={range}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#374151' }}>{range}</span>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>{count}</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: 4, height: 6 }}>
                    <div style={{ background: '#f59e0b', height: 6, borderRadius: 4, width: `${(count / maxVol) * 100}%` }} />
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
