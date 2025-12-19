import React, { useLayoutEffect, useRef } from 'react';
import './DienstenPage.css';
import Navbar from '../../components/layout/Navbar/Navbar';
import GlassTagline from '../../components/sections/GlassTagline/GlassTagline';
import FAQSection from '../../components/sections/FAQSection/FAQSection';
import DienstenSteps from '../../components/sections/Diensten/DienstenSteps';
import Footer from '../../components/layout/Footer/Footer';
import InfiniteGridOverlay from '../../components/ui/the-infinite-grid/InfiniteGridOverlay';
import { initScrollAnimations, initTitleAnimations, initHeroTitleAnimation, initLogoRevealAnimation, cleanupScrollAnimations } from '../../utils/scrollAnimations';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Icon components for visual elements
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function DienstenPage() {
  const bentoRef = useRef(null);
  const cardRefs = useRef([]);

  useLayoutEffect(() => {
    initScrollAnimations();
    initTitleAnimations();
    initHeroTitleAnimation();
    initLogoRevealAnimation(1000);

    return () => {
      cleanupScrollAnimations();
    };
  }, []);

  // GSAP Bento Grid Animation
  useLayoutEffect(() => {
    if (!bentoRef.current) return;
    
    let ctx = null;
    let timeoutId = null;
    
    // Wait for next frame to ensure layout is complete
    timeoutId = setTimeout(() => {
      const bento = bentoRef.current;
      if (!bento) return;
      
      const cards = cardRefs.current.filter(Boolean);
      if (cards.length === 0) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      ctx = gsap.context(() => {
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
            start: 'top 80%',
            end: 'top 30%',
            scrub: 0.6,
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
            duration: 1,
            ease: 'power3.out'
          }, position);
        });

        // Refresh ScrollTrigger to ensure correct start/end positions
        // Using setTimeout for better reliability with images/async content
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 50);
      }, bentoRef);
    }, 0);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
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
        { text: 'Contact via WhatsApp', type: 'primary' },
        { text: 'Lees meer', type: 'link' }
      ]
    },
    {
      id: 'kosten',
      label: 'Eerlijk',
      title: 'Geen verborgen kosten, alleen verzendtarieven',
      titleHighlight: 'alleen verzendtarieven',
      intro: 'Je betaalt precies wat je ziet. Geen onbekende kosten achteraf. Alleen per zending.',
      description: 'Bij Blueshipment geloven we in transparantie. Je ziet direct wat elke service kost, zonder verrassingen. We werken met duidelijke tarieven per zending, zodat je altijd weet waar je aan toe bent. Geen maandelijkse abonnementskosten, geen verborgen toeslagen - alleen wat je daadwerkelijk gebruikt.',
      bullets: [
        'Transparante prijzen voor elke service',
        'Geen instellingskosten of maandelijkse verplichtingen',
        'Schaal mee zonder extra uitgaven'
      ],
      buttons: [
        { text: 'Ontdekken', type: 'primary' },
        { text: 'Meer', type: 'link' }
      ]
    },
    {
      id: 'voorraad',
      label: 'Gratis',
      title: 'Voorraad opslaan zonder extra uitgaven',
      titleHighlight: 'zonder',
      intro: 'Je producten liggen veilig bij ons. Je betaalt alleen wanneer we verzenden. Geen opslagkosten, geen gedoe.',
      description: 'Je voorraad staat veilig opgeslagen in ons magazijn zonder dat je daarvoor extra betaalt. We rekenen alleen voor de verzendingen die we daadwerkelijk uitvoeren. Dit betekent dat je kunt opschalen zonder zorgen over stijgende opslagkosten. Perfect voor groeiende bedrijven die flexibiliteit nodig hebben.',
      bullets: [],
      buttons: [
        { text: 'Meer', type: 'primary' },
        { text: 'Lees meer', type: 'link' }
      ]
    },
    {
      id: 'retouren',
      label: 'Snel',
      title: 'Retouren afhandelen voor €1,50 per stuk',
      titleHighlight: '€1,50',
      intro: 'Klanten sturen terug, wij regelen het. Zo ervaar jij rust en houdt je tijd over voor zaken die winst opleveren.',
      description: 'Retouren zijn een onvermijdelijk onderdeel van e-commerce, maar ze hoeven niet jouw tijd te kosten. Ons team inspecteert elke retour, verwerkt deze en zorgt ervoor dat je voorraad automatisch wordt bijgewerkt. Alles voor een vaste prijs van €1,50 per retour, zonder verborgen kosten.',
      bullets: [
        'Inspectie en verwerking in één dag',
        'Automatische terugboeking naar je voorraad',
        'Klantcommunicatie volledig verzorgd'
      ],
      buttons: [
        { text: 'Meer', type: 'primary' },
        { text: 'Lees meer', type: 'link' }
      ]
    },
    {
      id: 'whatsapp',
      label: 'Snel',
      title: 'Antwoord binnen 30 minuten via WhatsApp',
      titleHighlight: 'binnen 30 minuten',
      intro: 'Geen wachtrijen, geen automatische antwoorden. Je krijgt echt iemand aan de lijn die je helpt. Altijd bereikbaar.',
      description: 'We weten hoe frustrerend het kan zijn om te wachten op antwoorden. Daarom garanderen we een reactie binnen 30 minuten via WhatsApp. Ons team kent jouw account en kan direct helpen met vragen over orders, voorraad of technische zaken. Persoonlijk contact, geen chatbots.',
      bullets: [],
      buttons: [
        { text: 'Meer', type: 'primary' },
        { text: 'Lees meer', type: 'link' }
      ]
    },
    {
      id: 'va-team',
      label: 'VA Team',
      title: 'Virtual assistants verwerken alles voor je',
      titleHighlight: 'Virtual assistants',
      description: 'Ons VA team neemt alle administratieve taken uit je handen. Van orderverwerking tot klantcommunicatie, alles wordt professioneel en efficiënt afgehandeld. Je kunt je volledig focussen op groei en strategie, terwijl wij zorgen voor een vlekkeloze dagelijkse operatie.',
      bullets: [
        'Orderverwerking en administratie',
        'Klantcommunicatie en support',
        'Voorraadbeheer en rapportage'
      ],
      buttons: [
        { text: 'Meer', type: 'primary' },
        { text: 'Lees meer', type: 'link' }
      ]
    }
  ];

  // Helper function to scroll to section with navbar offset
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

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

    // Focus for accessibility
    element.setAttribute('tabIndex', '-1');
    setTimeout(() => {
      element.focus({ preventScroll: true });
    }, 500);
  };

  // Service cards data
  const services = [
    {
      kicker: 'Opslag',
      title: 'Opslag zonder extra kosten',
      description: 'Maatwerk tarieven voor jouw situatie.',
      cta: 'Meer',
      href: '/diensten/opslag',
      area: 'a',
      sectionId: 'voorraad'
    },
    {
      kicker: 'Retouren',
      title: 'Retouren afhandelen voor slechts €1,50 per stuk.',
      description: '',
      cta: 'Meer',
      href: '/diensten/retouren',
      area: 'b',
      sectionId: 'retouren'
    },
    {
      kicker: 'Verzending',
      title: 'Verzending en picking',
      description: 'Orders worden snel en zorgvuldig verwerkt.',
      cta: 'Meer',
      href: '/diensten/verzending',
      area: 'c',
      sectionId: 'kosten'
    },
    {
      kicker: 'Software',
      title: 'Gratis productlistings gebaseerd op je bronnen.',
      description: 'Onze eigen software gratis door jou te gebruiken',
      cta: 'Meer',
      href: '/diensten/listings',
      area: 'd',
      sectionId: 'productlistings'
    },
    {
      kicker: 'VA Team',
      title: 'Ons VA team staat voor je klaar',
      description: 'Virtual assistants regelen orders en klantvragen.',
      cta: 'Meer',
      href: '/diensten/va-team',
      area: 'e',
      sectionId: 'va-team'
    },
    {
      kicker: 'Voorraad',
      title: 'Voorraadbeheer',
      description: 'Je ziet precies wat je hebt liggen. De software synchroniseert real-time met je bol-account.',
      cta: 'Meer',
      href: '/diensten/voorraad',
      area: 'f',
      sectionId: 'voorraad'
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
      
      {/* Hero Section - Reusing hero layout pattern */}
      <section className="diensten-hero">
        <InfiniteGridOverlay opacity={0.5} />
        <div className="diensten-hero-content">
          <div className="diensten-hero-text">
            <GlassTagline withDot>
              <p>Diensten</p>
            </GlassTagline>
            
            <div className="diensten-hero-title-section">
              <h1 className="diensten-hero-title" data-animate-title>
                Alles wat je nodig<br />hebt...
              </h1>
              <p className="diensten-hero-subtitle">
                Zes diensten die samen werken.
              </p>
            </div>

            <p className="diensten-hero-intro">
              Wij nemen de logistiek uit je handen zodat jij je kunt concentreren op wat echt telt. Van opslag tot verzending tot retourverwerking, alles gebeurt hier zonder gedoe.
            </p>

            <div className="diensten-hero-ctas">
              <button className="btn btn-primary">
                Starten
              </button>
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
                            <p className="diensten-card__kicker">{service.kicker}</p>
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
                    <div className="diensten-detail-ctas">
                      {detail.buttons.map((button, buttonIndex) => {
                        if (button.type === 'link') {
                          return (
                            <a key={buttonIndex} href="#" className="diensten-detail-link">
                              {button.text}
                            </a>
                          );
                        }
                        const buttonClass = `btn btn-${button.type}`;
                        return (
                          <button key={buttonIndex} className={buttonClass}>
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

      {/* Footer */}
      <div data-animate="fadeUpScale">
        <Footer />
      </div>
    </div>
  );
}

export default DienstenPage;
