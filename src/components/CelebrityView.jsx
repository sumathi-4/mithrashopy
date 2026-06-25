import React, { useState, useEffect } from 'react';
import { Star, Heart, Sparkles, User, ShoppingCart, Eye, X, ArrowRight } from 'lucide-react';
import logoImg from '../assets/logo.png';
import celebCouple from '../assets/celeb_couple.jpg';
import celebSaree from '../assets/celeb_saree.jpg';
import celebKid from '../assets/celeb_kid.jpg';
import celebKeerthy from '../assets/celeb_keerthy.jpg';
import celebDulquer from '../assets/celeb_dulquer.jpg';
import celebVeshti from '../assets/celeb_veshti.jpg';
import celebHaram from '../assets/celeb_haram.jpg';
import { apiService } from '../services/apiService';
import { resolveProductImage } from '../utils/imageHelper';
import { useToast } from './ToastProvider';

export default function CelebrityView() {
  const [activeCelebTab, setActiveCelebTab] = useState('couple');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const { addToast } = useToast();

  // Load wishlist, cart, and fetch products from database
  useEffect(() => {
    const storedUser = localStorage.getItem('mithira_auth_user');
    let initialWishlist = [];
    let initialCart = [];
    if (storedUser) {
      const user = JSON.parse(storedUser);
      initialWishlist = user.wishlist || [];
      initialCart = user.cart || [];
    } else {
      initialWishlist = JSON.parse(localStorage.getItem('mithira_guest_wishlist') || '[]');
      initialCart = JSON.parse(localStorage.getItem('mithira_guest_cart') || '[]');
    }
    setWishlist(initialWishlist);
    setCart(initialCart);

    apiService.getProducts()
      .then(data => {
        setProducts(data);
      })
      .catch(err => console.error('Error fetching products for celebrity closet:', err))
      .finally(() => setLoading(false));
  }, []);

  const isProductInStock = (p) => {
    if (p.stock !== undefined) return p.stock > 0;
    const val = p.title || p.name || '';
    return (val.length % 7 !== 0);
  };

  const toggleWishlist = (id) => {
    let updated;
    const storedUser = localStorage.getItem('mithira_auth_user');
    if (wishlist.includes(id)) {
      updated = wishlist.filter(item => item !== id);
      addToast({ message: 'Removed from wishlist', type: 'wishlist' });
    } else {
      updated = [...wishlist, id];
      addToast({ message: '❤️ Added to wishlist!', type: 'wishlist' });
    }
    setWishlist(updated);

    if (storedUser) {
      apiService.syncWishlist(updated).then(res => {
        if (res) {
          const user = JSON.parse(storedUser);
          user.wishlist = res;
          localStorage.setItem('mithira_auth_user', JSON.stringify(user));
        }
      });
    } else {
      localStorage.setItem('mithira_guest_wishlist', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('mithira_cart_update'));
    }
  };

  const toggleCart = (id, title) => {
    let updated;
    let updatedItems = [];
    const storedUser = localStorage.getItem('mithira_auth_user');
    if (cart.includes(id)) {
      updated = cart.filter(item => item !== id);
      addToast({ message: 'Removed from cart', type: 'cart' });
    } else {
      updated = [...cart, id];
      addToast({ message: `🛒 Added "${title}" to cart!`, type: 'cart' });
    }
    setCart(updated);

    const prevItems = storedUser 
      ? (JSON.parse(storedUser).cartItems || []) 
      : (JSON.parse(localStorage.getItem('mithira_guest_cart_items') || '[]'));
    const isRemoving = !updated.includes(id);

    if (isRemoving) {
      updatedItems = prevItems.filter(item => item.productId !== id);
    } else {
      updatedItems = [...prevItems.filter(item => item.productId !== id), {
        productId: id,
        quantity: 1,
        variant: { size: null, color: null, variantId: null, sku: null }
      }];
    }

    if (storedUser) {
      apiService.syncCart(updated, updatedItems).then(res => {
        if (res) {
          const user = JSON.parse(storedUser);
          user.cart = res.cart || updated;
          user.cartItems = res.cartItems || updatedItems;
          localStorage.setItem('mithira_auth_user', JSON.stringify(user));
        }
      });
    } else {
      localStorage.setItem('mithira_guest_cart', JSON.stringify(updated));
      localStorage.setItem('mithira_guest_cart_items', JSON.stringify(updatedItems));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('mithira_cart_update'));
    }
  };

  const handleShopNavigation = (prod) => {
    const searchVal = prod.title || prod.name || '';
    window.history.pushState({}, '', `/Shop?search=${encodeURIComponent(searchVal)}`);
    window.dispatchEvent(new Event('popstate'));
  };

  const findBestDbProduct = (item, dbProducts) => {
    const title = item.title.toLowerCase();
    
    // 1. Try exact or close match
    let found = dbProducts.find(p => {
      const pName = (p.name || p.title || '').toLowerCase();
      return pName.includes(title) || title.includes(pName);
    });
    if (found) return found;

    // 2. Try match by main nouns / keywords
    const keywords = title.split(' ').filter(w => w.length > 3 && !['premium', 'classic', 'traditional', 'antique', 'exquisite', 'royal', 'minimalist', 'festival'].includes(w));
    if (keywords.length > 0) {
      found = dbProducts.find(p => {
        const pName = (p.name || p.title || '').toLowerCase();
        return keywords.some(k => pName.includes(k));
      });
      if (found) return found;
    }

    // 3. Match by category
    const catGroup = item.category.toUpperCase();
    found = dbProducts.find(p => {
      const pCat = String(p.category || '').toUpperCase();
      return pCat.includes(catGroup) || catGroup.includes(pCat);
    });
    if (found) return found;

    return null;
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
          price: 8999,
          image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: 'sc2',
          title: "Men's Classic Khadi Veshti & Kurta Set",
          category: "clothing",
          price: 2500,
          image: celebVeshti
        },
        {
          id: 'sc3',
          title: "Traditional Gold Plated Temple Haram",
          category: "accessories",
          price: 3200,
          image: celebHaram
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
          price: 1500,
          image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: 'ny2',
          title: "Kanchipuram Silk Editorial Saree",
          category: "clothing",
          price: 12000,
          image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: 'ny3',
          title: "Royal Jasmine Hair Gajra Ornament",
          category: "accessories",
          price: 450,
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
          price: 4999,
          image: celebKid
        },
        {
          id: 'ks2',
          title: "Antique Ginkgo Leaf Premium Ring",
          category: "accessories",
          price: 500,
          image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: 'ks3',
          title: "Festive Occasion Floral Hampers",
          category: "gifts",
          price: 1800,
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
          price: 1999,
          image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: 'dq2',
          title: "Premium Gold-embossed Journal Set",
          category: "stationery",
          price: 850,
          image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: 'dq3',
          title: "Minimalist Brass Pen & Stand",
          category: "stationery",
          price: 450,
          image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80"
        }
      ]
    }
  };

  const getActiveClosetItems = () => {
    const celeb = celebrities[activeCelebTab];
    if (!celeb) return [];

    return celeb.closetItems.map(item => {
      const dbProd = findBestDbProduct(item, products);
      if (dbProd) {
        return {
          ...dbProd,
          id: dbProd.id || dbProd._id || item.id,
          image: resolveProductImage(dbProd) || item.image,
          title: dbProd.name || dbProd.title || item.title,
          price: dbProd.price || item.price,
          category: dbProd.category || item.category,
          brand: dbProd.brand || 'Mithira Collection'
        };
      }
      return {
        ...item,
        brand: 'Mithira Collection',
        rating: 4.8,
        reviews: 32
      };
    });
  };

  const activeItems = getActiveClosetItems();

  return (
    <div className="celebrity-view-page">
      <div className="celeb-view-container">
        
        {/* 1. Page Header */}
        <div className="celeb-header-section">
          <div className="celeb-crown-icon">
            <img src={logoImg} className="celeb-crown-svg" alt="Logo" style={{ objectFit: 'contain' }} />
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
                  <span>MITHRA SELECTS</span>
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

          {loading ? (
            <div className="text-center py-20" style={{ fontSize: '1.2rem', color: '#666' }}>
              <div className="shimmer-card" style={{ height: '300px', borderRadius: '12px' }}></div>
              <p style={{ marginTop: '15px' }}>Loading wardrobe collection...</p>
            </div>
          ) : (
            <div className="celeb-products-grid animate-fade-in-up" key={`${activeCelebTab}-grid`}>
              {activeItems.map((prod) => {
                const isWishlisted = wishlist.includes(prod.id);
                const isInCart = cart.includes(prod.id);
                const inStock = isProductInStock(prod);

                const originalPriceNum = prod.originalPrice ? parseFloat(String(prod.originalPrice).replace(/[^0-9.]/g, '')) : 0;
                const priceNum = typeof prod.price === 'number' ? prod.price : parseFloat(String(prod.price).replace(/[^0-9.]/g, '')) || 0;
                const discountPercentage = (originalPriceNum && originalPriceNum > priceNum) 
                  ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
                  : (prod.discount && parseFloat(String(prod.discount)) <= 100 
                      ? Math.round(parseFloat(String(prod.discount))) 
                      : 0);
                const brandName = prod.brand || 'Mithira Collection';

                return (
                  <div 
                    key={prod.id} 
                    className="clothing-product-card theme-clothing animate-fade-in-up"
                    onClick={() => setSelectedProduct(prod)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="clothing-img-wrapper" onClick={(e) => { e.stopPropagation(); setSelectedProduct(prod); }}>
                      {discountPercentage > 0 && (
                        <div className="clothing-discount-badge">
                          {discountPercentage}% OFF
                        </div>
                      )}
                      
                      <button 
                        className={`clothing-wishlist-float-btn ${isWishlisted ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                        aria-label="Add to Wishlist"
                      >
                        <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
                      </button>

                      <img src={prod.image} alt={prod.title} className="clothing-img" />

                      <div className="clothing-hover-overlay">
                        <button 
                          className={`clothing-hover-action-btn hover-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                          title="Add to Wishlist"
                        >
                          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                        <button 
                          className="clothing-hover-action-btn hover-quickview-btn"
                          onClick={(e) => { e.stopPropagation(); setSelectedProduct(prod); }}
                          title="Quick View"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className={`clothing-hover-action-btn hover-cart-btn ${isInCart ? 'in-cart' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleCart(prod.id, prod.title); }}
                          title="Add to Cart"
                        >
                          <ShoppingCart size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="clothing-info-section">
                      <div className="clothing-brand-row">
                        <span className="clothing-brand-name">{brandName}</span>
                        <div className="clothing-stock-badge">
                          {inStock ? (
                            <span className="stock-status-in">In Stock</span>
                          ) : (
                            <span className="stock-status-out">Out of Stock</span>
                          )}
                        </div>
                      </div>

                      <h4 className="clothing-product-title">
                        {prod.title}
                      </h4>

                      <div className="clothing-rating-badge-container">
                        <div className="clothing-rating-pill-green">
                          <span>{(prod.rating || 5).toFixed(1)}</span>
                          <span className="rating-star-icon">★</span>
                          <span className="rating-divider">|</span>
                          <span className="rating-count">{prod.reviews || 0}</span>
                        </div>
                      </div>

                      <div className="clothing-price-and-action">
                        <div className="clothing-price-box">
                          <span className="clothing-selling-price">₹{priceNum.toLocaleString()}</span>
                          {originalPriceNum > priceNum && (
                            <span className="clothing-original-price">₹{originalPriceNum.toLocaleString()}</span>
                          )}
                        </div>
                        <button 
                          className="clothing-card-add-cart-btn"
                          onClick={(e) => { e.stopPropagation(); handleShopNavigation(prod); }}
                          style={{ minWidth: '90px' }}
                        >
                          GET LOOK
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                
                <p className="modal-desc">{selectedProduct.description || "Indulge in our handpicked selections crafted to match your cultural roots and premium choices. Made with pure fabric, exquisite design details, and comfortable fit."}</p>
                
                {(selectedProduct.details || selectedProduct.fabric || selectedProduct.size || selectedProduct.modelNo) && (
                  <div className="modal-spec-box">
                    <strong>Specifications:</strong>
                    <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.9rem', color: '#666' }}>
                      {selectedProduct.modelNo && <div><span>Model No: </span><strong>{selectedProduct.modelNo}</strong></div>}
                      {selectedProduct.fabric && <div><span>Fabric: </span><strong>{selectedProduct.fabric}</strong></div>}
                      {selectedProduct.size && <div><span>Sizes: </span><strong>{selectedProduct.size}</strong></div>}
                      {selectedProduct.details && <div>{selectedProduct.details}</div>}
                    </div>
                  </div>
                )}

                <div className="modal-actions-row">
                  <button 
                    className={`modal-add-cart-btn ${cart.includes(selectedProduct.id) ? 'active' : ''}`}
                    onClick={() => {
                      toggleCart(selectedProduct.id, selectedProduct.title);
                      setSelectedProduct(null);
                    }}
                  >
                    <ShoppingCart size={18} />
                    <span>{cart.includes(selectedProduct.id) ? "Remove from Cart" : "ADD TO CART"}</span>
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
