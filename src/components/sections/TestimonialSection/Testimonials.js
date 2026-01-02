import React from 'react';
import './Testimonials.css';

function Testimonials() {
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
    }
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

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <article key={index} className="testimonial-card">
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
          ))}
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

