import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home/HomePage';
import AboutPage from './pages/About/AboutPage';
import DienstenPage from './pages/Diensten/DienstenPage';
import ScrollToTop from './components/ScrollToTop';
import StickyWhatsAppButton from './components/StickyWhatsAppButton';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/over-ons" element={<AboutPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/diensten" element={<DienstenPage />} />
      </Routes>
      <StickyWhatsAppButton />
    </Router>
  );
}

export default App;
