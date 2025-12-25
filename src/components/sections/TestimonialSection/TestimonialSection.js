import React, { useState, useLayoutEffect, useRef } from 'react';
import './TestimonialSection.css';
import { initTestimonialsScrollExperience } from '../../../utils/scrollAnimations';

const QuoteIcon = () => (
  <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
    <path d="M16 0C10.4 0 6 4.4 6 10C6 15.6 10.4 20 16 20C17.2 20 18.4 19.8 19.6 19.4L20 24C20 28.4 16.4 32 12 32C7.6 32 4 28.4 4 24V12C4 5.2 9.2 0 16 0ZM34 0C28.4 0 24 4.4 24 10C24 15.6 28.4 20 34 20C35.2 20 36.4 19.8 37.6 19.4L38 24C38 28.4 34.4 32 30 32C25.6 32 22 28.4 22 24V12C22 5.2 27.2 0 34 0Z" fill="currentColor" opacity="0.1"/>
  </svg>
);

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
  const sectionRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const cleanup = initTestimonialsScrollExperience(sectionRef.current);
    return cleanup;
  }, []);

  const testimonials = [
    {
      id: 1,
      quote: 'Blueshipment heeft mijn bol.com business naar een hoger niveau getild. Professioneel, snel en betrouwbaar.',
      name: 'Sarah van der Berg',
      role: 'E-commerce ondernemer, Rotterdam',
      rating: 5
    },
    {
      id: 2,
      quote: 'De integratie was naadloos en de support is top. Mijn klanten zijn tevreden en ik hoef me geen zorgen meer te maken over logistiek.',
      name: 'Tom de Vries',
      role: 'Dropshipper, Utrecht',
      rating: 5
    },
    {
      id: 3,
      quote: 'Eindelijk een partner die echt begrijpt wat ik nodig heb. De service is uitzonderlijk en de kosten zijn transparant.',
      name: 'Lisa Bakker',
      role: 'Online retailer, Den Haag',
      rating: 5
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section ref={sectionRef} className="testimonial-section">
      <div className="testimonial-container">
        <div className="testimonial-header">
          <h2 className="testimonial-title" data-animate-title>
            Ervaringen van <span className="text-blue">onze klanten</span>
          </h2>
          <p className="testimonial-subtitle">
            Ontdek waarom verkopers kiezen voor Blueshipment
          </p>
        </div>

        <div className="testimonial-content">
          <button className="testimonial-arrow testimonial-arrow-left" onClick={prevSlide} aria-label="Vorige testimonial">
            <ArrowLeft />
          </button>

          <div className="testimonial-track">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className={`testimonial-card ${index === currentSlide ? 'active' : ''}`}
              >
                <div className="testimonial-card-header">
                  <div className="quote-icon">
                    <QuoteIcon />
                  </div>
                  <Stars />
                </div>
                <div className="testimonial-card-content">
                  <p className="testimonial-quote">{testimonial.quote}</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <span className="avatar-initial">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div className="author-info">
                    <p className="author-name">{testimonial.name}</p>
                    <p className="author-role">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="testimonial-arrow testimonial-arrow-right" onClick={nextSlide} aria-label="Volgende testimonial">
            <ArrowRight />
          </button>
        </div>

        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`testimonial-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Ga naar testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialSection;

