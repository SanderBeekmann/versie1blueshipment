import React from 'react';
import './Hero.css';
import { ReactComponent as FeatureContainerSVG } from '../assets/svg/Feature Container.svg';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-tagline">
            <span className="tagline-dot"></span>
            <p className="tagline-text">Al meer dan 10.000 voltooide bestellingen</p>
          </div>
          
          <div className="hero-title-section">
            <h1 className="hero-title">
              Jouw all-in<br />bol.com partner
            </h1>
            <p className="hero-subtitle">
              Probeer nu: Krijg een totaalpakket t.w.v. 499 euro helemaal gratis!
            </p>
          </div>

          <button className="btn btn-primary hero-cta">
            Boek een kennismakingsgesprek
          </button>
        </div>

        <div className="hero-features">
          <FeatureContainerSVG className="feature-container-svg" />
        </div>
      </div>
    </section>
  );
}

export default Hero;

