import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import './TeamSection.css';
import timoImg from '../assets/timo.jpg';
import reitzeImg from '../assets/reitze.jpg';
import colinImg from '../assets/colin.jpg';
import GlassTagline from './GlassTagline';

const BlueDot = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="11" fill="#0070ff"/>
  </svg>
);

function TeamSection() {
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
    }
  ];

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

          <div className="team-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-6 lg:gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="card-scale max-w-[352px] w-full">
                <TeamCard member={member} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamCard({ member }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseEnter = () => {
      gsap.to(card, {
        rotation: 5,
        duration: 0.4,
        ease: 'power2.out',
        transformOrigin: '32px 32px'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotation: 0,
        duration: 0.4,
        ease: 'power2.out',
        transformOrigin: '32px 32px'
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
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

