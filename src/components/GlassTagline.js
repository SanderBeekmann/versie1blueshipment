import React from 'react';
import './GlassTagline.css';

function GlassTagline({ children, className = '', withDot = false }) {
  return (
    <div className={`glass-tagline ${className}`}>
      <div className="glass-shimmer"></div>
      <div className="glass-content">
        {withDot && <span className="glass-tagline-dot"></span>}
        {children}
      </div>
    </div>
  );
}

export default GlassTagline;
