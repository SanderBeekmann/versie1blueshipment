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

export const cleanupScrollAnimations = () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
};
