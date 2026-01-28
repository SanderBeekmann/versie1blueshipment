import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './DienstenPage.css';
import Navbar from '../../components/layout/Navbar/Navbar';
import GlassTagline from '../../components/sections/GlassTagline/GlassTagline';
import FAQSection from '../../components/sections/FAQSection/FAQSection';
import DienstenSteps from '../../components/sections/Diensten/DienstenSteps';
import DienstenDetailsSection from '../../components/sections/Diensten/DienstenDetailsSection';
import Footer from '../../components/layout/Footer/Footer';
import InfiniteGridOverlay from '../../components/ui/the-infinite-grid/InfiniteGridOverlay';
import PricingModal from '../../components/ui/PricingModal/PricingModal';
import SEO from '../../components/SEO/SEO';
import { initScrollAnimations, initTitleAnimations, initHeroTitleAnimation, initLogoRevealAnimation, cleanupScrollAnimations } from '../../utils/scrollAnimations';
import { openWhatsApp } from '../../utils/whatsapp';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WatermarkIcon } from '../../utils/bentoCardIcons';
import listingsImage from '../../assets/listings.webp';
import automatiseringImage from '../../assets/automatisering.webp';
import fulfilmentImage from '../../assets/fulfilment.webp';
import softwareImage from '../../assets/software.webp';

// Icon components for visual elements
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path 
      d="M20 6L9 17L4 12" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

function DienstenPage() {
  const bentoRef = useRef(null);
  const cardRefs = useRef([]);
  const location = useLocation();
  const hasScrolledToHashRef = useRef(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

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

    // Animate detail section images
    const animateDetailImages = () => {
      const imageWrappers = document.querySelectorAll('[data-animate-image]');
      if (imageWrappers.length === 0) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobileDevice = window.innerWidth < 768;

      imageWrappers.forEach((wrapper, index) => {
        const animationType = wrapper.getAttribute('data-animate-image');
        
        // Set initial state based on animation type (opacity always 1)
        if (animationType === 'fadeLeft') {
          gsap.set(wrapper, { opacity: 1, x: -40, scale: 0.95 });
        } else if (animationType === 'fadeRight') {
          gsap.set(wrapper, { opacity: 1, x: 40, scale: 0.95 });
        } else if (animationType === 'fadeUp') {
          gsap.set(wrapper, { opacity: 1, y: 40, scale: 0.95 });
        } else {
          gsap.set(wrapper, { opacity: 1, scale: 0.9 });
        }

        // Skip animation on mobile or reduced motion
        if (isMobileDevice || prefersReducedMotion) {
          gsap.set(wrapper, { opacity: 1, x: 0, y: 0, scale: 1 });
          return;
        }

        // Animate with ScrollTrigger (opacity stays at 1)
        const animationProps = {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power2.out',
          delay: index * 0.1,
          scrollTrigger: {
            trigger: wrapper,
            start: 'top 85%',
            once: true,
            invalidateOnRefresh: true,
          },
        };

        // Add x or y based on animation type
        if (animationType === 'fadeLeft' || animationType === 'fadeRight') {
          animationProps.x = 0;
        } else if (animationType === 'fadeUp') {
          animationProps.y = 0;
        }

        gsap.to(wrapper, animationProps);
      });
    };

    // Wait for images to load and then animate
    const imageAnimationTimeout = setTimeout(() => {
      animateDetailImages();
    }, 200);
    
    return () => {
      clearTimeout(refreshTimeout);
      clearTimeout(imageAnimationTimeout);
      cleanupScrollAnimations();
    };
  }, []);

  // GSAP animation for bullet checkmarks
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      const bulletLists = document.querySelectorAll('[data-bullet-list]');
      
      bulletLists.forEach((list) => {
        const bullets = list.querySelectorAll('.diensten-detail-bullet');
        if (bullets.length === 0) return;

        const lastBullet = bullets[bullets.length - 1];
        const paths = Array.from(bullets).map(bullet => 
          bullet.querySelector('svg path')
        ).filter(Boolean);

        if (paths.length === 0) return;

        // Calculate path length for each path and set initial state
        paths.forEach(path => {
          const pathLength = path.getTotalLength();
          gsap.set(path, {
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength
          });
        });

        ScrollTrigger.create({
          trigger: lastBullet,
          start: 'top 75%',
          once: true,
          onEnter: () => {
            gsap.to(paths, {
              strokeDashoffset: 0,
              duration: 0.6,
              ease: 'power2.out',
              stagger: 0.1
            });
          }
        });
      });
    });

    return () => ctx.revert();
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
      label: 'Productlistings',
      title: 'Productlistings die écht verkopen',
      titleHighlight: 'Productlistings',
      intro: 'Productlistings zijn de advertenties waarmee jouw producten zichtbaar worden op bol.com. Ze bepalen of bezoekers klikken, vertrouwen krijgen en uiteindelijk kopen.',
      description: 'Productlistings zijn de advertenties waarmee jouw producten zichtbaar worden op bol.com. Ze bepalen of bezoekers klikken, vertrouwen krijgen en uiteindelijk kopen. Wij maken deze listings volledig voor je: geoptimaliseerd op zoekgedrag, conversie en bol.com-richtlijnen. Zo hoef jij niet handmatig honderden listings aan te maken en kun je direct zorgeloos verkopen. Blueshipment is het all-in platform dat productcreatie, logistiek en verkoop samenbrengt in één schaalbaar businessmodel.',
      image: listingsImage,
      bullets: [
        'Automatische synchronisatie met je bronnen',
        'Prijzen en voorraad altijd up-to-date',
        'Bulk uploaden in minuten, niet uren'
      ],
      buttons: [
        { text: 'Bekijk tarieven', type: 'primary', action: 'pricing' }
      ]
    },
    {
      id: 'automatiseren',
      label: 'Automatiseren',
      title: 'Slim automatiseren, meer tijd voor groei',
      titleHighlight: 'Automatiseren',
      intro: 'Bestellingen, klantvragen, retouren en winstberekeningen worden automatisch verwerkt.',
      description: 'Bestellingen, klantvragen, retouren en winstberekeningen worden automatisch verwerkt. Dit wordt mogelijk gemaakt door een combinatie van ons ervaren team en slimme A.I.-software, zodat processen sneller, foutloos en schaalbaar verlopen.',
      image: automatiseringImage,
      bullets: [
        'Automatiseer jouw',
        'Bestellingen',
        'Klantvragen',
        'Retouren',
        'Winstberekeningen'
      ],
      buttons: [
        { text: 'Vraag een demo aan', type: 'primary', action: 'whatsapp', message: 'Hallo! Ik wil graag een demo van de automatiseringstools.' }
      ]
    },
    {
      id: 'fulfilment',
      label: 'Fulfilment',
      title: 'Stuur je bestellingen naar het BlueShipment Fulfilment Center',
      titleHighlight: 'Blue',
      intro: 'Onze fulfillment service omvat alles wat je nodig hebt: opslag, picking, verpakking en verzending. Je voorraad staat veilig bij ons en we verzenden snel en zorgvuldig. Geen gedoe, geen zorgen. Wij zorgen ervoor dat je klanten tevreden zijn.',
      description: 'Onze fulfillment service omvat alles wat je nodig hebt: opslag, picking, verpakking en verzending. Je voorraad staat veilig bij ons en we verzenden snel en zorgvuldig. Geen gedoe, geen zorgen. Wij zorgen ervoor dat je klanten tevreden zijn.',
      image: fulfilmentImage,
      bullets: [
        'All-in tarieven, geen onverwachte kosten',
        'Snelle levering',
        'Zorgvuldige verpakking en verzending',
        'We denken met je mee en zijn altijd bereikbaar'
      ],
      buttons: [
        { text: 'Start met fulfilment', type: 'primary', action: 'whatsapp', message: 'Hallo! Ik wil graag starten met fulfilment voor mijn bol.com shop.' }
      ]
    },
    {
      id: 'software',
      label: 'Software',
      title: 'Alles-in-één software voor groei',
      titleHighlight: 'Software',
      intro: 'Beheer je voorraad, optimaliseer je listings, analyseer data en schaal je bol.com-winkel vanuit één omgeving.',
      description: 'Beheer je voorraad, optimaliseer je listings, analyseer data en schaal je bol.com-winkel vanuit één omgeving. Onze software is gebouwd voor controle, inzicht en groei - zonder losse tools of handmatig werk.',
      image: softwareImage,
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
      id: 'consulting',
      label: 'Consulting',
      title: 'Strategisch advies dat resultaat oplevert',
      titleHighlight: 'strategisch advies',
      intro: 'Met onze expertise en praktijkervaring op bol.com helpen wij je onderneming gericht vooruit.',
      description: 'Met onze expertise en praktijkervaring op bol.com helpen wij je onderneming gericht vooruit. Onze consultants en partners hebben bewezen ervaring in het optimaliseren van winkels voor meer omzet, betere marges en duurzame groei.',
      bullets: [
        'Persoonlijke begeleiding',
        'Strategisch advies',
        'Praktische tips en best practices'
      ],
      buttons: [
        { text: 'Boek een gesprek', type: 'primary', action: 'calendly' }
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

  // FAQ data for this page
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
              <Link 
                to="/intake"
                className="btn btn-primary"
              >
                Start nu
              </Link>
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
                        key={service.area || index} 
                        ref={(el) => (cardRefs.current[index] = el)}
                        className={cardClass}
                        data-area={service.area}
                      >
                        <button
                          className="diensten-card__button"
                          onClick={() => {
                            if (service.action === 'calendly') {
                              window.location.href = '/intake';
                            } else if (service.sectionId) {
                              scrollToSection(service.sectionId);
                            }
                          }}
                          aria-label={service.sectionId ? `Scroll naar ${service.title}` : service.title}
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
        <DienstenDetailsSection>
          <section className="diensten-details">
            <div className="diensten-details-container">
              {serviceDetails.map((detail, index) => {
                const isReverse = index % 2 === 1;
                const blockClass = isReverse 
                  ? 'diensten-detail-block diensten-detail-block--reverse' 
                  : 'diensten-detail-block';
                
                return (
                  <div key={index} id={detail.id} className={blockClass} tabIndex="-1">
                    {detail.image ? (
                      <div className={`diensten-detail-image-wrapper ${
                        detail.id === 'productlistings'
                          ? 'diensten-detail-image-wrapper--half-size' 
                          : detail.id === 'fulfilment' || detail.id === 'software'
                          ? 'diensten-detail-image-wrapper--scale-60'
                          : detail.id === 'automatiseren' 
                          ? 'diensten-detail-image-wrapper--scale-80' 
                          : ''
                      }`} data-animate-image={isReverse ? 'fadeLeft' : 'fadeRight'}>
                        <img src={detail.image} alt={detail.title || detail.label} className="diensten-detail-image" loading="lazy" />
                      </div>
                    ) : (
                      <div className="diensten-detail-media"></div>
                    )}
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
                        <ul className="diensten-detail-bullets" data-bullet-list={detail.id}>
                          {detail.bullets.map((bullet, bulletIndex) => (
                            <li key={bulletIndex} className="diensten-detail-bullet">
                              <CheckIcon />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="diensten-detail-media-mobile">
                        {detail.image && (
                          <div className={`diensten-detail-image-wrapper ${
                            detail.id === 'productlistings'
                              ? 'diensten-detail-image-wrapper--half-size' 
                              : detail.id === 'fulfilment' || detail.id === 'software'
                              ? 'diensten-detail-image-wrapper--scale-60'
                              : detail.id === 'automatiseren' 
                              ? 'diensten-detail-image-wrapper--scale-80' 
                              : ''
                          }`} data-animate-image="fadeUp">
                            <img src={detail.image} alt={detail.title || detail.label} className="diensten-detail-image" loading="lazy" />
                          </div>
                        )}
                      </div>
                      <div className="diensten-detail-ctas">
                        {detail.buttons.map((button, buttonIndex) => {
                          const handleClick = (e) => {
                            e.preventDefault();
                            
                            if (button.action === 'whatsapp') {
                              openWhatsApp(button.message || 'Hallo! Ik heb een vraag over deze dienst.');
                            } else if (button.action === 'calendly') {
                              window.location.href = '/intake';
                            } else if (button.action === 'pricing') {
                              setIsPricingModalOpen(true);
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
        </DienstenDetailsSection>
      </div>

      {/* FAQ Section - Reusing existing component */}
      <div data-animate="fadeUp">
        <FAQSection faqs={faqs} noTopPadding={true} />
      </div>
      </div>
      {/* Footer - Outside page-content to ensure correct z-index stacking */}
      <Footer />
      
      {/* Pricing Modal */}
      <PricingModal 
        isOpen={isPricingModalOpen} 
        onClose={() => setIsPricingModalOpen(false)} 
      />
    </div>
  );
}

export default DienstenPage;
