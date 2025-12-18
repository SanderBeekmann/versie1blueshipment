import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './AboutTeamStable.css';
import GlassTagline from '../GlassTagline/GlassTagline';
import timoImg from '../../../assets/timo.jpg';
import colinImg from '../../../assets/colin.jpg';
import reitzeImg from '../../../assets/reitze.jpg';

const teamData = [
  {
    id: 'timo',
    name: 'Timo Jansen',
    role: 'Back-end & software',
    shortDescription: 'Zorgt voor vlekkeloze dagelijkse werkzaamheden en is verantwoordelijk voor de back-end.',
    fullDescription: 'Als back-end developer zorg ik ervoor dat alles achter de schermen soepel verloopt. Ik ben gepassioneerd over schone code en efficiënte systemen. Mijn focus ligt op het bouwen van robuuste oplossingen die dag in dag uit betrouwbaar werken. Ik begrijp de frustraties van bol.com verkopers omdat ik zelf jarenlang in die schoenen heb gestaan. Die ervaring gebruik ik nu om software te maken die echt werkt voor jullie.',
    badge: null,
    image: timoImg
  },
  {
    id: 'colin',
    name: 'Colin Frederiks',
    role: 'Verkoop & klantcontact',
    shortDescription: 'Eerste aanspreekpunt voor klanten en zorgt voor een perfecte verkoopervaring.',
    fullDescription: 'Ik ben het eerste aanspreekpunt voor al onze klanten. Mijn achtergrond als bol.com verkoper helpt me om precies te begrijpen waar je tegenaan loopt. Ik geloof in persoonlijk contact - geen automatische antwoorden, maar echte gesprekken. Als je een vraag hebt, bel of app me gerust. Ik ken je bedrijf en help je graag verder, of het nu gaat om een technisch probleem of gewoon een vraag over je dagelijkse werkzaamheden.',
    badge: 'Aanspreekpunt',
    image: colinImg
  },
  {
    id: 'reitze',
    name: 'Reitze Douma',
    role: 'Logistiek',
    shortDescription: 'Expert in logistieke afhandeling.',
    fullDescription: 'Logistiek is mijn specialiteit. Ik zorg ervoor dat elke order op tijd en correct wordt verzonden. Mijn ervaring met bol.com fulfillment heeft me geleerd wat echt belangrijk is: snelheid, nauwkeurigheid en transparantie. Ik werk dagelijks aan het optimaliseren van onze processen zodat jij je geen zorgen hoeft te maken over je verzendingen. Elke order die we verwerken, behandel ik alsof het mijn eigen bedrijf is.',
    badge: null,
    image: reitzeImg
  }
];

const BlueDot = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="11" fill="#0070ff"/>
  </svg>
);

function AboutTeamStable() {
  const [activeMember, setActiveMember] = useState('colin'); // Default: Colin
  const detailCardRef = useRef(null);
  const cardsRef = useRef([]);
  const animationRef = useRef(null);
  const prefersReducedMotionRef = useRef(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mediaQuery.matches;

    const handleChange = (e) => {
      prefersReducedMotionRef.current = e.matches;
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Animate cards on scroll in
  useEffect(() => {
    if (prefersReducedMotionRef.current) return;

    const cards = cardsRef.current.filter(Boolean);
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              entry.target,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                delay: index * 0.1,
                ease: 'power2.out'
              }
            );
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, []);

  // Animate detail card transition
  const animateDetailCard = (memberId) => {
    if (!detailCardRef.current) return;

    // Kill any ongoing animations
    if (animationRef.current) {
      animationRef.current.kill();
    }

    if (prefersReducedMotionRef.current) {
      // No animation, direct update
      setActiveMember(memberId);
      return;
    }

    // Animate out
    animationRef.current = gsap.to(detailCardRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.out',
      onComplete: () => {
        // Update active member
        setActiveMember(memberId);
        // Animate in
        const inAnimation = gsap.fromTo(
          detailCardRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out'
          }
        );
        animationRef.current = inAnimation;
      }
    });
  };

  // Handle click
  const handleMemberClick = (memberId) => {
    if (memberId !== activeMember) {
      animateDetailCard(memberId);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e, memberId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleMemberClick(memberId);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, []);

  const member = teamData.find(m => m.id === activeMember);

  return (
    <section className="about-team-stable">
      <div className="about-team-stable-container">
        {/* Header */}
        <div className="about-team-stable-header">
          <GlassTagline withDot>
            <p>Het team</p>
          </GlassTagline>
          <h2 className="about-team-stable-title">
            Het team achter Blueshipment
          </h2>
          <p className="about-team-stable-subtitle">
            Bol-verkopers die elkaar begrijpen en helpen
          </p>
        </div>

        {/* Content: Small Cards + Detail */}
        <div className="about-team-stable-content">
          {/* Left: Small Cards */}
          <div className="about-team-stable-cards">
            {teamData.map((member, index) => {
              const isActive = member.id === activeMember;
              return (
                <button
                  key={member.id}
                  ref={(el) => (cardsRef.current[index] = el)}
                  className={`about-team-stable-card ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleMemberClick(member.id)}
                  onKeyDown={(e) => handleKeyDown(e, member.id)}
                  aria-pressed={isActive}
                  aria-selected={isActive}
                  type="button"
                >
                  <div className="team-card-dot">
                    <BlueDot />
                  </div>
                  <div className="team-card-body">
                    <h3 className="team-card-name">{member.name}</h3>
                    <p className="team-card-role">{member.role}</p>
                    <p className="team-card-description">{member.shortDescription}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Detail Panel */}
          <article
            className="about-team-stable-detail"
            ref={detailCardRef}
            aria-live="polite"
            aria-atomic="true"
          >
          <div className="team-detail-card">
            {/* Media */}
            <div className="team-detail-media">
              <img src={member.image} alt={member.name} className="team-detail-image" />
            </div>

            {/* Content */}
            <div className="team-detail-content">
              <div className="team-detail-header">
                <h3 className="team-detail-name">{member.name}</h3>
                <p className="team-detail-role">{member.role}</p>
                {member.badge && (
                  <div className="team-detail-badge">{member.badge}</div>
                )}
              </div>
              <p className="team-detail-description">{member.fullDescription}</p>
              {member.badge && (
                <button className="btn btn-whatsapp" type="button">
                  Contact via WhatsApp
                </button>
              )}
            </div>
          </div>
        </article>
        </div>
      </div>
    </section>
  );
}

export default AboutTeamStable;
