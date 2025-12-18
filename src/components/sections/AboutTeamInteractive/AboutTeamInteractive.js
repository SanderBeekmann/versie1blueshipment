import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './AboutTeamInteractive.css';
import GlassTagline from '../GlassTagline/GlassTagline';

const teamData = [
  {
    id: 'timo',
    name: 'Timo Jansen',
    role: 'Back-end & software',
    description: 'Als back-end developer zorg ik ervoor dat alles achter de schermen soepel verloopt. Ik ben gepassioneerd over schone code en efficiënte systemen. Mijn focus ligt op het bouwen van robuuste oplossingen die dag in dag uit betrouwbaar werken. Ik begrijp de frustraties van bol.com verkopers omdat ik zelf jarenlang in die schoenen heb gestaan. Die ervaring gebruik ik nu om software te maken die echt werkt voor jullie.',
    badge: null
  },
  {
    id: 'colin',
    name: 'Colin Frederiks',
    role: 'Verkoop & klantcontact',
    description: 'Ik ben het eerste aanspreekpunt voor al onze klanten. Mijn achtergrond als bol.com verkoper helpt me om precies te begrijpen waar je tegenaan loopt. Ik geloof in persoonlijk contact - geen automatische antwoorden, maar echte gesprekken. Als je een vraag hebt, bel of app me gerust. Ik ken je bedrijf en help je graag verder, of het nu gaat om een technisch probleem of gewoon een vraag over je dagelijkse werkzaamheden.',
    badge: 'Aanspreekpunt'
  },
  {
    id: 'reitze',
    name: 'Reitze Douma',
    role: 'Logistiek',
    description: 'Logistiek is mijn specialiteit. Ik zorg ervoor dat elke order op tijd en correct wordt verzonden. Mijn ervaring met bol.com fulfillment heeft me geleerd wat echt belangrijk is: snelheid, nauwkeurigheid en transparantie. Ik werk dagelijks aan het optimaliseren van onze processen zodat jij je geen zorgen hoeft te maken over je verzendingen. Elke order die we verwerken, behandel ik alsof het mijn eigen bedrijf is.',
    badge: null
  }
];

const BlueDot = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="11" fill="#0070ff"/>
  </svg>
);

function AboutTeamInteractive() {
  const [activeMember, setActiveMember] = useState('colin'); // Default: Colin
  const [previewMember, setPreviewMember] = useState(null); // For hover preview on desktop
  const detailCardRef = useRef(null);
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
      y: 10,
      duration: 0.2,
      ease: 'power2.out',
      onComplete: () => {
        // Update active member
        setActiveMember(memberId);
        // Animate in
        const inAnimation = gsap.fromTo(
          detailCardRef.current,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
          }
        );
        animationRef.current = inAnimation;
      }
    });
  };

  // Handle click/tap
  const handleMemberClick = (memberId) => {
    if (memberId !== activeMember) {
      animateDetailCard(memberId);
    }
  };

  // Handle hover on desktop (optional preview)
  const handleMemberHover = (memberId) => {
    if (window.innerWidth >= 900) {
      setPreviewMember(memberId);
    }
  };

  const handleMemberLeave = () => {
    setPreviewMember(null);
  };

  // Get the member to display (preview or active)
  const displayMember = previewMember || activeMember;
  const member = teamData.find(m => m.id === displayMember);

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

  return (
    <section className="about-team-interactive">
      <div className="about-team-interactive-container">
        {/* Header */}
        <div className="about-team-interactive-header">
          <GlassTagline withDot>
            <p>Het team</p>
          </GlassTagline>
          <h2 className="about-team-interactive-title">
            Het team achter Blueshipment
          </h2>
          <p className="about-team-interactive-subtitle">
            Bol-verkopers die elkaar begrijpen en helpen
          </p>
        </div>

        {/* Main Content: List + Detail */}
        <div className="about-team-interactive-content">
          {/* Left: Compact List */}
          <nav className="about-team-interactive-list" aria-label="Team members">
            {teamData.map((member) => {
              const isActive = member.id === activeMember;
              return (
                <button
                  key={member.id}
                  className={`about-team-interactive-list-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleMemberClick(member.id)}
                  onMouseEnter={() => handleMemberHover(member.id)}
                  onMouseLeave={handleMemberLeave}
                  onKeyDown={(e) => handleKeyDown(e, member.id)}
                  aria-pressed={isActive}
                  aria-selected={isActive}
                  type="button"
                >
                  <div className="list-item-dot">
                    <BlueDot />
                  </div>
                  <div className="list-item-content">
                    <div className="list-item-name">{member.name}</div>
                    <div className="list-item-role">{member.role}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Right: Detail Panel */}
          <article 
            className="about-team-interactive-detail"
            ref={detailCardRef}
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="detail-card">
              {/* Media Placeholder */}
              <div className="detail-card-media">
                <div className="detail-card-image-placeholder"></div>
              </div>

              {/* Content */}
              <div className="detail-card-content">
                <div className="detail-card-header">
                  <h3 className="detail-card-name">{member.name}</h3>
                  <div className="detail-card-role">{member.role}</div>
                  {member.badge && (
                    <div className="detail-card-badge">{member.badge}</div>
                  )}
                </div>
                <p className="detail-card-description">{member.description}</p>
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

export default AboutTeamInteractive;

