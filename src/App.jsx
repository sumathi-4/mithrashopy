import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustBar from './components/TrustBar';
import CategoryCards from './components/CategoryCards';
import VideoShowcase from './components/VideoShowcase';
import ProductsSection from './components/ProductsSection';
import CelebrityCollection from './components/CelebrityCollection';
import Footer from './components/Footer';
import ShopView from './components/ShopView';
import ContactView from './components/ContactView';
import AboutView from './components/AboutView';
import OffersView from './components/OffersView';
import NewArrivalsView from './components/NewArrivalsView';
import CelebrityView from './components/CelebrityView';
import WhyChooseUs from './components/WhyChooseUs';
import UserAccount from './components/UserAccount';
import LuckyCharmModal from './components/LuckyCharmModal';
import LuckyCharmPage from './components/LuckyCharmPage';
import { ToastProvider } from './components/ToastProvider';
import { verifySession, getStoredUser, logout } from './services/authService';
import CustomFeatureSection from './components/CustomFeatureSection';
import { apiService } from './services/apiService';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [authUser, setAuthUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const [features, setFeatures] = useState([]);

  // ── Load website functionalities/features ─────────────────────────
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const data = await apiService.getFeatures();
        if (data) {
          setFeatures(data);
        }
      } catch (e) {
        console.error('Error fetching features:', e);
      }
    };
    fetchFeatures();

    const handleUpdate = () => fetchFeatures();
    window.addEventListener('mithira_features_update', handleUpdate);
    return () => window.removeEventListener('mithira_features_update', handleUpdate);
  }, []);

  const renderFeature = (feature) => {
    if (feature.status !== 'Active') return null;

    switch (feature.key) {
      case 'hero':
        return <Hero key="hero" />;
      case 'trust_bar':
        return <TrustBar key="trust_bar" />;
      case 'categories':
        return <CategoryCards key="categories" />;
      case 'video_showcase':
        return <VideoShowcase key="video_showcase" />;
      case 'exclusive_products':
        return <ProductsSection key="exclusive_products" authUser={authUser} setAuthUser={setAuthUser} />;
      case 'celebrity_collection':
        return <CelebrityCollection key="celebrity_collection" />;
      case 'why_choose_us':
        return <WhyChooseUs key="why_choose_us" />;
      default:
        return (
          <CustomFeatureSection
            key={feature.key}
            name={feature.name}
            title={feature.title}
            subtitle={feature.subtitle}
          />
        );
    }
  };

  // ── Restore session on page load ──────────────────────────────────
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setAuthUser(storedUser);
      verifySession().then((freshUser) => {
        if (freshUser) {
          setAuthUser(freshUser);
        } else {
          setAuthUser(null);
          logout();
        }
      }).finally(() => setSessionChecked(true));
    } else {
      setSessionChecked(true);
    }
  }, []);

  // ── Path-based routing ────────────────────────────────────────────
  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/account')) {
        setCurrentView('account');
      } else if (path.includes('/shop')) {
        setCurrentView('shop');
      } else if (path.includes('/offers')) {
        setCurrentView('offers');
      } else if (path.includes('/newarrivals') || path.includes('/new-arrivals')) {
        setCurrentView('new-arrivals');
      } else if (path.includes('/celebrity')) {
        setCurrentView('celebrity');
      } else if (path.includes('/lucky-charms')) {
        setCurrentView('lucky-charms');
      } else {
        setCurrentView('home');
      }
    };
    checkPath();
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  // ── Scroll hash handling ──────────────────────────────────────────
  useEffect(() => {
    if (currentView === 'home') {
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          const target = document.querySelector(hash);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [currentView, window.location.hash]);

  // ── Back to Top visibility ────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setShowBackTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (path) => {
    if (path === '/admin') {
      setCurrentView('admin');
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <ToastProvider>
      {currentView !== 'admin' && currentView !== 'lucky-charms' && (
        <Navbar authUser={authUser} setAuthUser={setAuthUser} onNavigate={handleNavigate} />
      )}
      {currentView === 'home' && (
        <>
          {features && features.length > 0 ? (
            features.map(f => renderFeature(f))
          ) : (
            <>
              <Hero />
              <TrustBar />
              <CategoryCards />
              <VideoShowcase />
              <ProductsSection authUser={authUser} setAuthUser={setAuthUser} />
              <CelebrityCollection />
              <WhyChooseUs />
            </>
          )}
        </>
      )}
      {currentView === 'shop' && <ShopView authUser={authUser} setAuthUser={setAuthUser} />}
      {currentView === 'offers' && <OffersView />}
      {currentView === 'new-arrivals' && <NewArrivalsView />}
      {currentView === 'celebrity' && <CelebrityView />}
      {currentView === 'lucky-charms' && <LuckyCharmPage authUser={authUser} setAuthUser={setAuthUser} onNavigate={handleNavigate} />}
      {currentView === 'account' && (
        <UserAccount
          authUser={authUser}
          setAuthUser={setAuthUser}
          onNavigate={handleNavigate}
        />
      )}
      {currentView !== 'lucky-charms' && <Footer />}
      <LuckyCharmModal />



      {/* ── Back to Top Button ───────────────────────────────────── */}
      {showBackTop && (
        <button
          className="back-to-top-btn"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </ToastProvider>
  );
}

export default App;
