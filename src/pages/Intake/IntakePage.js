import React from 'react';
import './IntakePage.css';
import Footer from '../../components/layout/Footer/Footer';
import IntakeFunnel from '../../components/ui/IntakeFunnel/IntakeFunnel';

function IntakePage() {

  const handleFunnelComplete = (formData) => {
    console.log('Funnel completed:', formData);
    // Optionally redirect after completion
  };

  return (
    <div className="app">
      <div className="intake-page">
        <IntakeFunnel onComplete={handleFunnelComplete} />
      </div>
      <Footer />
    </div>
  );
}

export default IntakePage;
