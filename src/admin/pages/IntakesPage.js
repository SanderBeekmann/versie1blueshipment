import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import '../styles/admin.css';

const STATUS_OPTIONS = ['', 'nieuw', 'in_behandeling', 'offerte', 'gewonnen', 'verloren'];
const STATUS_LABELS = {
  '': 'Alle statussen',
  nieuw: 'Nieuw',
  in_behandeling: 'In behandeling',
  offerte: 'Offerte',
  gewonnen: 'Gewonnen',
  verloren: 'Verloren',
};

const KANAAL_OPTIONS = ['', 'bol.com', 'bol.com en eigen webshop', 'Alleen eigen webshop', 'Ik ben nog aan het starten'];

const DIENST_OPTIONS = ['', 'Productlistings', 'Automatiseren', 'Fulfilment', 'Software'];

const PAGE_SIZE = 20;

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function DeleteConfirmModal({ intake, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '28px 32px', maxWidth: 400, width: '90%',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Klant verwijderen</h3>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
          Weet je zeker dat je <strong>{intake.naam || intake.email}</strong> wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 18px', border: '1px solid #e2e8f0', borderRadius: 7, background: '#fff',
              fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer',
            }}
          >Annuleren</button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 18px', border: 'none', borderRadius: 7, background: '#dc2626',
              fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer',
            }}
          >Verwijderen</button>
        </div>
      </div>
    </div>
  );
}

export default function IntakesPage() {
  const [intakes, setIntakes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKanaal, setFilterKanaal] = useState('');
  const [filterDienst, setFilterDienst] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('intakes')
      .select('id, naam, email, telefoon, bedrijf, verkoopkanaal, diensten, shipment_volume, status, created_at, preferred_date', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (filterStatus) query = query.eq('status', filterStatus);
    if (filterKanaal) query = query.eq('verkoopkanaal', filterKanaal);
    if (filterDienst) query = query.contains('diensten', [filterDienst]);
    if (search.trim()) {
      query = query.or(`naam.ilike.%${search}%,email.ilike.%${search}%,bedrijf.ilike.%${search}%`);
    }

    const { data, count } = await query;
    setIntakes(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [page, filterStatus, filterKanaal, filterDienst, search]);

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from('intakes').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    load();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {deleteTarget && (
        <DeleteConfirmModal
          intake={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="admin-page-header">
        <h1 className="admin-page-title">Intakes</h1>
        <p className="admin-page-subtitle">{total} aanvragen in totaal</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <div className="admin-filters">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Zoek op naam, e-mail, bedrijf..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
            <select
              className="admin-filter-select"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <select
              className="admin-filter-select"
              value={filterKanaal}
              onChange={(e) => { setFilterKanaal(e.target.value); setPage(0); }}
            >
              <option value="">Alle kanalen</option>
              {KANAAL_OPTIONS.filter(Boolean).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <select
              className="admin-filter-select"
              value={filterDienst}
              onChange={(e) => { setFilterDienst(e.target.value); setPage(0); }}
            >
              <option value="">Alle diensten</option>
              {DIENST_OPTIONS.filter(Boolean).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Naam / Bedrijf</th>
                <th>Contact</th>
                <th>Kanaal</th>
                <th>Diensten</th>
                <th>Shipments</th>
                <th>Voorkeursdatum</th>
                <th>Status</th>
                <th>Datum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>Laden...</td></tr>
              ) : intakes.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8', fontSize: 13 }}>Geen intakes gevonden</td></tr>
              ) : intakes.map(intake => (
                <tr key={intake.id}>
                  <td>
                    <Link to={`/admin/intakes/${intake.id}`} className="admin-table-link">
                      {intake.naam || '—'}
                    </Link>
                    {intake.bedrijf && (
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{intake.bedrijf}</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{intake.email}</div>
                    {intake.telefoon && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{intake.telefoon}</div>}
                  </td>
                  <td style={{ fontSize: 12, color: '#64748b', maxWidth: 160 }}>
                    {intake.verkoopkanaal || '—'}
                  </td>
                  <td style={{ fontSize: 12, color: '#64748b', maxWidth: 160 }}>
                    {Array.isArray(intake.diensten) ? intake.diensten.join(', ') : '—'}
                  </td>
                  <td style={{ fontSize: 13, textAlign: 'right', paddingRight: 24 }}>
                    {intake.shipment_volume ?? '—'}
                  </td>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                    {intake.preferred_date
                      ? <span style={{ color: '#0070ff', fontWeight: 600 }}>{new Date(intake.preferred_date + 'T00:00:00').toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      : <span style={{ color: '#94a3b8' }}>—</span>}
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${intake.status}`}>
                      {STATUS_LABELS[intake.status] || intake.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                    {formatDate(intake.created_at)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => setDeleteTarget(intake)}
                      title="Verwijderen"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#94a3b8', padding: '4px 6px', borderRadius: 6,
                        transition: 'color 0.15s, background 0.15s',
                        lineHeight: 1,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#fee2e2'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="admin-pagination">
            <span>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} van {total}</span>
            <div className="admin-pagination-btns">
              <button
                className="admin-pagination-btn"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >Vorige</button>
              <button
                className="admin-pagination-btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >Volgende</button>
            </div>
          </div>
        )}
      </div>

      {deleting && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: '20px 28px', fontSize: 14, color: '#374151' }}>
            Verwijderen...
          </div>
        </div>
      )}
    </div>
  );
}
