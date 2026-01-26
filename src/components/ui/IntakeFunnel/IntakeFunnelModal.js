import React, { useEffect, useRef } from 'react';
import IntakeFunnel from './IntakeFunnel';
import './IntakeFunnelModal.css';

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IntakeFunnelModal = ({ isOpen, onClose, onComplete }) => {
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

  const handleFunnelComplete = (formData) => {
    if (onComplete) {
      onComplete(formData);
    }
    // Close modal after a short delay to allow Calendly to open
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div 
      className="intake-funnel-modal-backdrop" 
      ref={backdropRef}
      onClick={handleBackdropClick}
    >
      <div className="intake-funnel-modal" ref={modalRef}>
        <button
          className="intake-funnel-modal-close"
          onClick={onClose}
          aria-label="Sluiten"
        >
          <CloseIcon />
        </button>
        <IntakeFunnel onComplete={handleFunnelComplete} />
      </div>
    </div>
  );
};

export default IntakeFunnelModal;
