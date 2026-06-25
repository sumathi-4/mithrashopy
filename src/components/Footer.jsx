import React, { useState, useEffect } from 'react';
import { 
  Gift, Tag, Mail, MapPin, Phone, MessageSquare 
} from 'lucide-react';
import { apiService } from '../services/apiService';
import newsletterGiftsImg from '../assets/newsletter_gifts.png';
import newsletterPerfumeImg from '../assets/newsletter_perfume.png';

export default function Footer() {
  const [settings, setSettings] = useState({
    storeName: 'Mithira Shoppy',
    supportEmail: 'support@mithrashopy.com'
  });

  useEffect(() => {
    apiService.getSettings().then(data => {
      if (data) {
        setSettings({
          storeName: data.storeName || 'Mithira Shoppy',
          supportEmail: data.supportEmail || 'support@mithrashopy.com'
        });
      }
    }).catch(console.error);
  }, []);

  const handleNavigation = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert("Thank you for subscribing to our newsletter!");
  };

  return (
    <footer className="footer-area">
      

      {/* 2. Premium Gold Newsletter Banner */}
      <div className="newsletter-banner">
        <div className="newsletter-content-wrapper">
          
          {/* Left Decorative Image */}
          <div className="newsletter-side-img-container left-side">
            <img 
              src={newsletterGiftsImg} 
              alt="Gifts and offers" 
              className="newsletter-side-img"
            />
          </div>

          {/* Center Content Section */}
          <div className="newsletter-center-content">
            <h3 className="newsletter-title">Stay Updated</h3>
            <p className="newsletter-subtitle">Subscribe to get special offers, new arrivals & more</p>
            
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <div className="newsletter-input-group">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  required 
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-btn">
                  SUBSCRIBE
                </button>
              </div>
            </form>
          </div>

          {/* Right Decorative Image */}
          <div className="newsletter-side-img-container right-side">
            <img 
              src={newsletterPerfumeImg} 
              alt="Premium products" 
              className="newsletter-side-img"
            />
          </div>

        </div>
      </div>

      {/* 3. Sitemap Footer */}
      <div className="sitemap-section">
        <div className="sitemap-container">
          
          {/* Brand block */}
          <div className="sitemap-column brand-column">
            <h2 className="brand-logo">{settings.storeName}</h2>
            
            <p className="brand-tagline">Style for Every Moment</p>
            <div className="social-links">
              <a href="#facebook" className="social-circle" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
              </a>
              <a href="#instagram" className="social-circle" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#twitter" className="social-circle" aria-label="Twitter">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#pinterest" className="social-circle" aria-label="Pinterest"><Tag size={16} /></a>
            </div>
          </div>

          {/* Information Links */}
          <div id="about" className="sitemap-column">

            <h4>Information</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms & Conditions</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>

          {/* Customer Service Links */}
          <div className="sitemap-column">
            <h4>Customer Service</h4>
            <ul>
              <li><a href="#track">Track Order</a></li>
              <li><a href="#shipping">Shipping Policy</a></li>
              <li><a href="#return">Return Policy</a></li>
              <li><a href="#cancel">Cancellation Policy</a></li>
              <li><a href="#support">Help & Support</a></li>
            </ul>
          </div>

          {/* My Account Links */}
          <div className="sitemap-column">
            <h4>My Account</h4>
            <ul>
              <li><a href="#account">My Account</a></li>
              <li><a href="#orders">Orders</a></li>
              <li><a href="#wishlist">Wishlist</a></li>
              <li><a href="#addresses">Addresses</a></li>
              <li><a href="#logout">Logout</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div id="contact" className="sitemap-column contact-column">

            <h4>Contact Us</h4>
            <div className="contact-details-list">
              <div className="contact-detail-item">
                <MapPin size={18} className="contact-icon" />
                <span>123 Fashion Street, New York, NY 10001</span>
              </div>
              <div className="contact-detail-item">
                <Phone size={18} className="contact-icon" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-detail-item">
                <Mail size={18} className="contact-icon" />
                <span>{settings.supportEmail}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </footer>
  );
}
