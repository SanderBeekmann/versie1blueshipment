import React from 'react';
import './LogoSection.css';

function LogoSection() {
  // Placeholder logos - in production these would be actual partner logos
  const logos = [
    { id: 1, name: 'Partner 1' },
    { id: 2, name: 'Partner 2' },
    { id: 3, name: 'Partner 3' },
    { id: 4, name: 'Partner 4' },
    { id: 5, name: 'Partner 5' },
    { id: 6, name: 'Partner 6' },
  ];

  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos];

  return (
    <section className="logo-section">
      <div className="logo-container">
        <p className="logo-title">
          In samenwerking met de juiste partners
        </p>
        <div className="logo-marquee-wrapper">
          <div className="logo-marquee-track">
            {duplicatedLogos.map((logo, index) => (
              <div key={`${logo.id}-${index}`} className="logo-item">
                <div className="logo-placeholder">
                  <span>{logo.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LogoSection;

