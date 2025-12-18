import React, { useLayoutEffect } from 'react';
import '../../styles/App.css';
import Navbar from '../../components/layout/Navbar/Navbar';
import Hero from '../../components/sections/Hero/Hero';
import VideoSection from '../../components/sections/VideoSection/VideoSection';
import LogoSection from '../../components/sections/LogoSection/LogoSection';
import ProcessSection from '../../components/sections/ProcessSection/ProcessSection';
import GallerySection from '../../components/sections/GallerySection/GallerySection';
import TeamSection from '../../components/sections/TeamSection/TeamSection';
import FeaturesSection from '../../components/sections/FeaturesSection/FeaturesSection';
import WhatsAppSection from '../../components/sections/WhatsAppSection/WhatsAppSection';
import TestimonialSection from '../../components/sections/TestimonialSection/TestimonialSection';
import CTASection from '../../components/sections/CTASection/CTASection';
import FAQSection from '../../components/sections/FAQSection/FAQSection';
import Footer from '../../components/layout/Footer/Footer';
import { initScrollAnimations, initTitleAnimations, initHeroTitleAnimation, initTeamCardsDotAccentAnimation, initLogoRevealAnimation, cleanupScrollAnimations } from '../../utils/scrollAnimations';

function HomePage() {
  useLayoutEffect(() => {
    initScrollAnimations();
    initTitleAnimations();
    initHeroTitleAnimation();
    initLogoRevealAnimation(1000); // 1 second delay for hero

    // Initialize team cards animation
    const teamGrid = document.querySelector('.team-grid');
    if (teamGrid) {
      initTeamCardsDotAccentAnimation(teamGrid);
    }

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

export default HomePage;

