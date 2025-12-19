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
  }, [location]);

  return (
    <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar-wrapper">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="BlueShipment" className="h-8 w-auto" loading="eager" />
          <span className="logo-text">
            <span className="logo-blue">Blue</span>Shipment
          </span>
        </Link>

        <div className="navbar-content">
          <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
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
            <Link 
              to="/diensten" 
              className={`nav-link ${location.pathname === '/diensten' ? 'active' : ''}`}
            >
              Diensten
            </Link>
            <a href="#listings" className="nav-link">listings</a>
            <div className="nav-dropdown">
              <button className="nav-link dropdown-trigger">
                Resources
                <span className="dropdown-icon"><ChevronDown /></span>
              </button>
            </div>
          </div>
        </div>

        <div className="navbar-actions">
          <button className="btn btn-primary">
            Boek een kennismakingsgesprek
          </button>
        </div>

        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
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
