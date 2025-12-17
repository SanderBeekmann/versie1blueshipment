import React from 'react';
import './CTASection.css';

function CTASection() {
  return (
    <section className="cta-section">
      <div className="cta-container">
        <div className="cta-card">
          <div className="cta-content">
            <h2 className="cta-title">Boek een kennismakingsgesprek</h2>
            <p className="cta-description">
              Ga met ons in gesprek en ontdek wat we voor je kunnen betekenen. Geen verplichtingen.
            </p>
            <button className="btn btn-primary">
              Boek een kennismakingsgesprek
            </button>
          </div>
        </div>
        <div className="cta-decoration">
          <svg width="163" height="162" viewBox="0 0 163 162" fill="none">
            <circle cx="81.5" cy="81" r="78" fill="white" stroke="#0070ff" strokeWidth="6"/>
          </svg>
        </div>
      </div>
    </section>
  );
}

export default CTASection;

