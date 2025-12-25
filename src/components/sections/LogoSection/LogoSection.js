import React from 'react';
import './LogoSection.css';
import bpostLogo from '../../../assets/bpost_logo.svg.png';
import dhlLogo from '../../../assets/dhl-logo.png';
import dpdLogo from '../../../assets/dpd.png';
import ampereLogo from '../../../assets/7869025b517d2a1d53961a98afda940bc118263f-1600x900-removebg-preview.png';

function LogoSection() {
  const logos = [
    { id: 1, name: 'bpost', src: bpostLogo },
    { id: 2, name: 'DHL', src: dhlLogo },
    { id: 3, name: 'DPD', src: dpdLogo },
    { id: 4, name: 'Ampère', src: ampereLogo },
  ];

  // Duplicate logos for seamless infinite loop
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <section className="logo-section">
      <div className="logo-container w-full">
        <p className="logo-title" data-animate-title>
          In samenwerking met de juiste partners
        </p>
        <div className="logo-carousel-wrapper">
          <div className="logo-carousel-track">
            {duplicatedLogos.map((logo, index) => (
              <div key={`${logo.id}-${index}`} className="logo-item">
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="logo-image"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LogoSection;

