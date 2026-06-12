import React, { useState, useEffect } from 'react';

const SLIDE_INTERVAL = 2000; // Shorter transition delay: 2.0 seconds

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Expanded gallery featuring Tamil Nadu traditional, kids, men, western wear, gifts, and accessories
  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?auto=format&fit=crop&w=1600&q=80",
      alt: "Tamil Nadu Classical Bharatanatyam Culture & Art"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1601342502621-396ec2b9db30?auto=format&fit=crop&w=1600&q=80",
      alt: "Indian Kid Traditional Pattu Pavadai / Saree"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1602052865955-fc42c943ea6a?auto=format&fit=crop&w=1600&q=80",
      alt: "South Indian Bride Tamil Nadu Kanchipuram Silk Silk Saree"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=80",
      alt: "Traditional Indian Men Festival Wear Kurta & Veshti Style"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1600&q=80",
      alt: "Modern Indian Western Dress Model"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80",
      alt: "Traditional Tamil Nadu Style Temple Jewelry & Accessories"
    },
    {
      id: 7,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=80",
      alt: "Luxury Hampers, Festive Gifts & Shopping Boxes"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section id="home" className="hero-container full-width-hero">

      {/* Background Auto-Slider (Spans full width) */}
      <div className="hero-slider-wrapper">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="slide-img"
            />
            <div className="slide-overlay"></div>
          </div>
        ))}

        {/* Floating Promotion Badge */}
        <div className="promo-badge">
          <span className="promo-badge-text-top">Up To</span>
          <span className="promo-badge-text-middle">50%</span>
          <span className="promo-badge-text-bottom">Off</span>
        </div>

        {/* Slide Indicator Controls */}
        <div className="slider-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>

      {/* Foreground Content Card (Left-aligned overlay) */}
      <div className="hero-content">
        <div className="hero-text-card">
          <span className="hero-tag">New Collection</span>
          <h2 className="hero-title">Elegant Ethnic Wear Collection</h2>
          <p className="hero-subtitle">Timeless Beauty, Modern You</p>
          <button 
            className="hero-btn"
            onClick={() => {
              window.history.pushState({}, '', '/Shop');
              window.dispatchEvent(new Event('popstate'));
            }}
          >
            Shop Now
          </button>
        </div>
      </div>
    </section>
  );
}

