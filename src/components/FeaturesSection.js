import React from 'react';
import './FeaturesSection.css';
import GlassTagline from './GlassTagline';

const ListsIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="8" width="32" height="32" rx="4" stroke="#0d0600" strokeWidth="2"/>
    <path d="M14 16H22" stroke="#0d0600" strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 24H22" stroke="#0d0600" strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 32H22" stroke="#0d0600" strokeWidth="2" strokeLinecap="round"/>
    <path d="M28 16H34" stroke="#0d0600" strokeWidth="2" strokeLinecap="round"/>
    <path d="M28 24H34" stroke="#0d0600" strokeWidth="2" strokeLinecap="round"/>
    <path d="M28 32H34" stroke="#0d0600" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SupportIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="20" r="8" stroke="#0d0600" strokeWidth="2"/>
    <path d="M12 38C12 32 17 28 24 28C31 28 36 32 36 38" stroke="#0d0600" strokeWidth="2" strokeLinecap="round"/>
    <path d="M32 14C36 14 38 16 38 20" stroke="#0d0600" strokeWidth="2" strokeLinecap="round"/>
    <path d="M38 20V26" stroke="#0d0600" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const InboxIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="12" width="32" height="24" rx="4" stroke="#0d0600" strokeWidth="2"/>
    <path d="M8 28H16L20 32H28L32 28H40" stroke="#0d0600" strokeWidth="2"/>
  </svg>
);

function FeaturesSection() {
  const features = [
    {
      id: 1,
      icon: <ListsIcon />,
      title: 'Gratis listings',
      description: 'Productlijsten klaar voor gebruik, zonder extra investering.'
    },
    {
      id: 2,
      icon: <SupportIcon />,
      title: 'Reactie in 30 minuten',
      description: 'WhatsApp support die echt luistert en snel handelt.'
    },
    {
      id: 3,
      icon: <InboxIcon />,
      title: 'Alles inbegrepen, niets extra',
      description: 'Één prijs per zending. Opslag, verwerking en support zitten erin.'
    },
    {
      id: 4,
      icon: <InboxIcon />,
      title: 'Geen verborgen kosten',
      description: 'Je betaalt alleen per zending. Geen opslagkosten, geen instellingskosten.'
    }
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-header">
          <GlassTagline>
            <p>Voordelen</p>
          </GlassTagline>
          <h2 className="features-title">
            Wat maakt ons <span className="text-blue">anders</span>
          </h2>
          <p className="features-subtitle">
            Alles wat je nodig hebt om te groeien, zonder extra kosten.
          </p>
        </div>

        <div className="features-content">
          <div className="features-column features-column-left">
            {features.slice(0, 2).map((feature) => (
              <div key={feature.id} className="feature-item">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-text">
                  <h5 className="feature-title">{feature.title}</h5>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="features-logo">
            <div className="logo-placeholder">
              <svg width="200" height="200" viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="53" height="53" rx="10" fill="#0070ff"/>
                <path d="M15 16H38L35 26H18L15 16Z" fill="white"/>
                <path d="M18 28H35L38 38H15L18 28Z" fill="white"/>
              </svg>
            </div>
          </div>

          <div className="features-column features-column-right">
            {features.slice(2, 4).map((feature) => (
              <div key={feature.id} className="feature-item">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-text">
                  <h5 className="feature-title">{feature.title}</h5>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary">Lees meer</button>
      </div>
    </section>
  );
}

export default FeaturesSection;

