import { useLayoutEffect, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Scrollt altijd naar boven bij route navigatie op alle devices (desktop en mobiel)
 */
function ScrollToTop() {
  const location = useLocation();
  const prevPathnameRef = useRef(location.pathname);
  const isFirstRenderRef = useRef(true);

  // Helper function om naar boven te scrollen
  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }
  };

  // Scroll VOOR paint (useLayoutEffect) - belangrijkste scroll
  useLayoutEffect(() => {
    const currentPathname = location.pathname;
    const prevPathname = prevPathnameRef.current;
    
    // Scroll naar boven wanneer pathname verandert (niet op eerste render)
    // Werkt op ALLE devices (desktop en mobiel)
    if (!isFirstRenderRef.current && prevPathname !== currentPathname) {
      scrollToTop();
    }
    
    // Update refs
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
    }
    prevPathnameRef.current = currentPathname;
  }, [location.pathname]);

  // Backup: scroll NA paint voor zekerheid
  useEffect(() => {
    // Extra scroll na paint (als we niet op eerste render zijn en niet al op top zijn)
    // Dit vangt layout shifts en ScrollTrigger.refresh() op
    if (!isFirstRenderRef.current) {
      // Als we niet op top zijn, scroll dan
      if (window.scrollY > 5) {
        scrollToTop();
      }
      
      // Extra scroll na delays om layout shifts en ScrollTrigger.refresh() te vangen
      const timeouts = [
        setTimeout(() => {
          if (window.scrollY > 5) scrollToTop();
        }, 10),
        setTimeout(() => {
          if (window.scrollY > 5) scrollToTop();
        }, 100),
        setTimeout(() => {
          if (window.scrollY > 5) scrollToTop();
        }, 200)
      ];
      
      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [location.pathname]);

  return null;
}

export default ScrollToTop;


