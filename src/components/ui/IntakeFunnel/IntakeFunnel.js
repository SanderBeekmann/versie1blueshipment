import React, { useState } from 'react';
import './IntakeFunnel.css';
import { sendFunnelEmail } from '../../../utils/emailService';
import timoImage from '../../../assets/timo.png';
import CalendarPicker from '../CalendarPicker/CalendarPicker';

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
    website: '',
    // Step 5
    preferredDate: '',
    preferredTime: '',
    awareOfTimeReservation: false
  });

  const [errors, setErrors] = useState({});

  const totalSteps = 5;

  // Step 1: Verkoopkanaal options - grouped for better UX
  const activeSellerOptions = [
    'bol.com',
    'bol.com en eigen webshop',
    'Alleen eigen webshop'
  ];
  
  const startingOption = 'Ik ben nog aan het starten';

  // Step 2: Diensten options
  const dienstenOptions = [
    'Productlistings',
    'Automatiseren',
    'Fulfilment',
    'Software'
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
      case 5:
        if (!formData.preferredDate) {
          newErrors.preferredDate = 'Kies een voorkeursdatum';
        } else if (!formData.preferredTime) {
          newErrors.preferredDate = 'Kies ook een tijdstip';
        }
        if (!formData.awareOfTimeReservation) {
          newErrors.awareOfTimeReservation = 'Je moet akkoord gaan om door te gaan';
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditingShipmentVolume, setIsEditingShipmentVolume] = useState(false);
  const [shipmentVolumeInputValue, setShipmentVolumeInputValue] = useState('');

  const handleSubmit = async () => {
    if (validateStep(5)) {
      setIsSubmitting(true);

      try {
        // Send email and wait for response
        const result = await sendFunnelEmail(formData);

        if (result.success) {
          // Show success state
          setIsSuccess(true);

          // Open Calendly in new tab after a short delay for UX
          setTimeout(() => {
            const calendlyUrl = 'https://calendly.com/mouseclick2017/30min';
            window.open(calendlyUrl, '_blank');

            if (onComplete) {
              onComplete(formData);
            }
          }, 500);
        } else {
          console.error('Failed to send email:', result.error);
          alert('Er is iets misgegaan bij het verzenden van je gegevens. Probeer het opnieuw of neem contact met ons op.');
        }
      } catch (error) {
        console.error('Error sending email:', error);
        alert('Er is iets misgegaan bij het verzenden van je gegevens. Probeer het opnieuw of neem contact met ons op.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const updateFormData = (field, value) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newFormData);
    
    // Clear error when user starts typing/selecting
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Auto-advance to next step when selecting in step 1
    if (field === 'verkoopkanaal' && currentStep === 1) {
      // Validate with the new value immediately
      const tempErrors = {};
      if (!value) {
        tempErrors.verkoopkanaal = 'Selecteer een verkoopkanaal';
      }
      
      // If valid, advance to next step after a small delay for visual feedback
      if (Object.keys(tempErrors).length === 0) {
        setTimeout(() => {
          setCurrentStep(2);
        }, 200);
      }
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
      case 5:
        return formData.awareOfTimeReservation;
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
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
            // Allow navigation to completed steps or next step (if current step is valid)
            const isCompletedStep = step < currentStep;
            const isNextStep = step === currentStep + 1;
            // Check if current step is valid without setting errors
            const isCurrentStepValid = canProceed();
            const canNavigateToStep = isCompletedStep || (isNextStep && isCurrentStepValid);
            const isClickable = canNavigateToStep && step !== currentStep;
            
            const handleStepClick = () => {
              if (isClickable) {
                // If navigating to next step, validate first
                if (isNextStep) {
                  if (validateStep(currentStep)) {
                    setCurrentStep(step);
                  }
                } else {
                  // Navigating to completed step - always allowed
                  setCurrentStep(step);
                }
              }
            };
            
            return (
              <button
              key={step}
                type="button"
                className={`funnel-progress-step ${step <= currentStep ? 'active' : ''} ${step === currentStep ? 'current' : ''} ${!isClickable ? 'disabled' : ''}`}
                onClick={handleStepClick}
                disabled={!isClickable}
                aria-label={isClickable ? `Ga naar stap ${step}` : step === currentStep ? `Huidige stap ${step}` : 'Voltooi eerst de huidige stap'}
                title={isClickable ? `Ga naar stap ${step}` : step === currentStep ? `Huidige stap ${step}` : 'Voltooi eerst de huidige stap'}
            >
              <span className="funnel-progress-step-number">{step}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="funnel-content">
        {/* Success State */}
        {isSuccess && (
          <div className="funnel-success">
            <div className="funnel-success-content">
              <div className="funnel-success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="funnel-success-title">Bedankt!</h2>
              <p className="funnel-success-message">
                Je gegevens zijn verzonden. We openen nu Calendly zodat je een kennismakingsgesprek kunt plannen.
              </p>
            </div>
          </div>
        )}
        
        {!isSuccess && (
        <div className="funnel-step-container">
          {/* Step 1: Verkoopkanaal */}
          {currentStep === 1 && (
            <div className="funnel-step funnel-step--step1">
              <div className="funnel-step-content">
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
                {currentStep < totalSteps && currentStep !== 1 && (
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
                <h2 className="funnel-question">Waar verkoop je momenteel?</h2>
                <p className="funnel-question-hint">
                  Deze keuze helpt ons om het advies in de volgende stappen beter af te stemmen op jouw situatie.
                </p>
                
                {/* All options in one row */}
                <div className="funnel-options-group">
                  <div className="funnel-options-grid funnel-options-grid--step1">
                    {activeSellerOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`funnel-option-card ${formData.verkoopkanaal === option ? 'selected' : ''}`}
                        onClick={() => updateFormData('verkoopkanaal', option)}
                      >
                        {option}
                      </button>
                    ))}
                    <div className="funnel-option-wrapper--starting">
                      <button
                        type="button"
                        className={`funnel-option-card funnel-option-card--starting ${formData.verkoopkanaal === startingOption ? 'selected' : ''}`}
                        onClick={() => updateFormData('verkoopkanaal', startingOption)}
                      >
                        {startingOption}
                      </button>
                      <p className="funnel-option-reassurance">
                        Geen probleem! We helpen je graag op weg.
                      </p>
                    </div>
                  </div>
                </div>
                
                {errors.verkoopkanaal && (
                  <p className="funnel-error">{errors.verkoopkanaal}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Dienstenkeuze */}
          {currentStep === 2 && (
            <div className="funnel-step">
              <div className="funnel-step-content">
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
                {currentStep < totalSteps && currentStep !== 1 && (
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
                {/* Desktop Navigation buttons */}
                <div className="funnel-step-nav">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="funnel-btn funnel-btn--secondary funnel-btn-nav-back"
                      onClick={handleBack}
                    >
                      Terug
                    </button>
                  )}
                  {currentStep < totalSteps && currentStep !== 1 && (
                    <button
                      type="button"
                      className="funnel-btn funnel-btn--primary funnel-btn-nav-next"
                      onClick={handleNext}
                      disabled={!canProceed() || isSubmitting}
                    >
                      Volgende
                    </button>
                  )}
                </div>
                {/* Mobile Navigation buttons */}
                <div className="funnel-mobile-nav">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="funnel-btn-mobile-back"
                      onClick={handleBack}
                    >
                      Terug
                    </button>
                  )}
                  {currentStep < totalSteps && currentStep !== 1 && (
                    <button
                      type="button"
                      className="funnel-btn-mobile-next"
                      onClick={handleNext}
                      disabled={!canProceed() || isSubmitting}
                    >
                      Volgende
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Kwalificatie */}
          {currentStep === 3 && (
            <div className="funnel-step funnel-step--step3">
              <div className="funnel-step-content">
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
                {currentStep < totalSteps && currentStep !== 1 && (
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
                <h2 className="funnel-question">Vertel ons meer over je situatie</h2>
                
                <div className="funnel-input-group funnel-input-group--first">
                  <label className="funnel-label">Hoeveel shipments verzend je per maand?</label>
                  
                  {/* Slider */}
                  <div className="funnel-slider-container">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="50"
                      value={(() => {
                        const val = formData.shipmentVolume;
                        // If it's a number (from slider), use it
                        if (val && !isNaN(parseInt(val)) && !shipmentVolumeOptions.includes(val)) {
                          return parseInt(val);
                        }
                        // If it's one of the old options, convert to number
                        if (val === '<50') return 25;
                        if (val === '50–250') return 150;
                        if (val === '250–1000') return 625;
                        if (val === '1000+') return 5500;
                        // Default to 0
                        return 0;
                      })()}
                      onChange={(e) => updateFormData('shipmentVolume', e.target.value)}
                      className="funnel-slider"
                    />
                    <div className="funnel-slider-labels">
                      <span>0</span>
                      {isEditingShipmentVolume ? (
                        <div className="funnel-slider-value-input-wrapper">
                          <input
                            type="number"
                            min="0"
                            max="10000"
                            step="50"
                            value={shipmentVolumeInputValue}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              setShipmentVolumeInputValue(inputValue);
                              if (inputValue === '' || inputValue === '-') {
                                return; // Allow empty or minus sign while typing
                              }
                              const numValue = parseInt(inputValue);
                              if (!isNaN(numValue)) {
                                const newValue = Math.max(0, Math.min(10000, numValue));
                                updateFormData('shipmentVolume', newValue.toString());
                              }
                            }}
                            onFocus={(e) => {
                              // Select all text when focused
                              e.target.select();
                            }}
                            onBlur={() => {
                              // Ensure a valid value on blur
                              const numValue = parseInt(shipmentVolumeInputValue);
                              if (isNaN(numValue) || numValue < 0) {
                                updateFormData('shipmentVolume', '0');
                                setShipmentVolumeInputValue('0');
                              } else {
                                const clampedValue = Math.max(0, Math.min(10000, numValue));
                                updateFormData('shipmentVolume', clampedValue.toString());
                                setShipmentVolumeInputValue(clampedValue.toString());
                              }
                              setIsEditingShipmentVolume(false);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.target.blur();
                              }
                              if (e.key === 'Escape') {
                                setIsEditingShipmentVolume(false);
                                setShipmentVolumeInputValue('');
                              }
                            }}
                            className="funnel-slider-value-input"
                            autoFocus
                          />
                          <span> shipments</span>
                        </div>
                      ) : (
                        <span 
                          className="funnel-slider-value funnel-slider-value-clickable"
                          onClick={() => {
                            const currentValue = (() => {
                              const val = formData.shipmentVolume;
                              if (val && !isNaN(parseInt(val)) && !shipmentVolumeOptions.includes(val)) {
                                return parseInt(val).toString();
                              }
                              return '0';
                            })();
                            setShipmentVolumeInputValue(currentValue);
                            setIsEditingShipmentVolume(true);
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              const currentValue = (() => {
                                const val = formData.shipmentVolume;
                                if (val && !isNaN(parseInt(val)) && !shipmentVolumeOptions.includes(val)) {
                                  return parseInt(val).toString();
                                }
                                return '0';
                              })();
                              setShipmentVolumeInputValue(currentValue);
                              setIsEditingShipmentVolume(true);
                            }
                          }}
                      >
                          {(() => {
                            const val = formData.shipmentVolume;
                            if (val && !isNaN(parseInt(val)) && !shipmentVolumeOptions.includes(val)) {
                              return parseInt(val).toLocaleString('nl-NL');
                            }
                            if (val && shipmentVolumeOptions.includes(val)) {
                              return val;
                            }
                            return '0';
                          })()} shipments
                        </span>
                      )}
                      <span>10.000</span>
                    </div>
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
                {/* Desktop Navigation buttons */}
                <div className="funnel-step-nav">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="funnel-btn funnel-btn--secondary funnel-btn-nav-back"
                      onClick={handleBack}
                    >
                      Terug
                    </button>
                  )}
                  {currentStep < totalSteps && currentStep !== 1 && (
                    <button
                      type="button"
                      className="funnel-btn funnel-btn--primary funnel-btn-nav-next"
                      onClick={handleNext}
                      disabled={!canProceed() || isSubmitting}
                    >
                      Volgende
                    </button>
                  )}
                </div>
                {/* Mobile Navigation buttons */}
                <div className="funnel-mobile-nav">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="funnel-btn-mobile-back"
                      onClick={handleBack}
                    >
                      Terug
                    </button>
                  )}
                  {currentStep < totalSteps && currentStep !== 1 && (
                    <button
                      type="button"
                      className="funnel-btn-mobile-next"
                      onClick={handleNext}
                      disabled={!canProceed() || isSubmitting}
                    >
                      Volgende
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Contactgegevens */}
          {currentStep === 4 && (
            <div className="funnel-step">
              <div className="funnel-step-content">
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
                {currentStep < totalSteps && currentStep !== 1 && (
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
                <h2 className="funnel-question">Laat je contactgegevens achter</h2>
                
                <div className="funnel-form-grid">
                <div className="funnel-input-group funnel-input-group--first">
                  <label className="funnel-label">Naam *</label>
                  <input
                    type="text"
                    className="funnel-input"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Jouw naam"
                  />
                </div>

                <div className="funnel-input-group funnel-input-group--first">
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
                
                </div>
                {/* Desktop Navigation buttons */}
                <div className="funnel-step-nav">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="funnel-btn funnel-btn--secondary funnel-btn-nav-back"
                      onClick={handleBack}
                    >
                      Terug
                    </button>
                  )}
                  {currentStep < totalSteps && (
                    <button
                      type="button"
                      className="funnel-btn funnel-btn--primary funnel-btn-nav-next"
                      onClick={handleNext}
                      disabled={!canProceed() || isSubmitting}
                    >
                      Volgende
                    </button>
                  )}
                </div>
                {/* Mobile Navigation buttons */}
                <div className="funnel-mobile-nav">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="funnel-btn-mobile-back"
                      onClick={handleBack}
                    >
                      Terug
                    </button>
                  )}
                  {currentStep < totalSteps && (
                    <button
                      type="button"
                      className="funnel-btn-mobile-next"
                      onClick={handleNext}
                      disabled={!canProceed() || isSubmitting}
                    >
                      Volgende
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Bewustwording en Timo introductie */}
          {currentStep === 5 && (
            <div className="funnel-step">
              <div className="funnel-step-content">
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

                <h2 className="funnel-question">Bijna klaar!</h2>
                
                {/* Timo Introduction */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <img 
                      src={timoImage} 
                      alt="Timo" 
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        borderRadius: '50%', 
                        objectFit: 'cover',
                        border: '3px solid #2563eb',
                        margin: '0 auto',
                        display: 'block'
                      }} 
                    />
                  </div>
                  <p style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#1f2937', 
                    marginBottom: '8px' 
                  }}>
                    Je kennismakingsgesprek is met Timo
                  </p>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6b7280', 
                    marginBottom: '30px' 
                  }}>
                    Timo kijkt er naar uit om met jou in gesprek te gaan!
                  </p>
                </div>

                {/* Calendar Picker */}
                <div className="funnel-input-group" style={{ marginBottom: '24px' }}>
                  <CalendarPicker
                    selectedDate={formData.preferredDate}
                    selectedTime={formData.preferredTime}
                    onDateChange={(date) => {
                      updateFormData('preferredDate', date);
                      updateFormData('preferredTime', '');
                    }}
                    onTimeChange={(time) => updateFormData('preferredTime', time)}
                    error={errors.preferredDate}
                  />
                </div>

                {/* Checkbox */}
                <div className="funnel-input-group" style={{ marginBottom: '30px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      padding: '16px',
                      border: `2px solid ${formData.awareOfTimeReservation ? '#0070ff' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      backgroundColor: formData.awareOfTimeReservation ? '#eff6ff' : '#ffffff',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => updateFormData('awareOfTimeReservation', !formData.awareOfTimeReservation)}
                  >
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      minWidth: '24px',
                      marginRight: '12px',
                      border: `2px solid ${formData.awareOfTimeReservation ? '#2563eb' : '#9ca3af'}`,
                      borderRadius: '4px',
                      backgroundColor: formData.awareOfTimeReservation ? '#2563eb' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      marginTop: '2px'
                    }}>
                      {formData.awareOfTimeReservation && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span style={{ 
                      fontSize: '16px', 
                      color: '#1f2937', 
                      lineHeight: '1.5' 
                    }}>
                      Ik ben me bewust dat BlueShipment na het plannen van een kennismakingsgesprek tijd voor me reserveert.
                    </span>
                  </label>
                  {errors.awareOfTimeReservation && (
                    <p className="funnel-error-text" style={{ marginTop: '8px' }}>
                      {errors.awareOfTimeReservation}
                    </p>
                  )}
                </div>

                {/* Desktop Navigation buttons */}
                <div className="funnel-step-nav">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="funnel-btn funnel-btn--secondary funnel-btn-nav-back"
                      onClick={handleBack}
                    >
                      Terug
                    </button>
                  )}
                  {currentStep === totalSteps && (
                    <button
                      type="button"
                      className="funnel-btn funnel-btn--primary funnel-btn-nav-next"
                      onClick={handleNext}
                      disabled={!canProceed() || isSubmitting}
                    >
                      {isSubmitting 
                        ? 'Verzenden...' 
                        : 'Plan mijn kennismaking'}
                    </button>
                  )}
                </div>
                {/* Mobile Navigation buttons */}
                <div className="funnel-mobile-nav">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="funnel-btn-mobile-back"
                      onClick={handleBack}
                    >
                      Terug
                    </button>
                  )}
                  {currentStep === totalSteps && (
                    <button
                      type="button"
                      className="funnel-btn-mobile-next"
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
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default IntakeFunnel;
