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

  // Backup: één late scroll-corrigeer na routewissel (minder timeouts = minder kans op stutter)
  useEffect(() => {
    if (!isFirstRenderRef.current && window.scrollY > 30) {
      const t = setTimeout(() => {
        if (window.scrollY > 30) scrollToTop();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [location.pathname]);

  return null;
}

export default ScrollToTop;


