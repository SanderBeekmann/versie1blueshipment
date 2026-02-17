import React, { useState, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './TrustSection.css';
import GlassTagline from '../GlassTagline/GlassTagline';
import logo from '../../../assets/brand/logo.png';

gsap.registerPlugin(ScrollTrigger);

// Icon Components - used only for floating cards
const ZapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckCircle2Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1004 1.7649 16.2038 2.24013C18.3072 2.71537 20.2007 3.85781 21.6017 5.49706" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrustSection = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const taglineRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const featuresGridRef = useRef(null);
  const sectionRef = useRef(null);

  const features = [
    {
      title: "Win-win samenwerking",
      description: "Doordat wij het volledige proces aanbieden, zijn onze belangen direct gekoppeld aan het succes van jouw winkel. Hoe beter jouw prestaties, hoe sterker de samenwerking. Zo creëren we een duurzaam model waarin beide partijen winnen."
    },
    {
      title: "Bewezen resultaat",
      description: "Wij hebben tientallen winkels begeleid van de startfase naar omzetten van tienduizenden euro's. Deze ervaring passen wij toe voor iedere ondernemer die serieus wil bouwen aan een succesvolle bol.com-winkel."
    },
    {
      title: "Persoonlijke aanpak",
      description: "Bij ons is alles persoonlijk. Geen standaardoplossingen, maar begeleiding afgestemd op jouw situatie. Of je nu wilt opschalen, optimaliseren of strategische keuzes wilt maken, wij denken actief met je mee en handelen snel."
    },
    {
      title: "Gericht op groei",
      description: "Wij focussen continu op groei voor de ondernemers die bij ons zijn aangesloten. Met schaalbare oplossingen, data-gedreven beslissingen en langdurige samenwerking bouwen we samen aan structureel succes."
    }
  ];

  useLayoutEffect(() => {
    const tagline = taglineRef.current;
    const title = titleRef.current;
    const description = descriptionRef.current;

    if (!tagline || !title || !description) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set([tagline, title, description], { opacity: 1, y: 0 });
      return;
    }

    // Set initial states
    gsap.set(tagline, {
      opacity: 0,
      y: 18,
      willChange: 'transform, opacity'
    });

    gsap.set(title, {
      opacity: 0,
      y: 18,
      willChange: 'transform, opacity'
    });

    gsap.set(description, {
      opacity: 0,
      y: 15,
      willChange: 'transform, opacity'
    });

    // Create timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: tagline,
        start: 'top 85%',
        once: true,
        invalidateOnRefresh: true,
      },
    });

    // Animate tagline first
    tl.to(tagline, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(tagline, { willChange: 'auto' });
      },
    }, 0);

    // Animate title after tagline
    tl.to(title, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(title, { willChange: 'auto' });
      },
    }, 0.2);

    // Animate description after title (halfway through title animation)
    tl.to(description, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(description, { willChange: 'auto' });
      },
    }, 0.6);

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars && trigger.vars.trigger === tagline) {
          trigger.kill();
        }
      });
    };
  }, []);

  // Staggered in-animatie voor kernwaarden-cards (homepage én over ons)
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const grid = featuresGridRef.current;
    if (!section || !grid) return;

    const cards = grid.querySelectorAll('.trust-section__feature-card');
    if (cards.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(cards, { opacity: 0, y: 24, willChange: 'transform, opacity' });

    const st = ScrollTrigger.create({
      trigger: cards[0],
      start: 'bottom bottom',
      once: true,
      invalidateOnRefresh: true,
      onEnter: () => {
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.22,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(cards, { willChange: 'auto' });
          },
        });
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="trust-section">
      <div className="trust-section__container">
        <div className="trust-section__grid">
          
          {/* Left Column: Content */}
          <div className="trust-section__content">
            <div ref={taglineRef}>
              <GlassTagline>
                <p>Onze Kernwaarden</p>
              </GlassTagline>
            </div>
            
            <h2 ref={titleRef} className="trust-section__title" data-animate-title>
              Wij bouwen niet zomaar oplossingen, wij bouwen <span className="trust-section__title-highlight">groei.</span>
            </h2>

            <p ref={descriptionRef} className="trust-section__description">
              Tijd is geld en jouw groei staat centraal. Wij bieden het fundament dat net zo solide is als jouw ambities.
            </p>

            {/* Feature Grid */}
            <div ref={featuresGridRef} className="trust-section__features-grid">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className={`trust-section__feature-card ${
                    hoveredFeature === index ? 'trust-section__feature-card--hovered' : ''
                  }`}
                >
                  <div className="trust-section__feature-content">
                    <h3 className="trust-section__feature-title">
                      {feature.title}
                    </h3>
                    <p className="trust-section__feature-description">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile CTA - stays in normal flow */}
            <div className="trust-section__cta lg:hidden">
              <Link 
                to="/intake"
                className="btn btn-primary trust-section__cta-button"
              >
                Start uw aanvraag
              </Link>
            </div>
          </div>

          {/* Right Column: Visuals */}
          <div className="trust-section__visuals lg:relative">
            {/* Main Image Container */}
            <div className="trust-section__image-wrapper">
              <img 
                src={logo} 
                alt="BlueShipment Logo" 
                className="trust-section__image"
              />
            </div>

            {/* Floating Trust Card 1: Speed/Efficiency */}
            <div className="trust-section__floating-card trust-section__floating-card--speed">
              <div className="trust-section__floating-card-content">
                <div className="trust-section__floating-card-icon">
                  <ZapIcon />
                </div>
                <div className="trust-section__floating-card-text">
                  <p className="trust-section__floating-card-label">Reactietijd</p>
                  <p className="trust-section__floating-card-value">&lt; 30 min</p>
                </div>
              </div>
            </div>

            {/* Floating Trust Card 2: Guarantee */}
            <div className="trust-section__floating-card trust-section__floating-card--guarantee">
              <div className="trust-section__floating-card-icon-large">
                <CheckCircle2Icon />
              </div>
              <div className="trust-section__floating-card-text-large">
                <p className="trust-section__floating-card-label-large">Kwaliteit</p>
                <p className="trust-section__floating-card-value-large">Groeigarantie</p>
              </div>
            </div>

            {/* Decoration Dots */}
            <div className="trust-section__decoration-dots">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="trust-section__dot"></div>
              ))}
            </div>

            {/* Desktop CTA - absolutely positioned in right column whitespace */}
            <div className="trust-section__cta-desktop-wrapper hidden lg:block lg:absolute lg:left-1/2 lg:top-[calc(650px+min(150px,20%))] lg:-translate-x-1/2 lg:z-[15]">
              <Link 
                to="/intake"
                className="btn btn-primary trust-section__cta-button"
              >
                Start uw aanvraag
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TrustSection;
