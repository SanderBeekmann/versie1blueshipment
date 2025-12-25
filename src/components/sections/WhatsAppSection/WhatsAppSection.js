import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './WhatsAppSection.css';
import GlassTagline from '../GlassTagline/GlassTagline';

gsap.registerPlugin(ScrollTrigger);

const WhatsAppIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
      fill="currentColor"
    />
  </svg>
);

function WhatsAppSection() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!section || !card || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Set initial state for the card - starts below and invisible
      gsap.set(card, {
        y: 60,
        opacity: 0,
        willChange: 'transform, opacity',
      });

      // Animate the entire card up and fade in
      gsap.to(card, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true,
          onComplete: () => {
            gsap.set(card, { willChange: 'auto' });
          },
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="whatsapp-section">
      <div className="whatsapp-container">
        <div className="whatsapp-header">
          <GlassTagline>
            <p>Communicatie</p>
          </GlassTagline>
          <h2 className="whatsapp-title" data-animate-title>
            <span className="whatsapp-title-blue">WhatsApp</span> support binnen 30 minuten
          </h2>
          <p className="whatsapp-subtitle">
            Direct persoonlijk contact wanneer je het nodig hebt. Geen wachtrijen, geen chatbots.
          </p>
        </div>

        <div ref={cardRef} className="whatsapp-card">
          <div className="whatsapp-card-content">
            <div className="whatsapp-icon-wrapper">
              <WhatsAppIcon />
            </div>
            <div className="whatsapp-info">
              <div className="whatsapp-time">
                <span>Reactie binnen 30 minuten</span>
              </div>
              <h3 className="whatsapp-card-title">
                Neem contact op met Colin
              </h3>
              <p className="whatsapp-card-description">
                Ben je klaar om te starten? Colin staat klaar om met je in gesprek te gaan via WhatsApp en je dé perfecte begeleiding te geven die je nodig hebt om het beste uit BlueShipment te halen.
              </p>
            </div>
            <button className="btn btn-whatsapp whatsapp-cta-button">
              Neem contact op via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhatsAppSection;

