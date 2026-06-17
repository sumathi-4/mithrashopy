import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import pHairUpdated from '../assets/p_hair_updated.jpg';
import pRing from '../assets/p_ring.jpg';
import pAnklet from '../assets/p_anklet.jpg';
import pNeck from '../assets/p_neck.jpg';
import logoImg from '../assets/logo.png';

export default function PremiumCollection() {
  const [wishlist, setWishlist] = useState([]);

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const handleNavigation = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  // Decreased amount of products from 4 to 3, and using the newly uploaded premium accessory images
  const premiumProducts = [
    {
      id: 'p1',
      title: "Royal Jasmine Hair Gajra Ornament",
      price: "₹450",
      image: pHairUpdated
    },
    {
      id: 'p2',
      title: "Antique Ginkgo Leaf Premium Ring",
      price: "₹500",
      image: pRing
    },
    {
      id: 'p3',
      title: "Exquisite Kundan Choker Necklace",
      price: "₹1,500",
      image: pNeck
    }
  ];


  return (
    <section className="premium-collection-section">
      <div className="premium-full-width-container">
        
        {/* Luxury Gold Header */}
        <div className="premium-header">
          <span className="premium-subtitle-tag">EXCLUSIVELY CRAFTED</span>
          <h2 className="premium-title">Premium Collection</h2>
          <div className="premium-gold-divider">
            <img src={logoImg} className="premium-divider-crown" alt="Logo" style={{ objectFit: 'contain' }} />
          </div>
        </div>

        {/* Full-width Product Grid (Modified to 3 Columns for bigger cards) */}
        <div className="premium-grid premium-grid-three">
          {premiumProducts.map((prod) => (
            <div key={prod.id} className="premium-product-card big-card-premium">
              
              {/* Product Image Area */}
              <div className="premium-img-wrapper big-img-wrapper">
                
                <div className="premium-card-crown">
                  <img src={logoImg} className="card-crown-svg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>

                {/* Wishlist Button (Top-Right) */}
                <button 
                  className={`premium-wishlist-btn ${wishlist.includes(prod.id) ? 'active' : ''}`}
                  onClick={() => toggleWishlist(prod.id)}
                  aria-label="Add to Wishlist"
                >
                  <Heart size={16} fill={wishlist.includes(prod.id) ? "var(--gold-accent)" : "none"} />
                </button>

                <img src={prod.image} alt={prod.title} className="premium-img" />
                <div className="premium-card-overlay"></div>
              </div>

              {/* Product Info Block */}
              <div className="premium-info">
                <h3 className="premium-prod-title">{prod.title}</h3>
                <div className="premium-price-row">
                  <span className="premium-price">{prod.price}</span>
                  <button 
                    className="premium-buy-btn"
                    onClick={() => handleNavigation('/shop?category=accessories')}
                  >
                    Examine
                  </button>
                </div>
              </div>

              {/* Border shine effect markup */}
              <div className="premium-border-shine"></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
