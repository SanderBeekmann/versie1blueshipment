import React from 'react';
import './VideoSection.css';

const PlayButton = () => (
  <svg width="63" height="63" viewBox="0 0 63 63" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="31.5" cy="31.5" r="31.5" fill="white"/>
    <path d="M42 31.5L25.5 41.5V21.5L42 31.5Z" fill="#0070ff"/>
  </svg>
);

function VideoSection() {
  return (
    <section className="video-section">
      <div className="video-container">
        <div className="video-content">
          <div className="video-text">
            <h2 className="video-title">
              Krijg je eerste bestelling <span className="text-blue">zonder </span>investering of risico
            </h2>
            <p className="video-subtitle">
              Wij leggen je uit wat ons proces zo bijzonder maakt.
            </p>
            <button className="btn btn-primary">
              Ervaar het zelf!
            </button>
          </div>
          <div className="video-player">
            <div className="video-thumbnail">
              <div className="video-overlay"></div>
              <button className="play-button">
                <PlayButton />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VideoSection;

