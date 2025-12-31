import React, { useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './AboutPage.css';
import Navbar from '../../components/layout/Navbar/Navbar';
import TeamSection from '../../components/ui/TeamSection';
import LogoSection from '../../components/sections/LogoSection/LogoSection';
import Footer from '../../components/layout/Footer/Footer';
import InfiniteGridOverlay from '../../components/ui/the-infinite-grid/InfiniteGridOverlay';
import { initScrollAnimations, initTitleAnimations, initHeroTitleAnimation, initLogoRevealAnimation, initStatsCountUp, cleanupScrollAnimations } from '../../utils/scrollAnimations';
import logo from '../../assets/brand/logo.png';
import timoImg from '../../assets/timo.jpg';
import colinImg from '../../assets/colin.jpg';
import reitzeImg from '../../assets/reitze.jpg';
import davidImg from '../../assets/david.jpeg';

const BlueDot = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="11" fill="#0070ff"/>
  </svg>
);

function AboutPage() {
  useLayoutEffect(() => {
    // Initialize all animations
    initScrollAnimations();
    initTitleAnimations();
    initHeroTitleAnimation();
    initLogoRevealAnimation(1000); // 1 second delay for hero
    initStatsCountUp();

    // Ensure ScrollTrigger refreshes after layout is stable
    const refreshTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      });
    }, 100);

    return () => {
      clearTimeout(refreshTimeout);
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
              Het <span className="text-blue">team</span> achter Blueshipment
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

      {/* Waarden Section */}
      <div data-animate="fadeUp">
        <section className="about-values">
          <div className="about-values-container">
            <div className="about-values-header">
              <h2 className="about-values-title" data-animate-title>
                Onze waarden
              </h2>
              <p className="about-values-subtitle">
                De principes die ons dagelijks drijven en waarom we anders zijn dan de rest.
              </p>
            </div>
            <div className="about-values-grid">
              <div className="about-value-card">
                <div className="value-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <h3 className="value-title">Transparantie</h3>
                <p className="value-description">
                  Geen verborgen kosten, geen verrassingen. Je ziet precies wat je betaalt en waarom. Eerlijkheid staat voorop in alles wat we doen.
                </p>
              </div>
              <div className="about-value-card">
                <div className="value-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <h3 className="value-title">Snelheid</h3>
                <p className="value-description">
                  Reactie binnen 30 minuten, orders dezelfde dag verzonden. We begrijpen dat tijd geld is en handelen daar naar.
                </p>
              </div>
              <div className="about-value-card">
                <div className="value-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="value-title">Persoonlijk</h3>
                <p className="value-description">
                  Geen chatbots of automatische antwoorden. Je spreekt altijd met een echt persoon die je kent en begrijpt.
                </p>
              </div>
              <div className="about-value-card">
                <div className="value-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h3 className="value-title">Betrouwbaarheid</h3>
                <p className="value-description">
                  We doen wat we beloven. Elke dag opnieuw. Je kunt op ons rekenen voor consistente service en kwaliteit.
                </p>
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

