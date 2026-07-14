import React, { useState, useEffect } from 'react';
import { Tag, Clock, Copy, Check, Gift } from 'lucide-react';
import { apiService } from '../services/apiService';
import { resolveProductImage } from '../utils/imageHelper';
import logoImg from '../assets/logo.png';

export default function OffersView() {
  const [copiedCode, setCopiedCode] = useState(null);
  const [revealedGift, setRevealedGift] = useState(false);
  const [mysteryCode, setMysteryCode] = useState('');
  const [scratching, setScratching] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 34, seconds: 56 });
  
  const [coupons, setCoupons] = useState([
    {
      code: "MITHRA10",
      discount: "10% OFF",
      desc: "On all clothing purchases above ₹1,499",
      expiry: "Valid till end of month"
    },
    {
      code: "FESTIVE25",
      discount: "25% OFF",
      desc: "On Premium Gift Hampers & Occasion Boxes",
      expiry: "Limited time offer"
    },
    {
      code: "GOLDEN50",
      discount: "₹500 Flat OFF",
      desc: "On luxury necklaces and accessories",
      expiry: "Exclusive user voucher"
    }
  ]);

  const [offerProducts, setOfferProducts] = useState([]);

  // 1. Live Countdown Timer running every second
  useEffect(() => {
    const target = new Date();
    target.setHours(target.getHours() + 14); // 14 hours from now
    target.setMinutes(target.getMinutes() + 45);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch real data from API
  useEffect(() => {
    // Fetch real active coupons
    apiService.getCoupons().then(data => {
      if (data && data.length > 0) {
        const active = data
          .filter(c => c.status === 'Active')
          .map(c => ({
            code: c.code,
            discount: c.discount,
            desc: `Min Cart Value: ₹${c.minCart || '0'}`,
            expiry: `Expires on ${c.expiry}`
          }));
        if (active.length > 0) {
          setCoupons(active);
        }
      }
    }).catch(() => {});

    // Fetch real products for specially discounted section
    apiService.getProducts().then(data => {
      if (data && data.length > 0) {
        // Filter products that have offers (isOffer is true, or badge contains 'OFFER'/'DEAL', or discount/originalPrice > price)
        let filtered = data.filter(p => {
          const hasOfferBadge = p.badge?.toUpperCase().includes('OFFER') || p.badge?.toUpperCase().includes('DEAL');
          const hasDiscount = p.originalPrice && parseFloat(String(p.originalPrice).replace(/[^0-9.]/g, '')) > (typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, '')));
          return p.isOffer || hasOfferBadge || hasDiscount;
        });

        // Fallback: If no products have offer indicators in backend, take the first 3 products as fallback
        if (filtered.length === 0) {
          filtered = data.slice(0, 3);
        }

        // Limit to 3 items for the grid section
        const sliced = filtered.slice(0, 3);

        const mappedOffers = sliced.map((p, idx) => {
          // Parse price
          const priceNum = typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 299;
          
          // Determine discount percentage
          let discountPercent = 30 + (idx * 10); // fallback default
          let originalPriceNum = Math.round(priceNum / (1 - (discountPercent / 100)));

          // If product has originalPrice, use it
          if (p.originalPrice) {
            const rawOrig = parseFloat(String(p.originalPrice).replace(/[^0-9.]/g, ''));
            if (rawOrig > priceNum) {
              originalPriceNum = Math.round(rawOrig);
              discountPercent = Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100);
            }
          }

          const resolvedImg = resolveProductImage(p);

          return {
            id: p.id,
            title: p.name || p.title || 'Exclusive Product',
            originalPrice: originalPriceNum,
            price: priceNum,
            discount: `${discountPercent}% OFF`,
            image: resolvedImg,
            badge: p.badge || '', // ONLY show badge added by admin, no hardcoding
            category: p.category ? p.category.toLowerCase() : 'clothing'
          };
        });
        setOfferProducts(mappedOffers);
      }
    }).catch(() => {});
  }, []);

  // 2. Copy Code helper
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  // 3. Reveal mystery discount function
  const handleRevealGift = () => {
    if (revealedGift) return;
    setScratching(true);
    setTimeout(() => {
      const activeCodes = coupons.map(c => c.code);
      const codes = activeCodes.length > 0 ? activeCodes : ['WELCOME10', 'SUMMER30', 'FESTIVE50'];
      const randomCode = codes[Math.floor(Math.random() * codes.length)];
      setMysteryCode(randomCode);
      setScratching(false);
      setRevealedGift(true);
    }, 1200);
  };

  // Navigate to Shop and auto-open quick view for the product
  const handleViewProduct = (prodId) => {
    sessionStorage.setItem('auto_open_product_id', String(prodId));
    window.history.pushState({}, '', '/shop');
    window.dispatchEvent(new Event('popstate'));
  };

  // Navigate to Shop with offers filter enabled
  const handleViewAllOffers = () => {
    window.history.pushState({}, '', '/shop?offers=true');
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="offers-view-page">
      <div className="offers-container">
        
        {/* 1. Header Banner */}
        <div className="offers-header-section">
          <div className="offers-crown-icon">
            <img src={logoImg} className="offers-crown-svg" alt="Logo" style={{ objectFit: 'contain' }} />
          </div>
          <h1 className="offers-main-title">Exclusive Offers & Deals</h1>
          <p className="offers-subtitle">Unlock limited-time discounts, luxury rewards, and voucher values</p>
        </div>

        {/* 2. Interactive Mystery Scratch Box */}
        <section className="mystery-reward-section">
          <div className="mystery-card">
            <div className="mystery-card-glass">
              <div className="mystery-icon-box">
                <Gift className={`mystery-gift-icon ${scratching ? 'shaking' : ''}`} size={44} />
              </div>
              <h2 className="mystery-title">Claim Your Mystery Gift</h2>
              <p className="mystery-desc">
                Click below to scratch the coupon and reveal your secret boutique discount code.
              </p>

              <div className="scratch-area-box">
                {!revealedGift ? (
                  <button 
                    onClick={handleRevealGift} 
                    disabled={scratching}
                    className="scratch-reveal-btn"
                  >
                    {scratching ? "Scratching Card..." : "Reveal Code"}
                  </button>
                ) : (
                  <div className="revealed-code-box animate-scale-in">
                    <span className="revealed-label">YOUR SECRET CODE:</span>
                    <span className="revealed-code-text">{mysteryCode}</span>
                    <button 
                      className="mystery-copy-btn" 
                      onClick={() => handleCopyCode(mysteryCode)}
                    >
                      {copiedCode === mysteryCode ? <Check size={16} /> : <Copy size={16} />}
                      {copiedCode === mysteryCode ? "Copied!" : "Copy Code"}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="mystery-glow-ring"></div>
          </div>
        </section>

        {/* 3. Deal of the Day: Live Countdown */}
        <section className="deal-of-the-day-section">
          <div className="deal-countdown-card">
            <div className="deal-card-badge">
              <Clock size={16} />
              <span>FLASH SALE</span>
            </div>
            
            <h2 className="deal-card-title">Deal of the Day</h2>
            <p className="deal-card-desc">Hurry up! Grab these special discounts before the timer hits zero.</p>

            <div className="countdown-timer-row">
              <div className="timer-block">
                <span className="timer-number">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="timer-label">Hours</span>
              </div>
              <span className="timer-colon">:</span>
              <div className="timer-block">
                <span className="timer-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="timer-label">Minutes</span>
              </div>
              <span className="timer-colon">:</span>
              <div className="timer-block">
                <span className="timer-number">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="timer-label">Seconds</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Active Promo Vouchers Grid */}
        <section className="promo-vouchers-section">
          <h2 className="section-block-title">Active Store Coupons</h2>
          <div className="coupons-grid">
            {coupons.map((coupon, index) => (
              <div key={index} className="coupon-card-item">
                <div className="coupon-ticket-left">
                  <span className="coupon-discount-text">{coupon.discount}</span>
                  <span className="coupon-badge-tag">MITHRASHOPY</span>
                </div>
                
                <div className="coupon-ticket-right">
                  <h3 className="coupon-title">{coupon.code}</h3>
                  <p className="coupon-desc">{coupon.desc}</p>
                  <span className="coupon-expiry">{coupon.expiry}</span>
                  
                  <button 
                    className={`coupon-copy-action ${copiedCode === coupon.code ? 'copied' : ''}`}
                    onClick={() => handleCopyCode(coupon.code)}
                  >
                    {copiedCode === coupon.code ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedCode === coupon.code ? "Copied" : "Copy Code"}</span>
                  </button>
                </div>
                
                {/* Visual tickets notch circles */}
                <div className="ticket-notch top-notch"></div>
                <div className="ticket-notch bottom-notch"></div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Discounted Products Grid */}
        <section className="offers-products-section">
          <h2 className="section-block-title">Specially Discounted Products</h2>
          <div className="offers-grid-cards">
            {offerProducts.map((prod) => (
              <div key={prod.id} className="offer-product-item" onClick={() => handleViewProduct(prod.id)} style={{ cursor: 'pointer' }}>
                <div className="offer-img-box-wrapper">
                  <div className="offer-badge-percent">{prod.discount}</div>
                  {prod.badge && <div className="offer-badge-status">{prod.badge}</div>}
                  <img src={prod.image} alt={prod.title} className="offer-product-img" />
                  <div className="offer-img-overlay"></div>
                </div>

                <div className="offer-item-content">
                  <h3 className="offer-item-title">{prod.title}</h3>
                  <div className="offer-price-row">
                    <span className="offer-price-original">₹{prod.originalPrice}</span>
                    <span className="offer-price-discounted">₹{prod.price}</span>
                  </div>
                  
                  <button 
                    className="offer-btn-examine"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProduct(prod.id);
                    }}
                  >
                    View in Shop
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View All Products Button */}
          <div className="view-all-offers-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <button 
              onClick={handleViewAllOffers}
              className="view-all-offers-btn"
            >
              View All Products
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
