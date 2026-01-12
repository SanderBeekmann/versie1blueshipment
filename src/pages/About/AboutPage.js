import React, { useLayoutEffect, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './AboutPage.css';
import Navbar from '../../components/layout/Navbar/Navbar';
import TeamSection from '../../components/ui/TeamSection';
import LogoSection from '../../components/sections/LogoSection/LogoSection';
import Footer from '../../components/layout/Footer/Footer';
import InfiniteGridOverlay from '../../components/ui/the-infinite-grid/InfiniteGridOverlay';
import TrustSection from '../../components/sections/TrustSection/TrustSection';
import CTASection from '../../components/sections/CTASection/CTASection';
import ResourcesSection from '../../components/sections/ResourcesSection/ResourcesSection';
import { initScrollAnimations, initTitleAnimations, initHeroTitleAnimation, initLogoRevealAnimation, initStatsCountUp, cleanupScrollAnimations } from '../../utils/scrollAnimations';
import logo from '../../assets/brand/logo.png';
import timoImg from '../../assets/timo.jpg';
import colinImg from '../../assets/colin.jpg';
import reitzeImg from '../../assets/reitze.jpg';
import davidImg from '../../assets/david.jpeg';

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

  return (
    <div className="app">
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
                <div className="result-number stat-value">10K+</div>
                <div className="result-label">Orders verwerkt</div>
                <p className="result-description">
                  Maandelijks groeien we met tientallen procenten.
                </p>
              </div>
              <div className="about-result-card">
                <div className="result-number stat-value">30m</div>
                <div className="result-label">Gemiddelde reactietijd</div>
                <p className="result-description">
                  Ongekend snel en persoonlijk.
                </p>
              </div>
              <div className="about-result-card">
                <div className="result-number stat-value">98%</div>
                <div className="result-label">Klanttevredenheid</div>
                <p className="result-description">
                  Omdat we luisteren en echt iets voor je betekenen.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Team Section */}
      <div data-animate="fadeUp">
        <TeamSection
          title={
            <>
              Het team achter Blueshipment
            </>
          }
          groups={[
            {
              title: 'Team',
              members: [
                {
                  id: 'timo',
                  name: 'Timo Jansen',
                  role: 'Back-end & software',
                  avatar: timoImg,
                  story: 'Als back-end developer zorg ik ervoor dat alles achter de schermen soepel verloopt. Ik ben gepassioneerd over schone code en efficiënte systemen. Mijn focus ligt op het bouwen van robuuste oplossingen die dag in dag uit betrouwbaar werken. Ik begrijp de frustraties van bol.com verkopers omdat ik zelf jarenlang in die schoenen heb gestaan. Die ervaring gebruik ik nu om software te maken die echt werkt voor jullie.'
                },
                {
                  id: 'colin',
                  name: 'Colin Frederiks',
                  role: 'Verkoop & klantcontact',
                  avatar: colinImg,
                  story: 'Ik ben het eerste aanspreekpunt voor al onze klanten. Mijn achtergrond als bol.com verkoper helpt me om precies te begrijpen waar je tegenaan loopt. Ik geloof in persoonlijk contact - geen automatische antwoorden, maar echte gesprekken. Als je een vraag hebt, bel of app me gerust. Ik ken je bedrijf en help je graag verder, of het nu gaat om een technisch probleem of gewoon een vraag over je dagelijkse werkzaamheden.'
                },
                {
                  id: 'reitze',
                  name: 'Reitze Douma',
                  role: 'Logistiek',
                  avatar: reitzeImg,
                  story: 'Logistiek is mijn specialiteit. Ik zorg ervoor dat elke order op tijd en correct wordt verzonden. Mijn ervaring met bol.com fulfillment heeft me geleerd wat echt belangrijk is: snelheid, nauwkeurigheid en transparantie. Ik werk dagelijks aan het optimaliseren van onze processen zodat jij je geen zorgen hoeft te maken over je verzendingen. Elke order die we verwerken, behandel ik alsof het mijn eigen bedrijf is.'
                },
                {
                  id: 'david',
                  name: 'David Karani',
                  role: 'Social Media',
                  avatar: davidImg,
                  story: 'Als social media specialist zorg ik ervoor dat Blueshipment zichtbaar is op de juiste kanalen. Ik creëer content die bol.com verkopers helpt en inspireert, en zorg ervoor dat onze boodschap duidelijk overkomt. Mijn doel is om de community te verbinden en te laten zien wat Blueshipment voor jullie kan betekenen.'
                }
              ]
            }
          ]}
        />
      </div>

      {/* Trust Section */}
      <div data-animate="fadeUp">
        <TrustSection />
      </div>

      {/* Final CTA Section */}
      <CTASection />

      {/* Resources Section */}
      <div data-animate="fadeUp">
        <ResourcesSection />
      </div>

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

