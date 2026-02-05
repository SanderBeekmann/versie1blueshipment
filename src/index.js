import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';

// Disable browser scroll restoration on all devices to prevent unwanted scroll jumps
// We handle scroll-to-top manually in ScrollToTop component
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Immediately scroll to top on initial load (before React renders)
// This prevents any visible jump from browser scroll restoration
// Works on all devices (desktop and mobile)
if (!window.location.hash) {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  if (document.scrollingElement) {
    document.scrollingElement.scrollTop = 0;
  }
}

// Scroll monitoring alleen aanzetten voor debug (voorkomt extra main-thread werk bij scroll)
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_DEBUG_SCROLL === 'true') {
  let lastScrollY = window.scrollY;
  let scrollTimeout = null;
  const monitorScroll = () => {
    const currentScrollY = window.scrollY;
    const diff = currentScrollY - lastScrollY;
    if (Math.abs(diff) > 10) {
      console.warn('[ScrollMonitor] Large scroll change detected', { from: lastScrollY, to: currentScrollY, diff });
    }
    lastScrollY = currentScrollY;
  };
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(monitorScroll, 50);
  }, { passive: true });
  const originalScrollTo = window.scrollTo;
  window.scrollTo = function(...args) {
    console.trace('[ScrollMonitor] window.scrollTo called', { args, currentScrollY: window.scrollY });
    return originalScrollTo.apply(this, args);
  };
  const originalScrollIntoView = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function(...args) {
    console.trace('[ScrollMonitor] scrollIntoView called', { element: this, args });
    return originalScrollIntoView.apply(this, args);
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

