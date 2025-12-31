import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';

// Disable browser scroll restoration to prevent unwanted scroll-to-top
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Comprehensive scroll monitoring for debugging
if (process.env.NODE_ENV === 'development') {
  let lastScrollY = window.scrollY;
  let scrollTimeout = null;
  
  // Monitor all scroll position changes
  const monitorScroll = () => {
    const currentScrollY = window.scrollY;
    const diff = currentScrollY - lastScrollY;
    
    if (Math.abs(diff) > 10) {
      console.warn('[ScrollMonitor] Large scroll change detected', {
        from: lastScrollY,
        to: currentScrollY,
        diff,
        timestamp: Date.now(),
        stack: new Error().stack
      });
    }
    
    lastScrollY = currentScrollY;
  };
  
  // Monitor scroll events
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(monitorScroll, 50);
  }, { passive: true });
  
  // Monitor all scrollTo calls
  const originalScrollTo = window.scrollTo;
  window.scrollTo = function(...args) {
    console.trace('[ScrollMonitor] window.scrollTo called', {
      args,
      currentScrollY: window.scrollY,
      timestamp: Date.now()
    });
    return originalScrollTo.apply(this, args);
  };
  
  // Monitor scrollIntoView calls
  const originalScrollIntoView = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function(...args) {
    console.trace('[ScrollMonitor] scrollIntoView called', {
      element: this,
      args,
      currentScrollY: window.scrollY,
      timestamp: Date.now()
    });
    return originalScrollIntoView.apply(this, args);
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

