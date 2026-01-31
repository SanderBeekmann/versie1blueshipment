import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import './VideoSection.css';

const PlayButton = () => (
  <svg width="63" height="63" viewBox="0 0 63 63" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="31.5" cy="31.5" r="31.5" fill="white"/>
    <path d="M42 31.5L25.5 41.5V21.5L42 31.5Z" fill="#0070ff"/>
  </svg>
);

const CloseButton = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function VideoSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [startRect, setStartRect] = useState(null);
  const thumbRef = useRef(null);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const videoRef = useRef(null);
  const timelineRef = useRef(null);

  // Lock/unlock scroll
  const lockScroll = () => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
  };

  const unlockScroll = () => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  };

  // Open modal
  const handleOpen = () => {
    if (typeof window === 'undefined' || !thumbRef.current) return;

    const rect = thumbRef.current.getBoundingClientRect();
    setStartRect({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    });
    setIsOpen(true);
    lockScroll();
  };

  // Close modal
  const handleClose = useCallback(() => {
    if (!isOpen) return;

    // Pause video (if it exists)
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    // Start close animation - exact reverse of open animation
    if (overlayRef.current && modalRef.current && startRect && thumbRef.current) {
      const overlay = overlayRef.current;
      const modal = modalRef.current;
      
      // Get initial border radius from thumbnail (same as open animation)
      const initialRadius = typeof window !== 'undefined' && thumbRef.current
        ? window.getComputedStyle(thumbRef.current).borderRadius || 'var(--radius-large)'
        : 'var(--radius-large)';

      // Get current modal state (should be at target position from open animation)
      const currentRect = modal.getBoundingClientRect();
      const currentRadius = window.getComputedStyle(modal).borderRadius || '12px';

      // Set current state explicitly
      gsap.set(modal, {
        x: currentRect.left,
        y: currentRect.top,
        width: currentRect.width,
        height: currentRect.height,
        borderRadius: currentRadius
      });

      // Create close timeline - exact reverse of open animation
      const closeTl = gsap.timeline({
        onComplete: () => {
          setIsOpen(false);
          setStartRect(null);
          unlockScroll();
        }
      });

      // Animate modal back to thumbnail position (reverse of open)
      // Same duration and ease as open animation for perfect reverse
      closeTl.to(modal, {
        x: startRect.x,
        y: startRect.y,
        width: startRect.width,
        height: startRect.height,
        borderRadius: initialRadius,
        duration: 0.55,
        ease: 'power3.inOut' // Same ease as open (symmetrical)
      }, 0);

      // Animate overlay fade out (reverse of fade in)
      // Start later so it fades out as modal animates back, ending together
      // This ensures the full close animation is visible
      closeTl.to(overlay, {
        opacity: 0,
        duration: 0.2,
        ease: 'power3.in' // Reverse of power3.out from open animation
      }, 0.35); // Start at 0.35s so it ends at 0.55s with modal animation
    } else {
      // Fallback: close immediately if no animation possible
      setIsOpen(false);
      setStartRect(null);
      unlockScroll();
    }
  }, [isOpen, startRect]);

  // Handle Escape key
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  // Animate modal open/close
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      if (!isOpen || !startRect || !overlayRef.current || !modalRef.current) {
        // Cleanup previous timeline
        if (timelineRef.current) {
          timelineRef.current.kill();
          timelineRef.current = null;
        }
        return;
      }

      const overlay = overlayRef.current;
      const modal = modalRef.current;

      // Calculate target dimensions
      const targetW = Math.min(window.innerWidth * 0.9, 1100);
      const targetH = Math.min(window.innerHeight * 0.75, 620);
      const targetX = (window.innerWidth - targetW) / 2;
      const targetY = (window.innerHeight - targetH) / 2;

      // Get initial border radius from thumbnail
      const initialRadius = window.getComputedStyle(thumbRef.current).borderRadius || 'var(--radius-large)';
      const targetRadius = '12px';

      // Set initial state
      gsap.set(overlay, { opacity: 0 });
      gsap.set(modal, {
        x: startRect.x,
        y: startRect.y,
        width: startRect.width,
        height: startRect.height,
        borderRadius: initialRadius
      });

      // Create timeline
      const tl = gsap.timeline({
        onComplete: () => {
          // Video playback disabled - coming soon
        }
      });

      // Animate overlay fade in
      tl.to(overlay, {
        opacity: 1,
        duration: 0.2,
        ease: 'power3.out'
      }, 0);

      // Animate modal to center
      tl.to(modal, {
        x: targetX,
        y: targetY,
        width: targetW,
        height: targetH,
        borderRadius: targetRadius,
        duration: 0.55,
        ease: 'power3.inOut'
      }, 0);

      timelineRef.current = tl;
    });

    return () => {
      ctx.revert();
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, [isOpen, startRect]);


  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  return (
    <>
      <section className="video-section">
        <div className="video-container">
          <div className="video-content">
            <div className="video-text">
              <h2 className="video-title" data-animate-title>
                Krijg je eerste bestelling <span className="text-blue">zonder </span>investering of risico
              </h2>
              <p className="video-subtitle">
                Wij leggen je uit wat ons proces zo bijzonder maakt.
              </p>
              <Link to="/intake" className="btn btn-primary video-cta-desktop">
                Ervaar het zelf!
              </Link>
            </div>
            <div className="video-player">
              <div className="video-thumbnail" ref={thumbRef}>
                <div className="video-overlay"></div>
                <div className="video-coming-soon">Coming Soon</div>
                <button className="play-button" onClick={handleOpen} aria-label="Play video">
                  <PlayButton />
                </button>
              </div>
            </div>
            <Link to="/intake" className="btn btn-primary video-cta-mobile">
              Ervaar het zelf!
            </Link>
          </div>
        </div>
      </section>

      {/* Video Modal - Rendered via Portal to document.body */}
      {typeof window !== 'undefined' && (isOpen || startRect) && createPortal(
        <div
          ref={overlayRef}
          className="video-modal-overlay"
          onClick={handleBackdropClick}
          aria-hidden="true"
        >
          <div
            ref={modalRef}
            className="video-modal-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="video-modal-close"
              onClick={handleClose}
              aria-label="Close video"
            >
              <CloseButton />
            </button>
            <div className="video-modal-coming-soon">
              <div className="video-modal-coming-soon-text">Coming Soon</div>
            </div>
            <video
              ref={videoRef}
              className="video-modal-player"
              src=""
              controls={false}
              playsInline
              style={{ display: 'none' }}
              preload="none"
              muted
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default VideoSection;

