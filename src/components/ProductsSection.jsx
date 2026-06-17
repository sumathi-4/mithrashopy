import React, { useState, useEffect } from 'react';
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { apiService } from '../services/apiService';

export default function ProductsSection({ authUser, setAuthUser }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [wishlist, setWishlist] = useState(() => authUser?.wishlist || []);
  
  // Slider state for New Arrivals (index-based)
  const [currentArrivalIndex, setCurrentArrivalIndex] = useState(0);

  // Mock navigation function
  const handleNavigation = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  useEffect(() => {
    setWishlist(authUser?.wishlist || []);
  }, [authUser]);

  const toggleWishlist = (id) => {
    let updated;
    if (wishlist.includes(id)) {
      updated = wishlist.filter(item => item !== id);
      alert('Removed from wishlist!');
    } else {
      updated = [...wishlist, id];
      alert('Added to wishlist successfully!');
    }
    setWishlist(updated);
    if (authUser) {
      apiService.syncWishlist(updated).then(res => {
        if (res && setAuthUser) {
          setAuthUser(prev => {
            const newUser = { ...prev, wishlist: res };
            localStorage.setItem('mithira_auth_user', JSON.stringify(newUser));
            return newUser;
          });
        }
      });
    }
  };

  const trendingProducts = [
    {
      id: 't1',
      title: "Girls Anarkali Dress",
      category: "CLOTHING",
      price: "₹1,699",
      rating: 5,
      reviews: 128,
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 't2',
      title: "Premium Handbag",
      category: "ACCESSORIES",
      price: "₹2,499",
      rating: 5,
      reviews: 96,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 't3',
      title: "Premium Stationery Set",
      category: "STATIONERY",
      price: "₹699",
      rating: 5,
      reviews: 210,
      image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 't4',
      title: "Luxury Gift Hamper",
      category: "GIFTS",
      price: "₹1,299",
      rating: 5,
      reviews: 176,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 't5',
      title: "Gold Plated Necklace",
      category: "ACCESSORIES",
      price: "₹2,199",
      rating: 5,
      reviews: 134,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 't6',
      title: "Ladies Wrist Watch",
      category: "ACCESSORIES",
      price: "₹1,599",
      rating: 5,
      reviews: 88,
      image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    }
  ];

  const newArrivalsProducts = [
    {
      id: 'n1',
      title: "Floral Frock Dress",
      category: "CLOTHING",
      price: "₹1,499",
      rating: 5,
      reviews: 42,
      image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW",
      desc: "Vibrant traditional children's frock crafted in premium south cotton, featuring bright ethnic accents and details."
    },
    {
      id: 'n2',
      title: "Blue School Kit",
      category: "STATIONERY",
      price: "₹899",
      rating: 4,
      reviews: 18,
      image: "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW",
      desc: "An all-in-one premium study organizer set featuring pastel blue binders, designer pencils, and note kits."
    },
    {
      id: 'n3',
      title: "Birthday Gift Box",
      category: "GIFTS",
      price: "₹1,099",
      rating: 5,
      reviews: 35,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW",
      desc: "Thoughtfully curated celebration bundle containing custom premium boxes, ribbons, and hampers."
    },
    {
      id: 'n4',
      title: "Traditional Jhumka",
      category: "ACCESSORIES",
      price: "₹1,799",
      rating: 5,
      reviews: 58,
      image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW",
      desc: "Exquisite gold-plated jhumka earrings featuring premium micro-filigree beads and traditional temple design."
    },
    {
      id: 'n5',
      title: "Premium Notebook",
      category: "STATIONERY",
      price: "₹399",
      rating: 4,
      reviews: 14,
      image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW",
      desc: "Soft-bound luxury journal containing acid-free pages, ideal for sketching, calligraphy, and planning."
    },
    {
      id: 'n6',
      title: "Cotton Kurta Set",
      category: "CLOTHING",
      price: "₹1,299",
      rating: 5,
      reviews: 64,
      image: "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW",
      desc: "Premium organic cotton kurta paired with a matching dupatta, reflecting heritage ethnic motifs."
    }
  ];

  // Auto slider setup for New Arrivals
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentArrivalIndex((prev) => (prev + 1) % newArrivalsProducts.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [newArrivalsProducts.length]);

  const filteredTrending = activeTab === 'ALL'
    ? trendingProducts
    : trendingProducts.filter(p => p.category === activeTab);

  const getThemeClass = (category) => {
    switch (category) {
      case 'CLOTHING': return 'prod-theme-clothing';
      case 'GIFTS': return 'prod-theme-gifts';
      case 'STATIONERY': return 'prod-theme-stationery';
      case 'ACCESSORIES': return 'prod-theme-accessories';
      default: return '';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={13} 
        fill={i < rating ? "currentColor" : "none"} 
        className={i < rating ? "star-filled" : "star-empty"}
      />
    ));
  };

  const currentArrival = newArrivalsProducts[currentArrivalIndex];

  return (
    <div className="products-section-outer">
      
      {/* 1. TRENDING PRODUCTS (AJIO Top Trends Style: Big, Glassy, Premium Hover Anim) */}
      <section id="offers" className="trending-products-section">

        <div className="section-container">
          
          <div className="section-header">
            <img src={logoImg} className="section-crown-icon" alt="Logo" style={{ objectFit: 'contain' }} />
            <h2 className="section-title">Trending Products</h2>
            <p className="section-subtitle">AJIO Inspired Top Trends & Hot Deals</p>
          </div>

          {/* Tab Navigation Filter */}
          <div className="trending-tabs">
            {['ALL', 'CLOTHING', 'STATIONERY', 'GIFTS', 'ACCESSORIES'].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* AJIO-Style Grid of LARGE, GLASSY products */}
          <div className="products-grid ajio-trending-grid">
            {filteredTrending.map((product) => (
              <div key={product.id} className={`product-card ajio-big-card ${getThemeClass(product.category)}`}>
                
                <div className="prod-img-wrapper ajio-img-wrapper">
                  <span className="prod-badge">{product.badge}</span>
                  <button 
                    className={`prod-wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Add to Wishlist"
                  >
                    <Heart size={18} fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
                  </button>
                  <img src={product.image} alt={product.title} className="prod-img" />
                  
                  <div className="ajio-glass-overlay">
                    <h4 className="ajio-title">{product.title}</h4>
                    <div className="ajio-meta">
                      <span className="ajio-price">{product.price}</span>
                      <div className="ajio-rating">
                        <div className="stars-wrapper">{renderStars(product.rating)}</div>
                        <span className="reviews-count">({product.reviews})</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          <div className="section-footer-btn">
            <button 
              className="view-all-btn flex-center"
              onClick={() => handleNavigation('/Shop')}
            >
              View All Products
            </button>
          </div>

        </div>
      </section>

      {/* 2. NEW ARRIVALS (Full-width layout with bright solid themes and torn paper detail container) */}
      <section id="new-arrivals" className="new-arrivals-section full-width-arrivals-section">

        <div className="section-container full-width-container">

          <div className="section-header">
            <svg className="section-star-icon" viewBox="0 0 40 40" style={{ width: '40px', height: '40px', fill: 'var(--gold-accent)', marginBottom: '10px' }}>
              <path d="M 20,0 L 25,15 L 40,20 L 25,25 L 20,40 L 15,25 L 0,20 L 15,15 Z" />
            </svg>
            <h2 className="section-title">New Arrivals</h2>
            <p className="section-subtitle">Exhibition of Brighter Premium Collections</p>
          </div>

          {/* Kombu Layout Container styled as Full Width */}
          <div className={`kombu-layout-wrapper full-width-kombu ${getThemeClass(currentArrival.category)}`}>
            
            {/* Left Side: Brighter backdrop content containing Torn Paper Card */}
            <div className="kombu-left-panel">
              
              {/* Premium Torn Paper Backdrop Box */}
              <div className="torn-paper-card">
                
                {/* SVG Jagged Edge Torn Paper Path */}
                <div className="torn-paper-bg">
                  <svg viewBox="0 0 400 340" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
                    <path 
                      d="M 12,18 
                         Q 15,14 30,16 T 60,14 T 90,17 T 120,14 T 150,16 T 180,13 T 210,17 T 240,14 T 270,17 T 300,13 T 330,16 T 360,14 T 388,16
                         Q 391,14 388,28 T 390,60 T 387,90 T 390,120 T 387,150 T 390,180 T 387,210 T 390,240 T 387,270 T 390,298
                         Q 388,308 370,305 T 340,307 T 310,304 T 280,306 T 250,303 T 220,306 T 190,303 T 160,305 T 130,302 T 100,305 T 70,302 T 40,305 T 18,303
                         Q 10,305 13,290 T 11,260 T 14,230 T 11,200 T 13,170 T 10,140 T 13,110 T 10,80 T 13,50 T 11,28 Z" 
                      fill="#ffffff" 
                    />
                  </svg>
                </div>

                <div className="torn-paper-content">
                  <span className="kombu-badge">{currentArrival.badge}</span>
                  <h3 className="kombu-title">{currentArrival.title}</h3>
                  <p className="kombu-desc">{currentArrival.desc}</p>
                  
                  <div className="kombu-meta">
                    <span className="kombu-price">{currentArrival.price}</span>
                    <div className="kombu-rating">
                      <div className="stars-wrapper">{renderStars(currentArrival.rating)}</div>
                      <span className="reviews-count">({currentArrival.reviews} reviews)</span>
                    </div>
                  </div>

                  <div className="kombu-actions">
                    <button 
                      className="kombu-btn black-white-btn"
                      onClick={() => handleNavigation('/Shop')}
                    >
                      Examine Collection
                    </button>
                    <button 
                      className={`kombu-wish-btn black-white-btn ${wishlist.includes(currentArrival.id) ? 'active' : ''}`}
                      onClick={() => toggleWishlist(currentArrival.id)}
                      aria-label="Add to Wishlist"
                    >
                      <Heart size={20} fill={wishlist.includes(currentArrival.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Side: Enhanced tall portrait image viewport */}
            <div className="kombu-right-panel tall-image-panel">
              <div className="kombu-image-viewport">
                {newArrivalsProducts.map((product, index) => (
                  <div 
                    key={product.id}
                    className={`kombu-slide-img-box ${index === currentArrivalIndex ? 'active' : ''}`}
                  >
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="kombu-main-img" 
                    />
                    <div className="kombu-img-shadow-fade"></div>
                  </div>
                ))}
              </div>

              {/* Manual navigation keys */}
              <div className="kombu-nav-keys">
                <button 
                  className="nav-arrow"
                  onClick={() => setCurrentArrivalIndex((prev) => (prev - 1 + newArrivalsProducts.length) % newArrivalsProducts.length)}
                  aria-label="Previous Slide"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  className="nav-arrow"
                  onClick={() => setCurrentArrivalIndex((prev) => (prev + 1) % newArrivalsProducts.length)}
                  aria-label="Next Slide"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

            </div>

          </div>

          <div className="section-footer-btn">
            <button 
              className="view-all-btn flex-center"
              onClick={() => handleNavigation('/Shop')}
            >
              View All Products
            </button>
          </div>

        </div>
      </section>


    </div>
  );
}
