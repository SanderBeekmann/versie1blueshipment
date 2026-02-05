import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import './Hero.css';
import GlassTagline from '../GlassTagline/GlassTagline';
import InfiniteGridOverlay from '../../ui/the-infinite-grid/InfiniteGridOverlay';

function Hero() {
  const rootRef = useRef(null);
  const primaryBtnRef = useRef(null);
  const secondaryBtnRef = useRef(null);
  const rafIdRef = useRef(null);
  const ctxRef = useRef(null);

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
    // Eén frame uitstellen: eerste paint zonder GSAP-work in hero (minder lag), CSS houdt buttons verborgen
    rafIdRef.current = requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      ctxRef.current = gsap.context(() => {
        const buttons = [primaryBtnRef.current, secondaryBtnRef.current].filter(Boolean);
        if (buttons.length === 0) return;

        if (prefersReducedMotion) {
          gsap.set(buttons, { autoAlpha: 1, y: 0, scale: 1, willChange: 'auto' });
          return;
        }

        gsap.set(buttons, {
          autoAlpha: 0,
          y: 50,
          scale: 0.95,
          willChange: 'transform, opacity',
        });

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
    });

    return () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      if (ctxRef.current) ctxRef.current.revert();
    };
  }, []);

  return (
    <section className="hero" ref={rootRef}>
      {!isMobile && <InfiniteGridOverlay opacity={0.5} />}
      <div className="hero-content">
        <div className="hero-text">
          <GlassTagline withDot>
            <p>Al meer dan 10.000 voltooide bestellingen</p>
          </GlassTagline>
          
          <div className="hero-title-section">
            <h1 className="hero-title hero-title-desktop" data-animate-title>
              Jouw <span className="hero-all-in">all-in</span><br />bol.com partner
            </h1>
            <h1 className="hero-title hero-title-mobile" data-animate-title>
              Jouw <span className="hero-all-in">all-in</span><br />bol.com<br />partner
            </h1>
            <p className="hero-subtitle">
              Probeer nu: Krijg een totaalpakket t.w.v 499 euro helemaal gratis!<br className="hero-subtitle-break" /> Binnen 7 dagen je eerste bestelling.
            </p>
          </div>

          <a 
            ref={primaryBtnRef}
            href="/intake"
            className="btn btn-primary hero-cta"
          >
            Boek een kennismakingsgesprek
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;

