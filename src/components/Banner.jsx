import React, { useState, useEffect } from 'react';
import './Banner.css';

const Banner = () => {
  const images = [
    'https://placehold.co/1200x500/000000/39ff14?text=NEW+DROP:+CYBER+COLLECTION',
    'https://placehold.co/1200x500/111111/39ff14?text=SALE+UP+TO+50%',
    'https://placehold.co/1200x500/222222/39ff14?text=LIMITED+EDITION+GEAR',
    'https://placehold.co/1200x500/050505/39ff14?text=STREETWEAR+REDEFINED',
    'https://placehold.co/1200x500/1a1a1a/39ff14?text=JOIN+THE+VOID',
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="banner-slider">
      {images.map((img, index) => (
        <div 
          key={index} 
          className={`slide ${index === current ? 'active' : ''}`}
          style={{ backgroundImage: `url(${img})` }}
        >
          <div className="slide-content">
            {/* Optional text overlay if not in image */}
          </div>
        </div>
      ))}
      <div className="dots">
        {images.map((_, index) => (
          <span 
            key={index} 
            className={`dot ${index === current ? 'active' : ''}`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
