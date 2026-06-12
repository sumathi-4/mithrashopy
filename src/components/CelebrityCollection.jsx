import React from 'react';
import celebSaree from '../assets/celeb_saree.jpg';
import celebKid from '../assets/celeb_kid.jpg';
import celebCouple from '../assets/celeb_couple.jpg';

export default function CelebrityCollection() {
  const handleNavigation = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };


  return (
    <section id="celebrity-collection" className="celebrity-section">

      <div className="section-container">
        
        {/* Section Header */}
        <div className="section-header">
          <svg className="section-crown-icon" viewBox="0 0 100 40">
            <path d="M 15,35 L 85,35 L 80,18 L 65,26 L 50,10 L 35,26 L 20,18 Z M 15,37 L 85,37 L 85,39 L 15,39 Z" />
          </svg>
          <h2 className="section-title animate-glow">Celebrity Collection</h2>
          <p className="section-subtitle">Premium curation inspired by direct celebrity choices and authentic designs</p>
        </div>

        {/* Layout Container */}
        <div className="celebrity-layout">
          
          {/* Left Large Card: Suriya & Jyothika */}
          <div className="celeb-card celeb-card-large">
            <div className="celeb-img-container">
              <img 
                src={celebCouple} 
                alt="Suriya & Jyothika - Celebrity Collection" 
                className="celeb-img"
              />
              <div className="celeb-gradient-overlay"></div>
            </div>

            
            <div className="celeb-content">
              <span className="celeb-badge">CELEBRITY COLLECTION</span>
              <h3 className="celeb-title">Inspired By Celebrity Style</h3>
              <p className="celeb-desc">
                Curated looks & premium styling inspired by the stars
              </p>
              <button 
                className="celeb-btn"
                onClick={() => handleNavigation('/shop?collection=celebrity')}
              >
                Explore Collection
              </button>
            </div>
            {/* Shimmer sweep animation overlay */}
            <div className="celeb-shimmer-sweep"></div>
          </div>

          {/* Right Panel containing 2 Stacked Cards */}
          <div className="celeb-right-panel">
            
            {/* Top Right Card: Kid Pavadai Lehenga using newly uploaded kid image */}
            <div className="celeb-card celeb-card-small celeb-card-pink">
              <div className="celeb-content-inner">
                <div className="celeb-text-side">
                  <span className="celeb-mini-badge text-pink">ACCESSORIES & FANCY</span>
                  <h4 className="celeb-small-title">Style That Makes You Shine</h4>
                  <button 
                    className="celeb-small-btn"
                    onClick={() => handleNavigation('/shop?category=accessories')}
                  >
                    Shop Now
                  </button>
                </div>
                
                <div className="celeb-img-side">
                  <img 
                    src={celebKid} 
                    alt="Traditional Pavadai Lehenga kid fashion" 
                    className="celeb-side-img"
                  />
                </div>
              </div>
              {/* Shimmer sweep animation overlay */}
              <div className="celeb-shimmer-sweep"></div>
            </div>

            {/* Bottom Right Card: Nayanthara Saree using newly uploaded celebrity image */}
            <div className="celeb-card celeb-card-small celeb-card-gold">
              <div className="celeb-content-inner">
                <div className="celeb-text-side">
                  <span className="celeb-mini-badge text-gold">GIFTS COLLECTION</span>
                  <h4 className="celeb-small-title">Perfect Gifts For Every Occasion</h4>
                  <button 
                    className="celeb-small-btn"
                    onClick={() => handleNavigation('/shop?category=gifts')}
                  >
                    Explore Gifts
                  </button>
                </div>
                
                <div className="celeb-img-side">
                  <img 
                    src={celebSaree} 
                    alt="Nayanthara Premium Silk/Linen Saree style" 
                    className="celeb-side-img"
                  />
                </div>
              </div>
              {/* Shimmer sweep animation overlay */}
              <div className="celeb-shimmer-sweep"></div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

