import React from 'react';
import { Link } from 'react-router-dom';
import './CTASection.css';

function CTASection() {
  return (
    <section className="cta-section">
      <div className="cta-container">
        <div className="cta-gradient-background"></div>
        <div className="cta-content">
          <h2 className="cta-title" data-animate-title>Boek een kennismakingsgesprek</h2>
          <p className="cta-description">
            Ga met ons in gesprek en ontdek wat we voor je kunnen betekenen. Geen verplichtingen.
          </p>
          <Link 
            to="/intake"
            className="btn btn-secondary"
          >
            Boek een kennismakingsgesprek
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CTASection;

