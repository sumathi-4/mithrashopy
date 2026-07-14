import React, { useState, useEffect } from 'react';
import { ChevronRight, Shirt, BookOpen, Gift, Crown, Star, Tag, Users } from 'lucide-react';
import { apiService } from '../services/apiService';
import newsletterGiftsImg from '../assets/newsletter_gifts.png';
import newsletterPerfumeImg from '../assets/newsletter_perfume.png';
import logoImg from '../assets/logo.png';

// --- Navigation helper (same pattern as Navbar) ---
const navigate = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('popstate'));
};

// --- Razorpay visible badge ---
const RazorpayBadge = () => (
  <span className="footer-razorpay-badge" aria-label="Razorpay">
    <svg viewBox="0 0 90 28" width="86" height="26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="90" height="28" rx="5" fill="#ffffff" />
      {/* Blue lightning bolt */}
      <polygon points="18,5 12,15 17,15 11,23 21,11 16,11" fill="#3395FF" />
      <text x="26" y="18" fill="#072654" fontSize="10" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="0.5">Razorpay</text>
    </svg>
  </span>
);

// ─── SHOP links — real routes only ───────────────────────
const SHOP_LINKS = [
  { label: 'All Products',  path: '/shop',              exact: true },
  { label: 'Clothing',      path: '/shop/clothing',     exact: false },
  { label: 'Stationery',    path: '/shop/stationery',   exact: false },
  { label: 'Gifts',         path: '/shop/gifts',        exact: false },
  { label: 'Accessories',   path: '/shop/accessories',  exact: false },
  { label: 'New Arrivals',  path: '/newarrivals',       exact: false },
  { label: 'Offers',        path: '/offers',            exact: false },
  { label: 'Celebrity',     path: '/celebrity',         exact: false },
];

// ─── MY ACCOUNT links — real routes only ─────────────────
const ACCOUNT_LINKS = [
  { label: 'My Account',    path: '/account',            tab: null,     exact: false },
  { label: 'My Orders',     path: '/account?tab=orders', tab: 'orders', exact: false },
  { label: 'My Wishlist',   path: '/account?tab=wishlist', tab: 'wishlist', exact: false },
  { label: 'Login / Register', path: null, openAuth: true },
];

// ─── Helper: is a path active? ───────────────────────────
const isActive = (linkPath, currentPath) => {
  if (!linkPath) return false;
  const clean = linkPath.split('?')[0].toLowerCase();
  const cur   = currentPath.split('?')[0].toLowerCase();
  if (clean === '/shop' && cur === '/shop') return true;
  if (clean !== '/shop' && cur.startsWith(clean)) return true;
  return false;
};

export default function Footer({ authUser }) {
  const [settings, setSettings] = useState({
    storeName: 'MithiraShopy',
  });
  const [currentPath, setCurrentPath] = useState(window.location.pathname + window.location.search);

  // Track current path for active link highlighting
  useEffect(() => {
    const onNav = () => setCurrentPath(window.location.pathname + window.location.search);
    window.addEventListener('popstate', onNav);
    return () => window.removeEventListener('popstate', onNav);
  }, []);

  useEffect(() => {
    apiService.getSettings().then(data => {
      if (data) {
        setSettings({ storeName: data.storeName || 'MithiraShopy' });
      }
    }).catch(() => {});
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing to our newsletter!');
  };

  const handleShopNav = (e, link) => {
    e.preventDefault();
    navigate(link.path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAccountNav = (e, link) => {
    e.preventDefault();
    if (link.openAuth) {
      window.dispatchEvent(new CustomEvent('mithira_open_auth_modal', { detail: { type: 'user' } }));
      return;
    }
    navigate(link.path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-area">

      {/* ─── Newsletter Banner (UNTOUCHED) ─────────────────── */}
      <div className="newsletter-banner">
        <div className="newsletter-content-wrapper">
          <div className="newsletter-side-img-container left-side">
            <img src={newsletterGiftsImg} alt="Gifts and offers" className="newsletter-side-img" />
          </div>
          <div className="newsletter-center-content">
            <h3 className="newsletter-title">Stay Updated</h3>
            <p className="newsletter-subtitle">Subscribe to get special offers, new arrivals &amp; more</p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <div className="newsletter-input-group">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  required
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-btn">SUBSCRIBE</button>
              </div>
            </form>
          </div>
          <div className="newsletter-side-img-container right-side">
            <img src={newsletterPerfumeImg} alt="Premium products" className="newsletter-side-img" />
          </div>
        </div>
      </div>

      {/* ─── Main Footer Columns ─────────────────────────── */}
      <div className="footer-main">
        <div className="footer-main-inner">

          {/* Brand Column */}
          <div className="footer-brand-col">
            <a
              href="/"
              onClick={e => { e.preventDefault(); navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="footer-logo-link"
            >
              <img src={logoImg} alt={settings.storeName} className="footer-logo-img" />
            </a>
            <p className="footer-brand-tagline">Style for Every Moment</p>
            <p className="footer-brand-desc">
              Premium ethnic wear, stationery, gifts &amp; accessories — curated for the moments that matter.
            </p>
          </div>

          {/* Shop Column */}
          <div className="footer-links-col">
            <h4 className="footer-col-heading">
              <span className="footer-col-heading-icon">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </span>
              Shop
            </h4>
            <ul className="footer-nav-list">
              {SHOP_LINKS.map(link => {
                const active = isActive(link.path, currentPath);
                return (
                  <li key={link.path}>
                    <a
                      href={link.path}
                      className={`footer-nav-link${active ? ' footer-nav-link--active' : ''}`}
                      onClick={e => handleShopNav(e, link)}
                      aria-current={active ? 'page' : undefined}
                    >
                      <ChevronRight size={12} className="footer-nav-chevron" />
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* My Account Column */}
          <div className="footer-links-col">
            <h4 className="footer-col-heading">
              <span className="footer-col-heading-icon">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              My Account
            </h4>
            <ul className="footer-nav-list">
              {ACCOUNT_LINKS.map(link => {
                const active = link.path ? isActive(link.path, currentPath) : false;
                return (
                  <li key={link.label}>
                    <a
                      href={link.path || '#'}
                      className={`footer-nav-link${active ? ' footer-nav-link--active' : ''}`}
                      onClick={e => handleAccountNav(e, link)}
                      aria-current={active ? 'page' : undefined}
                    >
                      <ChevronRight size={12} className="footer-nav-chevron" />
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

        </div>
      </div>

      {/* ─── Footer Bottom Bar ───────────────────────────── */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <div className="footer-bottom-left">
            <span className="footer-copyright">
              © {currentYear}{' '}
              <strong className="footer-copyright-brand">{settings.storeName}</strong>
              . All rights reserved. Designed &amp; Developed by{' '}
              <span className="footer-copyright-dev">Atriowings Technologies India Private Limited</span>
            </span>
          </div>
          <div className="footer-bottom-right">
            <span className="footer-payment-label">Secure payments via</span>
            <RazorpayBadge />
          </div>
        </div>
      </div>

    </footer>
  );
}
