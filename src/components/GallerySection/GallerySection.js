import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

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
      { id: 1, title: "Performance", subtitle: "Real-time analytics dashboard" },
      { id: 2, title: "Omzet", subtitle: "Verkoopcijfers en trends" },
      { id: 3, title: "Conversie", subtitle: "Optimalisatie en resultaten" },
      { id: 4, title: "Voorraad", subtitle: "Voorraadbeheer en planning" },
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

  const onEnter = (e) => {
    const el = e.currentTarget;

    if (tlRef.current) tlRef.current.pause();

    // Set z-index to 20 on hover
    gsap.set(el, { zIndex: 20 });

    let ht = hoverTlRef.current.get(el);
    if (!ht) {
      ht = gsap.timeline({ paused: true });
      ht.to(el, { scale: 1.07, duration: 0.2, ease: "power2.out" }, 0).to(
        el,
        { boxShadow: "0 24px 60px rgba(0,0,0,0.16)", duration: 0.2, ease: "power2.out" },
        0
      );
      hoverTlRef.current.set(el, ht);
    }
    ht.play(0);
  };

  const onLeave = (e) => {
    const el = e.currentTarget;

    // Reset z-index to 0 on leave
    gsap.set(el, { zIndex: 0 });

    const ht = hoverTlRef.current.get(el);
    if (ht) ht.reverse();

    if (tlRef.current) tlRef.current.play();
  };

  return (
    <section ref={sectionRef} className="w-full py-16 bg-slate-100">
      <div style={{ background: "red", color: "white", padding: 16, fontWeight: 800 }}>
        GALLERYSECTION VERSION TEST 123
      </div>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-[#0d0600] mb-4 md:mb-6">
            Wat we <span className="text-[#0070ff]">bereikt</span> hebben
          </h2>
          <p className="mt-3 text-base md:text-lg text-slate-700">
            Niet alleen woorden, ook resultaten die spreken.
          </p>
        </div>

        <div className="mt-10 md:mt-14">
          <div
            ref={viewportRef}
            className="w-full mx-auto max-w-6xl overflow-hidden"
            style={{
              // fallback als er nog ergens CSS over Tailwind heen valt
              overflow: "hidden",
            }}
          >
            <div className="py-10 md:py-14 px-4 md:px-10">
              <div
                ref={trackRef}
                className="flex flex-nowrap gap-10 will-change-transform"
                style={{
                  // hard fallback om verticale stacking onmogelijk te maken
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
                  className="gallery-card shrink-0 w-[560px] max-w-[90vw] bg-white rounded-3xl border-2 border-blue-500 shadow-md overflow-hidden relative"
                  style={{
                    // fallback
                    flex: "0 0 auto",
                    width: 560,
                    maxWidth: "90vw",
                    transformOrigin: "center",
                    zIndex: 0,
                  }}
                  onMouseEnter={onEnter}
                  onMouseLeave={onLeave}
                >
                  <div className="w-full h-72 bg-white p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-2">
                        <div className="h-8 w-20 bg-blue-100 rounded-lg" />
                        <div className="h-8 w-16 bg-slate-100 rounded-lg" />
                        <div className="h-8 w-24 bg-slate-100 rounded-lg" />
                      </div>
                      <div className="h-8 w-8 bg-blue-500 rounded-lg" />
                    </div>

                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3 flex flex-col justify-end">
                        <div className="space-y-2">
                          <div className="h-16 bg-blue-500 rounded w-full" />
                          <div className="h-12 bg-blue-400 rounded w-[85%]" />
                          <div className="h-8 bg-blue-300 rounded w-[70%]" />
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-3 flex flex-col justify-end">
                        <div className="space-y-2">
                          <div className="h-20 bg-blue-600 rounded w-full" />
                          <div className="h-14 bg-blue-500 rounded w-[90%]" />
                          <div className="h-10 bg-blue-400 rounded w-[75%]" />
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-3 flex flex-col justify-end">
                        <div className="space-y-2">
                          <div className="h-14 bg-blue-500 rounded w-full" />
                          <div className="h-10 bg-blue-400 rounded w-[80%]" />
                          <div className="h-6 bg-blue-300 rounded w-[65%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <h3 className="text-xl font-bold text-[#0d0600] mb-1">{item.title}</h3>
                    <p className="text-sm text-[#0d0600] opacity-70">{item.subtitle}</p>
                  </div>
                </article>
              );
            })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 mt-10 md:mt-14">
          {items.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === 1 ? "w-8 bg-blue-500" : "w-2 bg-slate-300"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default GallerySection;

