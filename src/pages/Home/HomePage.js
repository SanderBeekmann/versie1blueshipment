import React, { useLayoutEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';
import '../../styles/App.css';
import '../Diensten/DienstenPage.css';
import Navbar from '../../components/layout/Navbar/Navbar';
import Hero from '../../components/sections/Hero/Hero';
import VideoSection from '../../components/sections/VideoSection/VideoSection';
import LogoSection from '../../components/sections/LogoSection/LogoSection';
import ProcessSection from '../../components/sections/ProcessSection/ProcessSection';
import GallerySection from '../../components/sections/GallerySection/GallerySection';
import TeamSection from '../../components/sections/TeamSection/TeamSection';
import FeaturesSection from '../../components/sections/FeaturesSection/FeaturesSection';
import WhatsAppSection from '../../components/sections/WhatsAppSection/WhatsAppSection';
import CTASection from '../../components/sections/CTASection/CTASection';
import FAQSection from '../../components/sections/FAQSection/FAQSection';
import Footer from '../../components/layout/Footer/Footer';
import { initScrollAnimations, initTitleAnimations, initHeroTitleAnimation, initTeamCardsDotAccentAnimation, initLogoRevealAnimation, cleanupScrollAnimations } from '../../utils/scrollAnimations';

function HomePage() {
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
      kicker: 'Coaching',
      title: 'Coaching',
      description: 'Persoonlijke begeleiding om je business te laten groeien.',
      cta: 'Meer',
      href: '/diensten#coaching',
      area: 'e',
      sectionId: 'coaching'
    },
    {
      kicker: 'Scaling',
      title: 'Scaling',
      description: 'Schaal je business naar het volgende niveau.',
      cta: 'Meer',
      href: '/diensten#scaling',
      area: 'f',
      sectionId: 'scaling'
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
    // On mobile, preserve scroll position more carefully
    const refreshTimeout = setTimeout(() => {
      const scrollY = window.scrollY;
      const isMobile = window.innerWidth < 768;
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          
          // On mobile, restore scroll position if it changed
          if (isMobile && Math.abs(window.scrollY - scrollY) > 5) {
            window.scrollTo({ top: scrollY, behavior: 'instant' });
          }
        });
      });
    }, 100);

    return () => {
      clearTimeout(refreshTimeout);
      cleanupScrollAnimations();
    };
  }, []);

  // GSAP Bento Grid Animation (same as DienstenPage)
  useLayoutEffect(() => {
    if (!bentoRef.current) return;
    
    let ctx = null;
    let timeoutId = null;
    
    timeoutId = setTimeout(() => {
      const bento = bentoRef.current;
      if (!bento) return;
      
      const cards = cardRefs.current.filter(Boolean);
      if (cards.length === 0) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      ctx = gsap.context(() => {
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
            start: 'top 85%',
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

        setTimeout(() => {
          const scrollY = window.scrollY;
          const isMobile = window.innerWidth < 768;
          
          ScrollTrigger.refresh();
          
          // Restore scroll position if it changed (prevents viewport jumps)
          // On mobile, be more aggressive about preserving scroll position
          const scrollDiff = Math.abs(window.scrollY - scrollY);
          const threshold = isMobile ? 5 : 10;
          
          if (scrollDiff > threshold) {
            window.scrollTo({ top: scrollY, behavior: 'instant' });
          }
        }, 50);
      }, bentoRef);
    }, 0);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div className="app">
      <Navbar />
      <Hero />
      <div data-animate="fadeUp">
        <VideoSection />
      </div>
      <div data-animate="fadeRight">
        <ProcessSection />
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
                      key={index} 
                      ref={(el) => (cardRefs.current[index] = el)}
                      className={cardClass}
                      data-area={service.area}
                    >
                      <a
                        href={service.href}
                        className="diensten-card__button"
                        aria-label={`Bekijk ${service.title}`}
                      >
                        <div className="diensten-card__body">
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
                      </a>
                    </article>
                  );
                })}
                <div className="diensten-services-cta" data-area="cta">
                  <a href="/diensten" className="btn btn-primary">Bekijk alle diensten</a>
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
        <FeaturesSection />
      </div>
      <div data-animate="fadeUpScale">
        <WhatsAppSection />
      </div>
      <div data-animate="scaleIn">
        <CTASection />
      </div>
      <div data-animate="fadeUp">
        <FAQSection />
      </div>
      <div data-animate="fadeLeft">
        <LogoSection />
      </div>
      <div data-animate="fadeUpScale">
        <Footer />
      </div>
    </div>
  );
}

export default HomePage;

