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

    // Create timeline with paused: true
    const tl = gsap.timeline({ paused: true });

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

    // Create ScrollTrigger with callbacks for forward/reverse behavior
    const scrollTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      end: 'top 60%',
      onEnter: () => {
        // Play forward when entering from bottom
        tl.play();
      },
      onLeaveBack: () => {
        // Reverse when scrolling back up - starts earlier so animation is still visible
        tl.reverse();
      },
      onEnterBack: () => {
        // Play forward again when re-entering from top
        tl.play();
      },
      markers: false, // Set to true temporarily for debugging
    });

    // Cleanup
    return () => {
      scrollTrigger.kill();
      tl.kill();
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
