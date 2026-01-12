import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './WhatsAppSection.css';
import colinImg from '../../../assets/colin.jpg';
import { openWhatsApp } from '../../../utils/whatsapp';

gsap.registerPlugin(ScrollTrigger);

const WhatsAppIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
      fill="currentColor"
    />
  </svg>
);

function WhatsAppSection() {
  const sectionRef = useRef(null);
  const contentGridRef = useRef(null);
  const imageRef = useRef(null);
  const iconRef = useRef(null);
  const timeRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const contentGrid = contentGridRef.current;
    const image = imageRef.current;
    const icon = iconRef.current;
    const time = timeRef.current;
    const title = titleRef.current;
    const description = descriptionRef.current;
    const button = buttonRef.current;

    if (!section || !contentGrid || !image) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If reduced motion, show everything immediately
    if (prefersReducedMotion) {
      gsap.set([contentGrid, image, icon, time, title, description, button], {
        opacity: 1,
        x: 0,
        y: 0,
        willChange: 'auto',
      });
      return;
    }

    // Set initial states
    gsap.set(contentGrid, {
      opacity: 1,
      y: 0,
      willChange: 'auto',
    });

    gsap.set(image, {
      opacity: 1,
      x: -30,
      willChange: 'transform',
    });

    gsap.set(icon, {
      opacity: 0,
      scale: 0.8,
      willChange: 'transform, opacity',
    });

    gsap.set([time, title, description, button], {
      opacity: 0,
      y: 20,
      willChange: 'transform, opacity',
    });

    // Create GSAP timeline with ScrollTrigger
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true,
          invalidateOnRefresh: true,
        },
      });

      // Animate image from left to right (no opacity change)
      tl.to(image, {
        x: 0,
        duration: 0.9,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(image, { willChange: 'auto' });
        },
      }, 0.1);

      // Animate icon behind image
      if (icon) {
        tl.to(icon, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.2)',
          onComplete: () => {
            gsap.set(icon, { willChange: 'auto' });
          },
        }, 0.2);
      }

      // Animate text content sequentially
      if (time) {
        tl.to(time, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(time, { willChange: 'auto' });
          },
        }, 0.4);
      }

      if (title) {
        tl.to(title, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(title, { willChange: 'auto' });
          },
        }, 0.5);
      }

      if (description) {
        tl.to(description, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(description, { willChange: 'auto' });
          },
        }, 0.6);
      }

      if (button) {
        tl.to(button, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(button, { willChange: 'auto' });
          },
        }, 0.7);
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="whatsapp-section">
      <div className="whatsapp-gradient-background"></div>
      <div className="whatsapp-container">
        <div ref={contentGridRef} className="whatsapp-content-grid">
          {/* Left Column - Image */}
          <div className="whatsapp-image-column">
            {/* WhatsApp Icon positioned behind image in left top corner */}
            <div ref={iconRef} className="whatsapp-icon-wrapper whatsapp-icon-behind">
              <WhatsAppIcon />
            </div>
            <img 
              ref={imageRef} 
              src={colinImg} 
              alt="Colin Frederiks" 
              className="whatsapp-portrait-image"
            />
          </div>

          {/* Right Column - Content */}
          <div className="whatsapp-content-column">
            <div className="whatsapp-info">
              <div ref={timeRef} className="whatsapp-time">
                <span>Reactie binnen 30 minuten</span>
              </div>
              <h3 ref={titleRef} className="whatsapp-card-title">
                Neem contact op met Colin
              </h3>
              <p ref={descriptionRef} className="whatsapp-card-description">
                Ben je klaar om te starten? Colin staat klaar om met je in gesprek te gaan via WhatsApp en je dé perfecte begeleiding te geven die je nodig hebt om het beste uit BlueShipment te halen.
              </p>
            </div>
            <button 
              ref={buttonRef} 
              className="btn btn-whatsapp whatsapp-cta-button"
              onClick={() => openWhatsApp()}
            >
              Neem contact op via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhatsAppSection;

