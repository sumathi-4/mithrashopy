import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, User, ShoppingBag, ChevronDown, Menu, X, Eye, EyeOff, Shield, LogOut, LayoutDashboard } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { loginUser, registerUser, loginAdmin, logout as authLogout } from '../services/authService';
import { apiService } from '../services/apiService';

export default function Navbar({ authUser, setAuthUser, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [authModal, setAuthModal] = useState(null); // null | 'user' | 'admin'
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User login form state
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showUserPwd, setShowUserPwd] = useState(false);
  const [userLoginError, setUserLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [regError, setRegError] = useState('');



  const [announcements, setAnnouncements] = useState([]);

  // ── Search state ──────────────────────────────────────────────────
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProductsSearch] = useState([]);
  const searchRef = useRef(null);

  const profileRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOpenAuth = (e) => {
      openModal(e.detail?.type || 'user');
    };
    window.addEventListener('mithira_open_auth_modal', handleOpenAuth);
    return () => window.removeEventListener('mithira_open_auth_modal', handleOpenAuth);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (authModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [authModal]);

  // Load active announcements from the backend
  useEffect(() => {
    apiService.getAnnouncements().then(data => {
      if (data && data.length > 0) {
        const active = data.filter(a => a.status === 'Active');
        if (active.length > 0) {
          setAnnouncements(active);
        }
      }
    }).catch(console.error);
  }, []);

  const [categoriesList, setCategoriesList] = useState([]);
  const [hoveredSubKeys, setHoveredSubKeys] = useState({});
  
  // Load categories from backend
  useEffect(() => {
    apiService.getCategories().then(data => {
      if (data && data.length > 0) setCategoriesList(data);
    }).catch(console.error);
  }, []);

  // Load all products for search
  useEffect(() => {
    apiService.getProducts().then(data => {
      if (data && data.length > 0) setAllProductsSearch(data);
    }).catch(console.error);
  }, []);

  // Close search on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getUnifiedCategories = () => {
    const defaultGroups = [
      { name: 'Clothing', key: 'CLOTHING' },
      { name: 'Stationery', key: 'STATIONERY' },
      { name: 'Gifts', key: 'GIFTS' },
      { name: 'Accessories', key: 'ACCESSORIES' }
    ];

    const buildTree = (parentName, parentKey) => {
      if (!categoriesList || categoriesList.length === 0) return [];
      const dbChildren = categoriesList.filter(cat => cat.parent && cat.parent.toLowerCase() === parentName.toLowerCase());
      return dbChildren.map(cat => {
        const uniqueKey = `${parentKey}_${cat.name.toUpperCase().replace(/\s+/g, '_')}`;
        return {
          key: uniqueKey,
          dbName: cat.name,
          label: cat.name,
          children: buildTree(cat.name, uniqueKey)
        };
      });
    };

    const structure = [];

    // Only root categories where showInNavbar !== false
    const dbRoots = categoriesList.filter(
      cat =>
        (!cat.parent || cat.parent === '—') &&
        cat.name !== '—' &&
        cat.showInNavbar !== false
    );

    defaultGroups.forEach(def => {
      const dbRoot = dbRoots.find(r => r.name.toLowerCase() === def.name.toLowerCase());
      // If backend has this category with showInNavbar=false, skip it
      const allRoots = categoriesList.filter(c => (!c.parent || c.parent === '—') && c.name !== '—');
      const dbRootAny = allRoots.find(r => r.name.toLowerCase() === def.name.toLowerCase());
      if (dbRootAny && dbRootAny.showInNavbar === false) return; // explicitly hidden

      const subcategories = dbRoot ? buildTree(dbRoot.name, def.key) : [];
      structure.push({
        name: def.name,
        key: def.key,
        subcategories
      });
    });

    dbRoots.forEach(dbRoot => {
      const alreadyAdded = structure.some(s => s.name.toLowerCase() === dbRoot.name.toLowerCase());
      if (!alreadyAdded) {
        const key = dbRoot.name.toUpperCase().replace(/\s+/g, '_');
        structure.push({
          name: dbRoot.name,
          key,
          subcategories: buildTree(dbRoot.name, key)
        });
      }
    });

    return structure;
  };


  const [guestCartCount, setGuestCartCount] = useState(0);
  const [guestWishlistCount, setGuestWishlistCount] = useState(0);

  const updateGuestCounts = () => {
    try {
      const localCart = localStorage.getItem('mithira_guest_cart');
      const localWish = localStorage.getItem('mithira_guest_wishlist');
      setGuestCartCount(localCart ? JSON.parse(localCart).length : 0);
      setGuestWishlistCount(localWish ? JSON.parse(localWish).length : 0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    updateGuestCounts();
    window.addEventListener('storage', updateGuestCounts);
    window.addEventListener('mithira_cart_update', updateGuestCounts);
    return () => {
      window.removeEventListener('storage', updateGuestCounts);
      window.removeEventListener('mithira_cart_update', updateGuestCounts);
    };
  }, []);

  // Live search handler
  const handleSearchInput = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const lower = q.toLowerCase();
    const filtered = allProducts
      .filter(p => {
        const name = (p.name || p.title || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        return name.includes(lower) || cat.includes(lower);
      })
      .slice(0, 8);
    setSearchResults(filtered);
  };

  const handleSearchSelect = (prod) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    const cat = (prod.category || '').split('>')[0].trim().toUpperCase();
    window.history.pushState({}, '', `/Shop?category=${cat.toLowerCase()}&search=${encodeURIComponent(prod.name || prod.title || '')}`);
    window.dispatchEvent(new Event('popstate'));
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setSearchOpen(false);
      window.history.pushState({}, '', `/Shop?search=${encodeURIComponent(searchQuery.trim())}`);
      window.dispatchEvent(new Event('popstate'));
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleLinkClick = (e, path) => {
    e.preventDefault();
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
    setMobileMenuOpen(false);
  };

  const openModal = (type) => {
    setAuthModal(type);
    setProfileDropdownOpen(false);
    setActiveTab('login');
    setUserEmail(''); setUserPassword(''); setUserLoginError('');
    setRegName(''); setRegEmail(''); setRegPhone(''); setRegPassword(''); setRegError('');
    setAdminEmail(''); setAdminPassword(''); setAdminError('');
  };

  const closeModal = () => setAuthModal(null);

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUserLoginError('');
    try {
      const result = await loginUser({ email: userEmail, password: userPassword });
      if (result.success) {
        setAuthUser(result.user);
        closeModal();
        if (onNavigate) onNavigate('/');
      } else {
        setUserLoginError(result.message || 'Invalid email or password.');
      }
    } catch {
      setUserLoginError('Cannot connect to server. Please ensure the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setRegError('Please fill all required fields.');
      return;
    }
    setIsSubmitting(true);
    setRegError('');
    try {
      const result = await registerUser({ name: regName, email: regEmail, phone: regPhone, password: regPassword });
      if (result.success) {
        setAuthUser(result.user);
        closeModal();
        if (onNavigate) onNavigate('/');
      } else {
        setRegError(result.message || 'Registration failed. Please try again.');
      }
    } catch {
      setRegError('Cannot connect to server. Please ensure the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleLogout = () => {
    authLogout();
    setAuthUser(null);
    setProfileDropdownOpen(false);
    if (onNavigate) onNavigate('/');
  };

  const getInitials = (name) =>
    name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <header className={`navbar-header ${scrolled ? 'scrolled' : ''}`}>
      {/* Main Navbar */}
      <div className="navbar-container">
        {/* ROW 1: Logo, Persistent Search, Right Actions */}
        <div className="navbar-row-one">
          {/* Mobile Menu Toggle Button */}
          <button
            className="menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <a href="/" onClick={(e) => handleLinkClick(e, '/')} className="logo-link">
            <div className="logo-wrapper">
              <img src={`${logoImg}?v=2`} alt="Mithra Shopy Logo" className="logo-img" />
            </div>
          </a>

          {/* Persistent Search Bar */}
          <div className="nav-search-wrapper persistent-search" ref={searchRef}>
            <div className="nav-search-bar-meesho">
              <input
                type="text"
                className="nav-search-input"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={handleSearchInput}
                onKeyDown={handleSearchSubmit}
              />
              {searchQuery && (
                <button className="nav-search-close" onClick={() => { setSearchQuery(''); setSearchResults([]); }} style={{ marginRight: '8px' }}>
                  <X size={16} />
                </button>
              )}
              <button className="nav-search-btn-meesho" onClick={handleSearchSubmit} aria-label="Search">
                <Search size={20} />
              </button>
            </div>
            {/* Live Search Dropdown */}
            {searchResults.length > 0 && (
              <div className="nav-search-dropdown-meesho">
                {searchResults.map((prod, i) => (
                  <div
                    key={prod._id || prod.id || i}
                    className="nav-search-result-item"
                    onClick={() => handleSearchSelect(prod)}
                  >
                    <Search size={13} className="result-icon" />
                    <div className="result-text">
                      <span className="result-name">{prod.name || prod.title}</span>
                      <span className="result-cat">{prod.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
              <div className="nav-search-dropdown-meesho">
                <div className="nav-search-no-result">No products found for "{searchQuery}"</div>
              </div>
            )}
          </div>

          {/* Stacked Row 1 Right Actions */}
          <div className="nav-actions-meesho">
            <a href="/supplier" className="action-text-link" onClick={(e) => handleLinkClick(e, '/supplier')}>
              Become a Supplier
            </a>
            <span className="action-divider">|</span>

            <a href="/lucky-charms" className="action-text-link" onClick={(e) => handleLinkClick(e, '/lucky-charms')}>
              Lucky Charms
            </a>
            <span className="action-divider">|</span>

            {/* Profile Stacked Button */}
            <div className="profile-dropdown-wrapper" ref={profileRef}>
              <button
                className={`action-btn-stacked ${authUser ? 'logged-in' : ''}`}
                aria-label="Account"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                {authUser ? (
                  <div className="nav-user-avatar-meesho">{getInitials(authUser.name)}</div>
                ) : (
                  <User size={28} className="action-icon-meesho" />
                )}
                <span className="action-label-meesho">Profile</span>
              </button>

              {profileDropdownOpen && (
                <div className="profile-dropdown-menu">
                  {authUser ? (
                    <>
                      <div className="pdm-user-header">
                        <div className="pdm-user-avatar">{getInitials(authUser.name)}</div>
                        <div className="pdm-user-info">
                          <div className="pdm-user-name">{authUser.name}</div>
                          <div className="pdm-user-email">{authUser.email}</div>
                        </div>
                      </div>
                      <div className="pdm-divider" />
                      <button
                        className="pdm-item"
                        onClick={() => { if (onNavigate) onNavigate('/account'); setProfileDropdownOpen(false); }}
                      >
                        <User size={15} />
                        <span>My Account</span>
                      </button>
                      <button className="pdm-item pdm-logout" onClick={handleLogout}>
                        <LogOut size={15} />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="pdm-welcome">
                        <User size={22} />
                        <div>
                          <div className="pdm-welcome-title">Hello, Guest!</div>
                          <div className="pdm-welcome-sub">Sign in to your account</div>
                        </div>
                      </div>
                      <div className="pdm-divider" />
                      <button className="pdm-item pdm-user-btn" onClick={() => openModal('user')}>
                        <User size={15} />
                        <span>Login / Register</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Stacked Button */}
            <button
              className="action-btn-stacked"
              aria-label="Wishlist"
              onClick={(e) => handleLinkClick(e, '/account?tab=wishlist')}
            >
              <div className="action-icon-wrapper-meesho">
                <Heart size={28} className="action-icon-meesho" />
                {(authUser ? (authUser.wishlist?.length || 0) : guestWishlistCount) > 0 && (
                  <span className="action-badge-meesho">
                    {authUser ? authUser.wishlist.length : guestWishlistCount}
                  </span>
                )}
              </div>
              <span className="action-label-meesho">Wishlist</span>
            </button>

            {/* Cart Stacked Button */}
            <button
              className="action-btn-stacked"
              aria-label="Cart"
              onClick={(e) => handleLinkClick(e, '/account?tab=cart')}
            >
              <div className="action-icon-wrapper-meesho">
                <ShoppingBag size={28} className="action-icon-meesho" />
                <span className="action-badge-meesho">
                  {authUser ? (authUser.cart?.length || 0) : guestCartCount}
                </span>
              </div>
              <span className="action-label-meesho">Cart</span>
            </button>
          </div>
        </div>

        {/* ROW 2: Horizontal Categories & Hover Mega Menu */}
        <div className={`navbar-row-two ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="nav-menu-meesho">
            <li className="nav-item-meesho">
              <a href="/#home" onClick={(e) => handleLinkClick(e, '/#home')}>Home</a>
            </li>
            <li className="nav-item-meesho">
              <a href="/Shop" onClick={(e) => handleLinkClick(e, '/Shop')}>Shop</a>
            </li>
            {getUnifiedCategories().map((group) => {
              return (
                <li
                  key={group.key}
                  className="nav-item-meesho has-mega-menu"
                >
                  <a
                    href={`/Shop?category=${group.key.toLowerCase()}`}
                    className="category-link-meesho"
                    onClick={(e) => handleLinkClick(e, `/Shop?category=${group.key.toLowerCase()}`)}
                  >
                    {group.name}
                  </a>

                  {/* Mega Menu container */}
                  {group.subcategories && group.subcategories.length > 0 && (
                    <div 
                      className="mega-menu-overlay"
                      onMouseEnter={() => {
                        if (!hoveredSubKeys[group.key]) {
                          setHoveredSubKeys(prev => ({ ...prev, [group.key]: group.subcategories[0].key }));
                        }
                      }}
                    >
                      <div className="mega-menu-split-container">
                        {/* Left Sidebar: Subcategories list */}
                        <div className="mega-menu-sidebar-left">
                          <ul className="mega-menu-sidebar-list">
                            {group.subcategories.map((sub) => (
                              <li 
                                key={sub.key} 
                                className={`mega-menu-sidebar-item ${
                                  (hoveredSubKeys[group.key] || group.subcategories[0]?.key) === sub.key ? 'active' : ''
                                }`}
                                onMouseEnter={() => setHoveredSubKeys(prev => ({ ...prev, [group.key]: sub.key }))}
                              >
                                <a
                                  href={`/Shop?category=${group.key.toLowerCase()}&subcategory=${sub.dbName.toLowerCase()}`}
                                  onClick={(e) => handleLinkClick(e, `/Shop?category=${group.key.toLowerCase()}&subcategory=${sub.dbName.toLowerCase()}`)}
                                >
                                  {sub.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Right Content: Active subcategory's children */}
                        <div className="mega-menu-content-right">
                          {(() => {
                            const activeSubKey = hoveredSubKeys[group.key] || group.subcategories[0]?.key;
                            const activeSub = group.subcategories.find(s => s.key === activeSubKey);
                            if (!activeSub) return null;

                            return (
                              <div className="mega-menu-right-panel">
                                <div className="mega-menu-right-header">
                                  <a 
                                    href={`/Shop?category=${group.key.toLowerCase()}&subcategory=${activeSub.dbName.toLowerCase()}`}
                                    className="mega-menu-right-main-link"
                                    onClick={(e) => handleLinkClick(e, `/Shop?category=${group.key.toLowerCase()}&subcategory=${activeSub.dbName.toLowerCase()}`)}
                                  >
                                    All {activeSub.label}
                                  </a>
                                </div>
                                {activeSub.children && activeSub.children.length > 0 && (
                                  <div className="mega-menu-right-grid">
                                    {activeSub.children.map((child) => {
                                      const hasSubChildren = child.children && child.children.length > 0;
                                      return (
                                        <div className="mega-menu-right-column" key={child.key}>
                                          <a
                                            href={`/Shop?category=${group.key.toLowerCase()}&subcategory=${child.dbName.toLowerCase()}`}
                                            className="mega-menu-right-column-heading"
                                            onClick={(e) => handleLinkClick(e, `/Shop?category=${group.key.toLowerCase()}&subcategory=${child.dbName.toLowerCase()}`)}
                                          >
                                            {child.label}
                                          </a>
                                          {hasSubChildren && (
                                            <ul className="mega-menu-right-column-list">
                                              {child.children.map((subChild) => (
                                                <li key={subChild.key} className="mega-menu-right-item">
                                                  <a
                                                    href={`/Shop?category=${group.key.toLowerCase()}&subcategory=${subChild.dbName.toLowerCase()}`}
                                                    onClick={(e) => handleLinkClick(e, `/Shop?category=${group.key.toLowerCase()}&subcategory=${subChild.dbName.toLowerCase()}`)}
                                                  >
                                                    {subChild.label}
                                                  </a>
                                                </li>
                                              ))}
                                            </ul>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
            <li className="nav-item-meesho">
              <a href="/NewArrivals" onClick={(e) => handleLinkClick(e, '/NewArrivals')}>New Arrivals</a>
            </li>
            <li className="nav-item-meesho">
              <a href="/Offers" onClick={(e) => handleLinkClick(e, '/Offers')}>Offers</a>
            </li>
          </ul>
        </div>
      </div>

      {/* ────────────────────────────────────────────
          AUTH MODAL OVERLAY
      ──────────────────────────────────────────── */}
      {authModal && (
        <div className="auth-overlay" onClick={closeModal}>
          <div
            className={`auth-modal-card ${authModal === 'admin' ? 'auth-modal-admin' : 'auth-modal-user'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="auth-close-btn" onClick={closeModal} aria-label="Close">
              <X size={18} />
            </button>

            {/* ── USER MODAL ── */}
            {authModal === 'user' && (
              <div className="auth-user-content">

                {/* Top Brand Header */}
                <div className="auth-user-header">
                  <div className="auth-user-header-glow" />
                  <img src={`${logoImg}?v=2`} alt="Logo" className="auth-user-logo" />
                  <div className="auth-user-brand">
                    <span className="auth-brand-mithira">Mithra</span>
                    <span className="auth-brand-shoppy">Shopy</span>
                  </div>
                  <p className="auth-user-tagline">Your style. Your story.</p>
                </div>

                {/* Tab Toggle */}
                <div className="auth-user-tabs">
                  <button
                    className={`auth-user-tab ${activeTab === 'login' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('login'); setUserLoginError(''); setRegError(''); }}
                    type="button"
                  >Sign In</button>
                  <button
                    className={`auth-user-tab ${activeTab === 'register' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('register'); setUserLoginError(''); setRegError(''); }}
                    type="button"
                  >New Account</button>
                </div>

                {/* Form Body */}
                <div className="auth-user-body">

                  {/* ── LOGIN FORM ── */}
                  {activeTab === 'login' && (
                    <form className="auth-form" onSubmit={handleUserLogin} noValidate>
                      {userLoginError && <div className="auth-error-msg">{userLoginError}</div>}

                      <div className="auth-field-group">
                        <label className="auth-label">Email Address</label>
                        <input
                          className="auth-input"
                          type="email"
                          placeholder="Enter your email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="auth-field-group">
                        <label className="auth-label">Password</label>
                        <div className="auth-pwd-wrap">
                          <input
                            className="auth-input"
                            type={showUserPwd ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                            required
                          />
                          <button type="button" className="auth-eye-btn" onClick={() => setShowUserPwd(!showUserPwd)}>
                            {showUserPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="auth-forgot-row">
                        <a href="#" className="auth-forgot-link">Forgot Password?</a>
                      </div>

                      <button type="submit" className="auth-primary-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Logging in…' : 'Login to Account'}
                      </button>

                      <p className="auth-switch-text">
                        New here?{' '}
                        <button
                          type="button"
                          className="auth-switch-link"
                          onClick={() => { setActiveTab('register'); setUserLoginError(''); }}
                        >
                          Create Account
                        </button>
                      </p>
                    </form>
                  )}

                  {/* ── REGISTER FORM ── */}
                  {activeTab === 'register' && (
                    <form className="auth-form" onSubmit={handleRegister} noValidate>
                      {regError && <div className="auth-error-msg">{regError}</div>}

                      <div className="auth-field-group">
                        <label className="auth-label">Full Name <span className="auth-required">*</span></label>
                        <input
                          className="auth-input"
                          type="text"
                          placeholder="Enter your full name"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="auth-field-group">
                        <label className="auth-label">Email Address <span className="auth-required">*</span></label>
                        <input
                          className="auth-input"
                          type="email"
                          placeholder="Enter your email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="auth-reg-two-col">
                        <div className="auth-field-group">
                          <label className="auth-label">Mobile Number</label>
                          <input
                            className="auth-input"
                            type="tel"
                            placeholder="Mobile number"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                          />
                        </div>
                        <div className="auth-field-group">
                          <label className="auth-label">Password <span className="auth-required">*</span></label>
                          <div className="auth-pwd-wrap">
                            <input
                              className="auth-input"
                              type={showRegPwd ? 'text' : 'password'}
                              placeholder="Min 6 characters"
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              required
                            />
                            <button type="button" className="auth-eye-btn" onClick={() => setShowRegPwd(!showRegPwd)}>
                              {showRegPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button type="submit" className="auth-primary-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating Account…' : 'Create Account'}
                      </button>

                      <p className="auth-switch-text">
                        Already have an account?{' '}
                        <button
                          type="button"
                          className="auth-switch-link"
                          onClick={() => { setActiveTab('login'); setRegError(''); }}
                        >
                          Sign In
                        </button>
                      </p>
                    </form>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
