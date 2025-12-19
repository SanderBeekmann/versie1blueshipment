import React, { useLayoutEffect, useRef } from 'react';
import './DienstenSteps.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Icon components - line art style matching the site
const UserIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="18" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 38C12 32 17 28 24 28C31 28 36 32 36 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const InventoryIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="12" width="32" height="28" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 20H40" stroke="currentColor" strokeWidth="2"/>
    <path d="M16 8L24 4L32 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M28 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 16L8 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SyncIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path d="M24 8C16.27 8 10 14.27 10 22C10 29.73 16.27 36 24 36C31.73 36 38 29.73 38 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M32 14L38 8L32 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 34C23.73 34 30 27.73 30 20C30 12.27 23.73 6 16 6C8.27 6 2 12.27 2 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 40L4 46L10 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const OrderIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="10" y="10" width="28" height="28" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M4 16H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 24H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 32H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function DienstenSteps() {
  const sectionRef = useRef(null);
  const timelineRef = useRef(null);
  const lineSegmentsRef = useRef([]);
  const dotsRef = useRef([]);
  const kickerRef = useRef(null);
  const titleRef = useRef(null);
  const stepsRef = useRef([]);
  const ctaRef = useRef(null);

  // Helper function to position line segments based on dot positions
  const positionLineSegments = () => {
    if (!timelineRef.current) return;
    
    const dots = dotsRef.current.filter(Boolean);
    const segments = lineSegmentsRef.current.filter(Boolean);
    
    if (dots.length < 4 || segments.length < 3) return;
    
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const dotPositions = dots.map(dot => {
      const dotRect = dot.getBoundingClientRect();
      return dotRect.left - timelineRect.left + dotRect.width / 2; // Center of dot
    });
    
    // Position segments between dots - stop just before the next dot center
    segments.forEach((segment, index) => {
      if (index < 3 && dotPositions[index] !== undefined && dotPositions[index + 1] !== undefined) {
        const startX = dotPositions[index];
        const endX = dotPositions[index + 1];
        const dotRadius = 4; // Half of 8px dot width
        const width = endX - startX - dotRadius; // Stop before dot center
        
        gsap.set(segment, {
          left: `${startX}px`,
          width: `${width}px`
        });
      }
    });
  };

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    // Position line segments based on dot positions
    const timeoutId = setTimeout(() => {
      positionLineSegments();
    }, 100);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lineSegments = lineSegmentsRef.current.filter(Boolean);
    const dots = dotsRef.current.filter(Boolean);
    const kicker = kickerRef.current;
    const title = titleRef.current;
    const steps = stepsRef.current.filter(Boolean);
    const cta = ctaRef.current;

    if (prefersReducedMotion || steps.length === 0) {
      // Show immediately for reduced motion
      if (kicker) gsap.set(kicker, { opacity: 1, y: 0 });
      if (title) gsap.set(title, { opacity: 1, y: 0 });
      lineSegments.forEach(segment => {
        gsap.set(segment, { scaleX: 1 });
      });
      dots.forEach(dot => {
        gsap.set(dot, { opacity: 1, scale: 1 });
      });
      steps.forEach(step => {
        gsap.set(step, { opacity: 1, y: 0 });
      });
      if (cta) gsap.set(cta, { opacity: 1, y: 0 });
      return;
    }

    // Set initial state
    if (kicker) {
      gsap.set(kicker, {
        opacity: 0,
        y: 20,
        willChange: 'transform, opacity'
      });
    }
    if (title) {
      gsap.set(title, {
        opacity: 0,
        y: 20,
        willChange: 'transform, opacity'
      });
    }
    lineSegments.forEach(segment => {
      gsap.set(segment, {
        scaleX: 0,
        transformOrigin: 'left center',
        willChange: 'transform'
      });
    });
    // Dots are visible from start, just inactive (low opacity)
    dots.forEach((dot, index) => {
      gsap.set(dot, {
        opacity: index === 0 ? 0.3 : 0.2, // First dot slightly visible, others very faint
        scale: 0.9,
        willChange: 'transform, opacity'
      });
    });
    steps.forEach(step => {
      gsap.set(step, {
        opacity: 0,
        y: 15,
        willChange: 'transform, opacity'
      });
    });
    if (cta) {
      gsap.set(cta, {
        opacity: 0,
        y: 20,
        willChange: 'transform, opacity'
      });
    }

    // Create timeline with ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true
      }
    });

    // Kicker in
    if (kicker) {
      tl.to(kicker, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    }

    // Title in
    if (title) {
      tl.to(title, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.3');
    }

    // Animation timeline: reveal step 1, then line grows to dot 2, dot activates, reveal step 2, etc.
    const segmentDuration = 0.6; // Duration for each line segment
    const stepAppearDuration = 0.4;
    const dotActivateDuration = 0.18;
    
    // Reveal step 1 first
    if (steps[0]) {
      tl.to(steps[0], {
        opacity: 1,
        y: 0,
        duration: stepAppearDuration,
        ease: 'power2.out'
      });
    }
    
    // Activate dot 1 (first dot becomes fully visible)
    if (dots[0]) {
      tl.to(dots[0], {
        opacity: 1,
        scale: 1,
        duration: dotActivateDuration,
        ease: 'power2.out'
      }, '-=0.1');
    }
    
    // For steps 2, 3, 4: line grows to dot, dot activates, step reveals
    for (let i = 1; i < 4; i++) {
      // Line segment grows to next dot
      if (lineSegments[i - 1]) {
        tl.to(lineSegments[i - 1], {
          scaleX: 1,
          duration: segmentDuration,
          ease: 'none' // Linear/constant speed
        }, '+=0.2'); // Pause before line grows
      }
      
      // Dot activates when line reaches it
      if (dots[i]) {
        tl.to(dots[i], {
          opacity: 1,
          scale: 1,
          duration: dotActivateDuration,
          ease: 'power2.out'
        }, '-=0.05'); // Start slightly before line completes
      }
      
      // Step reveals after dot activates
      if (steps[i]) {
        tl.to(steps[i], {
          opacity: 1,
          y: 0,
          duration: stepAppearDuration,
          ease: 'power2.out'
        }, '-=0.1'); // Start right after dot activates
      }
    }

    // CTA button fade-up
    if (cta) {
      tl.to(cta, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out'
      }, '+=0.2');
    }

    // Handle resize to reposition segments
    const handleResize = () => {
      positionLineSegments();
      ScrollTrigger.refresh();
    };
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    if (timelineRef.current) {
      resizeObserver.observe(timelineRef.current);
    }
    
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === sectionRef.current) {
          trigger.kill();
        }
      });
    };
  }, []);

  const steps = [
    {
      icon: <UserIcon />,
      title: <>Stap 1:<br />Aanmelden en account instellen</>,
      description: 'Je gegevens in, we richten alles in. Klaar in minder dan een uur.'
    },
    {
      icon: <InventoryIcon />,
      title: <>Stap 2:<br />Voorraad aanleveren</>,
      description: 'Je producten komen aan, we scannen en registreren alles. Geen gedoe, geen wachten.'
    },
    {
      icon: <SyncIcon />,
      title: <>Stap 3:<br />Koppel je bol-account</>,
      description: 'Je listings synchroniseren automatisch. Voorraad, prijzen, alles loopt gelijk.'
    },
    {
      icon: <OrderIcon />,
      title: <>Stap 4:<br />Orders lopen automatisch</>,
      description: 'Klanten bestellen, wij verzenden. Jij hoeft niets te doen. Retourverwerking ook automatisch.'
    }
  ];

  return (
    <section ref={sectionRef} className="diensten-steps-section">
      <div className="diensten-steps-section-container">
        <div className="diensten-steps-section-header">
          <p ref={kickerRef} className="diensten-steps-section-label">Stap voor stap</p>
          <h2 ref={titleRef} className="diensten-steps-section-title">
            Van aanmelden tot eerste verzending in dagen
          </h2>
        </div>

        <div ref={timelineRef} className="diensten-steps-section-timeline">
          <div className="diensten-steps-section-lines">
            {[0, 1, 2].map((index) => (
              <div 
                key={index}
                ref={(el) => (lineSegmentsRef.current[index] = el)}
                className="diensten-steps-section-line-segment"
                data-segment={index}
              ></div>
            ))}
          </div>
          <div className="diensten-steps-section-grid">
            {steps.map((step, index) => (
              <div 
                key={index}
                ref={(el) => (stepsRef.current[index] = el)}
                className="diensten-steps-section-step"
              >
                <div className="diensten-steps-section-step-dot-wrapper">
                  <div 
                    ref={(el) => (dotsRef.current[index] = el)}
                    className="diensten-steps-section-dot"
                    data-dot={index}
                  ></div>
                </div>
                <div className="diensten-steps-section-icon">
                  {step.icon}
                </div>
                <h3 className="diensten-steps-section-step-title">{step.title}</h3>
                <p className="diensten-steps-section-step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div ref={ctaRef} className="diensten-steps-section-ctas">
          <button className="btn btn-secondary">Starten</button>
        </div>
      </div>
    </section>
  );
}

export default DienstenSteps;

