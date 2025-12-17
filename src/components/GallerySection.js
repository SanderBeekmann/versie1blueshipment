import React, { useState } from 'react';
import './GallerySection.css';

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

function GallerySection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const images = [
    { id: 1, alt: 'Gallery Image 1' },
    { id: 2, alt: 'Gallery Image 2' },
    { id: 3, alt: 'Gallery Image 3' },
    { id: 4, alt: 'Gallery Image 4' },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="gallery-section">
      <div className="gallery-container">
        <div className="gallery-header">
          <h2 className="gallery-title">
            Wat we <span className="text-blue">bereikt</span> hebben
          </h2>
          <p className="gallery-subtitle">
            Niet alleen woorden, ook resultaten die spreken.
          </p>
        </div>

        <div className="gallery-content">
          <button className="gallery-arrow gallery-arrow-left" onClick={prevSlide}>
            <ArrowLeft />
          </button>

          <div className="gallery-track">
            {images.map((image, index) => (
              <div 
                key={image.id} 
                className={`gallery-image ${index === currentSlide ? 'active' : ''}`}
              >
                <div className="image-placeholder"></div>
              </div>
            ))}
          </div>

          <button className="gallery-arrow gallery-arrow-right" onClick={nextSlide}>
            <ArrowRight />
          </button>
        </div>

        <div className="gallery-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`gallery-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default GallerySection;

