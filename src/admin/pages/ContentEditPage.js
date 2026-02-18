import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import '../styles/admin.css';

const EMPTY_POST = {
  slug: '',
  title: '',
  subtitle: '',
  excerpt: '',
  content: [],
  meta_title: '',
  meta_description: '',
  og_image_url: '',
  canonical_url: '',
  category: '',
  tags: [],
  status: 'concept',
  read_time: '',
};

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function ContentEditPage() {
  const { id } = useParams();
  const isNew = id === 'nieuw';
  const { adminUser } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(EMPTY_POST);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (isNew) return;
    supabase.from('blog_posts').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      if (!data) { navigate('/admin/content'); return; }
      setPost(data);
      setTagsInput(Array.isArray(data.tags) ? data.tags.join(', ') : '');
      setLoading(false);
    });
  }, [id, isNew, navigate]);

  const update = (field, value) => setPost(prev => ({ ...prev, [field]: value }));

  const handleTitleChange = (title) => {
    update('title', title);
    if (isNew || !post.slug) {
      update('slug', slugify(title));
    }
    if (!post.meta_title) update('meta_title', title);
  };

  const handleSave = async (statusOverride) => {
    setSaving(true);
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      ...post,
      tags,
      author_id: adminUser?.id,
    };

    if (statusOverride) payload.status = statusOverride;
    if (statusOverride === 'live' && !post.published_at) {
      payload.published_at = new Date().toISOString();
    }

    let result;
    if (isNew) {
      result = await supabase.from('blog_posts').insert(payload).select('id').single();
    } else {
      result = await supabase.from('blog_posts').update(payload).eq('id', id).select('id').single();
    }

    setSaving(false);

    if (result.error) {
      alert('Opslaan mislukt: ' + result.error.message);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    if (isNew && result.data?.id) {
      navigate(`/admin/content/${result.data.id}`, { replace: true });
    } else {
      setPost(prev => ({ ...prev, ...(statusOverride ? { status: statusOverride } : {}) }));
    }
  };

  if (loading) return <div className="admin-loading" style={{ minHeight: 300 }}><div className="admin-loading-spinner" /></div>;

  return (
    <div>
      <Link to="/admin/content" className="admin-back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Terug naar content
      </Link>

      <div className="admin-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h1 className="admin-page-title">{isNew ? 'Nieuwe post' : 'Post bewerken'}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {saved && <span style={{ fontSize: 13, color: '#16a34a', alignSelf: 'center' }}>Opgeslagen</span>}
          <button className="admin-btn admin-btn--secondary" onClick={() => handleSave()} disabled={saving}>
            {saving ? 'Opslaan...' : 'Opslaan'}
          </button>
          {post.status !== 'live' && (
            <button className="admin-btn admin-btn--primary" onClick={() => handleSave('live')} disabled={saving}>
              Live zetten
            </button>
          )}
          {post.status === 'live' && (
            <button className="admin-btn admin-btn--danger" onClick={() => handleSave('concept')} disabled={saving}>
              Terugzetten naar concept
            </button>
          )}
        </div>
      </div>

      <div className="admin-detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="admin-card">
            <div className="admin-card-header"><h2 className="admin-card-title">Inhoud</h2></div>
            <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="admin-form-field">
                <label className="admin-form-label">Titel *</label>
                <input className="admin-form-input" value={post.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Blogtitel" />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Subtitel</label>
                <input className="admin-form-input" value={post.subtitle} onChange={(e) => update('subtitle', e.target.value)} placeholder="Ondertitel" />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Excerpt (samenvatting voor overzicht) *</label>
                <textarea className="admin-form-textarea" value={post.excerpt} onChange={(e) => update('excerpt', e.target.value)} placeholder="Korte samenvatting voor de resources overzichtspagina..." rows={3} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Content (JSON blokken)
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>Format: {`[{"type":"paragraph","text":"..."}]`}</span>
                </label>
                <textarea
                  className="admin-form-textarea"
                  style={{ fontFamily: 'monospace', fontSize: 12 }}
                  value={typeof post.content === 'string' ? post.content : JSON.stringify(post.content, null, 2)}
                  onChange={(e) => {
                    try {
                      update('content', JSON.parse(e.target.value));
                    } catch {
                      update('content', e.target.value);
                    }
                  }}
                  rows={16}
                  placeholder='[{"type":"paragraph","text":"Inhoud hier..."}]'
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="admin-card">
            <div className="admin-card-header"><h2 className="admin-card-title">Publicatie</h2></div>
            <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="admin-form-field">
                <label className="admin-form-label">Status</label>
                <select className="admin-form-select" value={post.status} onChange={(e) => update('status', e.target.value)}>
                  <option value="concept">Concept</option>
                  <option value="gepland">Gepland</option>
                  <option value="live">Live</option>
                  <option value="gearchiveerd">Gearchiveerd</option>
                </select>
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Categorie</label>
                <input className="admin-form-input" value={post.category} onChange={(e) => update('category', e.target.value)} placeholder="bijv. Fulfilment" />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Tags (komma-gescheiden)</label>
                <input className="admin-form-input" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="bol.com, fulfilment, groei" />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Leestijd</label>
                <input className="admin-form-input" value={post.read_time} onChange={(e) => update('read_time', e.target.value)} placeholder="8 min" />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header"><h2 className="admin-card-title">SEO</h2></div>
            <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="admin-form-field">
                <label className="admin-form-label">URL Slug *</label>
                <input className="admin-form-input" style={{ fontFamily: 'monospace', fontSize: 12 }} value={post.slug} onChange={(e) => update('slug', slugify(e.target.value))} placeholder="mijn-blog-post" />
                <span style={{ fontSize: 11, color: '#94a3b8' }}>/resources/{post.slug || 'slug'}</span>
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">
                  SEO Titel
                  <span style={{ float: 'right', fontSize: 11, color: post.meta_title?.length > 60 ? '#dc2626' : '#94a3b8' }}>
                    {post.meta_title?.length || 0}/60
                  </span>
                </label>
                <input className="admin-form-input" value={post.meta_title} onChange={(e) => update('meta_title', e.target.value)} placeholder="SEO paginatitel" />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">
                  Meta description
                  <span style={{ float: 'right', fontSize: 11, color: post.meta_description?.length > 160 ? '#dc2626' : '#94a3b8' }}>
                    {post.meta_description?.length || 0}/160
                  </span>
                </label>
                <textarea className="admin-form-textarea" value={post.meta_description} onChange={(e) => update('meta_description', e.target.value)} rows={3} placeholder="Beschrijving voor zoekmachines..." />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">OG Image URL</label>
                <input className="admin-form-input" value={post.og_image_url} onChange={(e) => update('og_image_url', e.target.value)} placeholder="https://..." />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Canonical URL</label>
                <input className="admin-form-input" value={post.canonical_url} onChange={(e) => update('canonical_url', e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
