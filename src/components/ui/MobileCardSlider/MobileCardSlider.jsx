import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import './MobileCardSlider.css';

/**
 * MobileCardSlider - Generic slider component for mobile slideshows
 * 
 * @param {Array} items - Array of items to slide through
 * @param {Function} renderItem - Render function: (item, index) => JSX
 * @param {number} intervalMs - Pause duration between slides (default: 5000)
 * @param {number} transitionMs - Animation duration (default: 550)
 * @param {string} className - Optional className for wrapper
 * @param {Function} getKey - Optional function to get stable key: (item, index) => string
 * @param {Function} onIndexChange - Optional callback when index changes: (newIndex) => void
 */
function MobileCardSlider({
  items = [],
  renderItem,
  intervalMs = 5000,
  transitionMs = 550,
  className = '',
  getKey = (item, index) => `slide-${index}`,
  onIndexChange
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'animating'
  const [wrapperHeight, setWrapperHeight] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  
  const wrapperRef = useRef(null);
  const currentSlideRef = useRef(null);
  const nextSlideRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const animationRef = useRef(null);
  const observerRef = useRef(null);

  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Check if mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };
    
    checkMobile();
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    mediaQuery.addEventListener('change', checkMobile);
    
    return () => mediaQuery.removeEventListener('change', checkMobile);
  }, []);

  // IntersectionObserver to pause when not visible
  useEffect(() => {
    if (!isMobile || !wrapperRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(wrapperRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isMobile]);

  // Measure height of current slide to prevent layout shift
  useLayoutEffect(() => {
    if (!isMobile || !currentSlideRef.current) return;

    const measureHeight = () => {
      const slide = currentSlideRef.current;
      if (slide) {
        const height = slide.offsetHeight;
        if (height > 0) {
          setWrapperHeight(height);
        }
      }
    };

    measureHeight();

    // Re-measure on resize
    const resizeObserver = new ResizeObserver(() => {
      measureHeight();
    });

    if (currentSlideRef.current) {
      resizeObserver.observe(currentSlideRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [isMobile, currentIndex, phase]);

  // Autoplay logic with proper timing
  useEffect(() => {
    if (!isMobile || items.length <= 1 || phase !== 'idle' || !isVisible) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start interval for pause period
    intervalRef.current = setTimeout(() => {
      if (phase === 'idle' && isVisible) {
        setPhase('animating');
      }
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isMobile, items.length, phase, isVisible, intervalMs]);

  // Animation logic
  useLayoutEffect(() => {
    if (!isMobile || phase !== 'animating') return;

    const currentSlide = currentSlideRef.current;
    const nextSlide = nextSlideRef.current;

    if (!currentSlide || !nextSlide) {
      setPhase('idle');
      return;
    }

    // Clear any existing animation
    if (animationRef.current) {
      animationRef.current.kill();
    }

    if (prefersReducedMotion.current) {
      // Reduced motion: instant switch or quick fade
      gsap.set([currentSlide, nextSlide], {
        opacity: 0,
        x: 0,
        willChange: 'opacity'
      });

      animationRef.current = gsap.timeline({
        onComplete: () => {
          // Update indices
          const newNextIndex = (nextIndex + 1) % items.length;
          setCurrentIndex(nextIndex);
          setNextIndex(newNextIndex);
          setPhase('idle');
          gsap.set([currentSlide, nextSlide], { willChange: 'auto' });
          // Call callback if provided
          if (onIndexChange) {
            onIndexChange(nextIndex);
          }
        }
      });

      animationRef.current
        .to(nextSlide, {
          opacity: 1,
          duration: 0.15,
          ease: 'power2.out'
        });
    } else {
      // Full slide animation
      // Set initial positions
      gsap.set(currentSlide, {
        x: 0,
        willChange: 'transform'
      });

      gsap.set(nextSlide, {
        x: '-110%',
        willChange: 'transform'
      });

      // Create animation timeline
      animationRef.current = gsap.timeline({
        onComplete: () => {
          // Update indices
          const newNextIndex = (nextIndex + 1) % items.length;
          setCurrentIndex(nextIndex);
          setNextIndex(newNextIndex);
          setPhase('idle');
          gsap.set([currentSlide, nextSlide], { willChange: 'auto' });
          // Call callback if provided
          if (onIndexChange) {
            onIndexChange(nextIndex);
          }
        }
      });

      // Animate both slides simultaneously
      animationRef.current
        .to(currentSlide, {
          x: '110%',
          duration: transitionMs / 1000,
          ease: 'power2.in'
        }, 0)
        .to(nextSlide, {
          x: '0%',
          duration: transitionMs / 1000,
          ease: 'power2.out'
        }, 0);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [isMobile, phase, nextIndex, items.length, transitionMs, onIndexChange]);

  // Call onIndexChange on mount to sync initial index
  useEffect(() => {
    if (isMobile && onIndexChange && items.length > 0) {
      onIndexChange(currentIndex);
    }
  }, [isMobile]); // Only on mount or when mobile state changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationRef.current) {
        animationRef.current.kill();
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Don't render slider on desktop
  if (!isMobile) {
    return null;
  }

  if (items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];
  const nextItem = items[nextIndex];

  return (
    <div 
      ref={wrapperRef}
      className={`mobile-card-slider ${className}`}
      style={{
        minHeight: wrapperHeight ? `${wrapperHeight}px` : 'auto'
      }}
    >
      <div className="mobile-card-slider__track">
        {/* Current slide */}
        <div
          ref={currentSlideRef}
          key={getKey(currentItem, currentIndex)}
          className="mobile-card-slider__slide mobile-card-slider__slide--current"
        >
          {renderItem(currentItem, currentIndex)}
        </div>

        {/* Next slide (ready to slide in) */}
        {items.length > 1 && (
          <div
            ref={nextSlideRef}
            key={getKey(nextItem, nextIndex)}
            className="mobile-card-slider__slide mobile-card-slider__slide--next"
          >
            {renderItem(nextItem, nextIndex)}
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileCardSlider;
