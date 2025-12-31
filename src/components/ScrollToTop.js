import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Scrollt automatisch naar boven wanneer de route verandert
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    // Only scroll to top on actual pathname change, not on hash changes
    // React Router v7: pathname doesn't change when hash changes, so this should be safe
    // But we add a check to be extra sure
    if (prevPathnameRef.current !== pathname) {
      console.trace('[ScrollToTop] Pathname changed, scrolling to top', {
        from: prevPathnameRef.current,
        to: pathname,
        hash: window.location.hash
      });
      
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant', // Instant scroll (geen smooth animatie voor snellere navigatie)
      });
      
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  return null;
}

export default ScrollToTop;


