import React from 'react';
import './styles/App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoSection from './components/VideoSection';
import LogoSection from './components/LogoSection';
import ProcessSection from './components/ProcessSection';
import GallerySection from './components/GallerySection';
import TeamSection from './components/TeamSection';
import FeaturesSection from './components/FeaturesSection';
import WhatsAppSection from './components/WhatsAppSection';
import TestimonialSection from './components/TestimonialSection';
import CTASection from './components/CTASection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <VideoSection />
      <LogoSection />
      <ProcessSection />
      <GallerySection />
      <TeamSection />
      <FeaturesSection />
      <WhatsAppSection />
      <TestimonialSection />
      <CTASection />
      <FAQSection />
      <Footer />
    </div>
  );
}

export default App;
