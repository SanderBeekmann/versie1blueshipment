import React, { useLayoutEffect, useRef } from 'react';
import './ProcessSection.css';
import GlassTagline from '../GlassTagline/GlassTagline';
import { initTimelineAnimations, cleanupTimelineAnimations } from '../../../utils/scrollAnimations';
import stap1Img from '../../../assets/stap1.svg';
import stap2Img from '../../../assets/stap 2.png';
import stap3Img from '../../../assets/stap 3.png';
import stap4Img from '../../../assets/stap 4.png';
import stap5Img from '../../../assets/stap 5.png';

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function ProcessSection() {
  const processStepsRef = useRef(null);
  const processContainerRef = useRef(null);
  const step6Ref = useRef(null);

  useLayoutEffect(() => {
    if (processStepsRef.current && processContainerRef.current) {
      const cleanup = initTimelineAnimations(processStepsRef.current, processContainerRef.current, {
        step6El: step6Ref.current
      });

      return () => {
        if (cleanup) cleanup();
        cleanupTimelineAnimations();
      };
    }
  }, []);

  const steps = [
    {
      number: 1,
      title: 'Ontvang 2000 artikelen cadeau van BlueShipment',
      description: 'Je ontvangt artikelen van ons en profiteert van onze gratis listingservice.',
      buttonText: 'Ontdek listings',
      align: 'left',
      image: stap1Img
    },
    {
      number: 2,
      title: 'Houd je voorraad up-to-date door middel van onze Stock Controle Software',
      description: 'Ons team voert een grondige kwaliteitscheck uit. Alles klopt voordat het de verzending in gaat.',
      buttonText: 'Lees meer',
      align: 'right',
      image: stap2Img
    },
    {
      number: 3,
      title: 'Binnen 1 week je eerste bestelling binnen',
      description: 'We zetten je account in en automatiseren alles. Jij zit achterover en wij doen het werk.',
      buttonText: 'Lees meer',
      align: 'left',
      image: stap3Img
    },
    {
      number: 4,
      title: 'Verstuur je bestelling naar het BlueShipment Fulfilment Center',
      description: 'Wanneer de kwaliteit in orde is en mogelijke automatiseringen zijn doorgevoerd, ontvangen we je artikelen.',
      buttonText: 'Lees meer',
      align: 'right',
      image: stap4Img
    },
    {
      number: 5,
      title: 'BlueShipment verstuurd de bestelling door naar de klant',
      description: 'Orders binnengekomen? We pakken en verzenden dezelfde dag. Geen vertraging, geen gedoe.',
      buttonText: 'Bekijk resultaten',
      align: 'left',
      image: stap5Img
    }
  ];

  return (
    <section className="process-section">
      <div className="process-wrapper">
        <div className="process-container" ref={processContainerRef}>
          {/* Header */}
          <div className="process-header">
            <GlassTagline>
              <p>Ons proces</p>
            </GlassTagline>
            <h2 className="process-title" data-animate-title>Van artikel tot blije klant in zes stappen</h2>
            <p className="process-subtitle">Dit is hoe we het doen.</p>
          </div>

          {/* Steps */}
          <div className="process-steps" ref={processStepsRef}>
            {/* Mobile: Timeline rail container for animated line */}
            <div className="process-timeline-rail">
              <div className="process-timeline-track"></div>
              <div className="process-timeline-progress"></div>
            </div>
            {steps.map((step, index) => (
              <div 
                key={step.number} 
                className={`process-step ${step.align === 'right' ? 'reverse' : ''} ${step.align === 'left' ? 'is-left' : 'is-right'}`}
              >
                <div className="step-content-left">
                  {step.align === 'left' ? (
                    <div className="step-title-container timeline-text">
                      <p className="step-number timeline-text">Stap {step.number}.</p>
                      <h3 className="step-title timeline-text">{step.title}</h3>
                    </div>
                  ) : (
                    <div className="step-info timeline-text">
                      <p className="step-description timeline-text">{step.description}</p>
                      <div className="step-image-wrapper">
                        <div className="step-image-container timeline-media">
                          <img src={step.image} alt={`Stap ${step.number}`} className="step-image" />
                        </div>
                      </div>
                      <button className="btn btn-secondary btn-icon">
                        {step.buttonText}
                        <ChevronRight />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="step-timeline">
                  <div className="timeline-line timeline-line-base"></div>
                  <div className="timeline-dot"></div>
                  <div className="timeline-line timeline-line-base"></div>
                  <div className="timeline-line-progress"></div>
                </div>
                
                <div className="step-content-right">
                  {step.align === 'right' ? (
                    <div className="step-title-container timeline-text">
                      <p className="step-number timeline-text">Stap {step.number}.</p>
                      <h3 className="step-title timeline-text">{step.title}</h3>
                    </div>
                  ) : (
                    <div className="step-info timeline-text">
                      <p className="step-description timeline-text">{step.description}</p>
                      <div className="step-image-wrapper">
                        <div className="step-image-container timeline-media">
                          <img src={step.image} alt={`Stap ${step.number}`} className="step-image" />
                        </div>
                      </div>
                      <button className="btn btn-secondary btn-icon">
                        {step.buttonText}
                        <ChevronRight />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Mobile-only unified content */}
                <div className="step-content-mobile">
                  <div className="step-title-container timeline-text">
                    <p className="step-number timeline-text">Stap {step.number}.</p>
                    <h3 className="step-title timeline-text">{step.title}</h3>
                  </div>
                  <p className="step-description timeline-text">{step.description}</p>
                  <div className="step-image-wrapper">
                    <div className="step-image-container timeline-media">
                      <img src={step.image} alt={`Stap ${step.number}`} className="step-image" />
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-icon">
                    {step.buttonText}
                    <ChevronRight />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Step 6 */}
          <div className="process-step-final" ref={step6Ref}>
            <h3 className="step-final-title">
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

