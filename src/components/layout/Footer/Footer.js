import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { openWhatsApp } from '../../../utils/whatsapp';

function Footer() {
  const footerRef = useRef(null);

  // Measure footer height and set CSS custom property for padding-bottom
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const updateFooterHeight = () => {
      const height = footer.offsetHeight;
      document.documentElement.style.setProperty('--footer-h', `${height}px`);
    };

    // Initial measurement
    updateFooterHeight();

    // Update on resize
    const resizeObserver = new ResizeObserver(() => {
      updateFooterHeight();
    });
    resizeObserver.observe(footer);

    // Update when fonts load (to handle dynamic font loading)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        updateFooterHeight();
      });
    }

    // Update after a short delay to catch any layout changes
    const timeoutId = setTimeout(() => {
      updateFooterHeight();
    }, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);
  const column1Links = [
    { text: 'Over Ons', href: '/over-ons', type: 'internal' },
    { text: 'Diensten', href: '/diensten', type: 'internal' },
    { text: 'Software', href: '/diensten#software', type: 'internal' },
    { text: 'Resources', href: '/resources', type: 'internal' },
    { text: 'Kennismakingsgesprek', href: 'https://calendly.com/mouseclick2017/30min', type: 'external' }
  ];

  const column2Links = [
    { text: 'FAQ', href: '/#faq', type: 'internal' },
    { text: 'Contact', href: null, type: 'whatsapp', action: () => openWhatsApp('Hallo! Ik heb een vraag.') },
    { text: 'Hulp', href: '/resources', type: 'internal' },
    { text: 'Voorwaarden', href: null, type: 'placeholder' },
    { text: 'Cookies', href: null, type: 'placeholder' }
  ];

  return (
    <footer ref={footerRef} className="footer">
      <div className="footer-gradient-background"></div>
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-branding">
            <h2 className="footer-brand-name">BlueShipment</h2>
            <div className="footer-contact">
              <div className="contact-item">
                <p className="contact-label">Adres</p>
                <p className="contact-value">Zwolle, Nederland</p>
              </div>
              <div className="contact-item">
                <p className="contact-label">Contact</p>
                <div className="contact-links">
                  <button 
                    type="button"
                    className="contact-link"
                    onClick={() => {
                      openWhatsApp('Hallo! Ik heb een vraag over BlueShipment.');
                    }}
                  >
                    WhatsApp support
                  </button>
                  <a href="mailto:info@blueshipment.nl" className="contact-link">info@blueshipment.nl</a>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-links-container">
            <div className="footer-links">
              {column1Links.map((link, index) => {
                if (link.type === 'external') {
                  return (
                    <a 
                      key={index} 
                      href={link.href} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                    >
                      {link.text}
                    </a>
                  );
                } else if (link.href.startsWith('#')) {
                  // Hash link - use anchor
                  return (
                    <a 
                      key={index} 
                      href={link.href} 
                      className="footer-link"
                    >
                      {link.text}
                    </a>
                  );
                } else {
                  // Internal route - use Link
                  return (
                    <Link 
                      key={index} 
                      to={link.href} 
                      className="footer-link"
                    >
                      {link.text}
                    </Link>
                  );
                }
              })}
            </div>
            <div className="footer-links">
              {column2Links.map((link, index) => {
                if (link.type === 'whatsapp' && link.action) {
                  return (
                    <button 
                      key={index} 
                      type="button"
                      className="footer-link"
                      onClick={link.action}
                    >
                      {link.text}
                    </button>
                  );
                } else if (link.type === 'placeholder') {
                  // Placeholder for future pages - use button
                  return (
                    <button 
                      key={index} 
                      type="button"
                      className="footer-link"
                      disabled
                      aria-label={`${link.text} - Coming soon`}
                    >
                      {link.text}
                    </button>
                  );
                } else if (link.href && link.href.startsWith('#')) {
                  // Hash link - use anchor
                  return (
                    <a 
                      key={index} 
                      href={link.href} 
                      className="footer-link"
                    >
                      {link.text}
                    </a>
                  );
                } else if (link.href) {
                  // Internal route - use Link
                  return (
                    <Link 
                      key={index} 
                      to={link.href} 
                      className="footer-link"
                    >
                      {link.text}
                    </Link>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <div className="footer-credits">
            <p className="footer-copyright">
              © 2025 Blueshipment. Alle rechten voorbehouden.
            </p>
            <p className="footer-credit">Created by <a href="https://blitzworx.nl" target="_blank" rel="noopener noreferrer" className="footer-credit-link">BLITZWORX</a></p>
            <div className="footer-legal">
              <button type="button" className="legal-link" disabled aria-label="Privacybeleid - Coming soon">Privacybeleid</button>
              <button type="button" className="legal-link" disabled aria-label="Gebruiksvoorwaarden - Coming soon">Gebruiksvoorwaarden</button>
              <button type="button" className="legal-link" disabled aria-label="Cookie-instellingen - Coming soon">Cookie-instellingen</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

