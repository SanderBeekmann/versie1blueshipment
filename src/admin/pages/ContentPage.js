import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import '../styles/admin.css';

const STATUS_OPTIONS = ['', 'concept', 'gepland', 'live', 'gearchiveerd'];
const STATUS_LABELS = { '': 'Alle', concept: 'Concept', gepland: 'Gepland', live: 'Live', gearchiveerd: 'Gearchiveerd' };

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ContentPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('blog_posts')
      .select('id, slug, title, status, category, tags, published_at, read_time, created_at')
      .order('created_at', { ascending: false });

    if (filterStatus) query = query.eq('status', filterStatus);
    if (search.trim()) query = query.ilike('title', `%${search}%`);

    const { data } = await query;
    setPosts(data || []);
    setLoading(false);
  }, [filterStatus, search]);

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [load]);

  const updateStatus = async (id, status) => {
    const updates = { status };
    if (status === 'live') updates.published_at = new Date().toISOString();
    await supabase.from('blog_posts').update(updates).eq('id', id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="admin-page-title">Content</h1>
          <p className="admin-page-subtitle">Blog posts en resources</p>
        </div>
        <Link to="/admin/content/nieuw" className="admin-btn admin-btn--primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nieuwe post
        </Link>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <div className="admin-filters">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Zoek op titel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="admin-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
        </div>

        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titel</th>
                <th>Categorie</th>
                <th>Status</th>
                <th>Publicatiedatum</th>
                <th>Leestijd</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>Laden...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8', fontSize: 13 }}>Geen posts gevonden</td></tr>
              ) : posts.map(post => (
                <tr key={post.id}>
                  <td>
                    <Link to={`/admin/content/${post.id}`} className="admin-table-link">{post.title}</Link>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, fontFamily: 'monospace' }}>/resources/{post.slug}</div>
                  </td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>{post.category || '—'}</td>
                  <td>
                    <select
                      className="admin-filter-select"
                      style={{ padding: '4px 8px', fontSize: 12 }}
                      value={post.status}
                      onChange={(e) => updateStatus(post.id, e.target.value)}
                    >
                      {['concept', 'gepland', 'live', 'gearchiveerd'].map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                    {formatDate(post.published_at)}
                  </td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>{post.read_time || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link to={`/admin/content/${post.id}`} className="admin-btn admin-btn--secondary admin-btn--sm">Bewerken</Link>
                      {post.status === 'live' && (
                        <a href={`/resources/${post.slug}`} target="_blank" rel="noreferrer" className="admin-btn admin-btn--secondary admin-btn--sm">Bekijken</a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
