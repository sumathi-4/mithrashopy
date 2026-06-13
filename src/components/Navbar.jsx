import React, { useState, useEffect } from 'react';
import { Search, Heart, User, ShoppingBag, ChevronDown, Menu, X } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = ['Clothing', 'Stationery', 'Gifts', 'Accessories'];

  const handleLinkClick = (e, path) => {
    e.preventDefault();
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
    setMobileMenuOpen(false);
  };

  return (
    <header className={`navbar-header ${scrolled ? 'scrolled' : ''}`}>
      {/* Top Announcement Bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <span>🎉 Free Shipping on orders above ₹999</span>
          <span className="top-bar-divider">|</span>
          <span>✨ Exclusive Collection For You</span>
        </div>
        <div className="top-bar-right">
          <a href="#track">Track Order</a>
          <span className="top-bar-divider">|</span>
          <a href="#support">Help & Support</a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="navbar-container">
        <nav className="navbar">
          {/* Mobile Hamburg Menu Toggle */}
          <button 
            className="menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo Section */}
          <a href="/" onClick={(e) => handleLinkClick(e, '/')} className="logo-link">
            <div className="logo-wrapper">
              <img src={logoImg} alt="MithiraShoppy Logo" className="logo-img" />
              <h1 className="logo-text">
                <span className="logo-brand-mithira">Mithira</span>
                <span className="logo-brand-shoppy">Shoppy</span>
              </h1>
            </div>
          </a>

          {/* Navigation Links */}
          <ul className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <li className="nav-item">
              <a href="/#home" onClick={(e) => handleLinkClick(e, '/#home')}>Home</a>
            </li>
            <li className="nav-item">
              <a href="/Shop" onClick={(e) => handleLinkClick(e, '/Shop')}>Shop</a>
            </li>
            
            {/* Categories Dropdown */}
            <li 
              className="nav-item has-dropdown"
              onMouseEnter={() => setCategoriesDropdownOpen(true)}
              onMouseLeave={() => setCategoriesDropdownOpen(false)}
            >
              <div className="dropdown-toggle" onClick={(e) => handleLinkClick(e, '/#categories')}>
                Categories <ChevronDown className="dropdown-icon" />
              </div>
              <ul className={`dropdown-menu ${categoriesDropdownOpen ? 'show' : ''}`}>
                {categories.map((category) => (
                  <li key={category}>
                    <a 
                      href={`/Shop?category=${category.toLowerCase()}`} 
                      className="dropdown-item"
                      onClick={(e) => handleLinkClick(e, `/Shop?category=${category.toLowerCase()}`)}
                    >
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
            </li>

            <li className="nav-item">
              <a href="/NewArrivals" onClick={(e) => handleLinkClick(e, '/NewArrivals')}>New Arrivals</a>
            </li>
            <li className="nav-item">
              <a href="/Offers" onClick={(e) => handleLinkClick(e, '/Offers')}>Offers</a>
            </li>
            <li className="nav-item">
              <a href="/About" onClick={(e) => handleLinkClick(e, '/About')}>About</a>
            </li>
            <li className="nav-item">
              <a href="/Contact" onClick={(e) => handleLinkClick(e, '/Contact')}>Contact</a>
            </li>
          </ul>

          {/* Action Icons in specified order: Search, Wishlist, Cart, Profile */}
          <div className="nav-icons">
            <button 
              className="icon-btn search-btn" 
              aria-label="Search"
              onClick={(e) => handleLinkClick(e, '/Shop')}
            >
              <Search size={20} />
            </button>

            <button className="icon-btn wishlist-btn" aria-label="Wishlist">
              <Heart size={20} />
            </button>

            <button className="icon-btn cart-btn" aria-label="Cart">
              <ShoppingBag size={20} />
              <span className="icon-badge">0</span>
            </button>

            <button className="icon-btn profile-btn" aria-label="Account">
              <User size={20} />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
