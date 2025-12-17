import React from 'react';
import './WhatsAppSection.css';

const BlueDot = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="11" fill="#0070ff"/>
  </svg>
);

function WhatsAppSection() {
  return (
    <section className="whatsapp-section">
      <div className="whatsapp-container">
        <div className="whatsapp-header">
          <p className="whatsapp-tagline">Communicatie</p>
          <h5 className="whatsapp-title">
            WhatsApp support binnen 30 minuten
          </h5>
        </div>

        <div className="whatsapp-card">
          <div className="card-indicator">
            <BlueDot />
          </div>
          <h3 className="card-title">Neem contact op met Colin</h3>
          <p className="card-description">
            Ben je klaar om te starten? Colin staat klaar om met je in gesprek te gaan via WhatsApp en je dé perfecte begeleiding te geven die je nodig hebt om het beste uit <span className="logo-text"><span className="logo-blue">Blue</span>Shipment</span> te halen.
          </p>
          <div className="card-avatar">
            <div className="avatar-placeholder"></div>
          </div>
          <button className="btn btn-whatsapp">
            Neem contact op via WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
}

export default WhatsAppSection;

