import React, { useLayoutEffect, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ContactPage.css';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import GlassTagline from '../../components/sections/GlassTagline/GlassTagline';
import InfiniteGridOverlay from '../../components/ui/the-infinite-grid/InfiniteGridOverlay';
import SEO from '../../components/SEO/SEO';
import { initScrollAnimations, initTitleAnimations, initHeroTitleAnimation, cleanupScrollAnimations } from '../../utils/scrollAnimations';
import { openWhatsApp } from '../../utils/whatsapp';

gsap.registerPlugin(ScrollTrigger);

function ContactPage() {
  // MOBILE OPTIMIZATION: Don't render InfiniteGridOverlay on mobile
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);
  const contactMethodsRef = useRef(null);
  const leftCardRef = useRef(null);
  const middleCardRef = useRef(null);
  const rightCardRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  useLayoutEffect(() => {
    let refreshTimeout = null;
    const rafId = requestAnimationFrame(() => {
      initScrollAnimations();
      initTitleAnimations();
      initHeroTitleAnimation();
      refreshTimeout = setTimeout(() => { ScrollTrigger.refresh(true); }, 150);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (refreshTimeout) clearTimeout(refreshTimeout);
      cleanupScrollAnimations();
    };
  }, []);

  // Contact cards stagger animation
  useLayoutEffect(() => {
    const leftCard = leftCardRef.current;
    const middleCard = middleCardRef.current;
    const rightCard = rightCardRef.current;
    const section = contactMethodsRef.current;

    if (!section || !leftCard || !middleCard || !rightCard) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileDevice = window.innerWidth < 768;

    // For reduced motion or mobile, show elements immediately
    if (prefersReducedMotion || isMobileDevice) {
      gsap.set([leftCard, middleCard, rightCard], {
        opacity: 1,
        x: 0,
        y: 0,
        willChange: 'auto'
      });
      return;
    }

    // Set initial states - cards start outside viewport
    gsap.set(leftCard, {
      opacity: 0,
      x: -window.innerWidth,
      willChange: 'transform, opacity'
    });

    gsap.set(middleCard, {
      opacity: 0,
      y: 150,
      willChange: 'transform, opacity'
    });

    gsap.set(rightCard, {
      opacity: 0,
      x: window.innerWidth,
      willChange: 'transform, opacity'
    });

    // Create timeline with ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        once: true,
      }
    });

    // All cards animate simultaneously
    tl.to(leftCard, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, 0)
    .to(middleCard, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, 0)
    .to(rightCard, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, 0);

    // Cleanup
    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === section) {
          trigger.kill();
        }
      });
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build WhatsApp message from form data
    let message = `Hallo! Ik wil graag contact opnemen.\n\n`;
    if (formData.name) message += `Naam: ${formData.name}\n`;
    if (formData.email) message += `Email: ${formData.email}\n`;
    if (formData.phone) message += `Telefoon: ${formData.phone}\n`;
    if (formData.message) message += `\nBericht:\n${formData.message}`;
    
    // Open WhatsApp with pre-filled message
    openWhatsApp(message);
    
    // Show success message
    setFormStatus('success');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    
    // Clear status after 5 seconds
    setTimeout(() => {
      setFormStatus(null);
    }, 5000);
  };

  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "BlueShipment",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "email": "info@blueshipment.nl"
      }
    }
  };

  return (
    <div className="app">
      <SEO
        title="Contact - Neem Contact Op"
        description="Neem contact op met BlueShipment. Wij helpen je graag verder met vragen over onze bol.com partner services: productlistings, automatisering, fulfilment en software."
        structuredData={contactPageSchema}
      />
      <Navbar />
      <div className="page-content">
        {/* Hero Section */}
        <section className="contact-hero">
          {!isMobile && <InfiniteGridOverlay opacity={0.5} />}
          <div className="contact-hero-content">
            <div className="contact-hero-text">
              <GlassTagline withDot>
                <p>Contact</p>
              </GlassTagline>
              
              <div className="contact-hero-title-section">
                <h1 className="contact-hero-title">
                  Laten we <span className="contact-hero-word-samen">samen</span><br />werken
                </h1>
                <p className="contact-hero-subtitle">
                  We staan klaar om je te helpen
                </p>
              </div>

              <p className="contact-hero-intro">
                Heb je vragen over onze diensten? Wil je meer weten over fulfilment, automatisering of onze software? Neem gerust contact met ons op. We reageren binnen 30 minuten.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods Section */}
        <div data-animate="fadeUp">
          <section ref={contactMethodsRef} className="contact-methods">
            <div className="contact-methods-container">
              <h2 className="contact-methods-title" data-animate-title>
                Kies je contactmethode
              </h2>
              <p className="contact-methods-subtitle">
                We zijn bereikbaar via verschillende kanalen
              </p>

              <div className="contact-methods-grid">
                <div ref={leftCardRef} className="contact-method-card">
                  <div className="contact-method-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3 className="contact-method-title">WhatsApp</h3>
                  <p className="contact-method-description">
                    Stuur een bericht en we reageren binnen 30 minuten
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => openWhatsApp('Hallo! Ik wil graag contact opnemen.')}
                  >
                    Stuur een bericht
                  </button>
                </div>

                <div ref={middleCardRef} className="contact-method-card">
                  <div className="contact-method-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3 className="contact-method-title">Kennismaking</h3>
                  <p className="contact-method-description">
                    Vul de intake in en plan een kennismakingsgesprek
                  </p>
                  <Link 
                    to="/intake"
                    className="btn btn-primary"
                  >
                    Start kennismaking
                  </Link>
                </div>

                <div ref={rightCardRef} className="contact-method-card">
                  <div className="contact-method-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3 className="contact-method-title">Email</h3>
                  <p className="contact-method-description">
                    Stuur direct een email naar ons
                  </p>
                  <a 
                    href="mailto:info@blueshipment.nl?subject=Contact%20via%20website&body=Hallo%20BlueShipment%2C%0A%0AIk%20wil%20graag%20contact%20met%20jullie%20opnemen.%0A%0AGroet%2C"
                    className="btn btn-primary"
                  >
                    Stuur een email
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Contact Form Section */}
        <div data-animate="fadeUp">
          <section className="contact-form-section">
            <div className="contact-form-container">
              <div className="contact-form-header">
                <h2 className="contact-form-title" data-animate-title>
                  Of stuur een bericht via WhatsApp
                </h2>
                <p className="contact-form-subtitle">
                  Vul het formulier in en we openen WhatsApp met je bericht
                </p>
              </div>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form-row">
                  <div className="contact-form-group">
                    <label htmlFor="name" className="contact-form-label">
                      Naam *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="contact-form-input"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="contact-form-group">
                    <label htmlFor="email" className="contact-form-label">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="contact-form-input"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="contact-form-group">
                  <label htmlFor="phone" className="contact-form-label">
                    Telefoonnummer
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="contact-form-input"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="contact-form-group">
                  <label htmlFor="message" className="contact-form-label">
                    Bericht *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className="contact-form-textarea"
                    rows="6"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {formStatus === 'success' && (
                  <div className="contact-form-success">
                    <p>Bericht klaar! WhatsApp wordt geopend...</p>
                  </div>
                )}

                <button type="submit" className="btn btn-primary contact-form-submit">
                  Verstuur via WhatsApp
                </button>
              </form>
            </div>
          </section>
        </div>

        {/* Contact Info Section */}
        <div data-animate="fadeUp">
          <section className="contact-info">
            <div className="contact-info-container">
              <h2 className="contact-info-title" data-animate-title>
                Onze gegevens
              </h2>
              <div className="contact-info-grid">
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3 className="contact-info-label">Adres</h3>
                  <p className="contact-info-value">
                    BlueShipment<br />
                    Nederland
                  </p>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3 className="contact-info-label">Telefoon</h3>
                  <p className="contact-info-value">
                    <a href="tel:+31617818246">+31 6 17818246</a>
                  </p>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3 className="contact-info-label">Email</h3>
                  <p className="contact-info-value">
                    info@blueshipment.nl
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ContactPage;
