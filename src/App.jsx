import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryCards from './components/CategoryCards';
import ProductsSection from './components/ProductsSection';
import CelebrityCollection from './components/CelebrityCollection';
import PremiumCollection from './components/PremiumCollection';
import GiftsByOccasion from './components/GiftsByOccasion';
import Footer from './components/Footer';
import ShopView from './components/ShopView';
import ContactView from './components/ContactView';
import AboutView from './components/AboutView';
import OffersView from './components/OffersView';
import NewArrivalsView from './components/NewArrivalsView';
import CelebrityView from './components/CelebrityView';
import WhyChooseUs from './components/WhyChooseUs';
import AboutPreview from './components/AboutPreview';
import AdminDashboard from './components/AdminDashboard';
import UserAccount from './components/UserAccount';
import { verifySession, getStoredUser, logout } from './services/authService';


function App() {
  const [currentView, setCurrentView] = useState('home');
  const [authUser, setAuthUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // ── Restore session on page load ──────────────────────────────────
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      // Optimistically restore from localStorage for instant UI
      setAuthUser(storedUser);
      // Then verify with server in background
      verifySession().then((freshUser) => {
        if (freshUser) {
          setAuthUser(freshUser);
        } else {
          // Token expired or invalid — clear
          setAuthUser(null);
          logout();
        }
      }).finally(() => setSessionChecked(true));
    } else {
      setSessionChecked(true);
    }
  }, []);

  useEffect(() => {
    // Check path on initial mount
    const checkPath = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/admin')) {
        setCurrentView('admin');
      } else if (path.includes('/account')) {
        setCurrentView('account');
      } else if (path.includes('/shop')) {
        setCurrentView('shop');
      } else if (path.includes('/contact')) {
        setCurrentView('contact');
      } else if (path.includes('/about')) {
        setCurrentView('about');
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

    // Listen to history changes (popstate)
    const handlePopState = () => {
      checkPath();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle smooth scrolling to target hashes after currentView matches 'home'
  useEffect(() => {
    if (currentView === 'home') {
      const hash = window.location.hash;
      if (hash) {
        // Wait a tick for React rendering cycle to finish
        setTimeout(() => {
          const target = document.querySelector(hash);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } else {
      // Scroll page to top on mount for shop/contact views
      window.scrollTo(0, 0);
    }
  }, [currentView, window.location.hash]);

  const handleNavigate = (path) => {
    if (path === '/admin') {
      setCurrentView('admin');
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  return (
    <>
      {currentView !== 'admin' && (
        <Navbar authUser={authUser} setAuthUser={setAuthUser} onNavigate={handleNavigate} />
      )}
      {currentView === 'home' && (
        <>
          <Hero />
          <CategoryCards />
          <ProductsSection authUser={authUser} setAuthUser={setAuthUser} />
          <CelebrityCollection />
          <PremiumCollection />
          <GiftsByOccasion />
          <WhyChooseUs />
          <AboutPreview />

        </>
      )}
      {currentView === 'shop' && <ShopView authUser={authUser} setAuthUser={setAuthUser} />}
      {currentView === 'contact' && <ContactView />}
      {currentView === 'about' && <AboutView />}
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
      {currentView === 'admin' && (
        <AdminDashboard
          authUser={authUser}
          setAuthUser={setAuthUser}
          onNavigate={handleNavigate}
        />
      )}
      {currentView !== 'admin' && <Footer />}
    </>
  );
}

export default App;
