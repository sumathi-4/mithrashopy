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
      {currentView !== 'admin' && (
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
      {currentView === 'account' && (
        <UserAccount
          authUser={authUser}
          setAuthUser={setAuthUser}
          onNavigate={handleNavigate}
        />
      )}
      <Footer />
      <LuckyCharmModal />

      {/* ── Floating WhatsApp Button ─────────────────────────────── */}
      <a
        href="https://wa.me/919876543210?text=Hi%20Mithira%20Shoppy!%20I%20need%20help."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-btn"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="whatsapp-tooltip">Chat with us!</span>
      </a>

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
