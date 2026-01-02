import React from 'react';
import './CTASection.css';

function CTASection() {
  return (
    <section className="cta-section">
      <div className="cta-container">
        <div className="cta-card">
          <div className="cta-content">
            <h2 className="cta-title" data-animate-title>Boek een kennismakingsgesprek</h2>
            <p className="cta-description">
              Ga met ons in gesprek en ontdek wat we voor je kunnen betekenen. Geen verplichtingen.
            </p>
            <a 
              href="https://calendly.com/mouseclick2017/30min" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Boek een kennismakingsgesprek
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;

