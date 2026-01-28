import React, { useLayoutEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();
  const processStepsRef = useRef(null);
  const processContainerRef = useRef(null);
  const step6Ref = useRef(null);

  // Helper function to scroll to section with navbar offset
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    // Get navbar height or use fallback
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar?.offsetHeight || 110;
    const offset = navbarHeight + 20; // Extra 20px spacing

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  // Handle button click for step 1 (Ontdek listings)
  const handleListingsClick = () => {
    if (location.pathname === '/diensten') {
      // Already on diensten page, scroll to section
      setTimeout(() => {
        scrollToSection('productlistings');
      }, 100);
    } else {
      // Navigate to diensten page with hash
      navigate('/diensten#productlistings');
    }
  };

  // Handle button click for step 2 (Voorraadcheck uitleg)
  const handleSoftwareClick = () => {
    if (location.pathname === '/diensten') {
      // Already on diensten page, scroll to section
      setTimeout(() => {
        scrollToSection('software');
      }, 100);
    } else {
      // Navigate to diensten page with hash
      navigate('/diensten#software');
    }
  };

  // Handle button click for step 4 (Fulfilment)
  const handleFulfilmentClick = () => {
    if (location.pathname === '/diensten') {
      // Already on diensten page, scroll to section
      setTimeout(() => {
        scrollToSection('fulfilment');
      }, 100);
    } else {
      // Navigate to diensten page with hash
      navigate('/diensten#fulfilment');
    }
  };

  // Handle button click for step 5 (Bekijk resultaten - Gallery)
  const handleGalleryClick = () => {
    if (location.pathname === '/') {
      // Already on home page, scroll to section
      setTimeout(() => {
        scrollToSection('gallery');
      }, 100);
    } else {
      // Navigate to home page with hash
      navigate('/#gallery');
    }
  };

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
      description: 'Zorg ervoor dat de voorraad van jouw aanbod altijd up-to-date is met onze voorraadcheck software',
      buttonText: 'Voorraadcheck uitleg',
      align: 'right',
      image: stap2Img
    },
    {
      number: 3,
      title: 'Krijg gegarandeerd binnen 7 dagen je eerste bestelling',
      description: 'We zetten je account in en automatiseren alles. Jij zit achterover en wij doen het werk.',
      buttonText: 'Lees meer',
      align: 'left',
      image: stap3Img
    },
    {
      number: 4,
      title: 'Verstuur je bestelling naar het BlueShipment Fulfilment Center',
      description: 'Wij ontvangen jouw bestelling, controleren deze op kwaliteit & herpakken het indien nodig',
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
                          <img src={step.image} alt={`Stap ${step.number}: ${step.title || ''}`} className="step-image" loading="lazy" />
                        </div>
                      </div>
                      <button 
                        className="btn btn-secondary btn-icon"
                        onClick={
                          step.number === 1 ? handleListingsClick : 
                          step.number === 2 ? handleSoftwareClick : 
                          step.number === 4 ? handleFulfilmentClick :
                          step.number === 5 ? handleGalleryClick :
                          undefined
                        }
                      >
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
                          <img src={step.image} alt={`Stap ${step.number}: ${step.title || ''}`} className="step-image" loading="lazy" />
                        </div>
                      </div>
                      <button 
                        className="btn btn-secondary btn-icon"
                        onClick={
                          step.number === 1 ? handleListingsClick : 
                          step.number === 2 ? handleSoftwareClick : 
                          step.number === 4 ? handleFulfilmentClick :
                          step.number === 5 ? handleGalleryClick :
                          undefined
                        }
                      >
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
                  <button 
                    className="btn btn-secondary btn-icon"
                    onClick={step.number === 1 ? handleListingsClick : undefined}
                  >
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
        </div>
      </div>
    </section>
  );
}

export default ProcessSection;

