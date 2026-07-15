import React from 'react';
import heroBanner from '../assets/hero_main_banner.jpg';

export default function Hero() {
  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <section id="home" className="hero-container full-width-hero">
      {/* ── Full-width background image ── */}
      <div className="hero-bg-wrap">
        <img
          src={heroBanner}
          alt="MithraShoppy – Fashion, Gifts & Accessories"
          className="hero-bg-img"
        />
        {/* Left-side fade so text stays readable */}
        <div className="hero-bg-overlay" />
      </div>

      {/* ── Left tagline content ── */}
      <div className="hero-content">
        <div className="hero-text-card">
          {/* Top micro-label (like "NEW COLLECTION" in image3) */}
          <span className="hero-micro-label">New Collection</span>

          {/* Main headline — two-colour serif font matching image2 */}
          <h1 className="hero-title">
            Premium Lifestyle.<br />
            <span className="hero-title-gold">Thoughtful Gifting.</span>
          </h1>

          {/* Sub copy */}
          <p className="hero-subtitle">
            Discover our curated collection of fine clothing, designer stationery, elegant accessories, and perfect gifts for every special occasion.
          </p>

          {/* Buttons — image3 style: dark filled + ghost */}
          <div className="hero-btn-group">
            <button
              className="hero-btn hero-btn-primary"
              onClick={() => navigateTo('/Shop')}
            >
              Shop Now
            </button>
            <button
              className="hero-btn hero-btn-ghost"
              onClick={() => navigateTo('/NewArrivals')}
            >
              <span className="hero-play-icon" aria-hidden="true">▶</span>
              New Arrivals
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
