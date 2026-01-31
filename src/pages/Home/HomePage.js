import React, { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';
import '../../styles/App.css';
import '../Diensten/DienstenPage.css';
import './HomePage.css';
import Navbar from '../../components/layout/Navbar/Navbar';
import Hero from '../../components/sections/Hero/Hero';
import VideoSection from '../../components/sections/VideoSection/VideoSection';
import LogoSection from '../../components/sections/LogoSection/LogoSection';
import ProcessSection from '../../components/sections/ProcessSection/ProcessSection';
import GallerySection from '../../components/sections/GallerySection/GallerySection';
import ResultSection from '../../components/sections/ResultSection/ResultSection';
import TeamSection from '../../components/sections/TeamSection/TeamSection';
import TrustSection from '../../components/sections/TrustSection/TrustSection';
import Testimonials from '../../components/sections/TestimonialSection/Testimonials';
import WhatsAppSection from '../../components/sections/WhatsAppSection/WhatsAppSection';
import CTASection from '../../components/sections/CTASection/CTASection';
import FAQSection from '../../components/sections/FAQSection/FAQSection';
import Footer from '../../components/layout/Footer/Footer';
import SEO from '../../components/SEO/SEO';
import { initScrollAnimations, initTitleAnimations, initHeroTitleAnimation, initTeamCardsDotAccentAnimation, initLogoRevealAnimation, cleanupScrollAnimations } from '../../utils/scrollAnimations';
import { WatermarkIcon } from '../../utils/bentoCardIcons';

function HomePage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BlueShipment",
    "url": "https://blueshipment.nl",
    "logo": "https://blueshipment.nl/logo.png",
    "description": "BlueShipment is jouw all-in bol.com partner. Wij helpen je met productlistings, automatisering, fulfilment, software en consulting om je bol.com business te laten groeien.",
    "sameAs": [
      // Add social media links if available
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "info@blueshipment.nl"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BlueShipment",
    "url": "https://blueshipment.nl",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://blueshipment.nl/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const combinedSchema = [organizationSchema, websiteSchema];
  const bentoRef = useRef(null);
  const cardRefs = useRef([]);

  // Services data for bento grid
  const services = [
    {
      kicker: 'Productlistings',
      title: 'Productlistings',
      description: 'Professionele productlistings voor je bol.com shop.',
      cta: 'Meer',
      href: '/diensten#productlistings',
      area: 'a',
      sectionId: 'productlistings'
    },
    {
      kicker: 'Automatiseren',
      title: 'Automatiseren',
      description: 'Automatiseer je processen en bespaar tijd.',
      cta: 'Meer',
      href: '/diensten#automatiseren',
      area: 'b',
      sectionId: 'automatiseren'
    },
    {
      kicker: 'Fulfilment',
      title: 'Fulfilment',
      description: 'Volledige fulfilment service voor je orders.',
      cta: 'Meer',
      href: '/diensten#fulfilment',
      area: 'c',
      sectionId: 'fulfilment'
    },
    {
      kicker: 'Software',
      title: 'Software',
      description: 'Krachtige software tools voor je bol.com business.',
      cta: 'Meer',
      href: '/diensten#software',
      area: 'd',
      sectionId: 'software'
    },
    {
      kicker: 'Consulting',
      title: 'Consulting',
      description: 'Persoonlijke begeleiding om je business te laten groeien.',
      cta: 'Meer',
      href: '/diensten#consulting',
      area: 'e',
      sectionId: 'consulting'
    },
    {
      kicker: 'Kennismaken?',
      title: 'Kennismaken?',
      description: 'Laten we kennismaken en kijken wat we voor elkaar kunnen betekenen.',
      cta: 'Meer',
      href: 'https://calendly.com/mouseclick2017/30min',
      area: 'f',
      sectionId: null,
      action: 'calendly'
    }
  ];

  // FAQ data - same as DienstenPage
  const faqs = [
    {
      question: 'Voor wie is Blueshipment geschikt?',
      answer: 'Blueshipment is geschikt voor zowel startende als groeiende bol.com-verkopers die hun operatie willen uitbesteden en professioneel willen opschalen, zonder afhankelijk te zijn van losse tools of externe partijen.'
    },
    {
      question: 'Hoe kan ik contact opnemen bij vragen of ondersteuning?',
      answer: 'Je hebt direct contact met ons team via e-mail, WhatsApp of een vast aanspreekpunt. Geen ticketsystemen of lange wachttijden, maar korte lijnen en snelle ondersteuning.'
    },
    {
      question: 'Waarom kiezen klanten voor Blueshipment?',
      answer: 'Omdat wij listings, software, automatisering en fulfilment combineren onder één dak. Eén partner, één strategie en volledige focus op groei en rendement.'
    },
    {
      question: 'Hoe snel verzenden jullie?',
      answer: 'Orders die binnenkomen worden dezelfde dag ingepakt en verzonden. Geen wachten, geen gedoe. Je klanten krijgen hun pakket snel en jij krijgt goede reviews.'
    },
    {
      question: 'Wat gebeurt er met retouren?',
      answer: 'Retouren worden door ons verwerkt en je ontvangt een volledige rapportage. We handelen alles af zodat jij je op nieuwe orders kunt concentreren. Dat kost je slechts €1,50 per retour.'
    },
    {
      question: 'Zijn er opslagkosten?',
      answer: 'Nee. Je voorraad staat veilig bij ons zonder aparte opslagkosten. Je betaalt alleen voor wat je verzend. Dat scheelt je honderden euro\'s per maand vergeleken met andere fulfilmentcentra.'
    },
    {
      question: 'Hoe werkt de listing-software?',
      answer: 'Je kunt gratis productlijsten bij ons afnemen die klaar zijn voor gebruik. Geen gedoe met handmatig invoeren. Alles is al ingesteld en je kunt direct beginnen met verkopen.'
    }
  ];

  useLayoutEffect(() => {
    // Initialize all animations
    initScrollAnimations();
    initTitleAnimations();
    initHeroTitleAnimation();
    initLogoRevealAnimation(1000); // 1 second delay for hero

    // Initialize team cards animation
    const teamGrid = document.querySelector('.team-grid');
    if (teamGrid) {
      initTeamCardsDotAccentAnimation(teamGrid);
    }

    // Ensure ScrollTrigger refreshes after layout is stable
    // Use double RAF to ensure all initial states are set and layout is calculated
    // Scroll-to-top wordt afgehandeld door ScrollToTop component bij navigatie
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

  // GSAP Bento Grid Animation
  // FIX: Use gsap.matchMedia to disable animation on mobile (max-width: 767px)
  useLayoutEffect(() => {
    if (!bentoRef.current) return;
    
    let ctx = null;
    let timeoutId = null;
    let mm = null;
    
    timeoutId = setTimeout(() => {
      const bento = bentoRef.current;
      if (!bento) return;
      
      const cards = cardRefs.current.filter(Boolean);
      if (cards.length === 0) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      ctx = gsap.context(() => {
        // Use gsap.matchMedia to separate mobile and desktop behavior
        mm = gsap.matchMedia();
        
        // MOBILE: Disable animation, show cards immediately
        mm.add('(max-width: 767px)', () => {
          // Reset all cards to visible state immediately
          cards.forEach((card) => {
            gsap.set(card, {
              opacity: 1,
              x: 0,
              y: 0,
              rotate: 0,
              willChange: 'auto'
            });
          });
        });
        
        // DESKTOP: Full animation with ScrollTrigger
        mm.add('(min-width: 768px)', () => {
          const bentoRect = bento.getBoundingClientRect();
          const containerWidth = bentoRect.width;
          const columnWidth = containerWidth / 3;

          const cardsWithData = cards.map((card) => {
            const cardRect = card.getBoundingClientRect();
            const relativeLeft = cardRect.left - bentoRect.left;
            const cardCenterX = relativeLeft + cardRect.width / 2;
            const relativeTop = cardRect.top - bentoRect.top;
            
            let columnIndex = 0;
            if (cardCenterX < columnWidth) {
              columnIndex = 0;
            } else if (cardCenterX < columnWidth * 2) {
              columnIndex = 1;
            } else {
              columnIndex = 2;
            }

            return {
              element: card,
              columnIndex,
              top: relativeTop,
              left: relativeLeft
            };
          });

          cardsWithData.sort((a, b) => {
            if (a.columnIndex !== b.columnIndex) {
              return a.columnIndex - b.columnIndex;
            }
            return b.top - a.top;
          });

          const columnCounts = [0, 0, 0];
          cardsWithData.forEach((cardData) => {
            cardData.indexInColumn = columnCounts[cardData.columnIndex];
            columnCounts[cardData.columnIndex]++;
          });

          cardsWithData.forEach((cardData) => {
            const { element, columnIndex } = cardData;
            
            let initialX = -80;
            let initialRotate = -2;
            
            if (columnIndex === 1) {
              initialX = 55;
              initialRotate = 1;
            } else if (columnIndex === 2) {
              initialX = 90;
              initialRotate = 2;
            }

            gsap.set(element, {
              opacity: 0,
              x: initialX,
              y: -18,
              rotate: initialRotate,
              willChange: 'transform, opacity'
            });
          });

          if (prefersReducedMotion) {
            cardsWithData.forEach((cardData) => {
              gsap.set(cardData.element, {
                opacity: 1,
                x: 0,
                y: 0,
                rotate: 0,
                willChange: 'auto'
              });
            });
            return;
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: bento,
              start: 'top 75%',
              end: 'top 20%',
              scrub: 1.5,
              invalidateOnRefresh: true
            }
          });

          cardsWithData.forEach((cardData) => {
            const { element, columnIndex, indexInColumn } = cardData;
            const position = columnIndex * 0.40 + indexInColumn * 0.8;

            tl.to(element, {
              opacity: 1,
              x: 0,
              y: 0,
              rotate: 0,
              duration: 1.5,
              ease: 'power2.out'
            }, position);
          });

          // Refresh ScrollTrigger after layout is calculated
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              ScrollTrigger.refresh();
            });
          });
        });
      }, bentoRef);
    }, 0);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (mm) mm.revert(); // Revert matchMedia (kills all ScrollTriggers and tweens)
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div className="app">
      <SEO
        title="Jouw all-in bol.com partner"
        description="BlueShipment is jouw all-in bol.com partner. Wij helpen je met productlistings, automatisering, fulfilment, software en consulting om je bol.com business te laten groeien. Meer dan 10.000 voltooide bestellingen."
        structuredData={combinedSchema}
      />
      <Navbar />
      <div className="page-content">
        <Hero />
      <div data-animate="fadeUp">
        <VideoSection />
      </div>
      <div data-animate="fadeRight">
        <ProcessSection />
      </div>
      <div data-animate="fadeUp">
        <ResultSection />
      </div>
      <div data-animate="scaleIn">
        <GallerySection />
      </div>
      {/* Services Bento Grid */}
      <div data-animate="fadeUp">
        <section className="diensten-services">
          <div className="diensten-services-container">
            <h2 className="diensten-services-title" data-animate-title>
              Alles onder 1 dak
            </h2>
            <p className="diensten-services-subtitle">
              Alle fulfilment diensten die nodig zijn voor jouw succes
            </p>
            <div className="diensten-bento-trigger" ref={bentoRef}>
              <div className="diensten-bento">
                {services.map((service, index) => {
                  const isFeatured = index < 2;
                  const cardClass = isFeatured 
                    ? 'diensten-card diensten-card--featured' 
                    : 'diensten-card diensten-card--compact';
                  
                  return (
                    <article 
                      key={service.area || index} 
                      ref={(el) => (cardRefs.current[index] = el)}
                      className={cardClass}
                      data-area={service.area}
                    >
                      {service.action === 'calendly' ? (
                        <button
                          className="diensten-card__button"
                          onClick={() => {
                            window.open('https://calendly.com/mouseclick2017/30min', '_blank', 'noopener,noreferrer');
                          }}
                          aria-label={service.title}
                        >
                          <div className="diensten-card__body">
                            <WatermarkIcon title={service.title} />
                            <h3 className="diensten-card__title">{service.title}</h3>
                            {service.description && (
                              <p className="diensten-card__text">{service.description}</p>
                            )}
                            <div className="diensten-card__footer">
                              <span className="diensten-card__link">
                                {service.cta} <span aria-hidden="true">→</span>
                              </span>
                            </div>
                          </div>
                        </button>
                      ) : (
                        <Link
                          to={service.href}
                          className="diensten-card__button"
                          aria-label={`Bekijk ${service.title}`}
                        >
                          <div className="diensten-card__body">
                            <WatermarkIcon title={service.title} />
                            <h3 className="diensten-card__title">{service.title}</h3>
                            {service.description && (
                              <p className="diensten-card__text">{service.description}</p>
                            )}
                            <div className="diensten-card__footer">
                              <span className="diensten-card__link">
                                {service.cta} <span aria-hidden="true">→</span>
                              </span>
                            </div>
                          </div>
                        </Link>
                      )}
                    </article>
                  );
                  })}
                <div className="diensten-services-cta" data-area="cta">
                  <Link to="/diensten" className="btn btn-primary">Bekijk alle diensten</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div data-animate="fadeUp">
        <TeamSection />
      </div>
      <div data-animate="fadeLeft">
        <TrustSection />
      </div>
      <WhatsAppSection />
      <div data-animate="fadeUp">
        <Testimonials />
      </div>
      <CTASection />
      <div data-animate="fadeUp">
        <FAQSection faqs={faqs} />
      </div>
      <div data-animate="fadeLeft">
        <LogoSection />
      </div>
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;

