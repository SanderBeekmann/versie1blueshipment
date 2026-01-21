import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from '../../../assets/brand/logo.png';

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <Link 
                  to="/diensten#productlistings" 
                  className="nav-dropdown-link"
                  onClick={() => setIsDienstenDropdownOpen(false)}
                >
                  Listings
                </Link>
                <Link 
                  to="/diensten#automatiseren" 
                  className="nav-dropdown-link"
                  onClick={() => setIsDienstenDropdownOpen(false)}
                >
                  Automatisering
                </Link>
                <Link 
                  to="/diensten#fulfilment" 
                  className="nav-dropdown-link"
                  onClick={() => setIsDienstenDropdownOpen(false)}
                >
                  Fulfilment
                </Link>
                <Link 
                  to="/diensten#coaching" 
                  className="nav-dropdown-link"
                  onClick={() => setIsDienstenDropdownOpen(false)}
                >
                  Coaching
                </Link>
                <Link 
                  to="/diensten#software" 
                  className="nav-dropdown-link"
                  onClick={() => setIsDienstenDropdownOpen(false)}
                >
                  Software
                </Link>
                <Link 
                  to="/diensten#scaling" 
                  className="nav-dropdown-link"
                  onClick={() => setIsDienstenDropdownOpen(false)}
                >
                  Scaling
                </Link>
              </div>
            </div>
            <Link 
              to="/resources" 
              className={`nav-link ${location.pathname === '/resources' ? 'active' : ''}`}
            >
              Resources
            </Link>
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
                      to="/diensten#coaching" 
                      className="nav-dropdown-link"
                      onClick={() => {
                        setIsDienstenDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      Coaching
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
                    <Link 
                      to="/diensten#scaling" 
                      className="nav-dropdown-link"
                      onClick={() => {
                        setIsDienstenDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      Scaling
                    </Link>
                  </div>
                )}
              </div>
              <Link 
                to="/resources" 
                className={`nav-link ${location.pathname === '/resources' ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Resources
              </Link>
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
          <a 
            href="https://calendly.com/mouseclick2017/30min" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Boek een kennismakingsgesprek
          </a>
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
