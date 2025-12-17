import React, { useState } from 'react';
import './TestimonialSection.css';

const Stars = () => (
  <svg width="116" height="19" viewBox="0 0 116 19" fill="none">
    <path d="M10 0L12.245 6.91H19.511L13.633 11.18L15.878 18.09L10 13.82L4.122 18.09L6.367 11.18L0.489 6.91H7.755L10 0Z" fill="#ECB22E"/>
    <path d="M34 0L36.245 6.91H43.511L37.633 11.18L39.878 18.09L34 13.82L28.122 18.09L30.367 11.18L24.489 6.91H31.755L34 0Z" fill="#ECB22E"/>
    <path d="M58 0L60.245 6.91H67.511L61.633 11.18L63.878 18.09L58 13.82L52.122 18.09L54.367 11.18L48.489 6.91H55.755L58 0Z" fill="#ECB22E"/>
    <path d="M82 0L84.245 6.91H91.511L85.633 11.18L87.878 18.09L82 13.82L76.122 18.09L78.367 11.18L72.489 6.91H79.755L82 0Z" fill="#ECB22E"/>
    <path d="M106 0L108.245 6.91H115.511L109.633 11.18L111.878 18.09L106 13.82L100.122 18.09L102.367 11.18L96.489 6.91H103.755L106 0Z" fill="#ECB22E"/>
  </svg>
);

const ArrowLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function TestimonialSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote: '"Eindelijk een fulfilmentcenter dat begrijpt hoe bol-dropshipping werkt. Geen gedoe, alleen resultaten."',
      name: 'Marco Jansen',
      role: 'Bol-verkoper, Amsterdam'
    },
    {
      id: 2,
      quote: '"Eindelijk een fulfilmentcenter dat begrijpt hoe bol-dropshipping werkt. Geen gedoe, alleen resultaten."',
      name: 'Marco Jansen',
      role: 'Bol-verkoper, Amsterdam'
    },
    {
      id: 3,
      quote: '"Eindelijk een fulfilmentcenter dat begrijpt hoe bol-dropshipping werkt. Geen gedoe, alleen resultaten."',
      name: 'Marco Jansen',
      role: 'Bol-verkoper, Amsterdam'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="testimonial-section">
      <div className="testimonial-container">
        <div className="testimonial-header">
          <h2 className="testimonial-title" data-animate-title>
            Wat zeggen onze <span className="text-blue">klanten?</span>
          </h2>
          <p className="testimonial-subtitle">
            Bol-verkopers vertrouwen Blueshipment
          </p>
        </div>

        <div className="testimonial-content">
          <button className="testimonial-arrow testimonial-arrow-left" onClick={prevSlide}>
            <ArrowLeft />
          </button>

          <div className="testimonial-track">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className={`testimonial-card ${index === currentSlide ? 'active' : ''}`}
              >
                <div className="testimonial-card-content">
                  <Stars />
                  <p className="testimonial-quote">{testimonial.quote}</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar"></div>
                  <div className="author-info">
                    <p className="author-name">{testimonial.name}</p>
                    <p className="author-role">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="testimonial-arrow testimonial-arrow-right" onClick={nextSlide}>
            <ArrowRight />
          </button>
        </div>

        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`testimonial-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialSection;

