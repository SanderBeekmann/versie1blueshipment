import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import './TeamSection.css';
import timoImg from '../../../assets/timo.jpg';
import reitzeImg from '../../../assets/reitze.jpg';
import colinImg from '../../../assets/colin.jpg';
import davidImg from '../../../assets/david.jpeg';
import GlassTagline from '../GlassTagline/GlassTagline';

const BlueDot = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="11" fill="#0070ff"/>
  </svg>
);

function TeamSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardHeight, setCardHeight] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const timoCardRef = useRef(null);
  const viewportRef = useRef(null);
  const prevActiveIndexRef = useRef(0);
  const teamMembers = [
    {
      id: 1,
      name: 'Timo Jansen',
      role: 'Back-end & software',
      description: 'Zorgt voor vlekkeloze dagelijkse werkzaamheden en is verantwoordelijk voor de back-end.',
      image: timoImg
    },
    {
      id: 2,
      name: 'Reitze douma',
      role: 'Logistiek',
      description: 'Expert in logistieke afhandeling.',
      image: reitzeImg
    },
    {
      id: 3,
      name: 'Colin Frederiks',
      role: 'Verkoop & klantcontact',
      description: 'Eerste aanspreekpunt voor klanten en zorgt voor een perfecte verkoopervaring.',
      image: colinImg
    },
    {
      id: 4,
      name: 'David Karani',
      role: 'Social Media',
      description: 'Verzorgt social media voor Blueshipment.',
      image: davidImg
    }
  ];

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };
    
    checkMobile();
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    mediaQuery.addEventListener('change', checkMobile);
    
    return () => mediaQuery.removeEventListener('change', checkMobile);
  }, []);

  // Measure Timo's card height on mobile and apply to all cards
  useEffect(() => {
    const measureCardHeight = () => {
      const isMobileCheck = window.matchMedia('(max-width: 768px)').matches;
      if (!isMobileCheck) {
        setCardHeight(null);
        return;
      }

      if (!timoCardRef.current) return;

      const card = timoCardRef.current;
      const cardElement = card.querySelector('.team-card');
      if (!cardElement) return;

      // Temporarily make card measurable
      const originalStyles = {
        position: card.style.position,
        opacity: card.style.opacity,
        visibility: card.style.visibility,
        transform: card.style.transform,
        height: card.style.height
      };

      // Make card visible and static for measurement
      card.style.position = 'relative';
      card.style.opacity = '1';
      card.style.visibility = 'visible';
      card.style.transform = 'none';
      card.style.height = 'auto';

      // Wait for layout to calculate
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Measure the actual card element height
          const height = cardElement.offsetHeight;

          // Restore original styles
          Object.keys(originalStyles).forEach(key => {
            card.style[key] = originalStyles[key] || '';
          });

          if (height > 0) {
            setCardHeight(height + 24);
          }
        });
      });
    };

    // Measure after initial render
    const timeoutId = setTimeout(measureCardHeight, 300);

    // Re-measure on resize
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(measureCardHeight, 200);
    };
    
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    mediaQuery.addEventListener('change', handleResize);
    window.addEventListener('resize', handleResize);

    // Measure when images load
    const images = document.querySelectorAll('.member-photo');
    const imageLoadPromises = Array.from(images).map(img => {
      if (img.complete) {
        return Promise.resolve();
      }
      return new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    });

    Promise.all(imageLoadPromises).then(() => {
      setTimeout(measureCardHeight, 100);
    });

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(resizeTimeout);
      mediaQuery.removeEventListener('change', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Autoplay slider on mobile only
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        prevActiveIndexRef.current = prevIndex;
        return (prevIndex + 1) % teamMembers.length;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [teamMembers.length]);

  return (
    <section className="team-section">
      <div className="team-background"></div>
      <div className="max-w-7xl mx-auto px-6">
        <div className="team-container">
          <div className="team-header">
            <GlassTagline>
              <p>Mensen</p>
            </GlassTagline>
            <h2 className="team-title" data-animate-title>
              Het team achter <span className="text-blue">Blue</span>Shipment
            </h2>
            <p className="team-subtitle">
              Bol-verkopers die elkaar begrijpen en helpen
            </p>
          </div>

          <div className="team-grid">
            {/* Progress Indicator - Mobile Only */}
            <div className="team-deck-indicator" aria-hidden="true">
              {teamMembers.map((member, index) => (
                <div
                  key={`indicator-${member.id}`}
                  className={`team-indicator-bar ${index === activeIndex ? 'team-indicator-bar--active' : ''}`}
                  aria-label={`Card ${index + 1} of ${teamMembers.length}`}
                />
              ))}
            </div>

            <div 
              ref={viewportRef}
              className="team-slider-viewport team-deck"
              style={isMobile && cardHeight ? { height: `${cardHeight + 40}px` } : {}}
            >
              {isMobile ? (() => {
                // DECK MODEL: Only render 3 cards maximum on mobile
                // topCard = cards[activeIndex]
                // secondCard = cards[(activeIndex - 1 + N) % N] (previous card)
                // thirdCard = cards[(activeIndex - 2 + N) % N] (card before previous)
                const N = teamMembers.length;
                const topIndex = activeIndex;
                const secondIndex = (activeIndex - 1 + N) % N;
                const thirdIndex = (activeIndex - 2 + N) % N;
                
                // Determine if top card is entering (wasn't in previous deck)
                const prevTopIndex = prevActiveIndexRef.current;
                const prevSecondIndex = (prevTopIndex - 1 + N) % N;
                const prevThirdIndex = (prevTopIndex - 2 + N) % N;
                const isTopEntering = topIndex !== prevTopIndex && 
                                      topIndex !== prevSecondIndex && 
                                      topIndex !== prevThirdIndex;
                
                const deckCards = [
                  { index: topIndex, role: 'top', isEntering: isTopEntering },
                  { index: secondIndex, role: 'second', isEntering: false },
                  { index: thirdIndex, role: 'third', isEntering: false }
                ];
                
                return deckCards.map(({ index, role, isEntering }) => {
                  const member = teamMembers[index];
                  return (
                    <div 
                      key={`${member.id}-${role}-${activeIndex}`}
                      ref={index === 0 && role === 'top' ? timoCardRef : null}
                      className={`card-scale max-w-[352px] w-full team-slider-card team-slider-card--${role} ${isEntering ? 'team-slider-card--entering' : ''}`}
                      style={{
                        ...(cardHeight ? { height: `${cardHeight}px` } : {})
                      }}
                    >
                      <TeamCard member={member} />
                    </div>
                  );
                });
              })() : (
                // DESKTOP: Render all cards in grid
                teamMembers.map((member, index) => (
                  <div 
                    key={member.id}
                    ref={index === 0 ? timoCardRef : null}
                    className="card-scale max-w-[352px] w-full"
                  >
                    <TeamCard member={member} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CTA Button Container - Outside grid, centered */}
          <div className="team-deck-cta">
            <a href="/over-ons" className="team-cta-button">
              Over ons
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamCard({ member }) {
  const cardRef = useRef(null);
  const gsapInstanceRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const checkMobile = () => window.matchMedia('(max-width: 768px)').matches;
    const isMobile = checkMobile();
    
    // On mobile, disable rotation and reset any existing rotation
    if (isMobile) {
      if (gsapInstanceRef.current) {
        gsapInstanceRef.current.kill();
        gsapInstanceRef.current = null;
      }
      gsap.set(card, { rotation: 0, clearProps: 'transform' });
      return;
    }

    // On desktop/tablet, enable hover rotation
    const handleMouseEnter = () => {
      // Kill any existing animation
      if (gsapInstanceRef.current) {
        gsapInstanceRef.current.kill();
      }
      gsapInstanceRef.current = gsap.to(card, {
        rotation: 5,
        duration: 0.4,
        ease: 'power2.out',
        transformOrigin: '32px 32px'
      });
    };

    const handleMouseLeave = () => {
      // Kill any existing animation
      if (gsapInstanceRef.current) {
        gsapInstanceRef.current.kill();
      }
      gsapInstanceRef.current = gsap.to(card, {
        rotation: 0,
        duration: 0.4,
        ease: 'power2.out',
        transformOrigin: '32px 32px'
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    // Handle window resize to mobile
    const handleResize = () => {
      if (checkMobile()) {
        if (gsapInstanceRef.current) {
          gsapInstanceRef.current.kill();
          gsapInstanceRef.current = null;
        }
        gsap.set(card, { rotation: 0, clearProps: 'transform' });
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    mediaQuery.addEventListener('change', handleResize);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
      mediaQuery.removeEventListener('change', handleResize);
      if (gsapInstanceRef.current) {
        gsapInstanceRef.current.kill();
        gsapInstanceRef.current = null;
      }
      // Reset rotation on cleanup
      gsap.set(card, { rotation: 0, clearProps: 'transform' });
    };
  }, []);

  return (
    <div ref={cardRef} className="team-card">
      <div className="card-dot">
        <BlueDot />
      </div>
      <div className="card-image">
        <img src={member.image} alt={member.name} className="member-photo" />
      </div>
      <div className="card-content">
        <div className="card-title">
          <p className="member-name">{member.name}</p>
          <p className="member-role">{member.role}</p>
        </div>
        <p className="member-description">{member.description}</p>
      </div>
    </div>
  );
}

export default TeamSection;

