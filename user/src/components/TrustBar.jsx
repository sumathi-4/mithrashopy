import React from 'react';
import { Star, Sparkles, Banknote, Tag, Shield } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: <Star size={24} />, title: 'Premium Quality', sub: 'Handpicked Collections' },
  { icon: <Sparkles size={24} />, title: 'Exclusive Category', sub: 'Curated Choices' },
  { icon: <Banknote size={24} />, title: 'Cash on Delivery', sub: 'COD Available' },
  { icon: <Tag size={24} />, title: 'Lowest Price', sub: 'Best Price Guaranteed' },
  { icon: <Shield size={24} />, title: 'Secure Payment', sub: '100% Safe & Encrypted' },
];

export default function TrustBar() {
  return (
    <div className="trust-bar-section">
      <div className="trust-bar-container">
        {TRUST_ITEMS.map((item, i) => (
          <React.Fragment key={i}>
            <div className="trust-bar-item">
              <span className="trust-bar-icon">{item.icon}</span>
              <div className="trust-bar-text">
                <span className="trust-bar-title">{item.title}</span>
                <span className="trust-bar-sub">{item.sub}</span>
              </div>
            </div>
            {i < TRUST_ITEMS.length - 1 && <div className="trust-bar-divider" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
