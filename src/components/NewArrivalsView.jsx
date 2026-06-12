import React, { useState } from 'react';
import { Sparkles, Eye, X, ShoppingCart, Heart, ArrowRight } from 'lucide-react';
import pHairUpdated from '../assets/p_hair_updated.jpg';
import pRing from '../assets/p_ring.jpg';
import pNeck from '../assets/p_neck.jpg';
import pAnklet from '../assets/p_anklet.jpg';

export default function NewArrivalsView() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeLookbookTab, setActiveLookbookTab] = useState('ethnic');
  const [wishlist, setWishlist] = useState([]);

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const lookbooks = {
    ethnic: {
      title: "Royal Ethnic Splendor",
      desc: "Traditional silhouettes reimagined with subtle modern borders, handwoven textures, and premium threads.",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      quote: "Bridging cultural heritage and contemporary beauty."
    },
    stationery: {
      title: "Gold-Leaf Writers Edit",
      desc: "Lined and unlined archival-grade paper journals decorated with vintage borders, matching ink sets, and classic designs.",
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      quote: "Pour your thoughts onto timeless premium sheets."
    },
    gifts: {
      title: "Golden Occasion Hampers",
      desc: "Custom-curated gift boxes packed with premium accessories, cultural items, gourmet sweeps, and rose petal aromas.",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
      quote: "The art of gifting, defined by elegant care."
    }
  };

  const newProducts = [
    {
      id: 'n1',
      title: "Royal Jasmine Hair Gajra Ornament",
      category: "Accessories",
      price: 450,
      image: pHairUpdated,
      description: "Authentic handmade gajra styling ornament with gold-tinted crown links and durable matching bands.",
      details: "Weight: 45g | Material: Brass & Silk flowers | Traditional South Indian Design"
    },
    {
      id: 'n2',
      title: "Antique Ginkgo Leaf Premium Ring",
      category: "Accessories",
      price: 500,
      image: pRing,
      description: "Premium handcrafted open ring featuring detailed ginkgo leaf vein engravings and a rose-gold plating.",
      details: "Size: Adjustable | Material: 925 Sterling Silver Plated | Finish: Matte gold"
    },
    {
      id: 'n3',
      title: "Exquisite Kundan Choker Necklace",
      category: "Accessories",
      price: 1500,
      image: pNeck,
      description: "An elegant festive choker set decorated with high-grade Kundan stones and soft pink bead hangings.",
      details: "Length: Adjustable thread | Set includes: 1 Choker & 1 Pair of Earrings"
    },
    {
      id: 'n4',
      title: "Aesthetic Floral Anklet Set",
      category: "Accessories",
      price: 650,
      image: pAnklet,
      description: "Delicate silver alloy chain anklets accented with pastel rose flower charms and adjustable clasps.",
      details: "Length: 22cm + 5cm extension | Material: Anti-tarnish alloy"
    }
  ];

  return (
    <div className="new-arrivals-view-page">
      <div className="arrivals-container">
        
        {/* 1. Page Header */}
        <div className="arrivals-header-section">
          <div className="arrivals-crown-icon">
            <svg viewBox="0 0 100 40" className="arrivals-crown-svg">
              <path d="M 15,35 L 85,35 L 80,18 L 65,26 L 50,10 L 35,26 L 20,18 Z M 15,37 L 85,37 L 85,39 L 15,39 Z" fill="var(--gold-accent)" />
            </svg>
          </div>
          <h1 className="arrivals-main-title">The Fresh Edit</h1>
          <p className="arrivals-subtitle">Explore our newly launched, premium additions crafted for this season</p>
        </div>

        {/* 2. Interactive Lookbook Tabs & Slider */}
        <section className="lookbook-section">
          <div className="lookbook-header">
            <Sparkles size={18} className="text-gold" />
            <h2>Seasonal Lookbook</h2>
          </div>

          <div className="lookbook-layout-container">
            {/* Left Column: Tab list & Details */}
            <div className="lookbook-controls">
              <div className="lookbook-tabs-list">
                <button 
                  className={`lookbook-tab-btn ${activeLookbookTab === 'ethnic' ? 'active' : ''}`}
                  onClick={() => setActiveLookbookTab('ethnic')}
                >
                  Ethnic Splendor
                </button>
                <button 
                  className={`lookbook-tab-btn ${activeLookbookTab === 'stationery' ? 'active' : ''}`}
                  onClick={() => setActiveLookbookTab('stationery')}
                >
                  Writers Edit
                </button>
                <button 
                  className={`lookbook-tab-btn ${activeLookbookTab === 'gifts' ? 'active' : ''}`}
                  onClick={() => setActiveLookbookTab('gifts')}
                >
                  Occasion Hampers
                </button>
              </div>

              <div className="lookbook-tab-content animate-fade-in">
                <h3>{lookbooks[activeLookbookTab].title}</h3>
                <p className="lookbook-desc">{lookbooks[activeLookbookTab].desc}</p>
                <blockquote className="lookbook-quote">
                  "{lookbooks[activeLookbookTab].quote}"
                </blockquote>
                
                <button 
                  className="lookbook-explore-btn"
                  onClick={() => {
                    window.history.pushState({}, '', `/Shop?category=${activeLookbookTab === 'ethnic' ? 'clothing' : activeLookbookTab}`);
                    window.dispatchEvent(new Event('popstate'));
                  }}
                >
                  <span>Shop Collection</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Column: Visual Box */}
            <div className="lookbook-visual-wrapper">
              <div className="lookbook-image-card">
                <img 
                  src={lookbooks[activeLookbookTab].image} 
                  alt={lookbooks[activeLookbookTab].title} 
                  className="lookbook-img animate-scale-in"
                  key={activeLookbookTab} // force reload animation on tab switch
                />
                <div className="lookbook-glow-overlay"></div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. New Products Grid */}
        <section className="arrivals-products-section">
          <h2 className="section-block-title">Newest Arrivals</h2>
          
          <div className="arrivals-grid">
            {newProducts.map((prod) => (
              <div key={prod.id} className="arrival-card-item">
                <div className="arrival-img-box">
                  <div className="arrival-new-badge">NEW</div>
                  
                  {/* Action overlay buttons */}
                  <div className="arrival-actions-overlay">
                    <button 
                      className="arrival-btn-action" 
                      onClick={() => setSelectedProduct(prod)}
                      title="Quick View"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className={`arrival-btn-action ${wishlist.includes(prod.id) ? 'active' : ''}`}
                      onClick={() => toggleWishlist(prod.id)}
                      title="Add to Wishlist"
                    >
                      <Heart size={18} fill={wishlist.includes(prod.id) ? "var(--primary-rose)" : "none"} />
                    </button>
                  </div>

                  <img src={prod.image} alt={prod.title} className="arrival-prod-img" />
                  <div className="arrival-card-glow-overlay"></div>
                </div>

                <div className="arrival-card-content">
                  <span className="arrival-item-category">{prod.category}</span>
                  <h3 className="arrival-item-title">{prod.title}</h3>
                  <span className="arrival-item-price">₹{prod.price}</span>
                  
                  <button 
                    className="arrival-btn-view"
                    onClick={() => setSelectedProduct(prod)}
                  >
                    Quick View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* 4. Quick View Interactive Modal */}
      {selectedProduct && (
        <div className="modal-overlay animate-fade-in" onClick={() => setSelectedProduct(null)}>
          <div className="quickview-modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            
            {/* Close button */}
            <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>
              <X size={20} />
            </button>

            <div className="modal-layout">
              {/* Left Column: Image wrapper */}
              <div className="modal-image-side">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.title} 
                  className="modal-product-img" 
                />
                <div className="modal-image-shimmer"></div>
              </div>

              {/* Right Column: Information details */}
              <div className="modal-info-side">
                <span className="modal-category">{selectedProduct.category}</span>
                <h2 className="modal-title">{selectedProduct.title}</h2>
                <span className="modal-price">₹{selectedProduct.price}</span>
                
                <p className="modal-desc">{selectedProduct.description}</p>
                <div className="modal-spec-box">
                  <strong>Specifications:</strong>
                  <p>{selectedProduct.details}</p>
                </div>

                <div className="modal-actions-row">
                  <button 
                    className="modal-add-cart-btn"
                    onClick={() => {
                      alert(`Added ${selectedProduct.title} to cart!`);
                      setSelectedProduct(null);
                    }}
                  >
                    <ShoppingCart size={18} />
                    <span>Add To Cart</span>
                  </button>
                  <button 
                    className={`modal-wish-btn ${wishlist.includes(selectedProduct.id) ? 'active' : ''}`}
                    onClick={() => toggleWishlist(selectedProduct.id)}
                  >
                    <Heart size={18} fill={wishlist.includes(selectedProduct.id) ? "var(--primary-rose)" : "none"} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
