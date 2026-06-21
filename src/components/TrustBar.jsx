import React, { useEffect, useRef } from 'react';
import { Truck, Shield, RefreshCw, Headphones, Star, Tag } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: <Truck size={20} />, title: 'Free Delivery', sub: 'On orders above ₹999' },
  { icon: <Shield size={20} />, title: 'Secure Payment', sub: '100% Safe & Encrypted' },
  { icon: <RefreshCw size={20} />, title: 'Easy Returns', sub: '7-Day Return Policy' },
  { icon: <Headphones size={20} />, title: '24/7 Support', sub: 'Always Here For You' },
  { icon: <Star size={20} />, title: 'Premium Quality', sub: 'Handpicked Collections' },
  { icon: <Tag size={20} />, title: 'Best Prices', sub: 'Direct From Source' },
];

export default function TrustBar() {
  const trackRef = useRef(null);

  // Duplicate items for seamless loop
  const items = [...TRUST_ITEMS, ...TRUST_ITEMS];

  return (
    <div className="trust-bar-section">
      <div className="trust-bar-ticker">
        <div className="trust-bar-track" ref={trackRef}>
          {items.map((item, i) => (
            <div key={i} className="trust-bar-item">
              <span className="trust-bar-icon">{item.icon}</span>
              <div className="trust-bar-text">
                <span className="trust-bar-title">{item.title}</span>
                <span className="trust-bar-sub">{item.sub}</span>
              </div>
              <span className="trust-bar-sep">✦</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
