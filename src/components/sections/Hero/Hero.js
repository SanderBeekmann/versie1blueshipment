import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Hero.css';
import GlassTagline from '../GlassTagline/GlassTagline';
import InfiniteGridOverlay from '../../ui/the-infinite-grid/InfiniteGridOverlay';

function Hero() {
  const rootRef = useRef(null);
  const primaryBtnRef = useRef(null);
  const secondaryBtnRef = useRef(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Filter out null refs (voor toekomstige secondary button)
      const buttons = [primaryBtnRef.current, secondaryBtnRef.current].filter(Boolean);
      
      if (buttons.length === 0) return;

      // CRITICAL: Set initial state SYNCHRONOUSLY in useLayoutEffect (vóór eerste paint)
      // Dit voorkomt de flits waar buttons eerst zichtbaar zijn, dan wegvliegen
      gsap.set(buttons, {
        autoAlpha: 0,
        y: 50,
        scale: 0.95,
        willChange: 'transform, opacity',
      });

      // Button animatie starten na de subtitle animatie
      // Timing: title animatie start na ~200ms, subtitle na ~500ms (200ms + 300ms delay)
      // Button animatie moet starten na ~800ms (200ms + 600ms delay zoals in initHeroTitleAnimation)
      // We gebruiken een kleine timeline die wacht en dan de buttons animeert
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
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={rootRef}>
      <InfiniteGridOverlay opacity={0.5} />
      <div className="hero-content">
        <div className="hero-text">
          <GlassTagline withDot>
            <p>Al meer dan 10.000 voltooide bestellingen</p>
          </GlassTagline>
          
          <div className="hero-title-section">
            <h1 className="hero-title" data-animate-title>
              Jouw all-in<br />bol.com partner
            </h1>
            <p className="hero-subtitle">
              Probeer nu: Krijg een totaalpakket t.w.v. 499 euro<br />helemaal gratis!
            </p>
          </div>

          <button ref={primaryBtnRef} className="btn btn-primary hero-cta">
            Boek een kennismakingsgesprek
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;

