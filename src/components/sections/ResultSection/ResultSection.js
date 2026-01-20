import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ResultSection.css';

gsap.registerPlugin(ScrollTrigger);

function ResultSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const rightContentRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const rightContent = rightContentRef.current;

    if (!section || !title || !rightContent) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    // For reduced motion or mobile, show elements immediately
    if (prefersReducedMotion || isMobile) {
      gsap.set([title, rightContent], {
        opacity: 1,
        x: 0,
        y: 0,
        willChange: 'auto'
      });
      return;
    }

    // Set initial states - elements start outside viewport
    gsap.set(title, {
      opacity: 0,
      x: -window.innerWidth,
      willChange: 'transform, opacity'
    });

    gsap.set(rightContent, {
      opacity: 0,
      x: window.innerWidth,
      willChange: 'transform, opacity'
    });

    // Create timeline with ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 50%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        once: true,
      }
    });

    // Animate title from left (aggressive)
    tl.to(title, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, 0);

    // Animate right content from right with stagger delay
    tl.to(rightContent, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, 0.3); // 0.3s delay after title starts

    // Cleanup
    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === section) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <section ref={sectionRef} className="result-section">
      <div className="result-section-container">
        <div className="result-section-grid">
          {/* Left: Title */}
          <div className="result-section-left">
            <h2 ref={titleRef} className="result-section-title">
              Het resultaat?
            </h2>
          </div>

          {/* Right: Content */}
          <div ref={rightContentRef} className="result-section-right">
            <h3 className="result-section-subtitle">
              Blije klanten en meer winst<br />voor jou!
            </h3>
            <p className="result-section-description">
              Je klant ontvangt het pakket snel en goed verpakt.<br />
              Dit resulteerd in goede reviews en meer verkoop.
            </p>
            <div className="result-section-actions">
              <button 
                className="btn btn-primary"
              >
                Ervaar het zelf!
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResultSection;
