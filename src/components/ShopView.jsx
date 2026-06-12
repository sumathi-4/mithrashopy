import React, { useState, useEffect } from 'react';
import { Heart, Star, ShoppingCart, Search, ArrowUpDown, Eye, X, Phone } from 'lucide-react';
import pHairUpdated from '../assets/p_hair_updated.jpg';
import pRing from '../assets/p_ring.jpg';
import pNeck from '../assets/p_neck.jpg';
import celebCouple from '../assets/celeb_couple.jpg';
import celebKid from '../assets/celeb_kid.jpg';

export default function ShopView() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);
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
    const subParam = params.get('subcategory');
    if (subParam) {
      setActiveSubTab(subParam.toUpperCase());
    }

    const handlePopState = () => {
      const updatedParams = new URLSearchParams(window.location.search);
      const updatedCat = updatedParams.get('category');
      if (updatedCat) {
        setActiveTab(updatedCat.toUpperCase());
      } else {
        setActiveTab('ALL');
      }
      const updatedSub = updatedParams.get('subcategory');
      if (updatedSub) {
        setActiveSubTab(updatedSub.toUpperCase());
      } else {
        setActiveSubTab('ALL');
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
      subCategory: "KIDS",
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
      subCategory: "WOMEN",
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
      subCategory: "MEN",
      price: 1299,
      rating: 5,
      reviews: 64,
      image: "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW"
    },

    // TIKQ KIDSWEAR COLLECTION FROM PDF
    {
      id: 'k1',
      title: "Misty Bow Set",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 69,
      rating: 5,
      reviews: 42,
      image: celebKid,
      badge: "TIKQ KIDS",
      modelNo: "TQ-2",
      size: "4 yr",
      moq: "Per size 6 pcs",
      colours: "2 colours",
      fabric: "Looper",
      description: "Super soft matching set with floral detailing and a bow accent on top, designed for play and casual comfort."
    },
    {
      id: 'k2',
      title: "Kids Printed Set (Archival Soft)",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 163,
      rating: 5,
      reviews: 31,
      image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80",
      badge: "TIKQ KIDS",
      modelNo: "TQ-3",
      size: "2y, 4y, 6y",
      moq: "All size mix 3 pcs",
      colours: "5 colours",
      fabric: "Looper",
      description: "Comfortable nightwear set with soft elastic waistbands and all-over cartoon characters print."
    },
    {
      id: 'k3',
      title: "Kids Loungewear Printed Set",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 194,
      rating: 5,
      reviews: 29,
      image: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=600&q=80",
      badge: "TIKQ KIDS",
      modelNo: "TQ-4",
      size: "8y, 10y, 12y",
      moq: "All size mix 3 pcs",
      colours: "5 colours",
      fabric: "Looper",
      description: "Warm long-sleeved nightwear set featuring cute screen printed chest graphics and cozy matching pants."
    },
    {
      id: 'k4',
      title: "Jacquard Classic T-shirt",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 87,
      rating: 5,
      reviews: 54,
      image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80",
      badge: "TIKQ KIDS",
      modelNo: "TQ-6",
      size: "2y, 4y, 6y, 8y, 10y, 12y",
      moq: "Per size 10 pcs",
      colours: "10 colours",
      fabric: "Jacquard",
      description: "Aesthetic boys solid crew neck tee featuring textured jacquard breathable knits. Price varies by size (₹87 - ₹103)."
    },
    {
      id: 'k5',
      title: "Cozy Hat Design Tshirt",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 313,
      rating: 5,
      reviews: 18,
      image: "https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?auto=format&fit=crop&w=600&q=80",
      badge: "TIKQ PREMIUM",
      modelNo: "TQ-7",
      size: "6yr, 8yr, 10yr",
      moq: "All size mix 3 pcs",
      colours: "5 colours",
      fabric: "Freelancer",
      description: "Trendy sweatshirt with a raised tactile hat patch and string decorations on chest."
    },
    {
      id: 'k6',
      title: "Boys Fullsleve Patchwork Set",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 136,
      rating: 5,
      reviews: 24,
      image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80",
      badge: "TIKQ KIDS",
      modelNo: "TQ-14",
      size: "2y, 4y, 6y",
      moq: "All size mix 3 pcs",
      colours: "4 colours",
      fabric: "Waffel",
      description: "Cozy waffel knit sweatshirt with adorable animal patches (dog, panda) paired with joggers."
    },
    {
      id: 'k7',
      title: "Newborn Baby Rampers",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 188,
      rating: 5,
      reviews: 48,
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
      badge: "TIKQ BABY",
      modelNo: "TQ-148",
      size: "0-1M, 1-3M, 6-9M",
      moq: "Per size 4 pcs",
      colours: "4 colours",
      fabric: "Interlock Cotton",
      description: "Ultra soft, premium organic cotton baby suits with snap buttons for easy diapers access."
    },
    {
      id: 'k8',
      title: "Girls Dreamy Comfort Wear",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 220,
      rating: 5,
      reviews: 19,
      image: "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=600&q=80",
      badge: "TIKQ KIDS",
      modelNo: "TQ-161",
      size: "6Yr, 8Yr, 10Yr, 12Yr",
      moq: "Per size 4 pcs",
      colours: "4 colours",
      fabric: "T-Shirt Cotton Bio Wash, Pant Tesla",
      description: "Premium wide leg relaxed bottom set with a crop cut floral t-shirt."
    },

    // COUPLES
    {
      id: 'c1',
      title: "Royal Couple Silk Matching Set",
      category: "CLOTHING",
      subCategory: "COUPLES",
      price: 4500,
      rating: 5,
      reviews: 28,
      image: celebCouple,
      badge: "MATCHING"
    },
    {
      id: 'c2',
      title: "Linen Fusion Festive Couple Wear",
      category: "CLOTHING",
      subCategory: "COUPLES",
      price: 3800,
      rating: 5,
      reviews: 15,
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
      badge: "MATCHING"
    }
  ];

  // Filtering products
  let filteredProducts = activeTab === 'ALL'
    ? allProducts
    : allProducts.filter(p => p.category === activeTab);

  if (activeTab === 'CLOTHING' && activeSubTab !== 'ALL') {
    filteredProducts = filteredProducts.filter(p => p.subCategory === activeSubTab);
  }

  if (searchQuery.trim() !== '') {
    filteredProducts = filteredProducts.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const getThemeClass = (prod) => {
    if (prod.category === 'CLOTHING' && prod.subCategory === 'KIDS') {
      return 'prod-theme-kids';
    }
    switch (prod.category) {
      case 'CLOTHING': return 'prod-theme-clothing';
      case 'GIFTS': return 'prod-theme-gifts';
      case 'STATIONERY': return 'prod-theme-stationery';
      case 'ACCESSORIES': return 'prod-theme-accessories';
      default: return '';
    }
  };

  const getBannerContent = () => {
    if (activeTab === 'CLOTHING') {
      switch (activeSubTab) {
        case 'KIDS':
          return {
            title: "🧸 TIKQ Kids & Baby Boutique",
            subtitle: "Adorable, skin-friendly, and ultra-soft outfits designed for play and sweet comfort"
          };
        case 'COUPLES':
          return {
            title: "👩‍❤️‍👨 Festive Couple Collections",
            subtitle: "Stunning matching ethnic ensembles designed for premium celebrations and couples"
          };
        case 'MEN':
          return {
            title: "👔 Premium Men's Collections",
            subtitle: "Elegant shirts, casual wear, and traditional dhotis crafted for distinction"
          };
        case 'WOMEN':
          return {
            title: "💃 Designer Women's Wardrobe",
            subtitle: "Premium sarees, luxury kurtis, and ethnic wear styled for elegance"
          };
        default:
          return {
            title: "✨ MithiraShoppy Clothing",
            subtitle: "Trendy and traditional ethnic apparel selected for your entire family"
          };
      }
    } else if (activeTab === 'GIFTS') {
      return {
        title: "🎁 Handcrafted Gifts & Return Favors",
        subtitle: "Celebrate life's special moments with luxury hampers and custom return gifts"
      };
    } else if (activeTab === 'STATIONERY') {
      return {
        title: "✍️ Aesthetic Stationery & Planners",
        subtitle: "Premium journals, gold-embellished pens, and desk accessories to inspire creativity"
      };
    } else if (activeTab === 'ACCESSORIES') {
      return {
        title: "👑 Luxury Hair & Fashion Accessories",
        subtitle: "Authentic jasmine gajras, rings, and handcrafted details to elevate your style"
      };
    }
    
    return {
      title: "MithiraShoppy Boutique",
      subtitle: "Exquisite designs selected for elegant lifestyle and ethnic premium wear"
    };
  };

  const bannerContent = getBannerContent();

  return (
    <div className="shop-view-page">
      
      {/* Premium Shop Header Banner */}
      <div className="shop-banner">
        <div className="shop-banner-overlay"></div>
        <div className="shop-banner-content">
          <svg viewBox="0 0 100 40" className="shop-banner-crown">
            <path d="M 15,35 L 85,35 L 80,18 L 65,26 L 50,10 L 35,26 L 20,18 Z" fill="#d4af37" />
          </svg>
          <h1 className="shop-banner-title">{bannerContent.title}</h1>
          <p className="shop-banner-subtitle">{bannerContent.subtitle}</p>
        </div>
      </div>

      <div className="shop-content-container">
        
        {/* Filters & Control bar */}
        <div className="shop-control-bar">
          
          {/* Categories Tab selector with Subtabs under CLOTHING */}
          <div className="shop-categories-tabs" style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
              {['ALL', 'CLOTHING', 'STATIONERY', 'GIFTS', 'ACCESSORIES'].map((tab) => (
                <button
                  key={tab}
                  className={`shop-tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab);
                    setActiveSubTab('ALL');
                    // Update URL params silently
                    const newUrl = tab === 'ALL' ? '/Shop' : `/Shop?category=${tab.toLowerCase()}`;
                    window.history.pushState({}, '', newUrl);
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'CLOTHING' && (
              <div className="shop-subcategories-tabs">
                {['ALL', 'MEN', 'WOMEN', 'KIDS', 'COUPLES'].map((sub) => (
                  <button
                    key={sub}
                    className={`shop-subtab-btn ${activeSubTab === sub ? 'active' : ''} ${sub === 'KIDS' ? 'kids-subtab-btn' : ''}`}
                    onClick={() => {
                      setActiveSubTab(sub);
                      const newUrl = sub === 'ALL' 
                        ? `/Shop?category=clothing` 
                        : `/Shop?category=clothing&subcategory=${sub.toLowerCase()}`;
                      window.history.pushState({}, '', newUrl);
                    }}
                  >
                    {sub === 'ALL' && '✨ '}
                    {sub === 'MEN' && '👔 '}
                    {sub === 'WOMEN' && '💃 '}
                    {sub === 'KIDS' && '🧸 '}
                    {sub === 'COUPLES' && '👩‍❤️‍👨 '}
                    {sub}
                  </button>
                ))}
              </div>
            )}
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
          <div className="shop-products-grid animate-fade-in-up">
            {filteredProducts.map((prod) => (
              <div key={prod.id} className={`product-card shop-prod-card ${getThemeClass(prod)}`}>
                
                <div className="prod-img-wrapper">
                  <span className={`prod-badge ${prod.modelNo ? 'kids-glow-badge' : ''}`}>
                    {prod.subCategory === 'KIDS' ? '🧸 ' : ''}{prod.badge}
                  </span>
                  
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
                      onClick={(e) => { e.stopPropagation(); toggleCart(prod.id, prod.title); }}
                    >
                      <ShoppingCart size={16} style={{ marginRight: '6px' }} />
                      {cart.includes(prod.id) ? "In Cart" : "Add to Cart"}
                    </button>
                    <button 
                      className="shop-quick-btn"
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(prod); }}
                      style={{ 
                        marginTop: '10px',
                        backgroundColor: '#ffffff',
                        color: 'var(--text-dark)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '10px 16px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        transition: 'var(--transition)'
                      }}
                    >
                      Quick View
                    </button>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="prod-details">
                  <span className="prod-card-category">{prod.category} {prod.subCategory ? `| ${prod.subCategory}` : ''}</span>
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

      {/* Quick View Interactive Modal */}
      {selectedProduct && (
        <div className="modal-overlay animate-fade-in" onClick={() => setSelectedProduct(null)}>
          <div className="quickview-modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            
            {/* Close button */}
            <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>
              <X size={20} />
            </button>

            <div className="modal-layout">
              {/* Left Column: Image */}
              <div className="modal-image-side">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.title} 
                  className="modal-product-img" 
                />
                <div className="modal-image-shimmer"></div>
              </div>

              {/* Right Column: Info details */}
              <div className="modal-info-side">
                <span className="modal-category">{selectedProduct.category} {selectedProduct.subCategory ? `| ${selectedProduct.subCategory}` : ''}</span>
                <h2 className="modal-title">{selectedProduct.title}</h2>
                <span className="modal-price">₹{selectedProduct.price.toLocaleString()}</span>
                
                <p className="modal-desc">{selectedProduct.description || "Indulge in our handpicked selections crafted to match your cultural roots and premium choices."}</p>

                {/* Kids Custom Specs Grid from PDF */}
                {selectedProduct.modelNo && (
                  <div className="modal-kids-spec-box">
                    <strong style={{ color: 'var(--primary-rose-dark)', fontSize: '0.82rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🧸</span> TIKQ KIDSWEAR AUTHENTIC DETAILS:
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: '0.88rem', color: 'var(--text-dark)', marginTop: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🏷️</span>
                        <span><strong>Model No:</strong> {selectedProduct.modelNo}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🧵</span>
                        <span><strong>Fabric:</strong> {selectedProduct.fabric}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📏</span>
                        <span><strong>Sizes:</strong> {selectedProduct.size}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🎨</span>
                        <span><strong>Colours:</strong> {selectedProduct.colours}</span>
                      </span>
                      <span style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📦</span>
                        <span><strong>MOQ:</strong> {selectedProduct.moq}</span>
                      </span>
                    </div>
                  </div>
                )}

                <div className="modal-actions-row" style={{ marginTop: '25px' }}>
                  <button 
                    className="modal-add-cart-btn"
                    onClick={() => {
                      toggleCart(selectedProduct.id, selectedProduct.title);
                      setSelectedProduct(null);
                    }}
                  >
                    <ShoppingCart size={18} />
                    <span>{cart.includes(selectedProduct.id) ? "Remove from Cart" : "Add to Cart"}</span>
                  </button>
                  <button 
                    className={`modal-wish-btn ${wishlist.includes(selectedProduct.id) ? 'active' : ''}`}
                    onClick={() => toggleWishlist(selectedProduct.id)}
                  >
                    <Heart size={18} fill={wishlist.includes(selectedProduct.id) ? "var(--primary-rose)" : "none"} />
                  </button>
                </div>

                {/* WhatsApp Inquiry for TIKQ Products */}
                {selectedProduct.modelNo && (
                  <a 
                    href={`https://wa.me/916384438557?text=Hi, I am interested in TIKQ Kidswear product: ${selectedProduct.title} (Model: ${selectedProduct.modelNo}). Please provide details.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-whatsapp-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      backgroundColor: '#25D366',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 0',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      marginTop: '15px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <Phone size={16} />
                    <span>Inquire via WhatsApp (+91 6384438557)</span>
                  </a>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
