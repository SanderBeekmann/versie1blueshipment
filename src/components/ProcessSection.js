import React from 'react';
import './ProcessSection.css';
import GlassTagline from './GlassTagline';

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function ProcessSection() {
  const steps = [
    {
      number: 1,
      title: 'Ontvang 2000 artikelen cadeau van BlueShipment',
      description: 'Je ontvangt artikelen van ons en profiteert van onze gratis listingservice.',
      buttonText: 'Ontdek listings',
      align: 'left'
    },
    {
      number: 2,
      title: 'Houd je voorraad up-to-date door middel van onze Stock Controle Software',
      description: 'Ons team voert een grondige kwaliteitscheck uit. Alles klopt voordat het de verzending in gaat.',
      buttonText: 'Lees meer',
      align: 'right'
    },
    {
      number: 3,
      title: 'Binnen 1 week je eerste bestelling binnen',
      description: 'We zetten je account in en automatiseren alles. Jij zit achterover en wij doen het werk.',
      buttonText: 'Lees meer',
      align: 'left'
    },
    {
      number: 4,
      title: 'Verstuur je bestelling naar het BlueShipment Fulfilment Center',
      description: 'Wanneer de kwaliteit in orde is en mogelijke automatiseringen zijn doorgevoerd, ontvangen we je artikelen.',
      buttonText: 'Lees meer',
      align: 'right'
    },
    {
      number: 5,
      title: 'BlueShipment verstuurd de bestelling door naar de klant',
      description: 'Orders binnengekomen? We pakken en verzenden dezelfde dag. Geen vertraging, geen gedoe.',
      buttonText: 'Bekijk resultaten',
      align: 'left'
    }
  ];

  return (
    <section className="process-section">
      <div className="process-wrapper">
        <div className="process-container">
          {/* Header */}
          <div className="process-header">
            <GlassTagline>
              <p>Ons proces</p>
            </GlassTagline>
            <h2 className="process-title" data-animate-title>Van artikel tot blije klant in zes stappen</h2>
            <p className="process-subtitle">Dit is hoe we het doen.</p>
          </div>

          {/* Steps */}
          <div className="process-steps">
            {steps.map((step, index) => (
              <div key={step.number} className={`process-step ${step.align === 'right' ? 'reverse' : ''}`}>
                <div className="step-content-left">
                  {step.align === 'left' ? (
                    <div className="step-title-container">
                      <p className="step-number">Stap {step.number}.</p>
                      <h3 className="step-title" data-animate-title>{step.title}</h3>
                    </div>
                  ) : (
                    <div className="step-info">
                      <p className="step-description">{step.description}</p>
                      <button className="btn btn-secondary btn-icon">
                        {step.buttonText}
                        <ChevronRight />
                      </button>
                      <div className="step-image-placeholder"></div>
                    </div>
                  )}
                </div>
                
                <div className="step-timeline">
                  <div className="timeline-line"></div>
                  <div className="timeline-dot"></div>
                  <div className="timeline-line"></div>
                </div>
                
                <div className="step-content-right">
                  {step.align === 'right' ? (
                    <div className="step-title-container">
                      <p className="step-number">Stap {step.number}.</p>
                      <h3 className="step-title" data-animate-title>{step.title}</h3>
                    </div>
                  ) : (
                    <div className="step-info">
                      <p className="step-description">{step.description}</p>
                      <button className="btn btn-secondary btn-icon">
                        {step.buttonText}
                        <ChevronRight />
                      </button>
                      <div className="step-image-placeholder"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Step 6 */}
          <div className="process-step-final">
            <h3 className="step-final-title" data-animate-title>
              Stap 6.<br />Repeat!
            </h3>
          </div>

          {/* Result */}
          <div className="process-result">
            <GlassTagline>
              <p>Het resultaat?</p>
            </GlassTagline>
            <h2 className="result-title" data-animate-title>
              Blije klanten en meer winst<br />voor jou!
            </h2>
            <p className="result-description">
              Je klant ontvangt het pakket snel en goed verpakt.<br />
              Dit resulteerd in goede reviews en meer verkoop.
            </p>
            <div className="result-actions">
              <button className="btn btn-whatsapp">Contact via Whatsapp</button>
              <button className="text-link">
                Bekijk diensten
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProcessSection;

