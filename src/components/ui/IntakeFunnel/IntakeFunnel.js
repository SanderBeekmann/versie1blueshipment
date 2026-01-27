import React, { useState } from 'react';
import './IntakeFunnel.css';
import { sendFunnelEmail } from '../../../utils/emailService';

const IntakeFunnel = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    verkoopkanaal: '',
    // Step 2
    diensten: [],
    // Step 3
    shipmentVolume: '',
    grootsteUitdaging: '',
    // Step 4
    name: '',
    company: '',
    email: '',
    phone: '',
    website: ''
  });

  const [errors, setErrors] = useState({});

  const totalSteps = 4;

  // Step 1: Verkoopkanaal options
  const verkoopkanaalOptions = [
    'bol.com',
    'bol.com en eigen webshop',
    'Alleen eigen webshop',
    'Ik ben nog aan het starten'
  ];

  // Step 2: Diensten options
  const dienstenOptions = [
    'Productlistings',
    'Automatiseren',
    'Fulfilment',
    'Software',
    'Consulting'
  ];

  // Step 3: Shipment volume options
  const shipmentVolumeOptions = [
    '<50',
    '50–250',
    '250–1000',
    '1000+'
  ];

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.verkoopkanaal) {
          newErrors.verkoopkanaal = 'Selecteer een verkoopkanaal';
        }
        break;
      case 2:
        if (formData.diensten.length === 0) {
          newErrors.diensten = 'Selecteer minimaal één dienst';
        }
        break;
      case 3:
        if (!formData.shipmentVolume) {
          newErrors.shipmentVolume = 'Selecteer een shipment volume';
        }
        break;
      case 4:
        if (!formData.email) {
          newErrors.email = 'E-mail is verplicht';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Ongeldig e-mailadres';
        }
        if (!formData.phone) {
          newErrors.phone = 'Telefoonnummer is verplicht';
        }
        break;
      default:
        // No validation needed for unknown steps
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (validateStep(4)) {
      setIsSubmitting(true);
      
      try {
        // Send email first
        const emailResult = await sendFunnelEmail(formData);
        
        if (emailResult.success) {
          // Then redirect to Calendly
          const calendlyUrl = 'https://calendly.com/mouseclick2017/30min';
          window.open(calendlyUrl, '_blank');
          
          if (onComplete) {
            onComplete(formData);
          }
        } else {
          // If email fails, still redirect to Calendly but show error
          console.error('Email sending failed:', emailResult.error);
          const calendlyUrl = 'https://calendly.com/mouseclick2017/30min';
          window.open(calendlyUrl, '_blank');
          
          if (onComplete) {
            onComplete(formData);
          }
        }
      } catch (error) {
        console.error('Error in form submission:', error);
        // Still redirect to Calendly even if email fails
        const calendlyUrl = 'https://calendly.com/mouseclick2017/30min';
        window.open(calendlyUrl, '_blank');
        
        if (onComplete) {
          onComplete(formData);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing/selecting
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleDienst = (dienst) => {
    setFormData(prev => {
      const diensten = prev.diensten.includes(dienst)
        ? prev.diensten.filter(d => d !== dienst)
        : [...prev.diensten, dienst];
      return { ...prev, diensten };
    });
    if (errors.diensten) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.diensten;
        return newErrors;
      });
    }
  };

  const canProceed = () => {
    switch(currentStep) {
      case 1:
        return !!formData.verkoopkanaal;
      case 2:
        return formData.diensten.length > 0;
      case 3:
        return !!formData.shipmentVolume;
      case 4:
        return !!formData.email && !!formData.phone && 
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      default:
        return false;
    }
  };

  // Calculate progress percentage: activeIndex (0-based) / (totalSteps - 1) * 100
  // This ensures the line ends exactly at the center of the active step
  const activeIndex = currentStep - 1; // Convert 1-based to 0-based
  const progressPercent = totalSteps > 1 
    ? (activeIndex / (totalSteps - 1)) * 100 
    : 0;

  return (
    <div className="intake-funnel">
      {/* Progress Indicator */}
      <div className="funnel-progress">
        {/* Background line (full width) */}
        <div className="funnel-progress-line funnel-progress-line--background" />
        
        {/* Progress line (fills to active step center) */}
        <div 
          className="funnel-progress-line funnel-progress-line--fill" 
          style={{ width: `${progressPercent}%` }}
        />
        
        {/* Step circles above the lines */}
        <div className="funnel-progress-steps">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div
              key={step}
              className={`funnel-progress-step ${step <= currentStep ? 'active' : ''} ${step === currentStep ? 'current' : ''}`}
            >
              <span className="funnel-progress-step-number">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="funnel-content">
        {/* Left Arrow Navigation */}
        {currentStep > 1 && (
          <button
            type="button"
            className="funnel-arrow funnel-arrow--left"
            onClick={handleBack}
            aria-label="Vorige stap"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Right Arrow Navigation */}
        {currentStep < totalSteps && (
          <button
            type="button"
            className="funnel-arrow funnel-arrow--right"
            onClick={handleNext}
            disabled={!canProceed()}
            aria-label="Volgende stap"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <div className="funnel-step-container">
          {/* Step 1: Verkoopkanaal */}
          {currentStep === 1 && (
            <div className="funnel-step">
              <h2 className="funnel-question">Waar verkoop je momenteel?</h2>
              <div className="funnel-options-grid">
                {verkoopkanaalOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`funnel-option-card ${formData.verkoopkanaal === option ? 'selected' : ''}`}
                    onClick={() => updateFormData('verkoopkanaal', option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.verkoopkanaal && (
                <p className="funnel-error">{errors.verkoopkanaal}</p>
              )}
            </div>
          )}

          {/* Step 2: Dienstenkeuze */}
          {currentStep === 2 && (
            <div className="funnel-step">
              <h2 className="funnel-question">Waar wil je op dit moment hulp bij?</h2>
              <p className="funnel-subtitle">Meerdere opties mogelijk</p>
              <div className="funnel-options-grid">
                {dienstenOptions.map((dienst) => (
                  <button
                    key={dienst}
                    type="button"
                    className={`funnel-option-card funnel-option-card--multi ${formData.diensten.includes(dienst) ? 'selected' : ''}`}
                    onClick={() => toggleDienst(dienst)}
                  >
                    <span className="funnel-option-checkbox">
                      {formData.diensten.includes(dienst) && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    {dienst}
                  </button>
                ))}
              </div>
              {errors.diensten && (
                <p className="funnel-error">{errors.diensten}</p>
              )}
            </div>
          )}

          {/* Step 3: Kwalificatie */}
          {currentStep === 3 && (
            <div className="funnel-step">
              <h2 className="funnel-question">Vertel ons meer over je situatie</h2>
              
              <div className="funnel-input-group">
                <label className="funnel-label">Hoeveel shipments verzend je per maand?</label>
                <div className="funnel-options-grid funnel-options-grid--compact">
                  {shipmentVolumeOptions.map((volume) => (
                    <button
                      key={volume}
                      type="button"
                      className={`funnel-option-card funnel-option-card--compact ${formData.shipmentVolume === volume ? 'selected' : ''}`}
                      onClick={() => updateFormData('shipmentVolume', volume)}
                    >
                      {volume}
                    </button>
                  ))}
                </div>
                {errors.shipmentVolume && (
                  <p className="funnel-error">{errors.shipmentVolume}</p>
                )}
              </div>

              <div className="funnel-input-group">
                <label className="funnel-label">
                  Wat is op dit moment je grootste uitdaging? <span className="funnel-label-optional">(optioneel)</span>
                </label>
                <textarea
                  className="funnel-textarea"
                  value={formData.grootsteUitdaging}
                  onChange={(e) => updateFormData('grootsteUitdaging', e.target.value)}
                  placeholder="Beschrijf je uitdaging..."
                  rows="4"
                />
              </div>
            </div>
          )}

          {/* Step 4: Contactgegevens */}
          {currentStep === 4 && (
            <div className="funnel-step">
              <h2 className="funnel-question">Laat je contactgegevens achter</h2>
              
              <div className="funnel-form-grid">
                <div className="funnel-input-group">
                  <label className="funnel-label">Naam *</label>
                  <input
                    type="text"
                    className="funnel-input"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Jouw naam"
                  />
                </div>

                <div className="funnel-input-group">
                  <label className="funnel-label">Bedrijf</label>
                  <input
                    type="text"
                    className="funnel-input"
                    value={formData.company}
                    onChange={(e) => updateFormData('company', e.target.value)}
                    placeholder="Bedrijfsnaam"
                  />
                </div>

                <div className="funnel-input-group">
                  <label className="funnel-label">E-mail *</label>
                  <input
                    type="email"
                    className={`funnel-input ${errors.email ? 'error' : ''}`}
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="jouw@email.nl"
                  />
                  {errors.email && (
                    <p className="funnel-error-text">{errors.email}</p>
                  )}
                </div>

                <div className="funnel-input-group">
                  <label className="funnel-label">Telefoonnummer *</label>
                  <input
                    type="tel"
                    className={`funnel-input ${errors.phone ? 'error' : ''}`}
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="06 12345678"
                  />
                  {errors.phone && (
                    <p className="funnel-error-text">{errors.phone}</p>
                  )}
                </div>

                <div className="funnel-input-group funnel-input-group--website">
                  <label className="funnel-label">Website URL</label>
                  <input
                    type="url"
                    className="funnel-input"
                    value={formData.website}
                    onChange={(e) => updateFormData('website', e.target.value)}
                    placeholder="https://jouwwebsite.nl"
                  />
                </div>
                
                {/* Submit button - only visible on desktop in step 4 */}
                {currentStep === totalSteps && (
                  <div className="funnel-input-group funnel-input-group--submit-desktop">
                    <label className="funnel-label funnel-label--hidden">Submit</label>
                    <button
                      type="button"
                      className="funnel-btn funnel-btn--primary funnel-btn--submit-inline"
                      onClick={handleNext}
                      disabled={!canProceed() || isSubmitting}
                    >
                      {isSubmitting 
                        ? 'Verzenden...' 
                        : 'Plan mijn kennismaking'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="funnel-navigation">
          {currentStep > 1 && (
            <button
              type="button"
              className="funnel-btn funnel-btn--secondary"
              onClick={handleBack}
            >
              Terug
            </button>
          )}
          {!(currentStep === totalSteps) && (
            <button
              type="button"
              className="funnel-btn funnel-btn--primary"
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
            >
              Volgende
            </button>
          )}
          {/* Mobile submit button - hidden on desktop when in step 4 */}
          {currentStep === totalSteps && (
            <button
              type="button"
              className="funnel-btn funnel-btn--primary funnel-btn--submit-mobile"
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting 
                ? 'Verzenden...' 
                : 'Plan mijn kennismaking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntakeFunnel;
