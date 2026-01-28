import React from 'react';
import './IntakePage.css';
import Footer from '../../components/layout/Footer/Footer';
import IntakeFunnel from '../../components/ui/IntakeFunnel/IntakeFunnel';
import SEO from '../../components/SEO/SEO';

function IntakePage() {

  const handleFunnelComplete = (formData) => {
    console.log('Funnel completed:', formData);
    // Optionally redirect after completion
  };

  return (
    <div className="app">
      <SEO
        title="Intake - Plan je Kennismakingsgesprek"
        description="Plan een kennismakingsgesprek met BlueShipment. Vul de intake in en ontdek hoe wij je kunnen helpen met je bol.com business."
      />
      <div className="intake-page">
        <IntakeFunnel onComplete={handleFunnelComplete} />
      </div>
      <Footer />
    </div>
  );
}

export default IntakePage;
