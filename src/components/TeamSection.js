import React from 'react';
import './TeamSection.css';

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
      description: 'Zorgt voor vlekkeloze dagelijkse werkzaamheden en is verantwoordelijk voor de back-end.'
    },
    {
      id: 2,
      name: 'Reitze douma',
      role: 'Logistiek',
      description: 'Expert in logistieke afhandeling.'
    },
    {
      id: 3,
      name: 'Colin Frederiks',
      role: 'Verkoop & klantcontact',
      description: 'Eerste aanspreekpunt voor klanten en zorgt voor een perfecte verkoopervaring.'
    }
  ];

  return (
    <section className="team-section">
      <div className="team-background"></div>
      <div className="team-container">
        <div className="team-header">
          <p className="team-tagline">Mensen</p>
          <h2 className="team-title">
            Het team achter <span className="text-blue">Blue</span>Shipment
          </h2>
          <p className="team-subtitle">
            Bol-verkopers die elkaar begrijpen en helpen
          </p>
        </div>

        <div className="team-grid">
          {teamMembers.map((member) => (
            <div key={member.id} className="team-card">
              <div className="card-dot">
                <BlueDot />
              </div>
              <div className="card-image">
                <div className="image-placeholder"></div>
              </div>
              <div className="card-content">
                <div className="card-title">
                  <p className="member-name">{member.name}</p>
                  <p className="member-role">{member.role}</p>
                </div>
                <p className="member-description">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TeamSection;

