import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animationVariants = {
  fadeUp: {
    y: 60,
    opacity: 0,
  },
  fadeDown: {
    y: -60,
    opacity: 0,
  },
  fadeLeft: {
    x: 60,
    opacity: 0,
  },
  fadeRight: {
    x: -60,
    opacity: 0,
  },
  scaleIn: {
    scale: 0.9,
    opacity: 0,
  },
  fadeUpScale: {
    y: 40,
    scale: 0.95,
    opacity: 0,
  },
};

const easings = [
  'power2.out',
  'power3.out',
  'expo.out',
];

export const initScrollAnimations = () => {
  const sections = document.querySelectorAll('[data-animate]');

  sections.forEach((section, index) => {
    const variantName = section.getAttribute('data-animate') || 'fadeUp';
    const variant = animationVariants[variantName];

    if (!variant) return;

    if (prefersReducedMotion) {
      gsap.set(section, { opacity: 0 });
      gsap.to(section, {
        opacity: 1,
        duration: 0.3,
        scrollTrigger: {
          trigger: section,
          start: 'top 90%',
          once: true,
        },
      });
      return;
    }

    gsap.set(section, variant);

    const duration = 0.8 + (index % 3) * 0.1;
    const easing = easings[index % easings.length];

    gsap.to(section, {
      y: 0,
      x: 0,
      scale: 1,
      opacity: 1,
      duration,
      ease: easing,
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        once: true,
      },
    });
  });
};

const titleAnimationConfig = {
  h1: {
    y: 24,
    duration: 0.9,
  },
  h2: {
    y: 18,
    duration: 0.8,
  },
  h3: {
    y: 16,
    duration: 0.75,
  },
  h4: {
    y: 14,
    duration: 0.7,
  },
  h5: {
    y: 12,
    duration: 0.65,
  },
};

export const initTitleAnimations = () => {
  // Exclude hero title - it has its own letter-by-letter animation
  const titles = document.querySelectorAll('[data-animate-title]:not(.hero-title)');

  titles.forEach((title) => {
    const tagName = title.tagName.toLowerCase();
    const config = titleAnimationConfig[tagName] || titleAnimationConfig.h3;

    if (prefersReducedMotion) {
      gsap.set(title, { opacity: 0, y: 0 });
      gsap.to(title, {
        opacity: 1,
        duration: 0.3,
        scrollTrigger: {
          trigger: title,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });
      return;
    }

    gsap.set(title, {
      opacity: 0,
      y: config.y,
    });

    gsap.to(title, {
      opacity: 1,
      y: 0,
      duration: config.duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        end: 'top 50%',
        toggleActions: 'play none none reverse',
        markers: false,
      },
    });
  });
};

/**
 * Splits hero title text into individual letters while preserving HTML structure
 * Handles <br> tags and nested elements correctly
 */
const splitHeroTitleIntoLetters = (element) => {
  const letters = [];
  
  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text.trim() || text.length > 0) {
        const parent = node.parentNode;
        const fragment = document.createDocumentFragment();

        // Split text into characters, preserving spaces
        text.split('').forEach((char) => {
          const span = document.createElement('span');
          span.className = 'hero-letter';
          span.textContent = char === ' ' ? '\u00A0' : char; // Non-breaking space
          span.style.display = 'inline-block';
          span.style.whiteSpace = 'pre';
          fragment.appendChild(span);
          letters.push(span);
        });

        parent.replaceChild(fragment, node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Preserve <br> tags as-is
      if (node.tagName === 'BR') {
        return;
      }
      
      // Process child nodes of other elements
      const childNodes = Array.from(node.childNodes);
      childNodes.forEach(processNode);
    }
  };

  // Process all child nodes of the hero title
  const childNodes = Array.from(element.childNodes);
  childNodes.forEach(processNode);

  return letters;
};

/**
 * Premium letter-by-letter animation for hero title only
 * Plays once on page load or when hero becomes visible
 */
export const initHeroTitleAnimation = () => {
  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;

    // Reduced motion: show text immediately
    if (prefersReducedMotion) {
      gsap.set(heroTitle, { opacity: 1 });
      return;
    }

    // Split hero title into individual letters
    const letters = splitHeroTitleIntoLetters(heroTitle);
    
    if (letters.length === 0) {
      // Fallback: if splitting fails, show title immediately
      gsap.set(heroTitle, { opacity: 1 });
      return;
    }

    // Set initial state for all letters
    gsap.set(letters, {
      opacity: 0,
      y: 20,
      willChange: 'transform, opacity',
    });

    // Check if hero is already visible in viewport
    const rect = heroTitle.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    // Always animate immediately for hero title (it's at the top of the page)
    // Small delay to ensure smooth animation
    setTimeout(() => {
      gsap.to(letters, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.03,
        onComplete: () => {
          gsap.set(letters, { willChange: 'auto' });
        },
      });
    }, 200);
  });
};

/**
 * Initialize timeline animations for ProcessSection
 * - Images fly in from left/right based on step alignment
 * - Progress line fills from top to bottom based on scroll position
 */
export const initTimelineAnimations = (stepsContainer, processContainer, options = {}) => {
  if (!stepsContainer || !processContainer) return;

  // Check for reduced motion preference
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Extract step6El from options
  const { step6El } = options;

  // Get all step items once for reuse
  const stepItems = stepsContainer.querySelectorAll('.process-step');

  // Get all timeline text elements (titles, descriptions, step numbers)
  // Animate per step to allow for stagger within each step
  
  stepItems.forEach((stepItem) => {
    const isLeft = stepItem.classList.contains('is-left');
    const isRight = stepItem.classList.contains('is-right');
    const textElements = stepItem.querySelectorAll('.timeline-text');
    
    if (textElements.length === 0) return;

    if (reduced) {
      gsap.set(textElements, { opacity: 0 });
      gsap.to(textElements, {
        opacity: 1,
        duration: 0.3,
        scrollTrigger: {
          trigger: stepItem,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
      return;
    }

    // Set initial state based on alignment
    // Left-aligned steps: text comes from left (negative x)
    // Right-aligned steps: text comes from right (positive x)
    const xOffset = isLeft ? -60 : isRight ? 60 : 0;
    gsap.set(textElements, {
      opacity: 0,
      x: xOffset,
      willChange: 'transform, opacity',
    });

    // Animate in with small stagger
    gsap.to(textElements, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: stepItem,
        start: 'top 80%',
        end: 'top 55%',
        toggleActions: 'play none none reverse',
        onComplete: () => {
          gsap.set(textElements, { willChange: 'auto' });
        },
      },
    });
  });

  // Get all timeline media elements (images)
  const timelineMedia = stepsContainer.querySelectorAll('.timeline-media');
  
  // Animate each image based on its parent's alignment
  timelineMedia.forEach((media) => {
    const stepItem = media.closest('.process-step');
    if (!stepItem) return;

    const isLeft = stepItem.classList.contains('is-left');
    const isRight = stepItem.classList.contains('is-right');

    if (reduced) {
      gsap.set(media, { opacity: 0 });
      gsap.to(media, {
        opacity: 1,
        duration: 0.3,
        scrollTrigger: {
          trigger: stepItem,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
      return;
    }

    // Set initial state based on alignment
    // When align is 'left', image is on the right, so it comes from right (positive x)
    // When align is 'right', image is on the left, so it comes from left (negative x)
    const xOffset = isLeft ? 60 : isRight ? -60 : 0;
    gsap.set(media, {
      opacity: 0,
      x: xOffset,
      willChange: 'transform, opacity',
    });

    // Animate in
    gsap.to(media, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: stepItem,
        start: 'top 80%',
        end: 'top 55%',
        toggleActions: 'play none none reverse',
        onComplete: () => {
          gsap.set(media, { willChange: 'auto' });
        },
      },
    });
  });

  // Helper function to play Step 6 celebration animation
  const playStep6Celebration = (titleEl) => {
    if (!titleEl) return;

    // Find the title element if step6El container was passed
    const targetEl = titleEl.querySelector('.step-final-title') || titleEl;
    if (!targetEl) return;

    const repeatEl = targetEl.querySelector('.repeat-word');

    // Kill lopende animaties
    gsap.killTweensOf(targetEl);
    if (repeatEl) gsap.killTweensOf(repeatEl);

    const tl = gsap.timeline();

    tl.set(targetEl, {
      transformOrigin: '50% 50%',
      willChange: 'transform, filter',
    });

    // Main celebration pop
    tl.to(targetEl, {
      y: -12,
      scale: 1.12,
      filter: 'drop-shadow(0 16px 36px rgba(255,255,255,0.35))',
      duration: 0.35,
      ease: 'power4.out',
    });

    // Snap back with energy
    tl.to(targetEl, {
      y: 0,
      scale: 0.98,
      filter: 'drop-shadow(0 8px 18px rgba(255,255,255,0.2))',
      duration: 0.18,
      ease: 'power1.in',
    });

    // Final settle
    tl.to(targetEl, {
      scale: 1,
      filter: 'drop-shadow(0 0 0 rgba(0,0,0,0))',
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(targetEl, { willChange: 'auto' });
      },
    });

    // Extra accent op "Repeat!" indien aanwezig
    if (repeatEl) {
      tl.fromTo(
        repeatEl,
        { scale: 1 },
        {
          scale: 1.18,
          duration: 0.28,
          ease: 'power3.out',
        },
        '-=0.25'
      ).to(
        repeatEl,
        {
          scale: 1,
          duration: 0.25,
          ease: 'power2.out',
        },
        '-=0.05'
      );
    }
  };

  // Animate progress line - fill based on scroll position in center of screen
  const progressLines = stepsContainer.querySelectorAll('.timeline-line-progress');
  
  if (progressLines.length > 0 && !reduced) {
    // Set initial state
    gsap.set(progressLines, {
      scaleY: 0,
      transformOrigin: 'top',
    });

    // Track completion state for Step 6 celebration (edge trigger)
    let step6Celebrated = false;
    const lastIndex = progressLines.length - 1;

    // Track progress based on center of screen
    // The line should fill continuously as steps pass through the center
    const updateProgressLines = () => {
      const viewportCenter = window.innerHeight / 2;
      
      stepItems.forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        const stepTop = rect.top;
        const stepBottom = rect.bottom;
        const stepHeight = step.offsetHeight;
        
        let lineProgress = 0;
        
        // Check position relative to viewport center
        if (stepBottom < viewportCenter) {
          // Step has completely passed center - fully filled
          lineProgress = 1;
        } else if (stepTop <= viewportCenter && stepBottom >= viewportCenter) {
          // Step is currently at center - calculate partial fill
          // Progress is based on how much of the step has passed the center
          const distanceFromTop = viewportCenter - stepTop;
          lineProgress = distanceFromTop / stepHeight;
        }
        // If stepTop > viewportCenter, step hasn't reached center yet, progress stays 0
        
        // Set progress for this step's timeline line
        if (progressLines[index]) {
          gsap.set(progressLines[index], { scaleY: Math.max(0, Math.min(1, lineProgress)) });
        }
      });
      
      // Check if last progress line is fully filled (completion detection)
      if (lastIndex >= 0 && progressLines[lastIndex]) {
        const lastFilled = gsap.getProperty(progressLines[lastIndex], 'scaleY') >= 0.999;
        
        if (lastFilled && !step6Celebrated) {
          // Edge trigger: false -> true, play celebration
          step6Celebrated = true;
          if (step6El) {
            playStep6Celebration(step6El);
          }
        } else if (!lastFilled) {
          // Reset trigger when line is no longer full
          step6Celebrated = false;
        }
      }
    };

    // Create scroll trigger that updates on scroll
    ScrollTrigger.create({
      trigger: processContainer,
      start: 'top center',
      end: 'bottom center',
      scrub: true,
      onUpdate: updateProgressLines,
      onEnter: updateProgressLines,
      onLeave: updateProgressLines,
      onEnterBack: updateProgressLines,
      onLeaveBack: updateProgressLines,
    });
  } else if (reduced && progressLines.length > 0) {
    // For reduced motion, just show the lines
    gsap.set(progressLines, { scaleY: 1 });
  }
};

/**
 * Initialize burst animation for FeaturesSection
 * Features animate from behind the logo to their positions
 */
export const initFeaturesSectionBurst = ({ sectionEl, logoEl, featureEls }) => {
  if (!sectionEl || !logoEl || !featureEls || featureEls.length !== 4) {
    return () => {};
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    gsap.set(featureEls, { opacity: 1, x: 0, y: 0, scale: 1 });
    return () => {};
  }

  let resizeTimeout;
  let handleResize;

  const ctx = gsap.context(() => {
    // Helper function to calculate offsets
    const calculateOffsets = () => {
      const logoRect = logoEl.getBoundingClientRect();
      const logoCenterX = logoRect.left + logoRect.width / 2;
      const logoCenterY = logoRect.top + logoRect.height / 2;

      const featureRects = featureEls.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
        };
      });

      return featureRects.map((featureRect) => ({
        x: logoCenterX - featureRect.centerX,
        y: logoCenterY - featureRect.centerY,
      }));
    };

    // Calculate initial offsets
    let offsets = calculateOffsets();

    // Force initial state: features behind logo, invisible
    // Use immediate values instead of function to ensure they're set
    featureEls.forEach((el, i) => {
      if (el && offsets[i]) {
        gsap.set(el, {
          opacity: 0,
          scale: 0.97,
          x: offsets[i].x,
          y: offsets[i].y,
        });
      }
    });

    // Stagger order: top-left (0), top-right (2), bottom-left (1), bottom-right (3)
    const staggerOrder = [0, 2, 1, 3];
    const orderedFeatures = staggerOrder.map((idx) => featureEls[idx]);

    // Create scrubbed timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top 60%',
        end: 'bottom 25%',
        scrub: 1.2,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Set will-change during active animation
          if (self.progress > 0 && self.progress < 1) {
            gsap.set(featureEls, { willChange: 'transform, opacity' });
          } else if (self.progress >= 1) {
            // At end, remove will-change after settle completes
            setTimeout(() => {
              gsap.set(featureEls, { willChange: 'auto' });
            }, 100);
          } else {
            gsap.set(featureEls, { willChange: 'auto' });
          }
        },
      },
    });

    // Main animation: burst out to positions (takes ~80% of timeline)
    tl.to(orderedFeatures, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.15,
    });

    // Settle animation: subtle final touch (takes ~20% of timeline)
    tl.to(orderedFeatures, {
      y: -2,
      scale: 1.01,
      duration: 0.1,
      ease: 'power1.out',
    }, '-=0.05')
    .to(orderedFeatures, {
      y: 0,
      scale: 1,
      duration: 0.1,
      ease: 'power1.inOut',
    });

    // Handle resize: recalculate offsets and invalidate timeline
    handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        offsets = calculateOffsets();
        
        // Update initial positions if timeline is at start
        const scrollTrigger = tl.scrollTrigger;
        if (scrollTrigger && scrollTrigger.progress === 0) {
          featureEls.forEach((el, i) => {
            if (el && offsets[i]) {
              gsap.set(el, {
                x: offsets[i].x,
                y: offsets[i].y,
              });
            }
          });
        }
        
        // Invalidate ScrollTrigger to recalculate positions
        scrollTrigger?.refresh();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    ScrollTrigger.addEventListener('refresh', () => {
      offsets = calculateOffsets();
      const scrollTrigger = tl.scrollTrigger;
      if (scrollTrigger && scrollTrigger.progress === 0) {
        featureEls.forEach((el, i) => {
          if (el && offsets[i]) {
            gsap.set(el, {
              x: offsets[i].x,
              y: offsets[i].y,
            });
          }
        });
      }
    });
  }, sectionEl);

  return () => {
    clearTimeout(resizeTimeout);
    if (handleResize) {
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.removeEventListener('refresh', handleResize);
    }
    ctx.revert();
  };
};

export const cleanupTimelineAnimations = () => {
  // Cleanup is handled by cleanupScrollAnimations, but we can add specific cleanup here if needed
  // ScrollTrigger.getAll() will catch all triggers including timeline ones
};

/**
 * Initialize scroll animation for TeamSection cards with dot accent
 * Cards animate subtly (opacity, y, scale) while dots have a pop accent animation
 */
export const initTeamCardsDotAccentAnimation = (containerEl) => {
  if (!containerEl) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Find all team cards and dots
  const teamCards = containerEl.querySelectorAll('.team-card');
  const dots = containerEl.querySelectorAll('.card-dot');

  if (teamCards.length === 0 || dots.length === 0) return;

  if (prefersReducedMotion) {
    // Reduced motion: show everything immediately
    gsap.set(teamCards, { opacity: 1, y: 0, scale: 1 });
    gsap.set(dots, { opacity: 1, scale: 1 });
    return;
  }

  // Set initial state for cards
  gsap.set(teamCards, {
    opacity: 0,
    y: 16,
    scale: 0.99,
    willChange: 'transform, opacity',
  });

  // Set initial state for dots
  gsap.set(dots, {
    opacity: 1,
    scale: 0.5,
    willChange: 'transform, filter',
  });

  // Create single timeline for synchronized animations
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: containerEl,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
  });

  // Animate cards with minimal stagger
  tl.to(teamCards, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.65,
    ease: 'power3.out',
    stagger: 0.06,
    onComplete: () => {
      gsap.set(teamCards, { willChange: 'auto' });
    },
  });

  // Dot pop animation: starts 0.15s after card animation begins
  // Scale 0.5 -> 1.25 -> 1 with glow
  tl.to(
    dots,
    {
      scale: 1.25,
      filter: 'drop-shadow(0 0 12px rgba(0, 112, 255, 0.6))',
      duration: 0.3,
      ease: 'power3.out',
      stagger: 0.06,
    },
    '+=0.15' // Start 0.15s after card animation start
  ).to(
    dots,
    {
      scale: 1,
      filter: 'drop-shadow(0 0 0 rgba(0, 112, 255, 0))',
      duration: 0.25,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(dots, { willChange: 'auto' });
      },
    }
  );
};

/**
 * Initialize scroll-driven horizontal testimonials experience
 * - Horizontal scrub on vertical scroll with pinned section
 * - Micro-interactions for active card
 */
export const initTestimonialsScrollExperience = (rootEl) => {
  if (!rootEl) return () => {};

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return () => {};
  }

  // Autodetect elements
  const viewportEl = rootEl.querySelector('.testimonials-viewport') || rootEl.querySelector('.testimonial-content');
  const trackEl = rootEl.querySelector('.testimonials-track') || rootEl.querySelector('.testimonial-track');
  const cards = trackEl ? Array.from(trackEl.querySelectorAll('.testimonial-card')) : [];

  if (!viewportEl || !trackEl || cards.length === 0) return () => {};

  let resizeTimeout;
  let activeIndex = 0;
  let scrollTriggerInstance = null;

  // Helper: calculate measurements
  const getMeasurements = () => {
    const viewportRect = viewportEl.getBoundingClientRect();
    const firstCard = cards[0];
    if (!firstCard) return null;

    const maxShift = trackEl.scrollWidth - viewportEl.clientWidth;

    return {
      viewportCenterX: viewportRect.left + viewportRect.width / 2,
      maxShift: Math.max(0, maxShift),
    };
  };

  // Helper: find active card index based on viewport center
  const findActiveIndex = () => {
    const measurements = getMeasurements();
    if (!measurements) return 0;

    const viewportCenterX = measurements.viewportCenterX;
    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(viewportCenterX - cardCenterX);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  // Helper: animate active card micro-interactions
  const updateActiveCard = (newIndex) => {
    if (newIndex === activeIndex) return;

    const prevCard = cards[activeIndex];
    const newCard = cards[newIndex];

    if (!newCard) return;

    // Kill existing tweens on all cards
    cards.forEach((card) => {
      const stars = card.querySelector('svg');
      const quote = card.querySelector('.testimonial-quote');
      
      gsap.killTweensOf(card);
      if (stars) {
        const starPaths = stars.querySelectorAll('path');
        gsap.killTweensOf(starPaths);
      }
      if (quote) gsap.killTweensOf(quote);
    });

    // Reset previous card
    if (prevCard) {
      gsap.to(prevCard, {
        scale: 1,
        boxShadow: 'var(--shadow-small)',
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    // Animate new active card
    gsap.to(newCard, {
      scale: 1.03,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      duration: 0.3,
      ease: 'power2.out',
    });

    // Animate stars in active card
    const stars = newCard.querySelector('svg');
    if (stars) {
      const starPaths = stars.querySelectorAll('path');
      gsap.fromTo(
        starPaths,
        { scale: 1 },
        {
          scale: 1.12,
          duration: 0.2,
          ease: 'power3.out',
          stagger: 0.03,
        }
      ).to(starPaths, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
      });
    }

    // Animate quote text
    const quote = newCard.querySelector('.testimonial-quote');
    if (quote) {
      gsap.fromTo(
        quote,
        { opacity: 0.7, y: 6 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
        }
      );
    }

    activeIndex = newIndex;
  };

  const ctx = gsap.context(() => {
    // Set initial state: track at x: 0
    gsap.set(trackEl, { x: 0 });

    // Get initial measurements
    let measurements = getMeasurements();
    if (!measurements || measurements.maxShift === 0) {
      return;
    }

    // Create scrubbed horizontal scroll animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: rootEl,
        start: 'top 60%',
        end: () => {
          const m = getMeasurements();
          return m ? `+=${m.maxShift * 1.4}` : '+=0';
        },
        pin: true,
        scrub: 1.2,
        invalidateOnRefresh: true,
        onUpdate: () => {
          // Update active card during scrub
          const newIndex = findActiveIndex();
          if (newIndex !== activeIndex) {
            updateActiveCard(newIndex);
          }
        },
      },
    });

    // Animate track horizontally
    tl.to(trackEl, {
      x: () => {
        const m = getMeasurements();
        return m ? -m.maxShift : 0;
      },
      ease: 'none',
    });

    scrollTriggerInstance = tl.scrollTrigger;

    // Handle resize
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        measurements = getMeasurements();
        if (scrollTriggerInstance) {
          scrollTriggerInstance.refresh();
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    ScrollTrigger.addEventListener('refresh', handleResize);

    // Set initial active card
    requestAnimationFrame(() => {
      updateActiveCard(findActiveIndex());
    });

    // Cleanup function
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.removeEventListener('refresh', handleResize);
    };
  }, rootEl);

  return () => {
    ctx.revert();
  };
};

export const cleanupScrollAnimations = () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
};
