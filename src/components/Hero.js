import React from 'react';
import './Hero.css';
import { ReactComponent as FeatureContainerSVG } from '../assets/svg/Feature Container.svg';
import GlassTagline from './GlassTagline';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <GlassTagline withDot>
            <p>Al meer dan 10.000 voltooide bestellingen</p>
          </GlassTagline>
          
          <div className="hero-title-section">
            <h1 className="hero-title" data-animate-title>
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

