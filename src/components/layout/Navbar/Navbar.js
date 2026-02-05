import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from '../../../assets/brand/logo.png';

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconListings = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconAutomatisering = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconFulfilment = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 8h14l2 8H3l2-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 16h18v4H3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconSoftware = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDienstenDropdownOpen, setIsDienstenDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setIsScrolled(scrollY > 8);
    };

    // Check initial scroll position
    handleScroll();

    // Add scroll listener with passive flag for performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsDienstenDropdownOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDienstenDropdownOpen && !event.target.closest('.nav-item--has-dropdown')) {
        setIsDienstenDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDienstenDropdownOpen]);

  return (
    <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''} ${isMenuOpen ? 'navbar--menu-open' : ''}`}>
      <div className="navbar-wrapper">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="BlueShipment" className="h-8 w-auto" loading="eager" />
          <span className="logo-text">
            <span className="logo-blue">Blue</span>Shipment
          </span>
        </Link>

        <div className="navbar-content">
          <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
            {/* Desktop links - visible on desktop, hidden on mobile */}
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/over-ons" 
              className={`nav-link ${location.pathname === '/over-ons' || location.pathname === '/about' ? 'active' : ''}`}
            >
              Over ons
            </Link>
            <div className="nav-item nav-item--has-dropdown">
              <Link
                to="/diensten"
                className={`nav-link ${location.pathname === '/diensten' ? 'active' : ''}`}
                onMouseEnter={() => {
                  // Desktop: open dropdown on hover
                  if (window.innerWidth >= 768) {
                    setIsDienstenDropdownOpen(true);
                  }
                }}
              >
                Diensten
              </Link>
              
              <button
                type="button"
                className="nav-dropdown-toggle"
                aria-label="Open diensten menu"
                aria-expanded={isDienstenDropdownOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDienstenDropdownOpen((v) => !v);
                }}
                onMouseEnter={() => {
                  // Desktop: open dropdown on hover
                  if (window.innerWidth >= 768) {
                    setIsDienstenDropdownOpen(true);
                  }
                }}
              >
                <ChevronDown />
              </button>

              <div 
                className={`nav-dropdown ${isDienstenDropdownOpen ? 'is-open' : ''}`}
                onMouseLeave={() => {
                  // Desktop: close dropdown on mouse leave
                  if (window.innerWidth >= 768) {
                    setIsDienstenDropdownOpen(false);
                  }
                }}
              >
                <div className="nav-dropdown-inner">
                  <div className="nav-dropdown-links">
                    <Link 
                      to="/diensten#productlistings" 
                      className="nav-dropdown-link"
                      onClick={() => setIsDienstenDropdownOpen(false)}
                    >
                      <span className="nav-dropdown-link-icon" aria-hidden="true"><IconListings /></span>
                      <span>Listings</span>
                    </Link>
                    <Link 
                      to="/diensten#automatiseren" 
                      className="nav-dropdown-link"
                      onClick={() => setIsDienstenDropdownOpen(false)}
                    >
                      <span className="nav-dropdown-link-icon" aria-hidden="true"><IconAutomatisering /></span>
                      <span>Automatisering</span>
                    </Link>
                    <Link 
                      to="/diensten#fulfilment" 
                      className="nav-dropdown-link"
                      onClick={() => setIsDienstenDropdownOpen(false)}
                    >
                      <span className="nav-dropdown-link-icon" aria-hidden="true"><IconFulfilment /></span>
                      <span>Fulfilment</span>
                    </Link>
                    <Link 
                      to="/diensten#software" 
                      className="nav-dropdown-link"
                      onClick={() => setIsDienstenDropdownOpen(false)}
                    >
                      <span className="nav-dropdown-link-icon" aria-hidden="true"><IconSoftware /></span>
                      <span>Software</span>
                    </Link>
                  </div>
                  <p className="nav-dropdown-cta">
                    Interesse? <Link to="/intake" onClick={() => setIsDienstenDropdownOpen(false)}>Boek een kennismakingsgesprek</Link>.
                  </p>
                </div>
              </div>
            </div>
            <Link 
              to="/contact" 
              className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
            >
              Contact
            </Link>

            {/* Mobile menu header with logo and close button - only visible on mobile */}
            <div className="mobile-menu-header">
              <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
                <img src={logo} alt="BlueShipment" className="h-8 w-auto" loading="eager" />
                <span className="logo-text">
                  <span className="logo-blue">Blue</span>Shipment
                </span>
              </Link>
              <button 
                className={`mobile-menu-btn mobile-menu-btn--header ${isMenuOpen ? 'mobile-menu-btn--open' : ''}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>

            {/* Mobile menu center - centered navigation */}
            <div className="mobile-menu-center">
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/over-ons" 
                className={`nav-link ${location.pathname === '/over-ons' || location.pathname === '/about' ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Over ons
              </Link>
              <div className="nav-item nav-item--has-dropdown">
                <Link
                  to="/diensten"
                  className={`nav-link ${location.pathname === '/diensten' ? 'active' : ''}`}
                >
                  Diensten
                </Link>
                
                <button
                  type="button"
                  className="nav-dropdown-toggle"
                  aria-label="Open diensten menu"
                  aria-expanded={isDienstenDropdownOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDienstenDropdownOpen((v) => !v);
                  }}
                >
                  <ChevronDown />
                </button>

                {/* Mobile: conditional render - only show dropdown when open */}
                {isDienstenDropdownOpen && (
                  <div className="nav-dropdown is-open">
                    <Link 
                      to="/diensten#productlistings" 
                      className="nav-dropdown-link"
                      onClick={() => {
                        setIsDienstenDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      Listings
                    </Link>
                    <Link 
                      to="/diensten#automatiseren" 
                      className="nav-dropdown-link"
                      onClick={() => {
                        setIsDienstenDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      Automatisering
                    </Link>
                    <Link 
                      to="/diensten#fulfilment" 
                      className="nav-dropdown-link"
                      onClick={() => {
                        setIsDienstenDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      Fulfilment
                    </Link>
                    <Link 
                      to="/diensten#software" 
                      className="nav-dropdown-link"
                      onClick={() => {
                        setIsDienstenDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      Software
                    </Link>
                  </div>
                )}
              </div>
              <Link 
                to="/contact" 
                className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div className="navbar-actions">
          <Link 
            to="/intake"
            className="btn btn-primary"
          >
            Boek een kennismakingsgesprek
          </Link>
        </div>

        <button 
          className={`mobile-menu-btn ${isMenuOpen ? 'mobile-menu-btn--open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
