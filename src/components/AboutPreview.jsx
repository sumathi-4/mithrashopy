import React from 'react';

export default function AboutPreview() {
  const handleNavigation = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <section className="about-preview-section">
      <div className="section-container">
        <div className="about-preview-layout">
          
          <div className="about-preview-content">
            <span className="section-tag-mini" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E94FA8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>OUR STORY</span>
            <h2 className="about-preview-title">Elegant Heritage, Contemporary Style</h2>
            <p className="about-preview-text">
              Welcome to MithiraShoppy, your boutique destination for curated fashion, premium stationery, luxury gifts, and stylish accessories. We combine authentic craftsmanship with modern trends to bring you collections that inspire confidence and bring joy.
            </p>
            <p className="about-preview-text">
              Every piece in our catalog is thoughtfully sourced and curated to ensure premium quality, affordable pricing, and absolute delight. Start your boutique shopping journey with us today and feel the difference.
            </p>
            <button 
              className="about-preview-btn"
              onClick={() => handleNavigation('/About')}
            >
              Learn More
            </button>
          </div>

          <div className="about-preview-image-side">
            <div className="about-image-frame">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80" 
                alt="MithiraShoppy Boutique Interior" 
                className="about-preview-img"
              />
              <div className="about-frame-border"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
