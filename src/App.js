import React, { useEffect } from 'react';
import './styles/App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoSection from './components/VideoSection';
import LogoSection from './components/LogoSection';
import ProcessSection from './components/ProcessSection';
import GallerySection from './components/GallerySection/GallerySection';
import TeamSection from './components/TeamSection';
import FeaturesSection from './components/FeaturesSection';
import WhatsAppSection from './components/WhatsAppSection';
import TestimonialSection from './components/TestimonialSection';
import CTASection from './components/CTASection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import { initScrollAnimations, initTitleAnimations, initHeroTitleAnimation, cleanupScrollAnimations } from './utils/scrollAnimations';

function App() {
  useEffect(() => {
    initScrollAnimations();
    initTitleAnimations();
    initHeroTitleAnimation();

    return () => {
      cleanupScrollAnimations();
    };
  }, []);

  return (
    <div className="app">
      <Navbar />
      <Hero />
      <div data-animate="fadeUp">
        <VideoSection />
      </div>
      <div data-animate="fadeRight">
        <ProcessSection />
      </div>
      <div data-animate="scaleIn">
        <GallerySection />
      </div>
      <div data-animate="fadeUp">
        <TeamSection />
      </div>
      <div data-animate="fadeLeft">
        <FeaturesSection />
      </div>
      <div data-animate="fadeUpScale">
        <WhatsAppSection />
      </div>
      <div data-animate="fadeRight">
        <TestimonialSection />
      </div>
      <div data-animate="scaleIn">
        <CTASection />
      </div>
      <div data-animate="fadeLeft">
        <LogoSection />
      </div>
      <div data-animate="fadeUp">
        <FAQSection />
      </div>
      <div data-animate="fadeUpScale">
        <Footer />
      </div>
    </div>
  );
}

export default App;
