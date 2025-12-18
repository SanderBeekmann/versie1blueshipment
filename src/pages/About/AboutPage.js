import React, { useLayoutEffect } from 'react';
import './AboutPage.css';
import Navbar from '../../components/layout/Navbar/Navbar';
import AboutTeamStable from '../../components/sections/AboutTeamStable/AboutTeamStable';
import LogoSection from '../../components/sections/LogoSection/LogoSection';
import Footer from '../../components/layout/Footer/Footer';
import InfiniteGridOverlay from '../../components/ui/the-infinite-grid/InfiniteGridOverlay';
import { initScrollAnimations, initTitleAnimations, initHeroTitleAnimation, initLogoRevealAnimation, initStatsCountUp, cleanupScrollAnimations } from '../../utils/scrollAnimations';
import logo from '../../assets/brand/logo.png';

const BlueDot = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="11" fill="#0070ff"/>
  </svg>
);

function AboutPage() {
  useLayoutEffect(() => {
    initScrollAnimations();
    initTitleAnimations();
    initHeroTitleAnimation();
    initLogoRevealAnimation(1000); // 1 second delay for hero
    initStatsCountUp();

    return () => {
      cleanupScrollAnimations();
    };
  }, []);

  return (
    <div className="app">
      <Navbar />
      
      {/* Hero Section */}
      <section className="about-hero">
        <InfiniteGridOverlay opacity={0.5} />
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
                <button className="btn btn-primary">
                  Ga voor succes
                </button>
                <a href="#diensten" className="text-link">
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
                <div className="result-number stat-value">50K+</div>
                <div className="result-label">Orders verwerkt</div>
                <p className="result-description">
                  Maandelijks groeien we met tientallen procenten.
                </p>
              </div>
              <div className="about-result-card">
                <div className="result-number stat-value">18m</div>
                <div className="result-label">Gemiddelde reactietijd</div>
                <p className="result-description">
                  Sneller dan onze belofte van dertig minuten.
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
        <AboutTeamStable />
      </div>

      {/* Cultuur Section */}
      <div data-animate="fadeUp">
        <section className="about-culture">
          <div className="about-culture-container">
            <div className="about-culture-header">
              <h2 className="about-culture-title" data-animate-title>
                Wat ons echt drijft
              </h2>
              <p className="about-culture-subtitle">
                We geloven in eerlijkheid, snelheid en het succes van onze klanten.
              </p>
            </div>
            <div className="about-culture-grid">
              <div className="about-culture-card">
                <div className="culture-card-header">
                  <div className="culture-card-dot">
                    <BlueDot />
                  </div>
                  <h3 className="culture-card-title">Persoonlijk</h3>
                </div>
                <p className="culture-card-tagline">
                  Geen automatische antwoorden, alleen persoonlijk contact.
                </p>
                <p className="culture-card-body">
                  Je ontvangt persoonlijk contact op WhatsApp met Colin, ons aanspreekpunt voor klanten. Hij kent je bedrijf en weet waar je tegenaan loopt. Op basis van deze kennis begeleidt hij je persoonlijk.
                </p>
                <button className="btn btn-whatsapp">
                  Contact via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Partners Section */}
      <div data-animate="fadeLeft">
        <LogoSection />
      </div>

      {/* Final CTA Section */}
      <div data-animate="fadeUpScale">
        <section className="about-final-cta">
          <div className="about-final-cta-container">
            <h2 className="about-final-cta-title" data-animate-title>
              Laten we kennismaken.
            </h2>
            <p className="about-final-cta-subtitle">
              Klaar om te starten? Stuur ons een bericht op WhatsApp en laten we zien wat we voor je kunnen doen.
            </p>
            <button className="btn btn-whatsapp">
              Neem contact op via WhatsApp
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div data-animate="fadeUpScale">
        <Footer />
      </div>
    </div>
  );
}

export default AboutPage;

