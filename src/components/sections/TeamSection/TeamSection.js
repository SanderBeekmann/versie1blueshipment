import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TeamSection.css';
import GlassTagline from '../GlassTagline/GlassTagline';
import timoPng from '../../../assets/timo.png';
import reitzePng from '../../../assets/Reitze.png';
import colinPng from '../../../assets/COLIN.png';
import davidPng from '../../../assets/david.png';

function TeamSection({ hideCTA = false }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const autoplayIntervalRef = useRef(null);
  const sectionRef = useRef(null);

  const teamMembers = [
    {
      id: 1,
      name: 'Timo Jansen',
      role: 'Back-end & software',
      description: 'Zorgt voor vlekkeloze dagelijkse werkzaamheden en is verantwoordelijk voor de back-end.',
      image: timoPng
    },
    {
      id: 2,
      name: 'Reitze Douma',
      role: 'Logistiek',
      description: 'Expert in logistieke afhandeling.',
      image: reitzePng
    },
    {
      id: 3,
      name: 'Colin Frederiks',
      role: 'Verkoop & klantcontact',
      description: 'Eerste aanspreekpunt voor klanten en zorgt voor een perfecte verkoopervaring.',
      image: colinPng
    },
    {
      id: 4,
      name: 'David Karani',
      role: 'Social Media',
      description: 'Verzorgt social media voor Blueshipment.',
      image: davidPng
    }
  ];

  // Check for reduced motion preference
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false
  );

  // Autoplay slider
  useEffect(() => {
    if (prefersReducedMotion.current) return;

    autoplayIntervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % teamMembers.length);
    }, 5000);

    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, [teamMembers.length]);

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setActiveIndex((prev) => (prev + 1) % teamMembers.length);
    }
    if (isRightSwipe) {
      setActiveIndex((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
    }

    // Reset timer on manual swipe
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
    }
    if (!prefersReducedMotion.current) {
      autoplayIntervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % teamMembers.length);
      }, 5000);
    }
  };

  const currentMember = teamMembers[activeIndex];

  return (
    <section 
      ref={sectionRef}
      className="team-hero-section"
      aria-label="Team slider"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="team-hero-container">
        <div className="team-hero-header">
          <GlassTagline>
            <p>Mensen</p>
          </GlassTagline>
          <h2 className="team-hero-title" data-animate-title>
            Het team achter <span className="text-blue">Blue</span>Shipment
          </h2>
          <p className="team-hero-subtitle">
            Bol-verkopers die elkaar begrijpen en helpen
          </p>
        </div>

        <div className="team-hero-ribbon-wrapper">
          <div className="team-hero-ribbon">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMember.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="team-hero-slide"
              >
                {/* Person Image - Links, uitstekend boven ribbon */}
                <div className="team-hero-person">
                  <img 
                    src={currentMember.image} 
                    alt={currentMember.name}
                    className="team-hero-person-image"
                  />
                </div>

                {/* Text Content - Rechts op ribbon */}
                <div className="team-hero-content">
                  <motion.h3 
                    key={`name-${activeIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="team-hero-name"
                  >
                    {currentMember.name}
                  </motion.h3>
                  <motion.p 
                    key={`role-${activeIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="team-hero-role"
                  >
                    {currentMember.role}
                  </motion.p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots - Inside ribbon */}
            <div className="team-hero-dots" role="tablist" aria-label="Team member navigation">
            {teamMembers.map((member, index) => (
              <button
                key={member.id}
                className={`team-hero-dot ${index === activeIndex ? 'team-hero-dot--active' : ''}`}
                onClick={() => {
                  setActiveIndex(index);
                  // Reset timer on manual navigation
                  if (autoplayIntervalRef.current) {
                    clearInterval(autoplayIntervalRef.current);
                  }
                  if (!prefersReducedMotion.current) {
                    autoplayIntervalRef.current = setInterval(() => {
                      setActiveIndex((prev) => (prev + 1) % teamMembers.length);
                    }, 5000);
                  }
                }}
                aria-label={`Ga naar ${member.name}`}
                aria-selected={index === activeIndex}
                role="tab"
                type="button"
              />
            ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        {!hideCTA && (
          <div className="team-hero-cta">
            <a href="/over-ons" className="team-hero-cta-button">
              Over ons
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export default TeamSection;
