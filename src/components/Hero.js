import React from 'react';
import './Hero.css';
import GlassTagline from './GlassTagline';
import InfiniteGridOverlay from './ui/the-infinite-grid/InfiniteGridOverlay';

function Hero() {
  return (
    <section className="hero">
      <InfiniteGridOverlay opacity={0.6} />
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
              Probeer nu: Krijg een totaalpakket t.w.v. 499 euro<br />helemaal gratis!
            </p>
          </div>

          <button className="btn btn-primary hero-cta">
            Boek een kennismakingsgesprek
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;

