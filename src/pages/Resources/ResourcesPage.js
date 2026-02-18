import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ResourcesPage.css';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import SEO from '../../components/SEO/SEO';
import { supabase } from '../../lib/supabase';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function ResourcesPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('slug, title, excerpt, published_at, read_time, category, tags')
      .eq('status', 'live')
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Resources",
    "description": "Praktische artikelen voor bol.com verkopers over fulfilment, software en groei."
  };

  return (
    <div className="app">
      <SEO
        title="Resources - Artikelen voor bol.com Verkopers"
        description="Praktische artikelen voor bol.com verkopers over fulfilment, software en groei. Leer hoe je je bol.com business kunt optimaliseren en laten groeien."
        structuredData={collectionPageSchema}
      />
      <Navbar />
      <main className="page-content resources-page">
        <header className="resources-hero">
          <div className="resources-hero-inner">
            <h1 className="resources-title">Resources</h1>
            <p className="resources-subtitle">
              Praktische artikelen voor bol.com verkopers over fulfilment, software en groei.
            </p>
          </div>
        </header>

        <section className="resources-list">
          <div className="resources-grid">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontSize: 14 }}>Artikelen laden...</div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontSize: 14 }}>Binnenkort meer artikelen.</div>
            ) : posts.map((p) => (
              <article key={p.slug} className="resource-card">
                <div className="resource-meta">
                  <span>{p.published_at ? formatDate(p.published_at) : ''}</span>
                  {p.read_time && <><span>•</span><span>{p.read_time}</span></>}
                  {p.category && <><span>•</span><span>{p.category}</span></>}
                </div>
                <h2 className="resource-card-title">{p.title}</h2>
                <p className="resource-card-excerpt">{p.excerpt}</p>
                <Link className="resource-card-link" to={`/resources/${p.slug}`}>
                  Lees verder
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default ResourcesPage;
