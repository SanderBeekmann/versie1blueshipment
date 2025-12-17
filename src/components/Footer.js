import React from 'react';
import './Footer.css';

const Logo = () => (
  <svg width="66" height="66" viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="53" height="53" rx="10" fill="#0070ff"/>
    <path d="M15 16H38L35 26H18L15 16Z" fill="white"/>
    <path d="M18 28H35L38 38H15L18 28Z" fill="white"/>
  </svg>
);

function Footer() {
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
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-info">
            <div className="footer-brand">
              <div className="footer-logo">
                <Logo />
              </div>
              <p className="footer-brand-name">BlueShipment</p>
            </div>
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
              {column1Links.map((link, index) => (
                <a key={index} href="#" className="footer-link">{link}</a>
              ))}
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
            <p className="footer-credit">Created by Blitzworx</p>
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

