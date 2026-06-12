import React, { useState } from 'react';
import { Search, Heart, User, ShoppingBag, ChevronDown, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  const categories = ['Clothing', 'Stationery', 'Gifts', 'Accessories'];

  const handleLinkClick = (e, path) => {
    e.preventDefault();
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
    setMobileMenuOpen(false);
  };

  return (
    <div className="navbar-container">
      {/* Top Announcement Bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <span>🎉 Free Shipping on orders above ₹999</span>
          <span>✨ Exclusive Collection For You</span>
        </div>
        <div className="top-bar-right">
          <a href="#track">Track Order</a>
          <span>|</span>
          <a href="#support">Help & Support</a>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        {/* Mobile Menu Icon (Left on mobile) */}
        <button 
          className="menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo (Centered on desktop, customized SVG brand matching reference img2) */}
        <a href="/" onClick={(e) => handleLinkClick(e, '/')} className="logo-link">
          <div className="flex flex-col items-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {/* Elegant Golden Crown SVG matching img2 */}
            <svg 
              className="crown-svg" 
              viewBox="0 0 100 40" 
              style={{ width: '45px', height: '22px', fill: '#c49a6c', marginBottom: '2px' }}
            >
              <path d="M 15,35 L 85,35 L 80,18 L 65,26 L 50,10 L 35,26 L 20,18 Z M 15,37 L 85,37 L 85,39 L 15,39 Z" />
              {/* Crown Jewels (small circles) */}
              <circle cx="20" cy="15" r="2.5" />
              <circle cx="50" cy="7" r="3" />
              <circle cx="80" cy="15" r="2.5" />
              <circle cx="35" cy="24" r="2" />
              <circle cx="65" cy="24" r="2" />
            </svg>
            <h1 className="logo-text" style={{ fontFamily: "var(--font-serif)", fontSize: '1.4rem', fontWeight: 600, letterSpacing: '0.02em', margin: 0, lineHeight: 1 }}>
              <span style={{ color: 'var(--text-dark)' }}>Mithira</span>
              <span style={{ color: 'var(--primary-rose)', fontWeight: 400 }}>Shoppy</span>
            </h1>
          </div>
        </a>

        {/* Navigation Menu Links */}
        <ul className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <li className="nav-item">
            <a href="/#home" onClick={(e) => handleLinkClick(e, '/#home')}>Home</a>
          </li>
          <li className="nav-item">
            <a href="/Shop" onClick={(e) => handleLinkClick(e, '/Shop')}>Shop</a>
          </li>
          
          {/* Categories Dropdown */}
          <li 
            className="nav-item"
            onMouseEnter={() => setCategoriesDropdownOpen(true)}
            onMouseLeave={() => setCategoriesDropdownOpen(false)}
          >
            <div className="dropdown-toggle" onClick={(e) => handleLinkClick(e, '/#categories')}>
              Categories <ChevronDown className="dropdown-icon" />
            </div>
            <ul className={`dropdown-menu ${categoriesDropdownOpen ? 'show' : ''}`} style={{ display: categoriesDropdownOpen ? 'block' : 'none' }}>
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
            <a href="/Celebrity" onClick={(e) => handleLinkClick(e, '/Celebrity')}>Celebrity Collection</a>
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

        {/* Action Icons (Search, Wishlist, Account, Cart) */}
        <div className="nav-icons">
          <button 
            className="icon-btn" 
            aria-label="Search"
            onClick={(e) => handleLinkClick(e, '/Shop')}
          >
            <Search size={20} />
          </button>

          <button className="icon-btn" aria-label="Account">
            <User size={20} />
          </button>
          <button className="icon-btn" aria-label="Wishlist">
            <Heart size={20} />
          </button>
          <button className="icon-btn" aria-label="Cart">
            <ShoppingBag size={20} />
            <span className="icon-badge">0</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
