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

  // Separate diensten detail titles from other titles for stagger
  const dienstenDetailTitles = Array.from(titles).filter(title => 
    title.closest('.diensten-detail-block')
  );
  const otherTitles = Array.from(titles).filter(title => 
    !title.closest('.diensten-detail-block')
  );

  // Animate diensten detail titles with stagger between sections
  dienstenDetailTitles.forEach((title, index) => {
    const tagName = title.tagName.toLowerCase();
    const config = titleAnimationConfig[tagName] || titleAnimationConfig.h3;

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
  otherTitles.forEach((title) => {
    const tagName = title.tagName.toLowerCase();
    const config = titleAnimationConfig[tagName] || titleAnimationConfig.h3;

    if (prefersReducedMotion) {
      gsap.set(title, { opacity: 1, y: 0 });
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
 * Premium letter-by-letter animation for hero title and subtitle
 * Plays once on page load or when hero becomes visible
 * Supports .hero-title (homepage), .about-hero-title (about page), and .diensten-hero-title (diensten page)
 * Subtitle animates with a small delay after the title
 */
export const initHeroTitleAnimation = () => {
  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    // Support homepage, about page, and diensten page hero titles
    const heroTitle = document.querySelector('.hero-title') || 
                      document.querySelector('.about-hero-title') || 
                      document.querySelector('.diensten-hero-title');
    if (!heroTitle) return;

    // Find subtitle (supports all hero pages)
    const heroSubtitle = document.querySelector('.hero-subtitle') || 
                         document.querySelector('.about-hero-subtitle') || 
                         document.querySelector('.diensten-hero-subtitle');

    // Find intro text (diensten page specific)
    const heroIntro = document.querySelector('.diensten-hero-intro');

    // Find buttons/CTAs (supports all hero pages)
    const heroCta = document.querySelector('.hero-cta');
    const aboutHeroCtas = document.querySelector('.about-hero-ctas');
    const dienstenHeroCtas = document.querySelector('.diensten-hero-ctas');
    const heroButtons = [];
    
    if (heroCta) {
      heroButtons.push(heroCta);
    }
    if (aboutHeroCtas) {
      // Get all buttons and links in the CTA container
      const buttons = aboutHeroCtas.querySelectorAll('button, a');
      heroButtons.push(...Array.from(buttons));
    }
    if (dienstenHeroCtas) {
      // Get all buttons and links in the CTA container
      const buttons = dienstenHeroCtas.querySelectorAll('button, a');
      heroButtons.push(...Array.from(buttons));
    }

    // Reduced motion: show text immediately
    if (prefersReducedMotion) {
      gsap.set(heroTitle, { opacity: 1 });
      if (heroSubtitle) {
        gsap.set(heroSubtitle, { opacity: 1, y: 0 });
      }
      if (heroIntro) {
        gsap.set(heroIntro, { opacity: 1, y: 0 });
      }
      if (heroButtons.length > 0) {
        gsap.set(heroButtons, { opacity: 1, y: 0 });
      }
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

    // Set initial state for buttons - powerful animation from below
    if (heroButtons.length > 0) {
      gsap.set(heroButtons, {
        opacity: 0,
        y: 50, // Stronger offset from below for more impact
        scale: 0.95,
        willChange: 'transform, opacity',
      });
    }

    // Check if hero is already visible in viewport
    const rect = heroTitle.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    // Always animate immediately for hero title (it's at the top of the page)
    // Small delay to ensure smooth animation
    setTimeout(() => {
      // Calculate title animation duration (base duration + stagger for all letters)
      const titleDuration = 0.9 + (letters.length * 0.02);
      
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

      // Animate buttons with powerful animation from below - after subtitle
      if (heroButtons.length > 0) {
        gsap.to(heroButtons, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out', // Stronger easing for more impact
          delay: 0.6, // Delay after subtitle starts
          stagger: 0.1, // Small stagger if multiple buttons
          onComplete: () => {
            gsap.set(heroButtons, { willChange: 'auto' });
          },
        });
      }
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
    const originalText = el.textContent.trim();
    
    // Parse the value and suffix
    let targetValue = 0;
    let suffix = '';
    
    if (originalText.includes('K+')) {
      // "50K+" -> targetValue: 50, suffix: "K+"
      const match = originalText.match(/(\d+)/);
      if (match) {
        targetValue = parseInt(match[1], 10);
        suffix = 'K+';
      }
    } else if (originalText.includes('m')) {
      // "18m" -> targetValue: 18, suffix: "m"
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
