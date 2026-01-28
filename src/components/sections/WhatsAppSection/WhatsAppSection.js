import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './WhatsAppSection.css';
import colinPng from '../../../assets/COLIN.png';
import { openWhatsApp } from '../../../utils/whatsapp';

gsap.registerPlugin(ScrollTrigger);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function WhatsAppSection() {
  const sectionRef = useRef(null);
  const contentGridRef = useRef(null);
  const imageRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const bulletpointRef = useRef(null);
  const buttonRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const contentGrid = contentGridRef.current;
    const image = imageRef.current;
    const title = titleRef.current;
    const description = descriptionRef.current;
    const bulletpoint = bulletpointRef.current;
    const button = buttonRef.current;

    if (!section || !contentGrid || !image) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If reduced motion, show everything immediately
    if (prefersReducedMotion) {
      gsap.set([contentGrid, image, title, description, bulletpoint, button], {
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

    gsap.set([title, description, bulletpoint, button], {
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

      // Animate text content sequentially
      if (title) {
        tl.to(title, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(title, { willChange: 'auto' });
          },
        }, 0.4);
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
        }, 0.5);
      }

      if (bulletpoint) {
        tl.to(bulletpoint, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(bulletpoint, { willChange: 'auto' });
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
      <div className="whatsapp-container">
        {/* Ribbon Wrapper - Allows overflow for person image */}
        <div className="whatsapp-ribbon-wrapper">
          {/* Blue Ribbon - Main container */}
          <div className="whatsapp-ribbon">
            {/* Content Container */}
            <div className="whatsapp-ribbon-content">
              {/* Person Image - Links, uitstekend boven ribbon */}
              <div className="whatsapp-person">
                <img 
                  ref={imageRef} 
                  src={colinPng} 
                  alt="Colin Frederiks" 
                  className="whatsapp-person-image"
                />
              </div>

              {/* Text Content - Rechts op ribbon */}
              <div ref={contentGridRef} className="whatsapp-content">
                <h3 ref={titleRef} className="whatsapp-name">
                  Neem contact op met Colin
                </h3>
                <p ref={descriptionRef} className="whatsapp-role">
                  Ben je klaar om te starten? Colin staat klaar om met je in gesprek te gaan via WhatsApp en je dé perfecte begeleiding te geven die je nodig hebt om het beste uit BlueShipment te halen.
                </p>
                <div ref={bulletpointRef} className="whatsapp-bulletpoint">
                  <div className="whatsapp-bulletpoint-icon">
                    <CheckIcon />
                  </div>
                  <span className="whatsapp-bulletpoint-text">
                    Reactie binnen 30 minuten
                  </span>
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
        </div>
      </div>
    </section>
  );
}

export default WhatsAppSection;

