import React from 'react';
import { Link } from 'react-router-dom';
import './ResourcesSection.css';

function ResourcesSection() {
  const featuredPost = {
    title: "Van dropshipping naar voorraad",
    excerpt: "Dropshipper op bol.com? Ontdek waarom verkoop vanuit voorraad via fulfilment de slimme overstap is voor groei, betrouwbaarheid en hogere ranking.",
    date: "2025-01-15",
    readTime: "8 min",
    slug: "van-dropshipping-naar-voorraad-fulfilment"
  };

  return (
    <section className="resources-section">
      <div className="resources-section-container">
        <div className="resources-section-grid">
          {/* Left Column - Text + CTA */}
          <div className="resources-section-left">
            <h2 className="resources-section-title" data-animate-title>
              Leer meer over bol.com groei
            </h2>
            <p className="resources-section-description">
              Ontdek praktische artikelen, tips en inzichten om je bol.com business te laten groeien.
            </p>
            <Link to="/resources" className="btn btn-primary resources-section-cta">
              Bekijk alle artikelen
            </Link>
          </div>

          {/* Right Column - Blog Card */}
          <div className="resources-section-right">
            <article className="resource-card">
              <div className="resource-meta">
                <span>{featuredPost.date}</span>
                <span>•</span>
                <span>{featuredPost.readTime}</span>
              </div>
              <h3 className="resource-card-title">{featuredPost.title}</h3>
              <p className="resource-card-excerpt">{featuredPost.excerpt}</p>
              <Link className="resource-card-link" to={`/resources/${featuredPost.slug}`}>
                Lees verder
              </Link>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResourcesSection;
