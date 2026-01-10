import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Configure ScrollTrigger to prevent viewport jumps on mobile
// Limit auto-refresh events to prevent excessive refreshes that cause scroll jumps
ScrollTrigger.config({
  autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
  ignoreMobileResize: true, // Prevent refresh on mobile resize events
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile detection helper - consistent across codebase
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

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
  // MOBILE OPTIMIZATION: Disable ScrollTrigger on mobile to prevent scroll stutter
  // Use simple IntersectionObserver-based animations instead
  if (isMobile()) {
    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section) => {
      const variantName = section.getAttribute('data-animate') || 'fadeUp';
      const variant = animationVariants[variantName];
      if (!variant) return;

      // Set initial state
      gsap.set(section, { opacity: 0, y: variant.y || 0, x: variant.x || 0, scale: variant.scale || 1 });

      // Use IntersectionObserver for smooth, performant animations on mobile
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(entry.target, {
                opacity: 1,
                y: 0,
                x: 0,
                scale: 1,
                duration: 0.6,
                ease: 'power2.out',
              });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
      );

      observer.observe(section);
    });
    return; // Early return - no ScrollTrigger on mobile
  }

  // DESKTOP: Use ScrollTrigger for advanced animations
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
          invalidateOnRefresh: true,
        },
      });
      return;
    }

    // Set initial state - layout-neutral (only opacity/transform, no display/height changes)
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
        invalidateOnRefresh: true, // Recalculate positions on refresh
      },
    });
  });

  // Refresh ScrollTrigger after all animations are set up (desktop only)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!isMobile()) {
        ScrollTrigger.refresh();
      }
    });
  });
};

// Unified animation config for all titles - same animation for all heading levels
const titleAnimationConfig = {
  h1: {
    y: 18,
    duration: 0.8,
  },
  h2: {
    y: 18,
    duration: 0.8,
  },
  h3: {
    y: 18,
    duration: 0.8,
  },
  h4: {
    y: 18,
    duration: 0.8,
  },
  h5: {
    y: 18,
    duration: 0.8,
  },
};

export const initTitleAnimations = () => {
  // MOBILE OPTIMIZATION: Disable ScrollTrigger on mobile
  if (isMobile()) {
    const titles = document.querySelectorAll('[data-animate-title]:not(.hero-title)');
    titles.forEach((title) => {
      // Simple fade-in on mobile using IntersectionObserver
      gsap.set(title, { opacity: 0, y: 18 });
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(entry.target, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
              });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
      );
      observer.observe(title);
    });
    return; // Early return - no ScrollTrigger on mobile
  }

  // DESKTOP: Use ScrollTrigger for advanced animations
  // Exclude hero title - it has its own letter-by-letter animation
  const titles = document.querySelectorAll('[data-animate-title]:not(.hero-title)');

  // Separate diensten detail titles from other titles for stagger
  const dienstenDetailTitles = Array.from(titles).filter(title => 
    title.closest('.diensten-detail-block')
  );
  const otherTitles = Array.from(titles).filter(title => 
    !title.closest('.diensten-detail-block')
  );

  // Animate diensten detail titles with stagger between sections
  // All titles use the same animation config (h2 settings)
  dienstenDetailTitles.forEach((title, index) => {
    const config = titleAnimationConfig.h2; // Use same config for all titles

    // Find related elements for this specific title
    const contentContainer = title.parentElement;
    if (!contentContainer) return;

    const detailBlock = contentContainer.closest('.diensten-detail-block');
    const media = detailBlock?.querySelector('.diensten-detail-media');
    const isReverse = detailBlock?.classList.contains('diensten-detail-block--reverse');

    // Set initial state for title (same animation as homepage titles)
    gsap.set(title, {
      opacity: 0,
      y: config.y,
      willChange: 'transform, opacity'
    });
    
    const label = contentContainer.querySelector('.diensten-detail-label');
    const description = contentContainer.querySelector('.diensten-detail-description');
    const bullets = contentContainer.querySelector('.diensten-detail-bullets');
    const buttons = contentContainer.querySelector('.diensten-detail-ctas');
    
    // Set initial state for animated text elements
    if (label) {
      gsap.set(label, { opacity: 0, y: 12, willChange: 'transform, opacity' });
    }
    if (description) {
      gsap.set(description, { opacity: 0, y: 15, willChange: 'transform, opacity' });
    }
    if (bullets) {
      const bulletItems = bullets.querySelectorAll('.diensten-detail-bullet');
      gsap.set(bulletItems, { opacity: 0, y: 12, willChange: 'transform, opacity' });
    }
    if (buttons) {
      const buttonItems = buttons.querySelectorAll('.btn, .diensten-detail-link');
      gsap.set(buttonItems, { opacity: 0, y: 15, willChange: 'transform, opacity' });
    }

    if (prefersReducedMotion) {
      gsap.set(title, { opacity: 1, y: 0 });
      if (media) gsap.set(media, { opacity: 1, x: 0 });
      if (label) gsap.set(label, { opacity: 1, y: 0 });
      if (description) gsap.set(description, { opacity: 1, y: 0 });
      if (bullets) {
        const bulletItems = bullets.querySelectorAll('.diensten-detail-bullet');
        gsap.set(bulletItems, { opacity: 1, y: 0 });
      }
      if (buttons) {
        const buttonItems = buttons.querySelectorAll('.btn, .diensten-detail-link');
        gsap.set(buttonItems, { opacity: 1, y: 0 });
      }
      return;
    }

    // Set initial state for media (if present)
    if (media) {
      // Animate from left for normal blocks, from right for reverse blocks
      const xOffset = isReverse ? 60 : -60;
      gsap.set(media, {
        opacity: 0,
        x: xOffset,
      });
    }

    // Create timeline for title, media and text animations
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        end: 'top 50%',
        toggleActions: 'play none none reverse',
        markers: false,
        invalidateOnRefresh: true, // Recalculate positions on refresh
      },
    });

    // Animate title (same as homepage titles)
    tl.to(title, {
      opacity: 1,
      y: 0,
      duration: config.duration,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(title, { willChange: 'auto' });
      },
    }, 0);

    // Animate media from side (if present)
    if (media) {
      tl.to(media, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power2.out',
      }, 0);
    }

      // Animate text elements with stagger
      if (label) {
        tl.to(label, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }, 0.1);
      }

      if (description) {
        tl.to(description, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
        }, 0.2);
      }

      if (bullets) {
        const bulletItems = bullets.querySelectorAll('.diensten-detail-bullet');
        if (bulletItems.length > 0) {
          tl.to(bulletItems, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.08,
            onComplete: () => {
              gsap.set(bulletItems, { willChange: 'auto' });
            },
          }, 0.3);
        }
      }

      if (buttons) {
        const buttonItems = buttons.querySelectorAll('.btn, .diensten-detail-link');
        if (buttonItems.length > 0) {
          tl.to(buttonItems, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.1,
            onComplete: () => {
              gsap.set(buttonItems, { willChange: 'auto' });
            },
          }, 0.4);
        }
      }

    // Cleanup will-change for label and description
    if (label) {
      tl.call(() => {
        gsap.set(label, { willChange: 'auto' });
      }, null, '+=0.3');
    }
    if (description) {
      tl.call(() => {
        gsap.set(description, { willChange: 'auto' });
      }, null, '+=0.3');
    }
  });

  // Animate other titles (non-diensten detail) without stagger
  // All titles use the same animation config (h2 settings)
  otherTitles.forEach((title) => {
    const config = titleAnimationConfig.h2; // Use same config for all titles

    // Find subtitle that comes after this title
    // Look for common subtitle class names in the same parent, or the next sibling p element
    const titleParent = title.parentElement;
    let subtitle = null;
    
    // First try to find by class name in the same parent
    if (titleParent) {
      subtitle = titleParent.querySelector('.subtitle, [class*="subtitle"], [class*="sub-title"], [class*="-subtitle"]');
    }
    
    // If not found, check if next sibling is a paragraph (common pattern)
    if (!subtitle && title.nextElementSibling && title.nextElementSibling.tagName === 'P') {
      subtitle = title.nextElementSibling;
    }

    if (prefersReducedMotion) {
      gsap.set(title, { opacity: 1, y: 0 });
      if (subtitle) {
        gsap.set(subtitle, { opacity: 1, y: 0 });
      }
      return;
    }

    gsap.set(title, {
      opacity: 0,
      y: config.y,
    });

    // Set initial state for subtitle if it exists
    if (subtitle) {
      gsap.set(subtitle, {
        opacity: 0,
        y: 15,
        willChange: 'transform, opacity'
      });
    }

    // Create timeline for title and subtitle
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        end: 'top 50%',
        toggleActions: 'play none none reverse',
        markers: false,
        invalidateOnRefresh: true,
      },
    });

    // Animate title first
    tl.to(title, {
      opacity: 1,
      y: 0,
      duration: config.duration,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(title, { willChange: 'auto' });
      },
    }, 0);

    // Animate subtitle after title completes
    if (subtitle) {
      tl.to(subtitle, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(subtitle, { willChange: 'auto' });
        },
      }, config.duration * 0.5); // Start subtitle animation halfway through title animation
    }
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
      
      // Preserve spans with classes that should not be split (e.g., word wrappers)
      if (node.tagName === 'SPAN' && node.classList && node.classList.contains('diensten-hero-word-nodig')) {
        // Don't split this span - preserve it as-is but process its text content
        const text = node.textContent;
        if (text && text.trim()) {
          // Process the text inside the span but keep the span wrapper
          const childNodes = Array.from(node.childNodes);
          childNodes.forEach(processNode);
        }
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
 * Premium letter-by-letter animation for hero title and subtitle
 * Plays once on page load or when hero becomes visible
 * Supports .hero-title (homepage), .about-hero-title (about page), and .diensten-hero-title (diensten page)
 * Subtitle animates with a small delay after the title
 */
export const initHeroTitleAnimation = () => {
  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    // Support homepage, about page, and diensten page hero titles
    // For homepage: select the visible title (desktop or mobile based on viewport)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    let heroTitle = null;
    
    // Homepage has separate desktop and mobile titles - select the visible one
    if (isMobile) {
      heroTitle = document.querySelector('.hero-title-mobile') || 
                  document.querySelector('.hero-title');
    } else {
      heroTitle = document.querySelector('.hero-title-desktop') || 
                  document.querySelector('.hero-title');
    }
    
    // Fallback to other page titles
    if (!heroTitle) {
      heroTitle = document.querySelector('.about-hero-title') || 
                  document.querySelector('.diensten-hero-title');
    }
    
    if (!heroTitle) return;

    // Find subtitle (supports all hero pages)
    const heroSubtitle = document.querySelector('.hero-subtitle') || 
                         document.querySelector('.about-hero-subtitle') || 
                         document.querySelector('.diensten-hero-subtitle');

    // Find intro text (diensten page specific)
    const heroIntro = document.querySelector('.diensten-hero-intro');

    // Buttons are handled by their respective Hero components (Hero.js, AboutPage, DienstenPage)
    // Do NOT animate buttons here to prevent flash on navigation

    // Reduced motion: show text immediately
    if (prefersReducedMotion) {
      gsap.set(heroTitle, { opacity: 1 });
      if (heroSubtitle) {
        gsap.set(heroSubtitle, { opacity: 1, y: 0 });
      }
      if (heroIntro) {
        gsap.set(heroIntro, { opacity: 1, y: 0 });
      }
      // Buttons are handled by their respective Hero components
      return;
    }

    // Split hero title into individual letters
    const letters = splitHeroTitleIntoLetters(heroTitle);
    
    if (letters.length === 0) {
      // Fallback: if splitting fails, show title immediately
      gsap.set(heroTitle, { opacity: 1 });
      if (heroSubtitle) {
        gsap.set(heroSubtitle, { opacity: 1, y: 0 });
      }
      if (heroIntro) {
        gsap.set(heroIntro, { opacity: 1, y: 0 });
      }
      // Buttons are handled by their respective Hero components
      return;
    }

    // Set initial state for all letters - softer values
    gsap.set(letters, {
      opacity: 0,
      y: 15, // Reduced from 20 for softer effect
      willChange: 'transform, opacity',
    });

    // Set initial state for subtitle
    if (heroSubtitle) {
      gsap.set(heroSubtitle, {
        opacity: 0,
        y: 12,
        willChange: 'transform, opacity',
      });
    }

    // Set initial state for intro text (diensten page)
    if (heroIntro) {
      gsap.set(heroIntro, {
        opacity: 0,
        y: 12,
        willChange: 'transform, opacity',
      });
    }

    // Buttons are handled by Hero.js component's useLayoutEffect (runs before paint)
    // Do NOT set button initial state here to prevent flash on navigation

    // Always animate immediately for hero title (it's at the top of the page)
    // Small delay to ensure smooth animation
    setTimeout(() => {
      // Animate title letters
      gsap.to(letters, {
        opacity: 1,
        y: 0,
        duration: 0.9, // Increased from 0.6 for smoother, softer animation
        ease: 'power1.out', // Softer easing than power2.out
        stagger: 0.02, // Reduced from 0.03 for smoother flow
        onComplete: () => {
          gsap.set(letters, { willChange: 'auto' });
        },
      });

      // Animate subtitle with delay after title starts (small delay for smooth transition)
      if (heroSubtitle) {
        gsap.to(heroSubtitle, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          delay: 0.3, // Small delay after title animation starts
          onComplete: () => {
            gsap.set(heroSubtitle, { willChange: 'auto' });
          },
        });
      }

      // Animate intro text (diensten page) with delay after subtitle
      if (heroIntro) {
        gsap.to(heroIntro, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          delay: 0.5, // Delay after subtitle animation starts
          onComplete: () => {
            gsap.set(heroIntro, { willChange: 'auto' });
          },
        });
      }

      // Buttons are animated by Hero.js component's useLayoutEffect
      // Do NOT animate buttons here to prevent flash on navigation
    }, 200);
  });
};

/**
 * Initialize logo reveal animation with flow effect
 * - Opacity fade with small y-lift
 * - Mask/clip follows logo curvature from left to right
 * - Duration: 0.8s, ease: power2.out
 * - 1 second delay for hero section
 */
export const initLogoRevealAnimation = (delay = 1000) => {
  requestAnimationFrame(() => {
    const logoElements = document.querySelectorAll('[data-animate-logo]');
    if (logoElements.length === 0) return;

    // Reduced motion: show logo immediately
    if (prefersReducedMotion) {
      logoElements.forEach(logoEl => {
        gsap.set(logoEl, { opacity: 1, y: 0 });
        const img = logoEl.querySelector('img');
        if (img) gsap.set(img, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' });
      });
      return;
    }

    logoElements.forEach(logoEl => {
      const img = logoEl.querySelector('img');
      if (!img) return;

      // Set initial state
      gsap.set(logoEl, {
        opacity: 0,
        y: 20,
        willChange: 'opacity, transform',
      });

      // Create a mask element for smooth flow effect
      // Use clip-path with a smooth reveal from left to right
      gsap.set(img, {
        clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
        willChange: 'clip-path',
      });

      // Create timeline for coordinated animation
      const tl = gsap.timeline({ delay: delay / 1000 });

      // Animate logo container (opacity and y-lift)
      tl.to(logoEl, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
      }, 0);

      // Animate clip-path mask (reveal from left to right with smooth flow)
      // Using polygon for smoother reveal that follows logo shape
      tl.to(img, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 0.8,
        ease: 'power2.out',
      }, 0);

      // Cleanup will-change after animation
      tl.call(() => {
        gsap.set(logoEl, { willChange: 'auto' });
        gsap.set(img, { willChange: 'auto' });
      });
    });
  });
};

/**
 * Initialize timeline animations for ProcessSection
 * - Images fly in from left/right based on step alignment
 * - Progress line fills from top to bottom based on scroll position
 */
export const initTimelineAnimations = (stepsContainer, processContainer, options = {}) => {
  if (!stepsContainer || !processContainer) return () => {};

  // Check for reduced motion preference
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Extract step6El from options
  const { step6El } = options;

  // Get all step items once for reuse
  const stepItems = stepsContainer.querySelectorAll('.process-step');
  
  // Use gsap.context for proper cleanup
  const ctx = gsap.context(() => {
    // Mobile timeline progress animation (max-width: 1023px)
    const mmMobile = gsap.matchMedia();
    
    mmMobile.add('(max-width: 1023px)', () => {
      // Reset all GSAP states on mobile to ensure content is visible
      stepItems.forEach((stepItem) => {
        const textElements = stepItem.querySelectorAll('.timeline-text');
        const media = stepItem.querySelector('.timeline-media');
        const img = media ? media.querySelector('img') : null;
        
        // Reset opacity and transforms to ensure visibility
        if (textElements.length > 0) {
          gsap.set(textElements, { 
            opacity: 1, 
            x: 0, 
            y: 0, 
            scale: 1,
            willChange: 'auto',
            clearProps: 'all'
          });
        }
        
        if (media && img) {
          gsap.set([media, img], { 
            opacity: 1, 
            x: 0, 
            y: 0, 
            scale: 1,
            willChange: 'auto',
            clearProps: 'all'
          });
        }
      });
      
      // Mobile: Progressive fill animation that grows to viewport center
      const railTrackEl = processContainer.querySelector('.process-timeline-track');
      const railFillEl = processContainer.querySelector('.process-timeline-progress');
      
      if (railTrackEl && railFillEl && !reduced) {
        // Set initial state
        gsap.set(railFillEl, {
          height: 0,
          transformOrigin: 'top',
        });
        
        // Helper function to calculate fill height based on viewport center and rail bounds
        const calculateFillHeight = () => {
          // Get section (processContainer) rect
          const sectionRect = processContainer.getBoundingClientRect();
          
          // Get rail track rect
          const railRect = railTrackEl.getBoundingClientRect();
          
          // Calculate viewport center position relative to section
          const viewportCenter = window.innerHeight * 0.5;
          const viewportCenterInSection = viewportCenter - sectionRect.top;
          
          // Calculate rail position relative to section
          const railTopInSection = railRect.top - sectionRect.top;
          const railBottomInSection = railRect.bottom - sectionRect.top;
          const railHeightPx = railBottomInSection - railTopInSection;
          
          // Calculate raw fill: viewport center relative to rail top
          const rawFill = viewportCenterInSection - railTopInSection;
          
          // Clamp fill height: 0 to railHeightPx (exact stop at rail bottom)
          const fillHeightPx = Math.max(0, Math.min(rawFill, railHeightPx));
          
          return fillHeightPx;
        };
        
        // Create ScrollTrigger for progressive fill animation
        ScrollTrigger.create({
          trigger: processContainer,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate: () => {
            // Calculate and set fill height
            const fillHeightPx = calculateFillHeight();
            gsap.set(railFillEl, {
              height: fillHeightPx,
            });
          },
          onRefresh: () => {
            // Recalculate on refresh (resize/orientation change)
            const fillHeightPx = calculateFillHeight();
            gsap.set(railFillEl, {
              height: fillHeightPx,
            });
          },
        });
      } else if (railFillEl && reduced) {
        // For reduced motion, show full line up to rail height
        if (railTrackEl) {
          const railRect = railTrackEl.getBoundingClientRect();
          const railHeightPx = railRect.height;
          gsap.set(railFillEl, { height: railHeightPx });
        } else {
          gsap.set(railFillEl, { height: '100%' });
        }
      }
    });
    
    // Desktop timeline animations (min-width: 1024px)
    const mmDesktop = gsap.matchMedia();
    
    mmDesktop.add('(min-width: 1024px)', () => {
      // Desktop code - unchanged from original
      // Get all timeline text elements (titles, descriptions, step numbers)
      // Animate per step to allow for stagger within each step
      
      stepItems.forEach((stepItem) => {
    const isLeft = stepItem.classList.contains('is-left');
    const isRight = stepItem.classList.contains('is-right');
    const textElements = stepItem.querySelectorAll('.timeline-text');
    const media = stepItem.querySelector('.timeline-media');
    const img = media ? media.querySelector('img') : null;
    
    if (textElements.length === 0) return;

    if (reduced) {
      gsap.set(textElements, { opacity: 0 });
      if (media) gsap.set([media, img], { opacity: 0 });
      gsap.to(textElements, {
        opacity: 1,
        duration: 0.3,
        scrollTrigger: {
          trigger: stepItem,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      });
      if (media) {
        gsap.to([media, img], {
          opacity: 1,
          duration: 0.3,
          scrollTrigger: {
            trigger: stepItem,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        });
      }
      return;
    }

    // Set initial state based on alignment
    // Left-aligned steps: text comes from left (negative x)
    // Right-aligned steps: text comes from right (positive x)
    const textXOffset = isLeft ? -60 : isRight ? 60 : 0;
    // Media animates from the same direction as text
    const mediaXOffset = isLeft ? -60 : isRight ? 60 : 0;
    
    gsap.set(textElements, {
      opacity: 0,
      x: textXOffset,
      willChange: 'transform, opacity',
    });
    
    if (media && img) {
      gsap.set([media, img], {
        opacity: 0,
        x: mediaXOffset,
        willChange: 'transform, opacity',
      });
    }

    // Create a single timeline for this step to synchronize text and media
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stepItem,
        start: 'top 80%',
        end: 'top 55%',
        toggleActions: 'play none none reverse',
        invalidateOnRefresh: true,
        onComplete: () => {
          gsap.set(textElements, { willChange: 'auto' });
          if (media && img) gsap.set([media, img], { willChange: 'auto' });
        },
      },
    });

    // Animate text and media together
    tl.to(textElements, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.1,
    }, 0);
    
    if (media && img) {
      tl.to([media, img], {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power2.out',
      }, 0);
    }
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
    });
  });
  
  // FIX: Refresh ScrollTrigger once after initialization
  // Scroll-to-top wordt afgehandeld door ScrollToTop component bij navigatie
  ScrollTrigger.refresh();
  
  // Return cleanup function
  return () => {
    ctx.revert();
  };
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
  let onRefreshInit;
  let scrollTriggerInstance = null;

  const ctx = gsap.context(() => {
    // Use consistent local array for features
    const features = Array.from(featureEls || []);

    // Validate elements exist and are non-null
    const validateElements = () => {
      if (!logoEl || !features || features.length !== 4) {
        return false;
      }
      if (features.some(el => !el)) {
        return false;
      }
      return true;
    };

    // Helper function to calculate offsets with guards
    const calculateOffsets = () => {
      // Guard: check logoEl exists
      if (!logoEl) {
        return [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
      }

      // Guard: check features exist and are non-null
      if (!features || features.length !== 4 || features.some(el => !el)) {
        return [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
      }

      try {
        const logoRect = logoEl.getBoundingClientRect();
        const logoCenterX = logoRect.left + logoRect.width / 2;
        const logoCenterY = logoRect.top + logoRect.height / 2;

        const featureRects = features.map((el) => {
          if (!el) {
            return { centerX: 0, centerY: 0 };
          }
          try {
            const rect = el.getBoundingClientRect();
            return {
              centerX: rect.left + rect.width / 2,
              centerY: rect.top + rect.height / 2,
            };
          } catch (e) {
            return { centerX: 0, centerY: 0 };
          }
        });

        return featureRects.map((featureRect) => ({
          x: logoCenterX - featureRect.centerX,
          y: logoCenterY - featureRect.centerY,
        }));
      } catch (e) {
        return [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
      }
    };

    // Calculate initial offsets
    let offsets = calculateOffsets();

    // Force initial state: features behind logo, invisible
    // Use immediate values instead of function to ensure they're set
    features.forEach((el, i) => {
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
    const orderedFeatures = staggerOrder.map((idx) => features[idx]).filter(el => el);

    // Create scrubbed timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top 60%',
        end: 'bottom 25%',
        scrub: 1.2,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Guard: check elements still exist
          if (!validateElements()) {
            return;
          }

          // Set will-change during active animation
          if (self.progress > 0 && self.progress < 1) {
            gsap.set(features, { willChange: 'transform, opacity' });
          } else if (self.progress >= 1) {
            // At end, remove will-change after settle completes
            setTimeout(() => {
              if (validateElements()) {
                gsap.set(features, { willChange: 'auto' });
              }
            }, 100);
          } else {
            gsap.set(features, { willChange: 'auto' });
          }
        },
      },
    });

    scrollTriggerInstance = tl.scrollTrigger;

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
      // Guard: check elements exist before proceeding
      if (!validateElements()) {
        return;
      }

      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Guard: check again after timeout
        if (!validateElements()) {
          return;
        }

        offsets = calculateOffsets();
        
        // Update initial positions if timeline is at start
        const scrollTrigger = tl.scrollTrigger;
        if (scrollTrigger && scrollTrigger.progress === 0) {
          features.forEach((el, i) => {
            if (el && offsets[i]) {
              gsap.set(el, {
                x: offsets[i].x,
                y: offsets[i].y,
              });
            }
          });
        }
        
        // Invalidate ScrollTrigger to recalculate positions
        if (scrollTrigger) {
          scrollTrigger.refresh();
        }
      }, 100);
    };

    // Refresh callback with guards
    onRefreshInit = () => {
      // Guard: check elements exist before proceeding
      if (!validateElements()) {
        return;
      }

      offsets = calculateOffsets();
      const scrollTrigger = tl.scrollTrigger;
      if (scrollTrigger && scrollTrigger.progress === 0) {
        features.forEach((el, i) => {
          if (el && offsets[i]) {
            gsap.set(el, {
              x: offsets[i].x,
              y: offsets[i].y,
            });
          }
        });
      }
    };

    window.addEventListener('resize', handleResize);
    ScrollTrigger.addEventListener('refresh', onRefreshInit);
  }, sectionEl);

  return () => {
    clearTimeout(resizeTimeout);
    
    // Remove resize listener
    if (handleResize) {
      window.removeEventListener('resize', handleResize);
    }
    
    // Remove ScrollTrigger refresh listener
    if (onRefreshInit) {
      ScrollTrigger.removeEventListener('refresh', onRefreshInit);
    }
    
    // Kill the scrollTrigger if it exists
    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill();
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

  // MOBILE OPTIMIZATION: Use IntersectionObserver on mobile instead of ScrollTrigger
  if (isMobile()) {
    const teamCards = containerEl.querySelectorAll('.team-card');
    const dots = containerEl.querySelectorAll('.card-dot');
    
    if (teamCards.length === 0 || dots.length === 0) return;
    
    // Simple fade-in animation on mobile
    gsap.set(teamCards, { opacity: 0, y: 16 });
    gsap.set(dots, { opacity: 1, scale: 0.5 });
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const card = entry.target;
            const dot = containerEl.querySelector(`.card-dot[data-card-index="${index}"]`) || 
                       Array.from(dots)[index];
            
            gsap.to(card, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power2.out',
              delay: index * 0.1,
            });
            
            if (dot) {
              gsap.to(dot, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out',
                delay: index * 0.1 + 0.2,
              });
            }
            
            observer.unobserve(card);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );
    
    teamCards.forEach((card, index) => {
      const dot = Array.from(dots)[index];
      if (dot) dot.setAttribute('data-card-index', index);
      observer.observe(card);
    });
    
    return; // Early return - no ScrollTrigger on mobile
  }

  // DESKTOP: Use ScrollTrigger for advanced animations
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
      invalidateOnRefresh: true,
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
      const tl = gsap.timeline();
      tl.fromTo(
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

    // Handle resize with better debouncing and scroll position preservation
    let isScrolling = false;
    let scrollTimeout;
    const handleScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Don't refresh if user is actively scrolling (prevents viewport jumps)
        if (isScrolling) {
          return;
        }
        
        measurements = getMeasurements();
        if (scrollTriggerInstance) {
          // Refresh ScrollTrigger - scroll-to-top wordt afgehandeld door ScrollToTop component
          scrollTriggerInstance.refresh();
        }
      }, 250); // Increased debounce for mobile stability
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
      clearTimeout(scrollTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      ScrollTrigger.removeEventListener('refresh', handleResize);
    };
  }, rootEl);

  return () => {
    ctx.revert();
  };
};

/**
 * Initialize count-up animation for statistics in "Wat hebben we bereikt?" section
 * Numbers count from 0 to their final values when section comes into view
 */
export const initStatsCountUp = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Find the stats section
  const statsSection = document.querySelector('.about-results');
  if (!statsSection) return;
  
  // Find all stat value elements
  const statValues = statsSection.querySelectorAll('.stat-value');
  if (statValues.length === 0) return;
  
  // Reduced motion: show final values immediately
  if (prefersReducedMotion) {
    statValues.forEach((el) => {
      const text = el.textContent.trim();
      // Keep original text (already has final values)
      el.textContent = text;
    });
    return;
  }
  
  // Parse each stat and prepare animation data
  const animations = [];
  
  statValues.forEach((el) => {
    // Get original text - use data attribute if it exists (from previous run), otherwise use current text
    let originalText = el.getAttribute('data-original-value');
    if (!originalText) {
      originalText = el.textContent.trim();
      // Store original value in data attribute for future reference
      el.setAttribute('data-original-value', originalText);
    }
    
    // Parse the value and suffix
    let targetValue = 0;
    let suffix = '';
    
    // More robust parsing: check for K+ first (case-insensitive)
    if (originalText.toUpperCase().includes('K+')) {
      // "10K+" or "10k+" -> targetValue: 10, suffix: "K+"
      const match = originalText.match(/(\d+)/);
      if (match) {
        targetValue = parseInt(match[1], 10);
        suffix = 'K+';
      }
    } else if (originalText.toLowerCase().includes('m')) {
      // "30m" -> targetValue: 30, suffix: "m"
      const match = originalText.match(/(\d+)/);
      if (match) {
        targetValue = parseInt(match[1], 10);
        suffix = 'm';
      }
    } else if (originalText.includes('%')) {
      // "98%" -> targetValue: 98, suffix: "%"
      const match = originalText.match(/(\d+)/);
      if (match) {
        targetValue = parseInt(match[1], 10);
        suffix = '%';
      }
    }
    
    // If parsing failed, skip this element
    if (targetValue === 0 && suffix === '') {
      return;
    }
    
    // Create animation object
    const obj = { value: 0 };
    
    animations.push({
      element: el,
      obj: obj,
      targetValue: targetValue,
      suffix: suffix,
    });
  });
  
  if (animations.length === 0) return;
  
  // Create timeline with single ScrollTrigger
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: statsSection,
      start: 'top 70%',
      once: true,
      invalidateOnRefresh: true,
    },
  });
  
  // Add animations with stagger
  animations.forEach((anim, index) => {
    tl.to(anim.obj, {
      value: anim.targetValue,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => {
        // Round to integer (no decimals)
        const currentValue = Math.floor(anim.obj.value);
        anim.element.textContent = `${currentValue}${anim.suffix}`;
      },
      onComplete: () => {
        // Ensure final value is set correctly
        anim.element.textContent = `${anim.targetValue}${anim.suffix}`;
      },
    }, index * 0.15); // Stagger: 0.15s between each stat
  });
};

export const cleanupScrollAnimations = () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
};
