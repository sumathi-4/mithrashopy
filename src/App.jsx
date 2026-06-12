import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryCards from './components/CategoryCards';
import ProductsSection from './components/ProductsSection';
import CelebrityCollection from './components/CelebrityCollection';
import PremiumCollection from './components/PremiumCollection';
import GiftsByOccasion from './components/GiftsByOccasion';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <CategoryCards />
      <ProductsSection />
      <CelebrityCollection />
      <PremiumCollection />
      <GiftsByOccasion />
      <Footer />
    </>
  );
}

export default App;




