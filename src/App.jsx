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


function App() {
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    // Check path on initial mount
    const checkPath = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/shop')) {
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

  return (
    <>
      <Navbar />
      {currentView === 'home' && (
        <>
          <Hero />
          <CategoryCards />
          <ProductsSection />
          <CelebrityCollection />
          <PremiumCollection />
          <GiftsByOccasion />
          <WhyChooseUs />
          <AboutPreview />

        </>
      )}
      {currentView === 'shop' && <ShopView />}
      {currentView === 'contact' && <ContactView />}
      {currentView === 'about' && <AboutView />}
      {currentView === 'offers' && <OffersView />}
      {currentView === 'new-arrivals' && <NewArrivalsView />}
      {currentView === 'celebrity' && <CelebrityView />}
      <Footer />
    </>
  );
}

export default App;





