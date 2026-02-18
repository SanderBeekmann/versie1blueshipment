import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import '../styles/admin.css';

const STATUSES = ['nieuw', 'in_behandeling', 'offerte', 'gewonnen', 'verloren'];
const STATUS_LABELS = {
  nieuw: 'Nieuw',
  in_behandeling: 'In behandeling',
  offerte: 'Offerte',
  gewonnen: 'Gewonnen',
  verloren: 'Verloren',
};
const STATUS_COLORS = {
  nieuw: '#2563eb',
  in_behandeling: '#d97706',
  offerte: '#059669',
  gewonnen: '#16a34a',
  verloren: '#dc2626',
};

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

export default function CrmPage() {
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    let query = supabase
      .from('intakes')
      .select('id, naam, email, bedrijf, diensten, shipment_volume, status, created_at, tags')
      .order('created_at', { ascending: false });

    if (search.trim()) {
      query = query.or(`naam.ilike.%${search}%,email.ilike.%${search}%,bedrijf.ilike.%${search}%`);
    }

    const { data } = await query;
    const grouped = {};
    STATUSES.forEach(s => { grouped[s] = []; });
    (data || []).forEach(item => {
      if (grouped[item.status]) grouped[item.status].push(item);
    });
    setColumns(grouped);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="admin-page-title">CRM Pipeline</h1>
          <p className="admin-page-subtitle">Leads en klanten per fase</p>
        </div>
        <input
          type="text"
          className="admin-search-input"
          placeholder="Zoek op naam, e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="admin-loading" style={{ minHeight: 200 }}><div className="admin-loading-spinner" /></div>
      ) : (
        <div className="crm-board">
          {STATUSES.map(status => {
            const items = columns[status] || [];
            return (
              <div key={status} className="crm-column">
                <div className="crm-column-header">
                  <span className="crm-column-dot" style={{ background: STATUS_COLORS[status] }} />
                  <span className="crm-column-title">{STATUS_LABELS[status]}</span>
                  <span className="crm-column-count">{items.length}</span>
                </div>
                <div className="crm-column-body">
                  {items.length === 0 ? (
                    <div className="crm-empty">Leeg</div>
                  ) : items.map(item => (
                    <Link key={item.id} to={`/admin/intakes/${item.id}`} className="crm-card">
                      <div className="crm-card-name">{item.naam || item.email}</div>
                      {item.bedrijf && <div className="crm-card-company">{item.bedrijf}</div>}
                      <div className="crm-card-meta">
                        {Array.isArray(item.diensten) && item.diensten.length > 0 && (
                          <span className="crm-card-tag">{item.diensten[0]}{item.diensten.length > 1 ? ` +${item.diensten.length - 1}` : ''}</span>
                        )}
                        {item.shipment_volume > 0 && (
                          <span className="crm-card-shipments">{item.shipment_volume.toLocaleString('nl-NL')} ship.</span>
                        )}
                      </div>
                      <div className="crm-card-date">{formatDate(item.created_at)}</div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .crm-board {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          align-items: start;
          overflow-x: auto;
        }
        .crm-column {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          min-width: 180px;
        }
        .crm-column-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          border-bottom: 1px solid #e2e8f0;
        }
        .crm-column-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .crm-column-title {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          flex: 1;
        }
        .crm-column-count {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          background: #e2e8f0;
          border-radius: 10px;
          padding: 1px 7px;
        }
        .crm-column-body {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .crm-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          text-decoration: none;
          display: block;
          transition: box-shadow 0.15s, border-color 0.15s;
        }
        .crm-card:hover {
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          border-color: #bfdbfe;
        }
        .crm-card-name {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 2px;
        }
        .crm-card-company {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 8px;
        }
        .crm-card-meta {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }
        .crm-card-tag {
          font-size: 10px;
          font-weight: 600;
          background: #eff6ff;
          color: #1d4ed8;
          border-radius: 4px;
          padding: 2px 6px;
        }
        .crm-card-shipments {
          font-size: 10px;
          color: #64748b;
          background: #f1f5f9;
          border-radius: 4px;
          padding: 2px 6px;
        }
        .crm-card-date {
          font-size: 10px;
          color: #94a3b8;
        }
        .crm-empty {
          text-align: center;
          padding: 24px 8px;
          font-size: 12px;
          color: #cbd5e1;
        }
        @media (max-width: 900px) {
          .crm-board { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 600px) {
          .crm-board { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
