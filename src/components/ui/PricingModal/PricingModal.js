import React, { useEffect, useRef } from 'react';
import './PricingModal.css';

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function PricingModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const amazonPricing = [
    { range: '1000-5000 stuks', price: '0,25', unit: 'p/s (excl)' },
    { range: '5000-10000 stuks', price: '0,22', unit: 'p/s (excl)' },
    { range: '10.000-20.000 stuks', price: '0,20', unit: 'p/s (excl)' },
    { range: '20.000+ stuks', price: '0,18', unit: 'p/s (excl)' }
  ];

  const aliexpressPricing = [
    { range: '100-500 stuks', price: '1,00', unit: 'p/s (excl)' },
    { range: '500-1000 stuks', price: '0,90', unit: 'p/s (excl)' },
    { range: '1000-2500 stuks', price: '0,80', unit: 'p/s (excl)' },
    { range: '2500-5000 stuks', price: '0,70', unit: 'p/s (excl)' }
  ];

  return (
    <div 
      className="pricing-modal-backdrop" 
      ref={backdropRef}
      onClick={handleBackdropClick}
      aria-modal="true"
      aria-labelledby="pricing-modal-title"
      role="dialog"
    >
      <div className="pricing-modal" ref={modalRef}>
        <button 
          className="pricing-modal-close"
          onClick={onClose}
          aria-label="Sluit tarieven popup"
        >
          <CloseIcon />
        </button>

        <div className="pricing-modal-content">
          <h2 id="pricing-modal-title" className="pricing-modal-title">
            Listing tarieven
          </h2>

          {/* Amazon Listings */}
          <div className="pricing-section">
            <h3 className="pricing-section-title">
              Amazon Listings
            </h3>
            <p className="pricing-section-minimum">
              Minimale afname: <strong>1000 stuks</strong>
            </p>
            <div className="pricing-table">
              {amazonPricing.map((item, index) => (
                <div key={index} className="pricing-row">
                  <span className="pricing-range">{item.range}</span>
                  <span className="pricing-price">
                    €{item.price} <span className="pricing-unit">{item.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AliExpress Listings */}
          <div className="pricing-section">
            <h3 className="pricing-section-title">
              AliExpress Listings
            </h3>
            <p className="pricing-section-minimum">
              Minimale afname: <strong>100 stuks</strong>
            </p>
            <div className="pricing-table">
              {aliexpressPricing.map((item, index) => (
                <div key={index} className="pricing-row">
                  <span className="pricing-range">{item.range}</span>
                  <span className="pricing-price">
                    €{item.price} <span className="pricing-unit">{item.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingModal;
