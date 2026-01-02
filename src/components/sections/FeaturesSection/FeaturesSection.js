import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './FeaturesSection.css';
import GlassTagline from '../GlassTagline/GlassTagline';
import logo from '../../../assets/brand/logo.png';

gsap.registerPlugin(ScrollTrigger);

// Icon Components
const ListIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 12H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PackageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16V8C20.9996 7.64928 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64928 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.27 6.96L12 12.01L20.73 6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WalletIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 10H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function FeaturesSection() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const titleHighlightRef = useRef(null);
  const subtitleRef = useRef(null);
  const cardsRef = useRef([]);
  const cardsGridRef = useRef(null);
  const watermarkRef = useRef(null);
  const ctaRef = useRef(null);

  const features = [
    {
      id: 1,
      icon: <ListIcon />,
      title: 'Gratis listings',
      description: 'Productlijsten klaar voor gebruik, zonder extra investering.'
    },
    {
      id: 2,
      icon: <PackageIcon />,
      title: 'Alles inbegrepen',
      description: 'Één prijs per zending. Opslag, verwerking en support zitten erin.'
    },
    {
      id: 3,
      icon: <ChatIcon />,
      title: 'Reactie in 30 minuten',
      description: 'WhatsApp support die echt luistert en snel handelt.'
    },
    {
      id: 4,
      icon: <WalletIcon />,
      title: 'Geen verborgen kosten',
      description: 'Je betaalt alleen per zending. Geen opslagkosten of onverwachte facturen.'
    }
  ];

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const titleHighlight = titleHighlightRef.current;
    const subtitle = subtitleRef.current;
    const cards = cardsRef.current.filter(Boolean);
    const watermark = watermarkRef.current;
    const cta = ctaRef.current;

    if (!section || !title || !titleHighlight || !subtitle || cards.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If reduced motion, show everything immediately
    // Title is handled by initTitleAnimations() - don't set here
    if (prefersReducedMotion) {
      gsap.set([titleHighlight, subtitle, ...cards, cta].filter(Boolean), {
        opacity: 1,
        y: 0,
        willChange: 'auto'
      });
      if (watermark) {
        gsap.set(watermark, {
          opacity: 0.05,
          y: 0,
          willChange: 'auto'
        });
      }
      return;
    }

    // Set initial states
    // Title is now animated by initTitleAnimations() - don't set initial state here
    gsap.set(subtitle, {
      opacity: 0,
      y: 30,
      willChange: 'transform, opacity'
    });

    gsap.set(titleHighlight, {
      opacity: 0,
      y: 30,
      willChange: 'transform, opacity'
    });

    gsap.set(cards, {
      opacity: 0,
      y: 40,
      willChange: 'transform, opacity'
    });

    // Set initial state for CTA
    if (cta) {
      gsap.set(cta, {
        opacity: 0,
        y: 40,
        willChange: 'transform, opacity'
      });
    }

    // Set initial state for watermark logo - start from right
    if (watermark) {
      gsap.set(watermark, {
        opacity: 0,
        x: 100,
        willChange: 'transform, opacity'
      });
    }

    // Create ScrollTrigger context with timeline
    const ctx = gsap.context(() => {
      // Create a timeline for all animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true,
          invalidateOnRefresh: true,
        }
      });

      // Title is animated by initTitleAnimations() - don't animate here
      // Title highlight ("anders") animation - slightly delayed
      tl.to(titleHighlight, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(titleHighlight, { willChange: 'auto' });
        }
      }, 0.2);

      // Subtitle animation - starts after title animation completes (0.8s duration + 0.2s delay)
      tl.to(subtitle, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(subtitle, { willChange: 'auto' });
        }
      }, 1.0); // Start after title animation (0.8s) + small delay

      // Cards animation - one by one with stagger
      cards.forEach((card, index) => {
        tl.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(card, { willChange: 'auto' });
          }
        }, 0.3 + index * 0.1);
      });

      // CTA animation - after cards
      if (cta) {
        tl.to(cta, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(cta, { willChange: 'auto' });
          }
        }, 0.3 + cards.length * 0.1 + 0.2);
      }

      // Watermark logo animation - fly in from right
      if (watermark) {
        tl.to(watermark, {
          opacity: 0.05,
          x: 0,
          duration: 1.2,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(watermark, { willChange: 'auto' });
          }
        }, 0.4);
      }
    }, section);

    // Cleanup
    return () => {
      ctx.revert();
      // Title cleanup is handled by initTitleAnimations()
      gsap.set([titleHighlight, subtitle, ...cards, cta].filter(Boolean), { willChange: 'auto' });
      if (watermark) {
        gsap.set(watermark, { willChange: 'auto' });
      }
    };
  }, []);

  // Parallax scroll effect (desktop only, no reduced motion)
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const cards = cardsRef.current.filter(Boolean);
    
    if (!section || !header || cards.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const mm = gsap.matchMedia();
    mm.add(
      { 
        desktop: '(min-width: 768px)', 
        motion: '(prefers-reduced-motion: no-preference)' 
      },
      (ctx) => {
        // Stop als reduced motion
        if (prefersReducedMotion) return;

        // 1) Header parallax - subtiel trager dan scroll
        gsap.fromTo(
          header,
          { y: 0 },
          {
            y: 24,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
              invalidateOnRefresh: true
            }
          }
        );

        // 2) Cards parallax - subtiele depth met afwisseling
        cards.forEach((card, i) => {
          const depth = (i % 2 === 0) ? 18 : 30; // afwisseling voor diepte
          gsap.fromTo(
            card,
            { y: 0 },
            {
              y: -depth,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
                invalidateOnRefresh: true
              }
            }
          );
        });

        // 3) Subtiele watermark parallax (optioneel)
        const watermark = watermarkRef.current;
        if (watermark) {
          gsap.fromTo(
            watermark,
            { y: -10 },
            {
              y: 40,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6,
                invalidateOnRefresh: true
              }
            }
          );
        }
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="features-section">
      {/* Brand Watermark */}
      <div className="features-section__watermark">
        <img ref={watermarkRef} src={logo} alt="BlueShipment" className="features-section__watermark-image" />
      </div>

      {/* Content Container with z-index */}
      <div className="features-section__content">
        <div className="features-section__container">
          <div ref={headerRef} className="features-section__header">
            <GlassTagline>
              <p>Voordelen</p>
            </GlassTagline>
            <h2 className="features-section__title" ref={titleRef} data-animate-title>
              Wat maakt ons <span ref={titleHighlightRef} className="features-section__title-highlight">anders</span>
            </h2>
            <p ref={subtitleRef} className="features-section__subtitle">
              Alles wat je nodig hebt om te groeien, zonder extra kosten.
            </p>
          </div>

          <div ref={cardsGridRef} className="features-section__grid">
            {features.map((feature, index) => (
              <div 
                key={feature.id} 
                ref={(el) => {
                  if (el) {
                    cardsRef.current[index] = el;
                  }
                }}
                className="features-section__card"
              >
                <div className="features-section__icon-wrapper">
                  {feature.icon}
                </div>
                <h3 className="features-section__card-title">{feature.title}</h3>
                <p className="features-section__card-description">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div ref={ctaRef} className="features-section__cta">
            <p className="features-section__cta-text">Ontdek het zelf.</p>
            <a 
              href="https://calendly.com/mouseclick2017/30min" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary features-section__cta-button"
            >
              Boek een kennismakingsgesprek
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
