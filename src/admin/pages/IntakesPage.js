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

export default function IntakesPage() {
  const [intakes, setIntakes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKanaal, setFilterKanaal] = useState('');
  const [filterDienst, setFilterDienst] = useState('');

  const load = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('intakes')
      .select('id, naam, email, telefoon, bedrijf, verkoopkanaal, diensten, shipment_volume, status, created_at', { count: 'exact' })
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

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
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
                <th>Status</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>Laden...</td></tr>
              ) : intakes.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8', fontSize: 13 }}>Geen intakes gevonden</td></tr>
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
                  <td>
                    <span className={`admin-badge admin-badge--${intake.status}`}>
                      {STATUS_LABELS[intake.status] || intake.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                    {formatDate(intake.created_at)}
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
    </div>
  );
}
