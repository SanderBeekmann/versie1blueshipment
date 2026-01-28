import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './pages/Home/HomePage';
import AboutPage from './pages/About/AboutPage';
import DienstenPage from './pages/Diensten/DienstenPage';
import ResourcesPage from './pages/Resources/ResourcesPage';
import BlogDetailPage from './pages/Resources/BlogDetailPage';
import ContactPage from './pages/Contact/ContactPage';
import IntakePage from './pages/Intake/IntakePage';
import ScrollToTop from './components/ScrollToTop';
import StickyWhatsAppButton from './components/StickyWhatsAppButton';

function App() {
  return (
    <HelmetProvider>
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/over-ons" element={<AboutPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/diensten" element={<DienstenPage />} />
        <Route path="/intake" element={<IntakePage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/:slug" element={<BlogDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <StickyWhatsAppButton />
    </Router>
    </HelmetProvider>
  );
}

export default App;
