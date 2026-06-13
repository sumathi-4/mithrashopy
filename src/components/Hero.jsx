import React, { useState, useEffect } from 'react';
import imgClothing from '../assets/hero_clothing.jpg';
import imgStationery from '../assets/hero_stationery.jpg';
import imgGifts from '../assets/hero_gifts.jpg';
import imgAccessories from '../assets/hero_accessories.jpg';

const SLIDE_INTERVAL = 2000; // Shorter transition delay: 2.0 seconds

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      category: "Clothing",
      title: "Fashion For Every Generation",
      subtitle: "Traditional, Modern & Trendy Collections For Men, Women & Kids",
      cta: "Shop Clothing",
      image: imgClothing,
      themeColor: "Elegant Red",
      alt: "Fashion For Every Generation"
    },
    {
      id: 2,
      category: "Stationery",
      title: "Create, Learn & Inspire",
      subtitle: "Premium Notebooks, Journals, Pens & Creative Essentials",
      cta: "Explore Stationery",
      image: imgStationery,
      themeColor: "Sky Blue",
      alt: "Create, Learn & Inspire"
    },
    {
      id: 3,
      category: "Gifts",
      title: "Gifts That Create Memories",
      subtitle: "Birthday, Wedding, Anniversary & Return Gifts",
      cta: "Shop Gifts",
      image: imgGifts,
      themeColor: "Soft Pink",
      alt: "Gifts That Create Memories"
    },
    {
      id: 4,
      category: "Accessories & Fancy",
      title: "Complete Your Style",
      subtitle: "Jewelry, Fancy Items & Everyday Accessories",
      cta: "Explore Accessories",
      image: imgAccessories,
      themeColor: "Brown + Gold",
      alt: "Complete Your Style"
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
              className="hero-image"
            />
            <div className="slide-overlay"></div>
          </div>
        ))}

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
        <div key={currentSlide} className="hero-text-card">
          <span className="hero-tag">{slides[currentSlide].category}</span>
          <h2 className="hero-title">{slides[currentSlide].title}</h2>
          <p className="hero-subtitle">{slides[currentSlide].subtitle}</p>
          <div className="hero-btn-group">
            <button 
              className="hero-btn primary-btn"
              onClick={() => {
                window.history.pushState({}, '', '/Shop');
                window.dispatchEvent(new Event('popstate'));
              }}
            >
              {slides[currentSlide].cta}
            </button>
            <button 
              className="hero-btn secondary-btn"
              onClick={() => {
                window.history.pushState({}, '', '/Shop');
                window.dispatchEvent(new Event('popstate'));
              }}
            >
              View Collection
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
