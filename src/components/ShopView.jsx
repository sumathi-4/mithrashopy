import React, { useState, useEffect } from 'react';
import { Heart, Star, ShoppingCart, Search, ArrowUpDown } from 'lucide-react';
import pHairUpdated from '../assets/p_hair_updated.jpg';
import pRing from '../assets/p_ring.jpg';
import pNeck from '../assets/p_neck.jpg';

export default function ShopView() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

  // Parse category filter from URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    if (catParam) {
      setActiveTab(catParam.toUpperCase());
    }

    const handlePopState = () => {
      const updatedParams = new URLSearchParams(window.location.search);
      const updatedCat = updatedParams.get('category');
      if (updatedCat) {
        setActiveTab(updatedCat.toUpperCase());
      } else {
        setActiveTab('ALL');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const toggleCart = (id, title) => {
    if (cart.includes(id)) {
      setCart(cart.filter(item => item !== id));
      alert(`Removed ${title} from cart!`);
    } else {
      setCart([...cart, id]);
      alert(`Added ${title} to cart!`);
    }
  };

  const handleBackToHome = () => {
    window.history.pushState({}, '', '/#home');
    window.dispatchEvent(new Event('popstate'));
  };

  const allProducts = [
    {
      id: 'p1',
      title: "Royal Jasmine Hair Gajra Ornament",
      category: "ACCESSORIES",
      price: 450,
      rating: 5,
      reviews: 42,
      image: pHairUpdated,
      badge: "PREMIUM"
    },
    {
      id: 'p2',
      title: "Antique Ginkgo Leaf Premium Ring",
      category: "ACCESSORIES",
      price: 500,
      rating: 5,
      reviews: 29,
      image: pRing,
      badge: "PREMIUM"
    },
    {
      id: 'p3',
      title: "Exquisite Kundan Choker Necklace",
      category: "ACCESSORIES",
      price: 1500,
      rating: 5,
      reviews: 64,
      image: pNeck,
      badge: "PREMIUM"
    },
    {
      id: 't1',
      title: "Girls Anarkali Dress",
      category: "CLOTHING",
      price: 1699,
      rating: 5,
      reviews: 128,
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 't2',
      title: "Premium Handbag",
      category: "ACCESSORIES",
      price: 2499,
      rating: 5,
      reviews: 96,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 't3',
      title: "Premium Stationery Set",
      category: "STATIONERY",
      price: 699,
      rating: 5,
      reviews: 210,
      image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 't4',
      title: "Luxury Gift Hamper",
      category: "GIFTS",
      price: 1299,
      rating: 5,
      reviews: 176,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 't5',
      title: "Gold Plated Necklace",
      category: "ACCESSORIES",
      price: 2199,
      rating: 5,
      reviews: 134,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 't6',
      title: "Ladies Wrist Watch",
      category: "ACCESSORIES",
      price: 1599,
      rating: 5,
      reviews: 88,
      image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 'n1',
      title: "Floral Frock Dress",
      category: "CLOTHING",
      price: 1499,
      rating: 5,
      reviews: 42,
      image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW"
    },
    {
      id: 'n2',
      title: "Blue School Kit",
      category: "STATIONERY",
      price: 899,
      rating: 4,
      reviews: 18,
      image: "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW"
    },
    {
      id: 'n3',
      title: "Birthday Gift Box",
      category: "GIFTS",
      price: 1099,
      rating: 5,
      reviews: 35,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW"
    },
    {
      id: 'n4',
      title: "Traditional Jhumka",
      category: "ACCESSORIES",
      price: 1799,
      rating: 5,
      reviews: 58,
      image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW"
    },
    {
      id: 'n5',
      title: "Premium Notebook",
      category: "STATIONERY",
      price: 399,
      rating: 4,
      reviews: 14,
      image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW"
    },
    {
      id: 'n6',
      title: "Cotton Kurta Set",
      category: "CLOTHING",
      price: 1299,
      rating: 5,
      reviews: 64,
      image: "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW"
    }
  ];

  // Filtering products
  let filteredProducts = activeTab === 'ALL'
    ? allProducts
    : allProducts.filter(p => p.category === activeTab);

  if (searchQuery.trim() !== '') {
    filteredProducts = filteredProducts.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sorting products
  if (sortBy === 'PRICE_LOW_HIGH') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'PRICE_HIGH_LOW') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'RATING') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={13} 
        fill={i < rating ? "#d4af37" : "none"} 
        className={i < rating ? "star-filled" : "star-empty"}
        style={{ color: i < rating ? "#d4af37" : "#ccc" }}
      />
    ));
  };

  const getThemeClass = (category) => {
    switch (category) {
      case 'CLOTHING': return 'prod-theme-clothing';
      case 'GIFTS': return 'prod-theme-gifts';
      case 'STATIONERY': return 'prod-theme-stationery';
      case 'ACCESSORIES': return 'prod-theme-accessories';
      default: return '';
    }
  };

  return (
    <div className="shop-view-page">
      
      {/* Premium Shop Header Banner */}
      <div className="shop-banner">
        <div className="shop-banner-overlay"></div>
        <div className="shop-banner-content">
          <svg viewBox="0 0 100 40" className="shop-banner-crown">
            <path d="M 15,35 L 85,35 L 80,18 L 65,26 L 50,10 L 35,26 L 20,18 Z" fill="#d4af37" />
          </svg>
          <h1 className="shop-banner-title">MithiraShoppy Collections</h1>
          <p className="shop-banner-subtitle">Exquisite designs selected for elegant lifestyle and ethnic premium wear</p>
        </div>
      </div>

      <div className="shop-content-container">
        
        {/* Filters & Control bar */}
        <div className="shop-control-bar">
          
          {/* Categories Tab selector */}
          <div className="shop-categories-tabs">
            {['ALL', 'CLOTHING', 'STATIONERY', 'GIFTS', 'ACCESSORIES'].map((tab) => (
              <button
                key={tab}
                className={`shop-tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab);
                  // Update URL params silently
                  const newUrl = tab === 'ALL' ? '/Shop' : `/Shop?category=${tab.toLowerCase()}`;
                  window.history.pushState({}, '', newUrl);
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search and Sort controls */}
          <div className="shop-action-controls">
            
            <div className="shop-search-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="shop-search-input"
              />
            </div>

            <div className="shop-sort-box">
              <ArrowUpDown size={18} className="sort-icon" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="shop-sort-select"
              >
                <option value="DEFAULT">Sort By: Default</option>
                <option value="PRICE_LOW_HIGH">Price: Low to High</option>
                <option value="PRICE_HIGH_LOW">Price: High to Low</option>
                <option value="RATING">Rating: High to Low</option>
              </select>
            </div>

          </div>

        </div>

        {/* Product Grid View */}
        {filteredProducts.length > 0 ? (
          <div className="shop-products-grid">
            {filteredProducts.map((prod) => (
              <div key={prod.id} className={`product-card shop-prod-card ${getThemeClass(prod.category)}`}>
                
                <div className="prod-img-wrapper">
                  <span className="prod-badge">{prod.badge}</span>
                  
                  <button 
                    className={`prod-wishlist-btn ${wishlist.includes(prod.id) ? 'active' : ''}`}
                    onClick={() => toggleWishlist(prod.id)}
                    aria-label="Add to Wishlist"
                  >
                    <Heart size={18} fill={wishlist.includes(prod.id) ? "currentColor" : "none"} />
                  </button>
                  
                  <img src={prod.image} alt={prod.title} className="prod-img" />
                  
                  {/* Hover Quick Examine Details */}
                  <div className="shop-card-hover-overlay">
                    <button 
                      className="shop-add-cart-btn"
                      onClick={() => toggleCart(prod.id, prod.title)}
                    >
                      <ShoppingCart size={16} style={{ marginRight: '6px' }} />
                      {cart.includes(prod.id) ? "In Cart" : "Add to Cart"}
                    </button>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="prod-details">
                  <span className="prod-card-category">{prod.category}</span>
                  <h4 className="prod-card-title">{prod.title}</h4>
                  
                  <div className="prod-card-rating">
                    <div className="stars-wrapper">{renderStars(prod.rating)}</div>
                    <span className="reviews-count">({prod.reviews})</span>
                  </div>

                  <div className="prod-card-price-row">
                    <span className="prod-card-price">₹{prod.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Glowing animation shimmer element */}
                <div className="celeb-shimmer-sweep"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="shop-empty-state">
            <h3>No products found matching your criteria</h3>
            <p>Try checking your search query or selecting a different category filter</p>
          </div>
        )}

        {/* Back to homepage button */}
        <div className="shop-footer-actions">
          <button onClick={handleBackToHome} className="shop-back-home-btn">
            Back to Homepage
          </button>
        </div>

      </div>

    </div>
  );
}
