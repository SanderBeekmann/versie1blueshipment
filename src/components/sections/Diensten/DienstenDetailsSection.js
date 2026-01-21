import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./DienstenDetailsSection.css";

gsap.registerPlugin(ScrollTrigger);

export default function DienstenDetailsSection({ children }) {
  const containerRef = useRef(null);
  const pathRef = useRef(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const path = pathRef.current;
    if (!container || !path) return;

    let ctx = null;
    let timeoutId = null;
    let scrollTriggerInstance = null;

    // Wait for next frame to ensure layout is complete
    timeoutId = setTimeout(() => {
      ctx = gsap.context(() => {
        const length = path.getTotalLength();
        
        // Kill any existing ScrollTriggers on this container to prevent conflicts
        // This ensures we have only ONE ScrollTrigger controlling this path
        const existingTriggers = ScrollTrigger.getAll().filter(st => {
          const vars = st.vars;
          return vars && vars.trigger === container;
        });
        existingTriggers.forEach(st => st.kill());

        // Set initial state ONCE - path is fully hidden, will animate to visible on scroll
        // This is the single source of truth for initial state
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length, // Start hidden
          visibility: 'visible'
        });

        // Create the SINGLE ScrollTrigger animation for this path
        // Start when container top reaches viewport center, end when container bottom leaves viewport center
        // This ensures the line drawing progress follows the middle of the viewport
        const animation = gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none", // Linear progression, no easing
          scrollTrigger: {
            trigger: container,
            start: "top center", // Start when top of container reaches viewport center
            end: "bottom center", // End when bottom of container reaches viewport center
            scrub: true, // Smooth scroll-linked animation
            invalidateOnRefresh: true, // Recalculate on refresh
            markers: false, // Set to true temporarily for debugging
            // Prevent animation from being reset after completion
            // Once the path is fully drawn, it should stay drawn
            onUpdate: (self) => {
              // Ensure path stays at 0 when progress is 1 (fully drawn)
              // This prevents any reset after completion
              if (self.progress >= 1) {
                gsap.set(path, { strokeDashoffset: 0 });
              }
            },
            onComplete: () => {
              // Lock the path at fully drawn state
              gsap.set(path, { strokeDashoffset: 0 });
            },
            // Prevent refresh from resetting completed animation
            onRefresh: function() {
              // If animation was completed, maintain the completed state
              // Check if ScrollTrigger is fully initialized and progress exists
              const st = this;
              if (st && typeof st.progress === 'number' && st.progress >= 1) {
                gsap.set(path, { strokeDashoffset: 0 });
              }
            }
          }
        });

        // Store the ScrollTrigger instance
        scrollTriggerInstance = animation.scrollTrigger;
      }, container);

      // Refresh ScrollTrigger after setup to ensure correct calculations
      // This should not reset the animation because we set initial state with gsap.set
      ScrollTrigger.refresh();
    }, 100);

    // Cleanup: properly revert context and clear timeout
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (ctx) {
        // Revert context - this kills all ScrollTriggers and tweens created within it
        ctx.revert();
      }
    };
  }, []);

  return (
    <section ref={containerRef} className="diensten-details-wrapper">
      <svg
        className="diensten-details-svg"
        viewBox="0 0 400 4000"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          className="diensten-details-path"
          d="M 200, 0 
             C 200, 200, 50, 200, 50, 400
             C 50, 600, 200, 600, 200, 800
             C 200, 1000, 350, 1000, 350, 1200
             C 350, 1400, 200, 1400, 200, 1600
             C 200, 1800, 20, 1800, 20, 2000
             C 20, 2200, 200, 2200, 200, 2400
             C 200, 2600, 380, 2600, 380, 2800
             C 380, 3000, 200, 3000, 200, 3200
             C 200, 3400, 200, 3600, 200, 3800
             L 200, 4000"
        />
      </svg>

      <div className="diensten-details-content-wrapper">
        {children}
      </div>
    </section>
  );
}
