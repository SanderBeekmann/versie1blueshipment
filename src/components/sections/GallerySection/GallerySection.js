import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './GallerySection.css';
import analytics1 from '../../../assets/analytics/analytics.png';
import analytics2 from '../../../assets/analytics/analytics2.png';
import analytics3 from '../../../assets/analytics/analytics3.png';
import analytics4 from '../../../assets/analytics/analytics4.png';

gsap.registerPlugin(ScrollTrigger);

const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function GallerySection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoplayIntervalRef = useRef(null);
  const cardRef = useRef(null);

  const slides = [
    { 
      id: 1, 
      image: analytics1, 
      alt: "Analytics dashboard met bestellingen en omzet",
      title: "45% stijging in online bestellingen",
      description: "Na implementatie van onze oplossing zagen onze klanten een stijging van 45% in online bestellingen en een verbetering van 30% in orderverwerkingsefficiëntie.",
      client: "TechStore Nederland",
      challenge: "TechStore Nederland worstelde met handmatige orderverwerking en trage verzendingen. Dit leidde tot klachten van klanten en gemiste verkoopkansen tijdens piekperiodes.",
      solution: "We implementeerden een volledig geautomatiseerd fulfilment systeem met real-time voorraadsynchronisatie en geïntegreerde verzendkoppelingen. Alle bestellingen worden nu automatisch verwerkt en dezelfde dag verzonden.",
      results: "Binnen 3 maanden zagen ze een stijging van 45% in online bestellingen en een verbetering van 30% in orderverwerkingsefficiëntie. Klanttevredenheid steeg met 28% en retouren daalden met 22%.",
      testimonial: "BlueShipment heeft onze logistiek volledig getransformeerd. We kunnen nu focussen op groei in plaats van operationele problemen.",
      testimonialAuthor: "Jan de Vries, CEO TechStore Nederland"
    },
    { 
      id: 2, 
      image: analytics2, 
      alt: "Analytics dashboard met verkoopcijfers",
      title: "25% kostenbesparing op logistiek",
      description: "Met onze geïntegreerde verzendsystemen realiseerden klanten een kostenbesparing van 25% op logistiek en een reductie van 40% in leveringsfouten.",
      client: "Home & Living Shop",
      challenge: "Home & Living Shop had te maken met hoge logistiekkosten en veel leveringsfouten. Ze werkten met meerdere verzendpartners zonder centrale controle, wat leidde tot verwarring en extra kosten.",
      solution: "We centraliseerden hun logistiek via ons fulfilmentcenter en integreerden alle verzendpartners in één platform. Automatische route-optimalisatie en real-time tracking werden geïmplementeerd.",
      results: "Ze realiseerden een kostenbesparing van 25% op logistiek en een reductie van 40% in leveringsfouten. Levertijden werden met gemiddeld 2 dagen verkort en klanttevredenheid steeg aanzienlijk.",
      testimonial: "De kostenbesparing en betrouwbaarheid die we nu hebben, hadden we nooit kunnen bereiken zonder BlueShipment. Het heeft onze business echt naar een hoger niveau getild.",
      testimonialAuthor: "Maria van der Berg, Operations Manager Home & Living Shop"
    },
    { 
      id: 3, 
      image: analytics3, 
      alt: "Analytics dashboard met conversie data",
      title: "35% verhoging in conversiepercentage",
      description: "Onze analytics tools helpen klanten om hun conversiepercentage te verhogen met gemiddeld 35% door real-time inzichten in klantgedrag en verzendprestaties.",
      client: "Fashion Forward",
      challenge: "Fashion Forward had een laag conversiepercentage op hun bol.com shop. Ze misten inzicht in welke producten goed presteerden en waarom klanten niet kochten.",
      solution: "We implementeerden geavanceerde analytics tools met real-time inzichten in klantgedrag, productprestaties en verzendstatistieken. Daarnaast optimaliseerden we hun productlistings met data-gedreven aanbevelingen.",
      results: "Hun conversiepercentage steeg met gemiddeld 35% door betere productlistings en snellere levering. Ze kunnen nu data-gedreven beslissingen nemen en hun assortiment continu optimaliseren.",
      testimonial: "De inzichten die we nu hebben zijn onbetaalbaar. We weten precies wat werkt en kunnen daar direct op inspelen. Onze omzet is sindsdien met 60% gestegen.",
      testimonialAuthor: "Lisa Jansen, E-commerce Manager Fashion Forward"
    },
    { 
      id: 4, 
      image: analytics4, 
      alt: "Analytics dashboard met voorraad statistieken",
      title: "20% reductie in voorraadkosten",
      description: "Door geautomatiseerde voorraadsynchronisatie reduceren klanten voorraadkosten met 20% en verbeteren ze beschikbaarheid met 15%.",
      client: "ElectroMax",
      challenge: "ElectroMax had problemen met voorraadbeheer. Ze hadden te veel voorraad van langzame producten en te weinig van populaire items, wat leidde tot hoge kosten en gemiste verkopen.",
      solution: "We implementeerden geautomatiseerde voorraadsynchronisatie tussen hun bol.com shop en ons fulfilmentcenter. Real-time voorraadupdates en voorspellende analyses helpen hen om de juiste voorraadniveaus te behouden.",
      results: "Ze reduceerden voorraadkosten met 20% en verbeterden productbeschikbaarheid met 15%. Out-of-stock situaties daalden met 50% en ze kunnen nu beter inspelen op seizoensgebonden vraag.",
      testimonial: "Het voorraadbeheer is nu volledig geautomatiseerd. We hebben altijd de juiste voorraad op het juiste moment, zonder dat we er zelf naar hoeven te kijken.",
      testimonialAuthor: "Peter Bakker, Supply Chain Manager ElectroMax"
    },
  ];

  // Autoplay functionality
  useEffect(() => {
    autoplayIntervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 15000); // 15 seconds

    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, [slides.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    const card = cardRef.current;
    if (card) {
      card.addEventListener('keydown', handleKeyDown);
      return () => card.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Animate title wrapper from bottom to top on scroll
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileStatic = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // Desktop: animate floating title wrapper
    const floatingTitle = document.querySelector('.gallery-floating-title');
    if (floatingTitle && !isMobileStatic) {
      if (prefersReducedMotion) {
        gsap.set(floatingTitle, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(floatingTitle, {
        opacity: 1, // Always same opacity
        y: 40, // Start from below
        willChange: 'transform'
      });

      gsap.to(floatingTitle, {
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: floatingTitle.closest('.gallery-section'),
          start: 'top 85%',
          toggleActions: 'play none none reverse',
          once: true,
        },
        onComplete: () => {
          gsap.set(floatingTitle, { willChange: 'auto' });
        },
      });
    }

    // Mobile: animate mobile header wrapper
    const mobileHeader = document.querySelector('.gallery-header-mobile');
    if (mobileHeader && isMobileStatic) {
      if (prefersReducedMotion) {
        gsap.set(mobileHeader, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(mobileHeader, {
        opacity: 1, // Always same opacity
        y: 40,
        willChange: 'transform'
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(entry.target, {
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
                onComplete: () => {
                  gsap.set(entry.target, { willChange: 'auto' });
                },
              });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
      );
      observer.observe(mobileHeader);

      return () => {
        observer.disconnect();
        if (floatingTitle) {
          ScrollTrigger.getAll().forEach(trigger => {
            if (trigger.trigger === floatingTitle.closest('.gallery-section')) {
              trigger.kill();
            }
          });
        }
      };
    }

    return () => {
      if (floatingTitle) {
        ScrollTrigger.getAll().forEach(trigger => {
          if (trigger.trigger === floatingTitle.closest('.gallery-section')) {
            trigger.kill();
          }
        });
      }
    };
  }, []);

  return (
    <section className="gallery-section">
      <div className="gallery-section-container">
        <div className="gallery-card-wrapper">
          {/* Floating title overlay - desktop only */}
          <div className="gallery-floating-title">
            <div className="gallery-title-pill">
              <h2 className="gallery-title">
                Wat we <span className="text-blue">bereikt</span> hebben
              </h2>
            </div>
          </div>

          {/* Title inside card on mobile */}
          <div className="gallery-header-mobile">
            <h2 className="gallery-title">
              Wat we <span className="text-blue">bereikt</span> hebben
            </h2>
          </div>

          <div 
            ref={cardRef}
            className="gallery-card"
            role="region"
            aria-label="Case studies slider"
            tabIndex={0}
          >
          <div className="gallery-card-grid">
            {/* Left: Image Carousel (Vertical) */}
            <div className="gallery-card-image-column">
              <div className="gallery-image-wrapper">
                <div 
                  className="gallery-image-track"
                  style={{
                    transform: `translateY(-${currentIndex * 100}%)`
                  }}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {slides.map((slide, index) => (
                    <div 
                      key={slide.id}
                      className="gallery-image-slide"
                      aria-hidden={index !== currentIndex}
                    >
                      <img 
                        src={slide.image} 
                        alt={slide.alt}
                        className="gallery-image"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Content Carousel (Horizontal) */}
            <div className="gallery-card-content-column">
              <div className="gallery-content-wrapper">
                <div 
                  className="gallery-content-track"
                  style={{
                    transform: `translateX(-${currentIndex * 100}%)`
                  }}
                >
                  {slides.map((slide, index) => (
                    <div 
                      key={slide.id}
                      className="gallery-content-slide"
                      aria-hidden={index !== currentIndex}
                    >
                      <div className="gallery-content-slide-inner">
                        <h3 className="gallery-content-title">
                          {slide.title}
                        </h3>
                        <p className="gallery-content-description">
                          {slide.description}
                        </p>
                        <button 
                          className="gallery-content-cta"
                          aria-label={`Bekijk volledig verhaal: ${slide.title}`}
                        >
                          Bekijk volledig verhaal →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows - Outside Grid */}
          <button
            className="gallery-nav-arrow gallery-nav-arrow-left"
            onClick={goToPrevious}
            aria-label="Vorige slide"
            type="button"
          >
            <ChevronLeft />
          </button>
          <button
            className="gallery-nav-arrow gallery-nav-arrow-right"
            onClick={goToNext}
            aria-label="Volgende slide"
            type="button"
          >
            <ChevronRight />
          </button>

          {/* Dots Navigation */}
          <div className="gallery-dots" role="tablist" aria-label="Slide navigatie">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                className={`gallery-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Ga naar slide ${index + 1}: ${slide.title}`}
                aria-selected={index === currentIndex}
                role="tab"
                type="button"
              />
            ))}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

export default GallerySection;
