import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './StickyWhatsAppButton.css';

function StickyWhatsAppButton() {
  const portalRootRef = useRef(null);

  useEffect(() => {
    // Get or create portal root
    let portalRoot = document.getElementById('portal-root');
    if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.id = 'portal-root';
      document.body.appendChild(portalRoot);
    }
    portalRootRef.current = portalRoot;

    // iOS Safari detection: check for iOS and mobile viewport
    const isMobile = window.innerWidth < 768;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isIOSSafari = isIOS && isMobile;

    // On iOS Safari mobile: disable visualViewport tracking to prevent glitches
    // Use stable fixed positioning instead
    if (isIOSSafari) {
      // Set static CSS variables for stable positioning
      document.documentElement.style.setProperty('--vv-top', '0px');
      document.documentElement.style.setProperty('--vv-left', '0px');
      document.documentElement.style.setProperty('--vv-width', '100vw');
      document.documentElement.style.setProperty('--vv-height', '100vh');
      return;
    }

    // Desktop and non-iOS mobile: use visualViewport for dynamic address bar handling
    const vv = window.visualViewport;
    if (!vv) {
      // Fallback for browsers without visualViewport API
      document.documentElement.style.setProperty('--vv-top', '0px');
      document.documentElement.style.setProperty('--vv-left', '0px');
      document.documentElement.style.setProperty('--vv-width', '100vw');
      document.documentElement.style.setProperty('--vv-height', '100vh');
      return;
    }

    // MOBILE OPTIMIZATION: Throttle scroll/resize listeners using requestAnimationFrame
    let rafId = null;
    let needsUpdate = false;

    const updateLayer = () => {
      document.documentElement.style.setProperty('--vv-top', `${vv.offsetTop}px`);
      document.documentElement.style.setProperty('--vv-left', `${vv.offsetLeft}px`);
      document.documentElement.style.setProperty('--vv-width', `${vv.width}px`);
      document.documentElement.style.setProperty('--vv-height', `${vv.height}px`);
      needsUpdate = false;
    };

    const throttledUpdate = () => {
      if (!needsUpdate) {
        needsUpdate = true;
        rafId = requestAnimationFrame(() => {
          updateLayer();
          rafId = null;
        });
      }
    };

    // Initial setup
    updateLayer();

    // Debounced resize handler (less frequent than scroll)
    let resizeTimeout = null;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateLayer, 100);
    };

    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', throttledUpdate);

    return () => {
      // Cancel pending RAF
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      // Clear resize timeout
      if (resizeTimeout !== null) {
        clearTimeout(resizeTimeout);
        resizeTimeout = null;
      }
      // Remove listeners
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', throttledUpdate);
    };
  }, []);

  // WhatsApp nummer: +31 6 17818246 (formaat zonder + en spaties: 31617818246)
  const whatsappNumber = '31617818246';
  const whatsappMessage = encodeURIComponent('Hallo! Ik heb een vraag over BlueShipment.');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // Get portal root synchronously (it exists in HTML or will be created)
  const portalRoot = portalRootRef.current || document.getElementById('portal-root') || document.body;

  return createPortal(
    <div className="vv-layer" aria-hidden="true">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="sticky-whatsapp-button"
        aria-label="Contacteer ons via WhatsApp"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="whatsapp-icon"
        >
          <path
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
            fill="currentColor"
          />
        </svg>
      </a>
    </div>,
    portalRoot
  );
}

export default StickyWhatsAppButton;

