import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import './CaseStudyModal.css';

function CaseStudyModal({ isOpen, onClose, caseStudy }) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const modalRootRef = useRef(null);

  // Get or create modal root
  useEffect(() => {
    if (!modalRootRef.current) {
      let modalRoot = document.getElementById('modal-root');
      if (!modalRoot) {
        modalRoot = document.createElement('div');
        modalRoot.id = 'modal-root';
        document.body.appendChild(modalRoot);
      }
      modalRootRef.current = modalRoot;
    }
  }, []);

  const handleClose = useCallback(() => {
    const overlay = overlayRef.current;
    const content = contentRef.current;

    if (!overlay || !content) {
      onClose();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        onClose();
      }
    });

    tl.to(content, { opacity: 0, y: 20, scale: 0.95, duration: 0.2, ease: 'power2.in' })
      .to(overlay, { opacity: 0, duration: 0.2, ease: 'power2.in' }, '-=0.1');
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  useEffect(() => {
    if (!isOpen || !caseStudy) return;

    const modal = modalRef.current;
    const overlay = overlayRef.current;
    const content = contentRef.current;

    if (!modal || !overlay || !content) return;

    // Set initial states
    gsap.set(overlay, { opacity: 0 });
    gsap.set(content, { opacity: 0, y: 30, scale: 0.95 });

    // Animate in
    const tl = gsap.timeline();
    tl.to(overlay, { opacity: 1, duration: 0.2, ease: 'power2.out' })
      .to(content, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }, '-=0.1');

    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    // Prevent body scroll - save previous value
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, caseStudy, handleClose]);

  if (!isOpen || !caseStudy || !modalRootRef.current) return null;

  const modalContent = (
    <div 
      ref={modalRef}
      className="case-study-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-title"
    >
      <div 
        ref={overlayRef}
        className="case-study-modal-backdrop"
        onClick={handleOverlayClick}
      />
      <div ref={contentRef} className="case-study-modal-content">
        <button
          className="case-study-modal-close"
          onClick={handleClose}
          aria-label="Sluit popup"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="case-study-modal-header">
          <img 
            src={caseStudy.image} 
            alt={caseStudy.alt}
            className="case-study-modal-image"
          />
        </div>

        <div className="case-study-modal-body">
          <h2 id="case-study-title" className="case-study-modal-title">
            {caseStudy.title}
          </h2>
          
          {caseStudy.client && (
            <div className="case-study-modal-client">
              <span className="case-study-client-label">Klant:</span>
              <span className="case-study-client-name">{caseStudy.client}</span>
            </div>
          )}

          {caseStudy.challenge && (
            <div className="case-study-section">
              <h3 className="case-study-section-title">Uitdaging</h3>
              <p className="case-study-section-text">{caseStudy.challenge}</p>
            </div>
          )}

          {caseStudy.solution && (
            <div className="case-study-section">
              <h3 className="case-study-section-title">Oplossing</h3>
              <p className="case-study-section-text">{caseStudy.solution}</p>
            </div>
          )}

          {caseStudy.results && (
            <div className="case-study-section">
              <h3 className="case-study-section-title">Resultaten</h3>
              <p className="case-study-section-text">{caseStudy.results}</p>
            </div>
          )}

          {caseStudy.testimonial && (
            <div className="case-study-testimonial">
              <p className="case-study-testimonial-text">"{caseStudy.testimonial}"</p>
              {caseStudy.testimonialAuthor && (
                <p className="case-study-testimonial-author">{caseStudy.testimonialAuthor}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalRootRef.current);
}

export default CaseStudyModal;

