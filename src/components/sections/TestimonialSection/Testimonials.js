import React from 'react';
import { AnimatedTestimonials } from '../../ui/AnimatedTestimonials/AnimatedTestimonials';
import './Testimonials.css';
import analytics1 from '../../../assets/analytics/analytics.png';
import analytics2 from '../../../assets/analytics/analytics2.png';
import analytics3 from '../../../assets/analytics/analytics3.png';

function Testimonials() {
  const testimonials = [
    {
      quote: "Sinds BlueShipment doen wij geen fulfilment meer zelf. Alles loopt strak, support is snel en we besparen elke week uren.",
      name: "Mark Jansen",
      designation: "Bol.com verkoper",
      src: analytics1,
    },
    {
      quote: "Geen verborgen kosten en altijd direct antwoord via WhatsApp. Dit is precies wat je wilt als je wilt opschalen.",
      name: "Sanne de Vries",
      designation: "E-commerce ondernemer",
      src: analytics2,
    },
    {
      quote: "De combinatie van software en fulfilment werkt perfect. Listings, verzending en retouren zijn volledig uit handen genomen.",
      name: "Tom Bakker",
      designation: "Marketplace specialist",
      src: analytics3,
    },
  ];

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <span className="testimonials-kicker">Ervaringen</span>
          <h2 className="testimonials-title">
            Wat klanten over ons zeggen
          </h2>
          <p className="testimonials-subtitle">
            Betrouwbare fulfilment en support waar ondernemers op bouwen.
          </p>
        </div>

        <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
      </div>

      <div className="testimonials-cta">
        <div className="testimonials-cta-content">
          <h3 className="testimonials-cta-title">
            Deel jouw ervaring met BlueShipment
          </h3>
          <p className="testimonials-cta-text">
            Help andere ondernemers door jouw verhaal te delen. We horen graag wat je van onze service vindt!
          </p>
          <button className="testimonials-cta-button">
            Laat een review achter
          </button>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;

