import React from 'react';
import './Hero.css';
import GlassTagline from './GlassTagline';
import InfiniteGridOverlay from './ui/the-infinite-grid/InfiniteGridOverlay';

function Hero() {
  return (
    <section className="hero">
      <InfiniteGridOverlay opacity={0.5} />
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

          <a 
            href="https://calendly.com/mouseclick2017/30min" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary hero-cta"
          >
            Boek een kennismakingsgesprek
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;

