import React from 'react';
import { Heart, ShieldCheck, Award, Sparkles, Compass, Users } from 'lucide-react';

export default function AboutView() {
  const stats = [
    { value: "50,000+", label: "Happy Customers" },
    { value: "10+", label: "Celebrity Cooperations" },
    { value: "100%", label: "Handcrafted Quality" },
    { value: "24/7", label: "Dedicated Support" }
  ];

  const values = [
    {
      icon: <Award size={28} />,
      title: "Authentic Craftsmanship",
      description: "We work directly with traditional artisans across Tamil Nadu and India to bring you authentic, meticulously crafted products that showcase our rich heritage."
    },
    {
      icon: <Heart size={28} />,
      title: "Customer Delight",
      description: "Our customers are at the heart of everything we do. From customized sizing to tailored gift hampers, we strive to exceed your expectations on every single order."
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Premium Materials Only",
      description: "No compromises. Whether it's Kanchipuram silk, gold-plated jewelry, or luxury stationery paper, we source only the finest sustainable materials."
    }
  ];

  return (
    <div className="about-view-page">
      
      {/* 1. Hero Header */}
      <section className="about-hero">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content animate-fade-in-up">
          <span className="about-hero-tag">ESTD 2024</span>
          <h1 className="about-hero-title">Crafting Elegant Lifestyles</h1>
          <p className="about-hero-subtitle">The Story of MithiraShoppy</p>
          <div className="about-hero-divider">
            <svg viewBox="0 0 100 20" className="about-divider-svg">
              <path d="M 35,10 L 65,10 L 60,3 L 50,8 L 40,3 Z" fill="var(--gold-accent)" />
            </svg>
          </div>
        </div>
      </section>

      {/* 2. Brand Story / Journey */}
      <section className="about-journey-section">
        <div className="about-inner-container">
          <div className="about-journey-layout">
            
            {/* Left: Interactive Story Text */}
            <div className="about-journey-text-block">
              <span className="about-section-tag">OUR ORIGINS</span>
              <h2 className="about-journey-title">Designed with Love, Inspired by Heritage</h2>
              <p className="about-journey-desc">
                MithiraShoppy began with a simple vision: to bridge the gap between traditional Indian craftsmanship and modern lifestyle needs. What started as a small curation of handcrafted ornaments has blossomed into a premium boutique offering exquisite clothing, custom stationery, luxury gifts, and unique accessories.
              </p>
              <p className="about-journey-desc">
                Every product in our catalog tells a story. We believe in slow fashion, high quality, and supporting the artisan communities that keep centuries-old crafts alive. By combining time-tested techniques with contemporary designs, we bring you items that feel both premium and personal.
              </p>
            </div>

            {/* Right: Creative Visual Grid */}
            <div className="about-journey-images">
              <div className="about-img-box img-box-large">
                <img 
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80" 
                  alt="Aesthetic workspace & journals" 
                  className="about-grid-img"
                />
                <div className="img-glow-overlay"></div>
              </div>
              <div className="about-img-box img-box-small">
                <img 
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80" 
                  alt="Crafted ethnic jewelry ornament" 
                  className="about-grid-img"
                />
                <div className="img-glow-overlay"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Dynamic Stats Banner */}
      <section className="about-stats-banner">
        <div className="about-inner-container">
          <div className="about-stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="about-stat-item">
                <span className="about-stat-value">{stat.value}</span>
                <span className="about-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Core Values (Glassmorphism & Interactive Cards) */}
      <section className="about-values-section">
        <div className="about-inner-container">
          
          <div className="about-values-header">
            <span className="about-section-tag centered">WHAT WE STAND FOR</span>
            <h2 className="about-values-main-title">Our Core Values</h2>
            <p className="about-values-subtitle">Guiding principles behind every product we design and build</p>
          </div>

          <div className="about-values-grid">
            {values.map((val, idx) => (
              <div key={idx} className="about-value-card">
                <div className="about-value-icon-circle">
                  {val.icon}
                </div>
                <h3 className="about-value-card-title">{val.title}</h3>
                <p className="about-value-card-desc">{val.description}</p>
                <div className="about-value-card-shimmer"></div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Founder's Quote Banner with Moving Gradient */}
      <section className="about-founder-banner">
        <div className="about-inner-container">
          <div className="about-founder-card">
            <div className="about-founder-quote-mark">“</div>
            <p className="about-founder-quote-text">
              We do not just sell products; we deliver stories of culture, warmth, and attention to detail. Every box packaged is a promise of premium quality and happiness delivered right to your doorstep.
            </p>
            <div className="about-founder-signature">
              <span className="founder-name">Sumathi S.</span>
              <span className="founder-title">Founder, MithiraShoppy</span>
            </div>
            <div className="about-founder-border-glow"></div>
          </div>
        </div>
      </section>

      {/* 6. Why Choose Us / Badges */}
      <section className="about-why-us">
        <div className="about-inner-container">
          <div className="about-why-us-grid">
            
            <div className="about-why-item">
              <Compass className="about-why-icon" />
              <h3>Pan-India Sourcing</h3>
              <p>Hand-picked treasures and fabrics from the most skilled pockets of India.</p>
            </div>

            <div className="about-why-item">
              <Sparkles className="about-why-icon" />
              <h3>Custom Curation</h3>
              <p>Personalized hampers, gift engravings, and tailored styling to fit your vibe.</p>
            </div>

            <div className="about-why-item">
              <Users className="about-why-icon" />
              <h3>Artisan Support</h3>
              <p>A portion of every sale goes back to supporting micro-artisans and rural weavers.</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
