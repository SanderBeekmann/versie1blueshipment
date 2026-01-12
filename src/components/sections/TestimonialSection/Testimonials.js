import React, { useState, useEffect, useRef } from 'react';
import './Testimonials.css';

function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prevActiveIndexRef = useRef(0);
  
  const testimonials = [
    {
      name: "Mark Jansen",
      role: "Bol.com verkoper",
      initials: "MJ",
      quote: "Sinds BlueShipment doen wij geen fulfilment meer zelf. Alles loopt strak, support is snel en we besparen elke week uren."
    },
    {
      name: "Sanne de Vries",
      role: "E-commerce ondernemer",
      initials: "SV",
      quote: "Geen verborgen kosten en altijd direct antwoord via WhatsApp. Dit is precies wat je wilt als je wilt opschalen."
    },
    {
      name: "Tom Bakker",
      role: "Marketplace specialist",
      initials: "TB",
      quote: "De combinatie van software en fulfilment werkt perfect. Listings, verzending en retouren zijn volledig uit handen genomen."
    },
    {
      name: "Lisa van der Berg",
      role: "Online retailer",
      initials: "LB",
      quote: "BlueShipment heeft onze operationele efficiëntie enorm verbeterd. We kunnen nu focussen op groei in plaats van logistiek."
    }
  ];

  // Autoplay slider on mobile only
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        prevActiveIndexRef.current = prevIndex;
        return (prevIndex + 1) % testimonials.length;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

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

        <div className="testimonials-grid">
          {/* Progress Indicator - Mobile Only */}
          <div className="testimonials-deck-indicator" aria-hidden="true">
            {testimonials.map((testimonial, index) => (
              <div
                key={`indicator-${index}`}
                className={`testimonials-indicator-bar ${index === activeIndex ? 'testimonials-indicator-bar--active' : ''}`}
                aria-label={`Card ${index + 1} of ${testimonials.length}`}
              />
            ))}
          </div>

          <div className="testimonials-deck-viewport">
            {(() => {
              // DECK MODEL: Only render 3 cards maximum
              const N = testimonials.length;
              const topIndex = activeIndex;
              const secondIndex = (activeIndex - 1 + N) % N;
              const thirdIndex = (activeIndex - 2 + N) % N;
              
              // Determine if top card is entering
              const prevTopIndex = prevActiveIndexRef.current;
              const prevSecondIndex = (prevTopIndex - 1 + N) % N;
              const prevThirdIndex = (prevTopIndex - 2 + N) % N;
              const isTopEntering = topIndex !== prevTopIndex && 
                                    topIndex !== prevSecondIndex && 
                                    topIndex !== prevThirdIndex;
              
              const deckCards = [
                { index: topIndex, role: 'top', isEntering: isTopEntering },
                { index: secondIndex, role: 'second', isEntering: false },
                { index: thirdIndex, role: 'third', isEntering: false }
              ];
              
              return deckCards.map(({ index, role, isEntering }) => {
                const testimonial = testimonials[index];
                return (
                  <article 
                    key={`${index}-${role}-${activeIndex}`}
                    className={`testimonial-card testimonial-card--${role} ${isEntering ? 'testimonial-card--entering' : ''}`}
                  >
                    <div className="testimonial-rating">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="testimonial-star"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8 0L10.163 5.528L16 6.112L11.82 9.944L12.944 16L8 12.944L3.056 16L4.18 9.944L0 6.112L5.837 5.528L8 0Z"
                            fill="currentColor"
                          />
                        </svg>
                      ))}
                    </div>
                    <p className="testimonial-quote">
                      "{testimonial.quote}"
                    </p>

                    <div className="testimonial-author">
                      <div className="testimonial-avatar">
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="testimonial-name">{testimonial.name}</p>
                        <p className="testimonial-role">{testimonial.role}</p>
                      </div>
                    </div>
                  </article>
                );
              });
            })()}
          </div>
        </div>
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

