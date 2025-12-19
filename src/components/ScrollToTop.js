import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Scrollt automatisch naar boven wanneer de route verandert
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll naar boven bij route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // Instant scroll (geen smooth animatie voor snellere navigatie)
    });
  }, [pathname]);

  return null;
}

export default ScrollToTop;

