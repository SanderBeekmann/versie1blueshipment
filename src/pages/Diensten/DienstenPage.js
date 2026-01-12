import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './DienstenPage.css';
import Navbar from '../../components/layout/Navbar/Navbar';
import GlassTagline from '../../components/sections/GlassTagline/GlassTagline';
import FAQSection from '../../components/sections/FAQSection/FAQSection';
import DienstenSteps from '../../components/sections/Diensten/DienstenSteps';
import Footer from '../../components/layout/Footer/Footer';
import InfiniteGridOverlay from '../../components/ui/the-infinite-grid/InfiniteGridOverlay';
import { initScrollAnimations, initTitleAnimations, initHeroTitleAnimation, initLogoRevealAnimation, cleanupScrollAnimations } from '../../utils/scrollAnimations';
import { openWhatsApp } from '../../utils/whatsapp';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WatermarkIcon } from '../../utils/bentoCardIcons';

// Icon components for visual elements
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function DienstenPage() {
  const bentoRef = useRef(null);
  const cardRefs = useRef([]);
  const location = useLocation();
  const hasScrolledToHashRef = useRef(false);

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
    // FIX 3: Detect mobile once - disable ScrollTrigger on mobile to prevent scroll conflicts
    // Mobile doesn't need ScrollTrigger - it causes scroll conflicts
    const isMobileStatic = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
    
    // Only initialize ScrollTrigger animations on desktop
    if (!isMobileStatic) {
      initScrollAnimations();
      initTitleAnimations();
      initLogoRevealAnimation(1000);
    }
    
    // Hero title animation moet ALTIJD werken (ook op mobile)
    // ScrollTrigger animaties zijn alleen voor andere secties
    initHeroTitleAnimation();

    // Animate hero buttons (DienstenPage specific)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      const heroCtas = document.querySelector('.diensten-hero-ctas');
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
      const heroCtas = document.querySelector('.diensten-hero-ctas');
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

    // FIX 1: Simplified ScrollTrigger refresh - removed mobile scroll restoration
    // No scrollTo calls, no rAF nesting - let browser handle scroll naturally
    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh(true);
    }, 150);
    
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
    
    // Wait for next frame to ensure layout is complete
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
          // Get container bounds for column detection
          const bentoRect = bento.getBoundingClientRect();
          const containerWidth = bentoRect.width;
          const columnWidth = containerWidth / 3;

          // Prepare cards with column detection based on their center position
          const cardsWithData = cards.map((card) => {
            const cardRect = card.getBoundingClientRect();
            const relativeLeft = cardRect.left - bentoRect.left;
            const cardCenterX = relativeLeft + cardRect.width / 2;
            const relativeTop = cardRect.top - bentoRect.top;
            
            // Determine column (0 = left, 1 = middle, 2 = right)
            // Use thirds of container width
            let columnIndex = 0;
            if (cardCenterX < columnWidth) {
              columnIndex = 0; // Left
            } else if (cardCenterX < columnWidth * 2) {
              columnIndex = 1; // Middle
            } else {
              columnIndex = 2; // Right
            }

            return {
              element: card,
              columnIndex,
              top: relativeTop,
              left: relativeLeft
            };
          });

          // Sort by column, then by vertical position (bottom first, then top within each column)
          cardsWithData.sort((a, b) => {
            if (a.columnIndex !== b.columnIndex) {
              return a.columnIndex - b.columnIndex;
            }
            // Sort by top in reverse (highest first = bottom first)
            return b.top - a.top;
          });

          // Calculate index within column for stagger
          const columnCounts = [0, 0, 0];
          cardsWithData.forEach((cardData) => {
            cardData.indexInColumn = columnCounts[cardData.columnIndex];
            columnCounts[cardData.columnIndex]++;
          });

          // Set initial state for all cards (before timeline)
          cardsWithData.forEach((cardData) => {
            const { element, columnIndex } = cardData;
            
            // Determine initial x offset based on column
            let initialX = -80; // Left column
            let initialRotate = -2;
            
            if (columnIndex === 1) {
              initialX = 55; // Middle column
              initialRotate = 1;
            } else if (columnIndex === 2) {
              initialX = 90; // Right column
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

          // If reduced motion, show cards immediately
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

          // Create timeline with ScrollTrigger scrub
          // Note: bento is the trigger wrapper (diensten-bento-trigger)
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: bento,
              start: 'top 85%',
              end: 'top 20%',
              scrub: 1.5,
              invalidateOnRefresh: true
            }
          });

          // Add animations to timeline using position offsets (not delay)
          cardsWithData.forEach((cardData) => {
            const { element, columnIndex, indexInColumn } = cardData;
            
            // Calculate timeline position: column delay + stagger within column
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

          // ScrollTrigger refresh after animation setup
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 50);
        });
      }, bentoRef);
    }, 0);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (mm) mm.revert(); // Revert matchMedia (kills all ScrollTriggers and tweens)
      if (ctx) ctx.revert();
    };
  }, []); // Run once on mount - services is constant

  // Service detail blocks data
  const serviceDetails = [
    {
      id: 'productlistings',
      label: 'Direct',
      title: 'Productlistings geautomatiseerd, zonder kosten',
      titleHighlight: 'Productlistings',
      intro: 'Gebruik onze software om je producten direct op bol te zetten. Geen instellingskosten, geen maandelijkse vergoeding.',
      description: 'Onze software integreert naadloos met je bestaande systemen en zorgt ervoor dat je producten automatisch worden gesynchroniseerd. Dit betekent dat je geen tijd meer hoeft te besteden aan handmatig invoeren of bijwerken van je listings. Alles gebeurt automatisch, zodat jij je kunt focussen op groei en verkoop.',
      bullets: [
        'Automatische synchronisatie met je bronnen',
        'Prijzen en voorraad altijd up-to-date',
        'Bulk uploaden in minuten, niet uren'
      ],
      buttons: [
        { text: 'Contact via WhatsApp', type: 'primary', action: 'whatsapp', message: 'Hallo! Ik wil graag meer weten over productlistings.' }
      ]
    },
    {
      id: 'automatiseren',
      label: 'Efficiënt',
      title: 'Automatiseer je processen en bespaar tijd',
      titleHighlight: 'Automatiseren',
      intro: 'Laat technologie het werk voor je doen. Automatiseer repetitieve taken en focus op wat echt belangrijk is.',
      description: 'Met onze automatiseringstools kun je je dagelijkse processen stroomlijnen. Van orderverwerking tot voorraadbeheer, alles draait automatisch op de achtergrond. Dit geeft je de tijd en ruimte om te groeien en te focussen op strategische beslissingen.',
      bullets: [
        'Automatische orderverwerking',
        'Geïntegreerde workflows',
        'Tijd besparen op repetitieve taken'
      ],
      buttons: [
        { text: 'Vraag een demo aan', type: 'primary', action: 'whatsapp', message: 'Hallo! Ik wil graag een demo van de automatiseringstools.' }
      ]
    },
    {
      id: 'fulfilment',
      label: 'Volledig',
      title: 'Volledige fulfilment service voor je orders',
      titleHighlight: 'Fulfilment',
      intro: 'Van opslag tot verzending, wij regelen alles. Je producten liggen veilig en orders worden snel verwerkt.',
      description: 'Onze fulfilment service omvat alles wat je nodig hebt: opslag, picking, verpakking en verzending. Je voorraad staat veilig bij ons en we verzenden snel en zorgvuldig. Geen gedoe, geen zorgen - wij zorgen ervoor dat je klanten tevreden zijn.',
      bullets: [
        'Opslag zonder extra kosten',
        'Snelle orderverwerking',
        'Zorgvuldige verpakking en verzending'
      ],
      buttons: [
        { text: 'Start met fulfilment', type: 'primary', action: 'whatsapp', message: 'Hallo! Ik wil graag starten met fulfilment voor mijn bol.com shop.' }
      ]
    },
    {
      id: 'software',
      label: 'Krachtig',
      title: 'Krachtige software tools voor je bol.com business',
      titleHighlight: 'Software',
      intro: 'Gebruik onze software om je business te optimaliseren. Alles wat je nodig hebt in één platform.',
      description: 'Onze software suite biedt alle tools die je nodig hebt om je bol.com business succesvol te runnen. Van voorraadbeheer tot analytics, alles is geïntegreerd en werkt naadloos samen. Geen losse systemen meer, alles op één plek.',
      bullets: [
        'Geïntegreerd platform',
        'Real-time synchronisatie',
        'Uitgebreide analytics en rapportage'
      ],
      buttons: [
        { text: 'Vraag een demo aan', type: 'primary', action: 'whatsapp', message: 'Hallo! Ik wil graag een demo van de software tools.' }
      ]
    },
    {
      id: 'coaching',
      label: 'Persoonlijk',
      title: 'Persoonlijke begeleiding om je business te laten groeien',
      titleHighlight: 'Coaching',
      intro: 'Krijg persoonlijke begeleiding van experts die weten hoe je een succesvolle bol.com business opbouwt.',
      description: 'Onze coaching service helpt je om je business naar het volgende niveau te tillen. We delen onze kennis en ervaring en begeleiden je stap voor stap. Van strategie tot uitvoering, we staan naast je om je te helpen groeien.',
      bullets: [
        'Persoonlijke begeleiding',
        'Strategisch advies',
        'Praktische tips en best practices'
      ],
      buttons: [
        { text: 'Boek een gesprek', type: 'primary', action: 'calendly' }
      ]
    },
    {
      id: 'scaling',
      label: 'Groeien',
      title: 'Schaal je business naar het volgende niveau',
      titleHighlight: 'Scaling',
      intro: 'Klaar om te groeien? Wij helpen je om je business te schalen zonder de controle te verliezen.',
      description: 'Scaling betekent niet alleen meer verkopen - het betekent ook je processen optimaliseren en je infrastructuur voorbereiden op groei. We helpen je om systematisch te groeien, met behoud van kwaliteit en controle. Van 10 naar 100 naar 1000 orders per dag.',
      bullets: [
        'Systematische groei',
        'Procesoptimalisatie',
        'Infrastructuur die meeschaalt'
      ],
      buttons: [
        { text: 'Plan een strategiegesprek', type: 'primary', action: 'calendly' }
      ]
    }
  ];

  // Helper function to scroll to section with navbar offset
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (!element) {
      console.log('[DienstenPage] scrollToSection: element not found', sectionId);
      return;
    }

    // Get navbar height or use fallback
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar?.offsetHeight || 110;
    const offset = navbarHeight + 20; // Extra 20px spacing

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  // FIX 2: Handle hash navigation - scroll to section only once when hash is present
  // Prevents repeated scrolling on mobile viewport changes
  useEffect(() => {
    // Don't scroll if we already handled this hash
    if (!location.hash || hasScrolledToHashRef.current) return;

    const timeout = setTimeout(() => {
      const sectionId = location.hash.substring(1); // Remove #
      scrollToSection(sectionId);
      hasScrolledToHashRef.current = true;
    }, 300);

    return () => clearTimeout(timeout);
  }, [location.hash]);

  // Service cards data
  const services = [
    {
      kicker: 'Productlistings',
      title: 'Productlistings',
      description: 'Professionele productlistings voor je bol.com shop.',
      cta: 'Meer',
      href: '/diensten/productlistings',
      area: 'a',
      sectionId: 'productlistings'
    },
    {
      kicker: 'Automatiseren',
      title: 'Automatiseren',
      description: 'Automatiseer je processen en bespaar tijd.',
      cta: 'Meer',
      href: '/diensten/automatiseren',
      area: 'b',
      sectionId: 'automatiseren'
    },
    {
      kicker: 'Fulfilment',
      title: 'Fulfilment',
      description: 'Volledige fulfilment service voor je orders.',
      cta: 'Meer',
      href: '/diensten/fulfilment',
      area: 'c',
      sectionId: 'fulfilment'
    },
    {
      kicker: 'Software',
      title: 'Software',
      description: 'Krachtige software tools voor je bol.com business.',
      cta: 'Meer',
      href: '/diensten/software',
      area: 'd',
      sectionId: 'software'
    },
    {
      kicker: 'Coaching',
      title: 'Coaching',
      description: 'Persoonlijke begeleiding om je business te laten groeien.',
      cta: 'Meer',
      href: '/diensten/coaching',
      area: 'e',
      sectionId: 'coaching'
    },
    {
      kicker: 'Scaling',
      title: 'Scaling',
      description: 'Schaal je business naar het volgende niveau.',
      cta: 'Meer',
      href: '/diensten/scaling',
      area: 'f',
      sectionId: 'scaling'
    }
  ];

  // FAQ data for this page
  const faqs = [
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
    },
    {
      question: 'Hoe bereik ik jullie als ik vragen heb?',
      answer: 'Via WhatsApp. We reageren binnen dertig minuten op je bericht. Geen wachtrijen, geen e-mails die verdwijnen. Je spreekt ons rechtstreeks en krijgt antwoord als je ons nodig hebt.'
    }
  ];

  return (
    <div className="app">
      <Navbar />
      <div className="page-content">
      {/* Hero Section - Reusing hero layout pattern */}
      <section className="diensten-hero">
        {!isMobile && <InfiniteGridOverlay opacity={0.5} />}
        <div className="diensten-hero-content">
          <div className="diensten-hero-text">
            <GlassTagline withDot>
              <p>Diensten</p>
            </GlassTagline>
            
            <div className="diensten-hero-title-section">
              <h1 className="diensten-hero-title" data-animate-title>
                Alles wat je <span className="diensten-hero-word-nodig">nodig</span><br />hebt...
              </h1>
              <p className="diensten-hero-subtitle">
                Zes diensten die samen werken.
              </p>
            </div>

            <p className="diensten-hero-intro">
              Wij nemen de logistiek uit je handen zodat jij je kunt concentreren op wat echt telt. Van opslag tot verzending tot retourverwerking, alles gebeurt hier zonder gedoe.
            </p>

            <div className="diensten-hero-ctas">
              <a 
                href="https://calendly.com/mouseclick2017/30min" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Start nu
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section A: Services Overview - Premium Bento Grid Layout */}
      <div data-animate="fadeUp">
        <section className="diensten-services">
          <div className="diensten-services-container">
            <h2 className="diensten-services-title" data-animate-title>
              ...onder 1 dak
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
                        key={index} 
                        ref={(el) => (cardRefs.current[index] = el)}
                        className={cardClass}
                        data-area={service.area}
                      >
                        <button
                          className="diensten-card__button"
                          onClick={() => {
                            if (service.sectionId) {
                              scrollToSection(service.sectionId);
                            }
                          }}
                          aria-label={`Scroll naar ${service.title}`}
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
                      </article>
                    );
                  })}
                  <div className="diensten-services-cta" data-area="cta">
            <button className="btn btn-primary">Starten</button>
          </div>
                </div>
            </div>
          </div>
        </section>
      </div>

      {/* New Steps Section - Grid layout with icons */}
      <div data-animate="fadeUp">
        <DienstenSteps />
      </div>

      {/* Section A.5: Service Details - Alternating layout blocks */}
      <div data-animate="fadeUp">
        <section className="diensten-details">
          <div className="diensten-details-container">
            {serviceDetails.map((detail, index) => {
              const isReverse = index % 2 === 1;
              const blockClass = isReverse 
                ? 'diensten-detail-block diensten-detail-block--reverse' 
                : 'diensten-detail-block';
              
              return (
                <div key={index} id={detail.id} className={blockClass} tabIndex="-1">
                  <div className="diensten-detail-media"></div>
                  <div className="diensten-detail-content">
                    <p className="diensten-detail-label">{detail.label}</p>
                    <h2 className="diensten-detail-title" data-animate-title>
                      {detail.titleHighlight ? (
                        <>
                          {detail.title.split(detail.titleHighlight).map((part, index, parts) => (
                            <React.Fragment key={index}>
                              {part}
                              {index < parts.length - 1 && (
                                <span className="text-blue">{detail.titleHighlight}</span>
                              )}
                            </React.Fragment>
                          ))}
                        </>
                      ) : (
                        detail.title
                      )}
                    </h2>
                    {detail.description && (
                      <p className="diensten-detail-description">{detail.description}</p>
                    )}
                    {detail.bullets && detail.bullets.length > 0 && (
                      <ul className="diensten-detail-bullets">
                        {detail.bullets.map((bullet, bulletIndex) => (
                          <li key={bulletIndex} className="diensten-detail-bullet">
                            <CheckIcon />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="diensten-detail-media-mobile"></div>
                    <div className="diensten-detail-ctas">
                      {detail.buttons.map((button, buttonIndex) => {
                        const handleClick = (e) => {
                          e.preventDefault();
                          
                          if (button.action === 'whatsapp') {
                            openWhatsApp(button.message || 'Hallo! Ik heb een vraag over deze dienst.');
                          } else if (button.action === 'calendly') {
                            window.open('https://calendly.com/mouseclick2017/30min', '_blank', 'noopener,noreferrer');
                          } else if (button.action === 'scroll' && button.target) {
                            scrollToSection(button.target);
                          }
                        };

                        if (button.type === 'link') {
                          return (
                            <button
                              key={buttonIndex}
                              type="button"
                              className="diensten-detail-link"
                              onClick={handleClick}
                            >
                              {button.text}
                            </button>
                          );
                        }
                        const buttonClass = `btn btn-${button.type}`;
                        return (
                          <button 
                            key={buttonIndex} 
                            className={buttonClass}
                            onClick={handleClick}
                          >
                            {button.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* FAQ Section - Reusing existing component */}
      <div data-animate="fadeUp">
        <FAQSection faqs={faqs} />
      </div>
      </div>
      {/* Footer - Outside page-content to ensure correct z-index stacking */}
      <Footer />
    </div>
  );
}

export default DienstenPage;
