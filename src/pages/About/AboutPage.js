import React, { useLayoutEffect, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './AboutPage.css';
import Navbar from '../../components/layout/Navbar/Navbar';
import TeamSection from '../../components/sections/TeamSection/TeamSection';
import LogoSection from '../../components/sections/LogoSection/LogoSection';
import Footer from '../../components/layout/Footer/Footer';
import InfiniteGridOverlay from '../../components/ui/the-infinite-grid/InfiniteGridOverlay';
import TrustSection from '../../components/sections/TrustSection/TrustSection';
import CTASection from '../../components/sections/CTASection/CTASection';
import SEO from '../../components/SEO/SEO';
import { initScrollAnimations, initTitleAnimations, initHeroTitleAnimation, initLogoRevealAnimation, initStatsCountUp, cleanupScrollAnimations } from '../../utils/scrollAnimations';
import logo from '../../assets/brand/logo.png';

function AboutPage() {
  // MOBILE OPTIMIZATION: Don't render InfiniteGridOverlay on mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on mount
    checkMobile();
    
    // Check on resize (debounced)
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  useLayoutEffect(() => {
    // Initialize all animations
    initScrollAnimations();
    initTitleAnimations();
    initHeroTitleAnimation();
    initLogoRevealAnimation(1000); // 1 second delay for hero
    initStatsCountUp();

    // Animate hero buttons (AboutPage specific)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      const heroCtas = document.querySelector('.about-hero-ctas');
      if (heroCtas) {
        const buttons = heroCtas.querySelectorAll('button, a');
        if (buttons.length > 0) {
          // CRITICAL: Set initial state SYNCHRONOUSLY in useLayoutEffect (vóór eerste paint)
          // Dit voorkomt de flits waar buttons eerst zichtbaar zijn, dan wegvliegen
          gsap.set(buttons, {
            autoAlpha: 0,
            y: 50,
            scale: 0.95,
            willChange: 'transform, opacity',
          });

          // Button animatie starten na de subtitle animatie (same timing as Hero.js)
          const buttonTimeline = gsap.timeline({ delay: 0.8 });
          buttonTimeline.to(buttons, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.1,
            onComplete: () => {
              gsap.set(buttons, { willChange: 'auto' });
            },
          });
        }
      }
    } else {
      // Reduced motion: show buttons immediately
      const heroCtas = document.querySelector('.about-hero-ctas');
      if (heroCtas) {
        const buttons = heroCtas.querySelectorAll('button, a');
        if (buttons.length > 0) {
          gsap.set(buttons, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            willChange: 'auto',
          });
        }
      }
    }

    // MOBILE OPTIMIZATION: Only refresh ScrollTrigger on desktop
    const isMobileCheck = window.innerWidth < 768;
    const refreshTimeout = setTimeout(() => {
      if (!isMobileCheck) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            ScrollTrigger.refresh();
          });
        });
      }
    }, 100);

    return () => {
      clearTimeout(refreshTimeout);
      cleanupScrollAnimations();
    };
  }, []);

  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "BlueShipment",
      "description": "BlueShipment is jouw all-in bol.com partner met meer dan 10.000 voltooide bestellingen."
    }
  };

  return (
    <div className="app">
      <SEO
        title="Over Ons - BlueShipment Team"
        description="Ontdek het BlueShipment team. Wij zijn jouw all-in bol.com partner met meer dan 10.000 voltooide bestellingen. Leer meer over onze missie en het team achter BlueShipment."
        structuredData={aboutPageSchema}
      />
      <Navbar />
      <div className="page-content">
        {/* Hero Section */}
        <section className="about-hero">
        {!isMobile && <InfiniteGridOverlay opacity={0.5} />}
        <div className="about-hero-content">
          <div className="about-hero-wrapper">
            <div className="about-hero-text">
              <div className="about-hero-title-section">
                <h1 className="about-hero-title" data-animate-title>
                  Over<br />BlueShipment
                </h1>
                <p className="about-hero-subtitle">
                  We begrijpen wat je nodig hebt omdat we het zelf hebben meegemaakt. Blueshipment is ontstaan uit frustratie met bestaande oplossingen en gebouwd met jouw succes in gedachten.
                </p>
              </div>

              <div className="about-hero-ctas">
                <a 
                  href="https://calendly.com/mouseclick2017/30min" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Ga voor succes
                </a>
                <a href="/diensten" className="btn btn-outline-blue">
                  Bekijk diensten
                </a>
              </div>
            </div>
            <div className="about-hero-logo" data-animate-logo>
              <img src={logo} alt="BlueShipment Logo" />
            </div>
          </div>
        </div>
      </section>

      {/* Verhaal Section */}
      <div data-animate="fadeUp">
        <section className="about-story">
          <div className="about-story-container">
            <div className="about-story-content">
              <div className="about-story-text">
                <h2 className="about-story-title" data-animate-title>
                  Hoe het allemaal begon
                </h2>
                <div className="about-story-body">
                  <p>
                    Wij zijn begonnen als bol.com verkopers en kennen de obstakels. Bestaande fulfilmentcentra voelden niet meedenkend, met verborgen kosten en trage reacties. We zagen ook een kans in onze eigen listingsoftware. We merkten hoeveel het ons hielp en wilden dit delen met andere bol.com verkopers.
                  </p>
                </div>
              </div>
              <div className="about-story-image">
                <div className="image-placeholder"></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Resultaten Section */}
      <div data-animate="fadeUp">
        <section className="about-results">
          <div className="about-results-container">
            <h2 className="about-results-title" data-animate-title>
              Wat hebben we bereikt?
            </h2>
            <div className="about-results-grid">
              <div className="about-result-card">
                <div className="result-number stat-value">100K+</div>
                <div className="result-label">Orders verwerkt</div>
              </div>
              <div className="about-result-card">
                <div className="result-number stat-value">75+</div>
                <div className="result-label">Succesvolle winkels aangesloten bij ons</div>
              </div>
              <div className="about-result-card">
                <div className="result-number stat-value">2M</div>
                <div className="result-label">omzet gedraaid Met onze strategie</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Team Section */}
      <div data-animate="fadeUp">
        <TeamSection hideCTA={true} />
      </div>

      {/* Trust Section */}
      <div data-animate="fadeUp">
        <TrustSection />
      </div>

      {/* Final CTA Section */}
      <CTASection />

      {/* Partners Section */}
      <div data-animate="fadeLeft">
        <LogoSection />
      </div>

      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default AboutPage;

