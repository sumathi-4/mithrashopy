import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, User, ShoppingBag, ChevronDown, Menu, X, Eye, EyeOff, Shield, LogOut, LayoutDashboard } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { loginUser, registerUser, loginAdmin, logout as authLogout } from '../services/authService';
import { apiService } from '../services/apiService';

export default function Navbar({ authUser, setAuthUser, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
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

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPwd, setShowAdminPwd] = useState(false);
  const [adminError, setAdminError] = useState('');

  const [announcements, setAnnouncements] = useState([]);

  const profileRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const [dynamicCategories, setDynamicCategories] = useState([]);
  
  useEffect(() => {
    apiService.getCategories().then(data => {
      if (data && data.length > 0) {
        // filter unique active categories parent names
        const names = [...new Set(data.map(cat => cat.name.split(' > ')[0]))];
        setDynamicCategories(names);
      }
    }).catch(console.error);
  }, []);

  const categories = dynamicCategories.length > 0 ? dynamicCategories : ['Clothing', 'Stationery', 'Gifts', 'Accessories'];

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

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAdminError('');
    try {
      const result = await loginAdmin({ email: adminEmail, password: adminPassword });
      if (result.success) {
        setAuthUser(result.user);
        closeModal();
        if (onNavigate) onNavigate('/admin');
      } else {
        setAdminError(result.message || 'Invalid admin credentials.');
      }
    } catch {
      setAdminError('Cannot connect to server. Please ensure the backend is running.');
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
      {/* Top Announcement Bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          {announcements.length > 0 ? (
            announcements.map((ann, idx) => (
              <React.Fragment key={ann.id}>
                {idx > 0 && <span className="top-bar-divider">|</span>}
                <span>{ann.text}</span>
              </React.Fragment>
            ))
          ) : (
            <>
              <span>🎉 Free Shipping on orders above ₹999</span>
              <span className="top-bar-divider">|</span>
              <span>✨ Exclusive Collection For You</span>
            </>
          )}
        </div>
        <div className="top-bar-right">
          <a href="#track">Track Order</a>
          <span className="top-bar-divider">|</span>
          <a href="#support">Help &amp; Support</a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="navbar-container">
        <nav className="navbar">
          {/* Mobile Toggle */}
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
              <img src={logoImg} alt="Mithra Shopy Logo" className="logo-img" />
            </div>
          </a>

          {/* Nav Links */}
          <ul className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <li className="nav-item">
              <a href="/#home" onClick={(e) => handleLinkClick(e, '/#home')}>Home</a>
            </li>
            <li className="nav-item">
              <a href="/Shop" onClick={(e) => handleLinkClick(e, '/Shop')}>Shop</a>
            </li>
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

          {/* Action Icons */}
          <div className="nav-icons">
            <button className="icon-btn search-btn" aria-label="Search" onClick={(e) => handleLinkClick(e, '/Shop')}>
              <Search size={20} />
            </button>
            <button className="icon-btn wishlist-btn" aria-label="Wishlist" onClick={(e) => handleLinkClick(e, '/account')}>
              <Heart size={20} />
              {authUser?.wishlist?.length > 0 && (
                <span className="icon-badge">{authUser.wishlist.length}</span>
              )}
            </button>
            <button className="icon-btn cart-btn" aria-label="Cart" onClick={(e) => handleLinkClick(e, '/account')}>
              <ShoppingBag size={20} />
              <span className="icon-badge">{authUser?.cart?.length || 0}</span>
            </button>

            {/* Profile Dropdown */}
            <div className="profile-dropdown-wrapper" ref={profileRef}>
              <button
                className={`icon-btn profile-btn ${authUser ? 'logged-in' : ''}`}
                aria-label="Account"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                {authUser ? (
                  <div className="nav-user-avatar">{getInitials(authUser.name)}</div>
                ) : (
                  <User size={20} />
                )}
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
                      {authUser.role !== 'admin' && (
                        <button
                          className="pdm-item"
                          onClick={() => { if (onNavigate) onNavigate('/account'); setProfileDropdownOpen(false); }}
                        >
                          <User size={15} />
                          <span>My Account</span>
                        </button>
                      )}
                      {authUser.role === 'admin' && (
                        <button
                          className="pdm-item"
                          onClick={() => { if (onNavigate) onNavigate('/admin'); setProfileDropdownOpen(false); }}
                        >
                          <LayoutDashboard size={15} />
                          <span>Admin Dashboard</span>
                        </button>
                      )}
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
                      <button className="pdm-item pdm-admin-btn" onClick={() => openModal('admin')}>
                        <Shield size={15} />
                        <span>Admin Login</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>
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
                {/* Left Panel */}
                <div className="auth-left-panel">
                  <div className="auth-left-inner">
                    <img src={logoImg} alt="Logo" className="auth-panel-logo" />
                    <h2 className="auth-panel-brand">
                      <span className="auth-brand-mithira">Mithra</span>
                      <span className="auth-brand-shoppy">Shopy</span>
                    </h2>
                    <p className="auth-panel-tagline">Your style. Your story.</p>
                    <ul className="auth-panel-perks">
                      <li>🛍️ Exclusive member-only offers</li>
                      <li>❤️ Save items to your wishlist</li>
                      <li>📦 Track your orders easily</li>
                      <li>✨ Early access to new arrivals</li>
                    </ul>
                  </div>
                </div>

                {/* Right Panel – Form */}
                <div className="auth-right-panel">

                  {/* ── Heading changes based on mode ── */}
                  <h3 className="auth-form-heading">
                    {activeTab === 'login' ? 'Welcome Back!' : 'Create Account'}
                  </h3>

                  {/* ── LOGIN FORM ── */}
                  {activeTab === 'login' && (
                    <form className="auth-form" onSubmit={handleUserLogin} noValidate>
                      <p className="auth-form-sub">Log in to access your orders &amp; wishlist</p>
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
                        {isSubmitting ? 'Logging in...' : 'Login to Account'}
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
                      <p className="auth-form-sub">Join Mithra Shopy — it's free!</p>
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

                      <div className="auth-field-group">
                        <label className="auth-label">Mobile Number</label>
                        <input
                          className="auth-input"
                          type="tel"
                          placeholder="Enter your mobile number"
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
                            placeholder="Create a password (min 6 chars)"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            required
                          />
                          <button type="button" className="auth-eye-btn" onClick={() => setShowRegPwd(!showRegPwd)}>
                            {showRegPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <button type="submit" className="auth-primary-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                      </button>

                      <p className="auth-switch-text">
                        Already have an account?{' '}
                        <button
                          type="button"
                          className="auth-switch-link"
                          onClick={() => { setActiveTab('login'); setRegError(''); }}
                        >
                          Login
                        </button>
                      </p>
                    </form>
                  )}

                </div>
              </div>
            )}


            {/* ── ADMIN MODAL ── */}
            {authModal === 'admin' && (
              <div className="auth-admin-content">
                <div className="auth-admin-icon-wrap">
                  <Shield size={36} />
                </div>
                <h2 className="auth-admin-title">Admin Portal</h2>
                <p className="auth-admin-subtitle">Restricted access — authorized personnel only</p>

                <form className="auth-form auth-admin-form" onSubmit={handleAdminLogin} noValidate>
                  {adminError && <div className="auth-error-msg">{adminError}</div>}

                  <div className="auth-field-group">
                    <label className="auth-label">Admin Email</label>
                    <input
                      className="auth-input"
                      type="email"
                      placeholder="Enter admin email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-label">Password</label>
                    <div className="auth-pwd-wrap">
                      <input
                        className="auth-input"
                        type={showAdminPwd ? 'text' : 'password'}
                        placeholder="Enter admin password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                      />
                      <button type="button" className="auth-eye-btn" onClick={() => setShowAdminPwd(!showAdminPwd)}>
                        {showAdminPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="auth-primary-btn auth-admin-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Verifying...' : 'Access Dashboard'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
