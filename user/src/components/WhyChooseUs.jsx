import React from 'react';
import whyChooseModelImg from '../assets/fashion_model_sunglasses.png';

export default function WhyChooseUs() {
  const handleNavigation = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <section className="why-choose-section">
      <div className="why-choose-container">
        
        {/* Left Side: Image with Overlapping Card */}
        <div className="why-choose-left">
          <div className="why-image-wrapper">
            <img 
              src={whyChooseModelImg} 
              alt="Mithra Shopy Premium Collection" 
              className="why-main-image"
            />
            {/* Overlapping Badge Card */}
            <div className="why-overlapping-card">
              <span className="why-card-badge">PREMIUM</span>
              <h3 className="why-card-title">Luxury Boutique Fashion</h3>
              <p className="why-card-desc">
                Elegant premium collections designed for modern fashion lovers.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Text details, metrics, button */}
        <div className="why-choose-right">
          <span className="why-commitment-tag">OUR COMMITMENT</span>
          <h2 className="why-main-title">Why Choose Mithra Shopy</h2>
          <p className="why-main-desc">
            Explore our handpicked premium fashion, boutique accessories, luxury gifts, and celebrity-inspired collections crafted with timeless elegance. We bring you direct-from-weaver boutique items that guarantee true value, authentic fabrics, and absolute customer trust.
          </p>

          <div className="why-metrics-grid">
            <div className="why-metric-item">
              <span className="why-metric-value">5K+</span>
              <span className="why-metric-label">Happy Customers</span>
            </div>
            <div className="why-metric-item">
              <span className="why-metric-value">500+</span>
              <span className="why-metric-label">Premium Products</span>
            </div>
            <div className="why-metric-item">
              <span className="why-metric-value">4.9</span>
              <span className="why-metric-label">Customer Rating</span>
            </div>
          </div>

          <button 
            className="why-explore-btn"
            onClick={() => handleNavigation('/Shop')}
          >
            Explore Premium
          </button>
        </div>

      </div>
    </section>
  );
}
