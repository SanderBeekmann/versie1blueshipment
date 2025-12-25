import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import './GallerySection.css';
import analytics1 from '../../../assets/analytics/analytics.png';
import analytics2 from '../../../assets/analytics/analytics2.png';
import analytics3 from '../../../assets/analytics/analytics3.png';
import analytics4 from '../../../assets/analytics/analytics4.png';

function GallerySection() {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const tlRef = useRef(null);
  const hoverTlRef = useRef(new Map());
  const resizeTimerRef = useRef(null);

  const [reducedMotion, setReducedMotion] = useState(false);

  const items = useMemo(
    () => [
      { 
        id: 1, 
        image: analytics1, 
        alt: "Analytics dashboard met bestellingen en omzet",
        description: "Na implementatie van onze oplossing zagen onze klanten een stijging van 45% in online bestellingen en een verbetering van 30% in orderverwerkingsefficiëntie."
      },
      { 
        id: 2, 
        image: analytics2, 
        alt: "Analytics dashboard met verkoopcijfers",
        description: "Met onze geïntegreerde verzendsystemen realiseerden klanten een kostenbesparing van 25% op logistiek en een reductie van 40% in leveringsfouten."
      },
      { 
        id: 3, 
        image: analytics3, 
        alt: "Analytics dashboard met conversie data",
        description: "Onze analytics tools helpen klanten om hun conversiepercentage te verhogen met gemiddeld 35% door real-time inzichten in klantgedrag en verzendprestaties."
      },
      { 
        id: 4, 
        image: analytics4, 
        alt: "Analytics dashboard met voorraad statistieken",
        description: "Door geautomatiseerde voorraadsynchronisatie reduceren klanten voorraadkosten met 20% en verbeteren ze beschikbaarheid met 15%."
      },
    ],
    []
  );

  const loopItems = useMemo(() => [...items, ...items], [items]);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReducedMotion(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useLayoutEffect(() => {
    if (reducedMotion) return;

    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const ctx = gsap.context(() => {
      const killTimeline = () => {
        if (tlRef.current) {
          tlRef.current.kill();
          tlRef.current = null;
        }
      };

      const build = () => {
        killTimeline();

        // reset transforms before measuring
        gsap.set(track, { x: 0 });

        // With duplicated items, half of scrollWidth equals one full set.
        // Use getBoundingClientRect to avoid fractional weirdness.
        const full = track.scrollWidth;
        const setWidth = full / 2;

        if (!setWidth || setWidth < 10) return;

        const pxPerSecond = 70; // rustig
        const duration = setWidth / pxPerSecond;

        tlRef.current = gsap.timeline({ repeat: -1 });
        tlRef.current.to(track, {
          x: -setWidth,
          duration,
          ease: "none",
          modifiers: {
            x: (x) => {
              const n = parseFloat(x);
              // wrap in [-setWidth, 0]
              const wrapped = ((n % -setWidth) + -setWidth) % -setWidth;
              return `${wrapped}px`;
            },
          },
        });
      };

      const onResize = () => {
        window.clearTimeout(resizeTimerRef.current);
        resizeTimerRef.current = window.setTimeout(() => {
          build();
        }, 200);
      };

      build();
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
      };
    }, sectionRef);

    return () => {
      window.clearTimeout(resizeTimerRef.current);

      // kill hover timelines
      hoverTlRef.current.forEach((t) => t.kill());
      hoverTlRef.current.clear();

      // kill main timeline
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
      }

      ctx.revert();
    };
  }, [reducedMotion, loopItems.length]);

  // Initialize overlay and text states, and set initial card scale
  useLayoutEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('.gallery-card');
    if (!cards) return;

    cards.forEach((card) => {
      const overlay = card.querySelector('.gallery-card-overlay');
      const text = card.querySelector('.gallery-card-text');
      if (overlay && text) {
        gsap.set(overlay, { opacity: 0 });
        gsap.set(text, { opacity: 0, y: 20 });
      }
      // Set initial scale to 0.95 for smaller initial state
      gsap.set(card, { scale: 0.95 });
    });
  }, [loopItems]);

  const onEnter = (e) => {
    const el = e.currentTarget;
    const overlay = el.querySelector('.gallery-card-overlay');
    const text = el.querySelector('.gallery-card-text');

    if (tlRef.current) tlRef.current.pause();

    // Set z-index to 20 on hover
    gsap.set(el, { zIndex: 20 });

    let ht = hoverTlRef.current.get(el);
    if (!ht) {
      // Ensure initial scale is 0.95 before creating timeline
      gsap.set(el, { scale: 0.95 });
      
      ht = gsap.timeline({ paused: true });
      // Scale from 0.95 to 1.0 (grows from smaller initial state)
      ht.to(el, { scale: 1.0, duration: 0.2, ease: "power2.out" }, 0)
        .to(el, { boxShadow: "0 12px 30px rgba(0,0,0,0.12)", duration: 0.2, ease: "power2.out" }, 0)
        .to(overlay, { opacity: 1, duration: 0.2, ease: "power2.out" }, 0)
        .to(text, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.1);
      hoverTlRef.current.set(el, ht);
    }
    ht.play(0);
  };

  const onLeave = (e) => {
    const el = e.currentTarget;

    // Reset z-index to 0 on leave
    gsap.set(el, { zIndex: 0 });

    const ht = hoverTlRef.current.get(el);
    if (ht) {
      ht.reverse();
    }

    if (tlRef.current) tlRef.current.play();
  };

  return (
    <section ref={sectionRef} className="w-full py-16" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="mx-auto max-w-6xl px-6 mb-16 md:mb-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-[#0d0600] mb-4 md:mb-6" data-animate-title>
            Wat we <span className="text-[#0070ff]">bereikt</span> hebben
          </h2>
          <p className="mt-3 text-base md:text-lg text-slate-700">
            Niet alleen woorden, ook resultaten die spreken.
          </p>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="w-full overflow-hidden"
        style={{
          overflow: "hidden",
        }}
      >
        <div className="py-10 md:py-14">
          <div
            ref={trackRef}
            className="flex flex-nowrap gap-10 will-change-transform"
            style={{
              display: "flex",
              flexWrap: "nowrap",
              gap: "2.5rem",
              willChange: "transform",
            }}
          >
          {loopItems.map((item, index) => {
            const key = `${item.id}-${index}`;
            return (
              <article
                key={key}
                className="gallery-card shrink-0 w-[560px] max-w-[90vw] rounded-3xl border-2 border-blue-500 shadow-md overflow-hidden relative bg-white"
                style={{
                  flex: "0 0 auto",
                  width: 560,
                  maxWidth: "90vw",
                  height: 320,
                  transformOrigin: "center",
                  zIndex: 0,
                }}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className="gallery-card-image"
                />
                <div className="gallery-card-overlay">
                  <div className="gallery-card-text">
                    {item.description}
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center mt-10 md:mt-14">
        <button className="btn btn-primary">
          Bekijk meer resultaten
        </button>
      </div>
    </section>
  );
}

export default GallerySection;

