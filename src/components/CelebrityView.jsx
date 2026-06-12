import React, { useState } from 'react';
import { Star, Heart, Sparkles, User, ShoppingBag, ArrowRight } from 'lucide-react';
import celebCouple from '../assets/celeb_couple.jpg';
import celebSaree from '../assets/celeb_saree.jpg';
import celebKid from '../assets/celeb_kid.jpg';
import celebKeerthy from '../assets/celeb_keerthy.jpg';
import celebDulquer from '../assets/celeb_dulquer.jpg';

export default function CelebrityView() {
  const [activeCelebTab, setActiveCelebTab] = useState('couple');
  const [wishlist, setWishlist] = useState([]);

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const handleShopNavigation = (category) => {
    window.history.pushState({}, '', `/Shop?category=${category}`);
    window.dispatchEvent(new Event('popstate'));
  };

  const celebrities = {
    couple: {
      name: "Suriya & Jyothika",
      role: "Actors & Power Couple",
      image: celebCouple,
      quote: "Fashion is about comfort, elegance, and celebrating who you are. We love outfits that speak of our traditions while remaining modern and easy to wear.",
      closetItems: [
        {
          id: 'sc1',
          title: "Premium Handwoven Banarasi Silk Saree",
          category: "clothing",
          price: "₹8,999",
          image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: 'sc2',
          title: "Men's Classic Khadi Veshti & Kurta Set",
          category: "clothing",
          price: "₹2,500",
          image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: 'sc3',
          title: "Traditional Gold Plated Temple Haram",
          category: "accessories",
          price: "₹3,200",
          image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
        }
      ]
    },
    nayanthara: {
      name: "Nayanthara",
      role: "Actress & Fashion Icon",
      image: celebSaree,
      quote: "Every look is an expression of grace. Traditional temple ornaments and pure linen silk sarees hold a special place in my wardrobe.",
      closetItems: [
        {
          id: 'ny1',
          title: "Exquisite Kundan Choker Necklace",
          category: "accessories",
          price: "₹1,500",
          image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: 'ny2',
          title: "Kanchipuram Silk Editorial Saree",
          category: "clothing",
          price: "₹12,000",
          image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: 'ny3',
          title: "Royal Jasmine Hair Gajra Ornament",
          category: "accessories",
          price: "₹450",
          image: "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?auto=format&fit=crop&w=600&q=80"
        }
      ]
    },
    keerthy: {
      name: "Keerthy Suresh",
      role: "Actress & Youth Ambassador",
      image: celebKeerthy,
      quote: "Bright colors, fresh florals, and matching accessories define my style. I enjoy blending tradition with lightweight designs that allow me to dance and enjoy festivals.",
      closetItems: [
        {
          id: 'ks1',
          title: "Pastel Pavadai Lehenga Set",
          category: "clothing",
          price: "₹4,999",
          image: celebKid
        },
        {
          id: 'ks2',
          title: "Antique Ginkgo Leaf Premium Ring",
          category: "accessories",
          price: "₹500",
          image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: 'ks3',
          title: "Festive Occasion Floral Hampers",
          category: "gifts",
          price: "₹1,800",
          image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80"
        }
      ]
    },
    dulquer: {
      name: "Dulquer Salmaan",
      role: "Actor & Style Influencer",
      image: celebDulquer,
      quote: "Simple edits, clean cuts, and high-quality materials. Whether it's a minimal linen kurta or a well-crafted journal, I prioritize materials that have character and durability.",
      closetItems: [
        {
          id: 'dq1',
          title: "Slim-fit Linen Festival Kurta",
          category: "clothing",
          price: "₹1,999",
          image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: 'dq2',
          title: "Premium Gold-embossed Journal Set",
          category: "stationery",
          price: "₹850",
          image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: 'dq3',
          title: "Minimalist Brass Pen & Stand",
          category: "stationery",
          price: "₹450",
          image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80"
        }
      ]
    }
  };

  return (
    <div className="celebrity-view-page">
      <div className="celeb-view-container">
        
        {/* 1. Page Header */}
        <div className="celeb-header-section">
          <div className="celeb-crown-icon">
            <svg viewBox="0 0 100 40" className="celeb-crown-svg">
              <path d="M 15,35 L 85,35 L 80,18 L 65,26 L 50,10 L 35,26 L 20,18 Z M 15,37 L 85,37 L 85,39 L 15,39 Z" fill="var(--gold-accent)" />
            </svg>
          </div>
          <h1 className="celeb-main-title">Celebrity Closet</h1>
          <p className="celeb-subtitle">Discover curated collections inspired by the style statements of your favorite stars</p>
        </div>

        {/* 2. Interactive Profile Tabs & Slider */}
        <section className="celeb-showcase-section">
          
          <div className="celeb-showcase-tabs">
            {Object.keys(celebrities).map((key) => (
              <button
                key={key}
                className={`celeb-tab-btn ${activeCelebTab === key ? 'active' : ''}`}
                onClick={() => setActiveCelebTab(key)}
              >
                <User size={14} className="celeb-tab-icon" />
                <span>{celebrities[key].name}</span>
              </button>
            ))}
          </div>

          <div className="celeb-profile-card animate-fade-in">
            <div className="celeb-profile-layout">
              
              {/* Left Column: Image wrapper */}
              <div className="celeb-profile-image-box">
                <img 
                  src={celebrities[activeCelebTab].image} 
                  alt={celebrities[activeCelebTab].name} 
                  className="celeb-profile-img animate-scale-in"
                  key={activeCelebTab}
                />
                <div className="celeb-profile-img-overlay"></div>
              </div>

              {/* Right Column: Bio details & Quote */}
              <div className="celeb-profile-info-box">
                <div className="celeb-role-badge">
                  <Star size={12} fill="currentColor" />
                  <span>{celebrities[activeCelebTab].role}</span>
                </div>
                
                <h2 className="celeb-profile-name">{celebrities[activeCelebTab].name}</h2>
                
                <blockquote className="celeb-profile-quote">
                  "{celebrities[activeCelebTab].quote}"
                </blockquote>

                <div className="celeb-signature-divider">
                  <span>MITHIRA SELECTS</span>
                  <div className="gold-dot-line"></div>
                </div>

                <p className="celeb-profile-meta">
                  Explore {celebrities[activeCelebTab].name}'s curated essentials, selected exclusively to match their signature appearances.
                </p>
              </div>

            </div>
          </div>

        </section>

        {/* 3. Celebrity Closets Products Grid */}
        <section className="celeb-closet-products-section">
          <div className="closet-header-row">
            <Sparkles size={18} className="text-gold" />
            <h2 className="section-block-title">Curated Closet</h2>
          </div>

          <div className="celeb-products-grid animate-fade-in-up" key={`${activeCelebTab}-grid`}>
            {celebrities[activeCelebTab].closetItems.map((item) => (
              <div key={item.id} className="celeb-item-card">
                
                {/* Image side */}
                <div className="celeb-item-img-wrapper">
                  <button 
                    className={`celeb-item-wishlist ${wishlist.includes(item.id) ? 'active' : ''}`}
                    onClick={() => toggleWishlist(item.id)}
                    aria-label="Add to Wishlist"
                  >
                    <Heart size={16} fill={wishlist.includes(item.id) ? "var(--primary-rose)" : "none"} />
                  </button>

                  <img src={item.image} alt={item.title} className="celeb-item-img" />
                  <div className="celeb-item-img-overlay"></div>
                </div>

                {/* Content side */}
                <div className="celeb-item-content">
                  <span className="celeb-item-tag">{item.category}</span>
                  <h3 className="celeb-item-title">{item.title}</h3>
                  
                  <div className="celeb-item-footer">
                    <span className="celeb-item-price">{item.price}</span>
                    <button 
                      className="celeb-item-shop-btn"
                      onClick={() => handleShopNavigation(item.category)}
                    >
                      <span>Get Look</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Glow border decorative markup */}
                <div className="celeb-item-glow"></div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
