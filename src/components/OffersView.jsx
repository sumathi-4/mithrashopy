import React, { useState, useEffect } from 'react';
import { Tag, Clock, Copy, Check, Gift, Sparkles, AlertCircle } from 'lucide-react';
import pHairUpdated from '../assets/p_hair_updated.jpg';
import pRing from '../assets/p_ring.jpg';
import pNeck from '../assets/p_neck.jpg';

export default function OffersView() {
  const [copiedCode, setCopiedCode] = useState(null);
  const [revealedGift, setRevealedGift] = useState(false);
  const [mysteryCode, setMysteryCode] = useState('');
  const [scratching, setScratching] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 34, seconds: 56 });

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
      const codes = ['MYSTERY15', 'SURPRISE20', 'LUCKY30'];
      const randomCode = codes[Math.floor(Math.random() * codes.length)];
      setMysteryCode(randomCode);
      setScratching(false);
      setRevealedGift(true);
    }, 1200);
  };

  const coupons = [
    {
      code: "MITHIRA10",
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
  ];

  const offerProducts = [
    {
      id: 'p1',
      title: "Royal Jasmine Hair Gajra Ornament",
      originalPrice: 750,
      price: 450,
      discount: "40% OFF",
      image: pHairUpdated,
      badge: "LIMITED DEAL"
    },
    {
      id: 'p2',
      title: "Antique Ginkgo Leaf Premium Ring",
      originalPrice: 999,
      price: 500,
      discount: "50% OFF",
      image: pRing,
      badge: "HALF PRICE"
    },
    {
      id: 'p3',
      title: "Exquisite Kundan Choker Necklace",
      originalPrice: 2499,
      price: 1500,
      discount: "40% OFF",
      image: pNeck,
      badge: "FESTIVE DEAL"
    }
  ];

  return (
    <div className="offers-view-page">
      <div className="offers-container">
        
        {/* 1. Header Banner */}
        <div className="offers-header-section">
          <div className="offers-crown-icon">
            <svg viewBox="0 0 100 40" className="offers-crown-svg">
              <path d="M 15,35 L 85,35 L 80,18 L 65,26 L 50,10 L 35,26 L 20,18 Z M 15,37 L 85,37 L 85,39 L 15,39 Z" fill="var(--gold-accent)" />
            </svg>
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
              <div className="timer-block font-glow-rose">
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
                  <span className="coupon-badge-tag">MITHIRASHOPPY</span>
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
              <div key={prod.id} className="offer-product-item">
                <div className="offer-img-box-wrapper">
                  <div className="offer-badge-percent">{prod.discount}</div>
                  <div className="offer-badge-status">{prod.badge}</div>
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
                    onClick={() => {
                      window.history.pushState({}, '', `/Shop?category=accessories`);
                      window.dispatchEvent(new Event('popstate'));
                    }}
                  >
                    View in Shop
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
