import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Scrollt automatisch naar boven wanneer de route verandert
 */
function ScrollToTop() {
  const location = useLocation();
  const prevPathnameRef = useRef(location.pathname);

  useEffect(() => {
    const currentPathname = location.pathname;
    
    // Only scroll to top on actual pathname change, not on hash changes or re-renders
    if (prevPathnameRef.current !== currentPathname) {
      // Scroll to top when route changes
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
      
      prevPathnameRef.current = currentPathname;
    }
  }, [location.pathname]);

  return null;
}

export default ScrollToTop;


