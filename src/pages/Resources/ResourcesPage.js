import React from 'react';
import { Link } from 'react-router-dom';
import './ResourcesPage.css';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import SEO from '../../components/SEO/SEO';

function ResourcesPage() {
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Resources",
    "description": "Praktische artikelen voor bol.com verkopers over fulfilment, software en groei."
  };

  const posts = [
    {
      title: "Van dropshipping naar voorraad",
      excerpt: "Dropshipper op bol.com? Ontdek waarom verkoop vanuit voorraad via fulfilment de slimme overstap is voor groei, betrouwbaarheid en hogere ranking.",
      date: "2025-01-15",
      readTime: "8 min",
      slug: "van-dropshipping-naar-voorraad-fulfilment"
    }
  ];

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
            {posts.map((p) => (
              <article key={p.slug} className="resource-card">
                <div className="resource-meta">
                  <span>{p.date}</span>
                  <span>•</span>
                  <span>{p.readTime}</span>
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

