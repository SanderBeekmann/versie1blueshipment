import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './BlogDetailPage.css';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import SEO from '../../components/SEO/SEO';
import { openWhatsApp } from '../../utils/whatsapp';
import { supabase } from '../../lib/supabase';

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' });
}

function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'live')
      .maybeSingle()
      .then(({ data }) => {
        setPost(data);
        setLoading(false);
      });
  }, [slug]);

  const articleSchema = post ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.meta_title || post.title,
    "description": post.meta_description || post.excerpt,
    "author": { "@type": "Organization", "name": "BlueShipment" },
    "publisher": {
      "@type": "Organization",
      "name": "BlueShipment",
      "logo": { "@type": "ImageObject", "url": "https://blueshipment.nl/logo.png" }
    },
    "datePublished": post.published_at,
    "dateModified": post.updated_at,
  } : null;

  if (loading) {
    return (
      <div className="app">
        <SEO title="Laden..." />
        <Navbar />
        <main className="page-content blog-detail-page">
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>Artikel laden...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="app">
        <SEO title="Artikel niet gevonden" />
        <Navbar />
        <main className="page-content blog-detail-page">
          <div className="blog-not-found">
            <h1>Blog niet gevonden</h1>
            <p>De blog die je zoekt bestaat niet.</p>
            <Link to="/resources" className="btn btn-primary">Terug naar Resources</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const content = Array.isArray(post.content) ? post.content : [];

  return (
    <div className="app">
      <SEO
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        type="article"
        structuredData={articleSchema}
      />
      <Navbar />
      <main className="page-content blog-detail-page">
        <article className="blog-article">
          <nav className="blog-breadcrumb">
            <Link to="/resources">Resources</Link>
            <span className="breadcrumb-separator">/</span>
            <span>{post.title}</span>
          </nav>

          <header className="blog-header">
            <h2 className="blog-title">{post.title}</h2>
            {post.subtitle && <p className="blog-subtitle">{post.subtitle}</p>}
            <div className="blog-meta">
              {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
              {post.read_time && <><span className="meta-separator">•</span><span>{post.read_time} lezen</span></>}
              {post.category && <><span className="meta-separator">•</span><span>{post.category}</span></>}
            </div>
          </header>

          <div className="blog-content">
            {content.map((section, index) => {
              if (section.type === 'heading') {
                const HeadingTag = `h${section.level}`;
                return <HeadingTag key={index} className={`blog-heading blog-heading-${section.level}`}>{section.text}</HeadingTag>;
              }
              if (section.type === 'paragraph') {
                return <p key={index} className="blog-paragraph">{section.text}</p>;
              }
              if (section.type === 'list') {
                return (
                  <ul key={index} className="blog-list">
                    {(section.items || []).map((item, i) => <li key={i} className="blog-list-item">{item}</li>)}
                  </ul>
                );
              }
              if (section.type === 'cta-inline') {
                return (
                  <p key={index} className="blog-paragraph blog-cta-inline">
                    {section.text}{' '}
                    <Link to={section.linkUrl} className="blog-inline-link">{section.linkText}</Link>
                  </p>
                );
              }
              if (section.type === 'cta-block') {
                return (
                  <div key={index} className="blog-cta-block">
                    <h3 className="blog-cta-block-title">{section.title}</h3>
                    <p className="blog-cta-block-text">{section.text}</p>
                    {section.buttonUrl ? (
                      <Link to={section.buttonUrl} className={`btn btn-${section.buttonType || 'primary'}`}>{section.buttonText}</Link>
                    ) : (
                      <button className={`btn btn-${section.buttonType || 'primary'}`} onClick={() => openWhatsApp(section.title)}>{section.buttonText}</button>
                    )}
                  </div>
                );
              }
              if (section.type === 'cta-context') {
                return (
                  <p key={index} className="blog-paragraph">
                    <Link to={section.linkUrl} className="blog-context-link">{section.linkText}</Link>
                  </p>
                );
              }
              if (section.type === 'cta-primary') {
                return (
                  <div key={index} className="blog-cta-primary">
                    <h3 className="blog-cta-primary-title">{section.title}</h3>
                    <p className="blog-cta-primary-text">{section.text}</p>
                    <div className="blog-cta-primary-buttons">
                      <button className={`btn btn-${section.primaryButtonType || 'primary'}`} onClick={() => openWhatsApp(section.title)}>
                        {section.primaryButtonText}
                      </button>
                      {section.secondaryButtonText && (
                        <Link to={section.secondaryButtonUrl || '#'} className="btn btn-outline">{section.secondaryButtonText}</Link>
                      )}
                    </div>
                  </div>
                );
              }
              if (section.type === 'cta-text') {
                return (
                  <p key={index} className="blog-paragraph">
                    <button className="blog-text-link" onClick={() => openWhatsApp(section.linkText)}>
                      {section.linkText}
                    </button>
                  </p>
                );
              }
              return null;
            })}
          </div>

          <div className="blog-footer">
            <Link to="/resources" className="blog-back-link">← Terug naar alle resources</Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

export default BlogDetailPage;
