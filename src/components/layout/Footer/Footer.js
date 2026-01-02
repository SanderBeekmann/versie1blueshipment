import React, { useEffect, useRef } from 'react';
import './Footer.css';
import logo from '../../../assets/brand/logo.png';

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
    'Over Ons',
    'Diensten',
    'Software',
    'Resources',
    'Kennismakingsgesprek'
  ];

  const column2Links = [
    'FAQ',
    'Contact',
    'Hulp',
    'Voorwaarden',
    'Cookies'
  ];

  return (
    <footer ref={footerRef} className="footer">
      <div className="footer-watermark">
        <img src={logo} alt="BlueShipment" className="footer-watermark-image" />
      </div>
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
                  <a href="#" className="contact-link">WhatsApp support</a>
                  <a href="mailto:info@blueshipment.nl" className="contact-link">info@blueshipment.nl</a>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-links-container">
            <div className="footer-links">
              {column1Links.map((link, index) => {
                const href = link === 'Kennismakingsgesprek' 
                  ? 'https://calendly.com/mouseclick2017/30min' 
                  : '#';
                const target = link === 'Kennismakingsgesprek' ? '_blank' : undefined;
                const rel = link === 'Kennismakingsgesprek' ? 'noopener noreferrer' : undefined;
                return (
                  <a 
                    key={index} 
                    href={href} 
                    target={target}
                    rel={rel}
                    className="footer-link"
                  >
                    {link}
                  </a>
                );
              })}
            </div>
            <div className="footer-links">
              {column2Links.map((link, index) => (
                <a key={index} href="#" className="footer-link">{link}</a>
              ))}
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
              <a href="#" className="legal-link">Privacybeleid</a>
              <a href="#" className="legal-link">Gebruiksvoorwaarden</a>
              <a href="#" className="legal-link">Cookie-instellingen</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

