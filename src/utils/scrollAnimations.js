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
export const initTimelineAnimations = (stepsContainer, processContainer) => {
  if (!stepsContainer || !processContainer) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Get all step items once for reuse
  const stepItems = stepsContainer.querySelectorAll('.process-step');

  // Get all timeline text elements (titles, descriptions, step numbers)
  // Animate per step to allow for stagger within each step
  
  stepItems.forEach((stepItem) => {
    const isLeft = stepItem.classList.contains('is-left');
    const isRight = stepItem.classList.contains('is-right');
    const textElements = stepItem.querySelectorAll('.timeline-text');
    
    if (textElements.length === 0) return;

    if (prefersReducedMotion) {
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

    if (prefersReducedMotion) {
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

  // Animate progress line - fill based on scroll position in center of screen
  const progressLines = stepsContainer.querySelectorAll('.timeline-line-progress');
  
  if (progressLines.length > 0 && !prefersReducedMotion) {
    // Set initial state
    gsap.set(progressLines, {
      scaleY: 0,
      transformOrigin: 'top',
    });

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
  } else if (prefersReducedMotion && progressLines.length > 0) {
    // For reduced motion, just show the lines
    gsap.set(progressLines, { scaleY: 1 });
  }
};

export const cleanupTimelineAnimations = () => {
  // Cleanup is handled by cleanupScrollAnimations, but we can add specific cleanup here if needed
  // ScrollTrigger.getAll() will catch all triggers including timeline ones
};

export const cleanupScrollAnimations = () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
};
