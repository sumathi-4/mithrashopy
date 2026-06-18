/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { Heart, Star, ShoppingCart, Search, Eye, X, Phone, ChevronDown, ChevronUp, ArrowLeft, Filter, Crown, Menu, Shirt, BookOpen, Gift } from 'lucide-react';
import logoImg from '../assets/logo.png';
import pHairUpdated from '../assets/p_hair_updated.jpg';
import pRing from '../assets/p_ring.jpg';
import pNeck from '../assets/p_neck.jpg';
import celebCouple from '../assets/celeb_couple.jpg';
import kids_tq_2 from '../assets/kids_tq_2.jpg';
import kids_tq_3 from '../assets/kids_tq_3.jpg';
import kids_tq_4 from '../assets/kids_tq_4.jpg';
import kids_tq_6 from '../assets/kids_tq_6.jpg';
import kids_tq_7 from '../assets/kids_tq_7.jpg';
import kids_tq_14 from '../assets/kids_tq_14.jpg';
import kids_tq_17 from '../assets/kids_tq_17.jpg';
import kids_tq_18 from '../assets/kids_tq_18.jpg';
import kids_tq_19 from '../assets/kids_tq_19.jpg';
import kids_tq_21 from '../assets/kids_tq_21.jpg';
import kids_tq_25 from '../assets/kids_tq_25.jpg';
import kids_tq_32 from '../assets/kids_tq_32.jpg';
import kids_tq_35 from '../assets/kids_tq_35.jpg';
import kids_tq_42 from '../assets/kids_tq_42.jpg';
import kids_tq_52 from '../assets/kids_tq_52.jpg';
import kids_tq_57 from '../assets/kids_tq_57.jpg';
import kids_tq_60 from '../assets/kids_tq_60.jpg';
import kids_tq_63 from '../assets/kids_tq_63.jpg';
import kids_tq_64 from '../assets/kids_tq_64.jpg';
import kids_tq_77 from '../assets/kids_tq_77.jpg';
import kids_tq_80 from '../assets/kids_tq_80.jpg';
import kids_tq_87 from '../assets/kids_tq_87.jpg';
import kids_tq_89 from '../assets/kids_tq_89.jpg';
import kids_tq_93 from '../assets/kids_tq_93.jpg';
import kids_tq_95 from '../assets/kids_tq_95.jpg';
import kids_tq_103 from '../assets/kids_tq_103.jpg';
import kids_tq_109 from '../assets/kids_tq_109.jpg';
import kids_tq_110 from '../assets/kids_tq_110.jpg';
import kids_tq_113 from '../assets/kids_tq_113.jpg';
import kids_tq_126 from '../assets/kids_tq_126.jpg';
import kids_tq_138 from '../assets/kids_tq_138.jpg';
import kids_tq_137 from '../assets/kids_tq_137.jpg';
import kids_tq_145 from '../assets/kids_tq_145.jpg';
import kids_tq_148 from '../assets/kids_tq_148.jpg';
import kids_tq_151 from '../assets/kids_tq_151.jpg';
import kids_tq_152 from '../assets/kids_tq_152.jpg';
import kids_tq_157 from '../assets/kids_tq_157.jpg';
import kids_tq_161 from '../assets/kids_tq_161.jpg';
import kids_tq_165 from '../assets/kids_tq_165.jpg';
import shopBannerRaw from '../assets/shop_banner_raw.jpg';
import imgClothing from '../assets/hero_clothing.jpg';
import imgStationery from '../assets/hero_stationery.jpg';
import imgGifts from '../assets/hero_gifts.jpg';
import imgAccessories from '../assets/hero_accessories.jpg';
import clothingUser1 from '../assets/clothing_user_1.jpg';
import clothingUser2 from '../assets/clothing_user_2.jpg';
import clothingUser3 from '../assets/clothing_user_3.jpg';
import clothingUser4 from '../assets/clothing_user_4.jpg';
import clothingUser5 from '../assets/clothing_user_5.jpg';



const kidsImages = import.meta.glob('../assets/kids_tq_*.jpg', { eager: true });

const getProductImages = (modelNo, defaultImage) => {
  if (!modelNo) return [defaultImage];
  const modelKey = modelNo.toLowerCase().replace('-', '_');
  const matchedImages = [];
  
  const fullKey = `../assets/kids_${modelKey}_full.jpg`;
  if (kidsImages[fullKey]) {
    matchedImages.push(kidsImages[fullKey].default || kidsImages[fullKey]);
  }
  
  const mainKey = `../assets/kids_${modelKey}.jpg`;
  if (kidsImages[mainKey]) {
    matchedImages.push(kidsImages[mainKey].default || kidsImages[mainKey]);
  } else {
    matchedImages.push(defaultImage);
  }
  
  for (let i = 1; i <= 10; i++) {
    const swatchKey = `../assets/kids_${modelKey}_g${i}.jpg`;
    if (kidsImages[swatchKey]) {
      matchedImages.push(kidsImages[swatchKey].default || kidsImages[swatchKey]);
    }
  }
  
  return matchedImages;
};

// Resolve all gallery images for a product
const getAllProductImages = (prod) => {
  if (!prod) return [];
  
  // Kids clothing with model number
  if (prod.category === 'CLOTHING' && prod.subCategory === 'KIDS' && prod.modelNo) {
    const customImages = getProductImages(prod.modelNo, prod.image);
    if (customImages.length > 1) return customImages;
  }
  
  // Generic clothing mapping for interactive thumbnails
  if (prod.category === 'CLOTHING') {
    const isKids = prod.subCategory === 'KIDS' || 
                   (prod.category && prod.category.toLowerCase().includes('kids')) ||
                   (prod.category && prod.category.toLowerCase().includes('child')) ||
                   (prod.title && prod.title.toLowerCase().includes('kids')) || 
                   (prod.title && prod.title.toLowerCase().includes('girl')) || 
                   (prod.title && prod.title.toLowerCase().includes('boy')) || 
                   (prod.title && prod.title.toLowerCase().includes('baby')) || 
                   (prod.title && prod.title.toLowerCase().includes('frock')) || 
                   (prod.title && prod.title.toLowerCase().includes('anarkali'));
    if (isKids) {
      return [clothingUser1, clothingUser5];
    } else {
      return [clothingUser2, clothingUser3, clothingUser4];
    }
  }
  
  if (prod.images && prod.images.length > 0) {
    return prod.images;
  }
  
  return [prod.image];
};

// Retrieve themed colors for products based on category/model number
const getProductThemedColors = (prod) => {
  if (!prod) return [];

  // If product has custom variants with colors, use them
  if (prod.variants && prod.variants.length > 0) {
    const uniqueColors = [...new Set(prod.variants.map(v => v.color).filter(Boolean))];
    if (uniqueColors.length > 0) {
      return uniqueColors.map(colorName => ({
        name: colorName,
        hex: getColorHex(colorName)
      }));
    }
  }

  if (prod.subCategory === 'KIDS' && prod.modelNo) {
    const model = prod.modelNo.toUpperCase();
    if (model.includes('TQ-2')) return [{ name: 'Pink', hex: '#ff80b3' }, { name: 'Purple', hex: '#a366ff' }];
    if (model.includes('TQ-3') || model.includes('TQ-4')) return [
      { name: 'Pink', hex: '#ff99b3' },
      { name: 'Grey', hex: '#999999' },
      { name: 'Red', hex: '#ff3333' },
      { name: 'Purple', hex: '#a366ff' },
      { name: 'Green', hex: '#4dff88' }
    ];
    if (model.includes('TQ-6')) return [
      { name: 'Sage Green', hex: '#99b399' },
      { name: 'Yellow', hex: '#ffdd66' },
      { name: 'Peach', hex: '#ffaa88' },
      { name: 'Blue', hex: '#6688ff' },
      { name: 'Olive', hex: '#889966' }
    ];
    if (model.includes('TQ-7')) return [
      { name: 'Grey', hex: '#888888' },
      { name: 'Olive', hex: '#889966' },
      { name: 'Blue', hex: '#3366ff' },
      { name: 'Green', hex: '#33ccaa' },
      { name: 'Light Blue', hex: '#88ccff' }
    ];
    if (model.includes('TQ-14')) return [
      { name: 'Brown', hex: '#cc8866' },
      { name: 'Pink', hex: '#ffb3d1' },
      { name: 'Blue', hex: '#4d88ff' },
      { name: 'Green', hex: '#88cc88' }
    ];
    if (model.includes('TQ-17')) return [
      { name: 'Pink', hex: '#ff99b3' },
      { name: 'Green', hex: '#88cc88' },
      { name: 'Purple', hex: '#cc99ff' },
      { name: 'Yellow', hex: '#ffdd66' },
      { name: 'Blue', hex: '#6688ff' }
    ];
    if (model.includes('TQ-18')) return [
      { name: 'Mint Green', hex: '#66e0a3' },
      { name: 'Yellow', hex: '#ffd166' },
      { name: 'Blue', hex: '#4d88ff' },
      { name: 'Olive', hex: '#889966' },
      { name: 'Navy', hex: '#1a2e3b' }
    ];
    if (model.includes('TQ-19')) return [
      { name: 'Blue', hex: '#4a7bb0' },
      { name: 'Purple', hex: '#b5a6d9' },
      { name: 'White', hex: '#ffffff' }
    ];
    if (model.includes('TQ-21')) return [
      { name: 'Pink', hex: '#ffa6c9' },
      { name: 'Wine', hex: '#6b2d5c' },
      { name: 'Mint', hex: '#a8d5ba' },
      { name: 'Charcoal', hex: '#3b3b3b' },
      { name: 'Blue', hex: '#4682b4' }
    ];
    if (model.includes('TQ-25')) return [
      { name: 'Purple-White', hex: '#b39ddb' },
      { name: 'Yellow-White', hex: '#fff59d' },
      { name: 'Pink-White', hex: '#f8bbd0' },
      { name: 'Green-White', hex: '#a5d6a7' },
      { name: 'Black-White', hex: '#e0e0e0' }
    ];
    if (model.includes('TQ-32')) return [
      { name: 'Charcoal', hex: '#424242' }
    ];
    if (model.includes('TQ-35')) return [
      { name: 'Pink', hex: '#ff80df' },
      { name: 'Rose', hex: '#ff99dd' },
      { name: 'Yellow', hex: '#ffcc00' },
      { name: 'Mint', hex: '#66e0a3' },
      { name: 'Blue', hex: '#66ccff' },
      { name: 'Lavender', hex: '#cc99ff' }
    ];
    if (model.includes('TQ-42') || model.includes('TQ-64')) return [
      { name: 'Navy', hex: '#1a237e' },
      { name: 'Black', hex: '#212121' },
      { name: 'Light Blue', hex: '#90caf9' },
      { name: 'Grey', hex: '#e0e0e0' },
      { name: 'Red', hex: '#ef5350' }
    ];
    if (model.includes('TQ-52') || model.includes('TQ-80')) return [
      { name: 'Beige', hex: '#d7ccc8' },
      { name: 'Sage', hex: '#c8e6c9' },
      { name: 'Pink', hex: '#f8bbd0' },
      { name: 'Yellow', hex: '#fff9c4' },
      { name: 'Blue', hex: '#bbdefb' }
    ];
    if (model.includes('TQ-57') || model.includes('TQ-60')) return [
      { name: 'Khaki', hex: '#d7ccc8' },
      { name: 'Pink', hex: '#f8bbd0' },
      { name: 'Sage', hex: '#c8e6c9' },
      { name: 'Coral', hex: '#ffab91' },
      { name: 'Blue', hex: '#bbdefb' }
    ];
    if (model.includes('TQ-63') || model.includes('TQ-93')) return [
      { name: 'Maroon', hex: '#880e4f' },
      { name: 'Plum', hex: '#4a148c' },
      { name: 'Olive', hex: '#558b2f' },
      { name: 'Beige', hex: '#d7ccc8' },
      { name: 'Green', hex: '#a5d6a7' }
    ];
    if (model.includes('TQ-87') || model.includes('TQ-145')) return [
      { name: 'Blue', hex: '#1565c0' },
      { name: 'Rose', hex: '#e91e63' },
      { name: 'Olive', hex: '#2e7d32' },
      { name: 'Yellow', hex: '#fbc02d' },
      { name: 'Purple', hex: '#6a1b9a' }
    ];
    if (model.includes('TQ-89') || model.includes('TQ-95')) return [
      { name: 'Blue', hex: '#2196f3' },
      { name: 'Sage', hex: '#4caf50' },
      { name: 'Rose', hex: '#e91e63' },
      { name: 'Yellow', hex: '#ffeb3b' },
      { name: 'Grey', hex: '#9e9e9e' }
    ];
    if (model.includes('TQ-103')) return [
      { name: 'Blue-White', hex: '#1976d2' }
    ];
    if (model.includes('TQ-109') || model.includes('TQ-110') || model.includes('TQ-113')) return [
      { name: 'Black', hex: '#212121' },
      { name: 'Blue', hex: '#1e88e5' },
      { name: 'Grey', hex: '#757575' },
      { name: 'Green', hex: '#43a047' },
      { name: 'Brown', hex: '#8d6e63' }
    ];
    if (model.includes('TQ-126') || model.includes('TQ-138')) return [
      { name: 'Purple', hex: '#6a1b9a' },
      { name: 'Dark Grey', hex: '#424242' },
      { name: 'Maroon', hex: '#880e4f' },
      { name: 'Olive', hex: '#2e7d32' },
      { name: 'Blue', hex: '#1565c0' }
    ];
    if (model.includes('TQ-137') || model.includes('TQ-152') || model.includes('TQ-157')) return [
      { name: 'Yellow', hex: '#ffeb3b' },
      { name: 'Cream', hex: '#fff9c4' },
      { name: 'Red', hex: '#f44336' },
      { name: 'Sage', hex: '#81c784' },
      { name: 'Pink', hex: '#f8bbd0' }
    ];
    if (model.includes('TQ-148') || model.includes('TQ-151')) return [
      { name: 'Peach', hex: '#ffcc80' },
      { name: 'White', hex: '#ffffff' },
      { name: 'Grey', hex: '#cfd8dc' },
      { name: 'Yellow', hex: '#ffe082' }
    ];
    if (model.includes('TQ-161') || model.includes('TQ-165')) return [
      { name: 'Pink', hex: '#f48fb1' },
      { name: 'Cream', hex: '#fff59d' },
      { name: 'Aqua', hex: '#80deea' },
      { name: 'Lavender', hex: '#ce93d8' },
      { name: 'Navy', hex: '#3949ab' }
    ];
  }
  if (prod.category === 'CLOTHING') {
    const isKids = prod.subCategory === 'KIDS' || 
                   (prod.category && prod.category.toLowerCase().includes('kids')) ||
                   (prod.category && prod.category.toLowerCase().includes('child')) ||
                   (prod.title && prod.title.toLowerCase().includes('kids')) || 
                   (prod.title && prod.title.toLowerCase().includes('girl')) || 
                   (prod.title && prod.title.toLowerCase().includes('boy')) || 
                   (prod.title && prod.title.toLowerCase().includes('baby')) || 
                   (prod.title && prod.title.toLowerCase().includes('frock')) || 
                   (prod.title && prod.title.toLowerCase().includes('anarkali'));
    if (isKids && !prod.modelNo) {
      return [
        { name: 'Pure White', hex: '#ffffff' },
        { name: 'Ocean Blue', hex: '#1e88e5' }
      ];
    }
    return [
      { name: 'Crimson Red', hex: '#b32142' },
      { name: 'Champagne Gold', hex: '#D4AF37' },
      { name: 'Midnight Black', hex: '#111111' }
    ];
  }
  if (prod.category === 'GIFTS') {
    return [
      { name: 'Lavender', hex: '#6d678d' },
      { name: 'Soft Pink', hex: '#f8bbd0' },
      { name: 'Plum', hex: '#4a148c' }
    ];
  }
  if (prod.category === 'STATIONERY') {
    return [
      { name: 'Slate Blue', hex: '#6b8195' },
      { name: 'Baby Blue', hex: '#bbdefb' },
      { name: 'Cool Grey', hex: '#b0bec5' }
    ];
  }
  if (prod.category === 'ACCESSORIES') {
    return [
      { name: 'Imperial Gold', hex: '#D4AF37' },
      { name: 'Silver Platinum', hex: '#e0e0e0' },
      { name: 'Rose Gold', hex: '#b71c1c' }
    ];
  }
  return [];
};

// Helper to resolve category themed classes based on user preferences
const getCategoryThemeClass = (category) => {
  const cat = String(category).toUpperCase();
  if (cat.includes('CLOTHING') || cat.includes('DRESS')) return 'theme-clothing';
  if (cat.includes('STATIONERY')) return 'theme-stationery';
  if (cat.includes('GIFT')) return 'theme-gifts';
  if (cat.includes('ACCESSORIES') || cat.includes('FANCY')) return 'theme-accessories';
  return 'theme-clothing';
};

const renderCategorySelectors = (prod, modalSize, setModalSize, modalColor, setModalColor, activeImageIndex, setActiveImageIndex, images, colors, modalQty, setModalQty) => {
  if (!prod) return null;
  const category = String(prod.category).toUpperCase();

  if (category.includes('CLOTHING') || category.includes('DRESS')) {
    return (
      <>
        {/* Colors selector */}
        {colors.length > 0 && (
          <div className="modal-section-block">
            <span className="modal-section-title">Color: <span className="color-name">{colors[activeImageIndex]?.name || colors[0]?.name || ""}</span></span>
            <div className="modal-color-dots">
              {colors.map((c, idx) => (
                <button 
                  key={idx}
                  className={`modal-color-dot ${activeImageIndex === idx ? 'active' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => {
                    if (idx < images.length) {
                      setActiveImageIndex(idx);
                    }
                    setModalColor(c.name);
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sizes selector */}
        <div className="modal-section-block">
          <span className="modal-section-title">Select Size</span>
          <div className="modal-size-pills">
            {(prod.subCategory === 'KIDS' ? ['2y', '4y', '6y', '8y'] : ['XS', 'S', 'M', 'L', 'XL', 'XXL']).map((sz) => (
              <button 
                key={sz}
                className={`modal-size-btn ${modalSize === sz ? 'active' : ''}`}
                onClick={() => setModalSize(sz)}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (category.includes('STATIONERY')) {
    const packs = ['Pack of 1', 'Pack of 3', 'Pack of 5', 'Pack of 10'];
    const packSize = modalSize.includes('Pack') ? modalSize : 'Pack of 3';
    return (
      <>
        {/* Colors selector (Ink Color) */}
        <div className="modal-section-block">
          <span className="modal-section-title">Ink Color: {modalColor || "Blue"}</span>
          <div className="modal-color-dots">
            {[
              { name: 'Blue', hex: '#0d47a1' },
              { name: 'Black', hex: '#212121' },
              { name: 'Red', hex: '#b71c1c' }
            ].map((c, idx) => (
              <button 
                key={idx}
                className={`modal-color-dot ${modalColor === c.name ? 'active' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => setModalColor(c.name)}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Pack Size Selector */}
        <div className="modal-section-block">
          <span className="modal-section-title">Pack Size</span>
          <div className="modal-size-pills">
            {packs.map((sz) => (
              <button 
                key={sz}
                className={`modal-size-btn ${packSize === sz ? 'active' : ''}`}
                onClick={() => setModalSize(sz)}
                style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem' }}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (category.includes('GIFT')) {
    const wrapThemes = ['Classic Red', 'Mystic Violet', 'Minimalist White', 'Premium Gold'];
    const selectedTheme = modalColor.includes('Classic') || modalColor.includes('Mystic') || modalColor.includes('Minimal') || modalColor.includes('Premium') ? modalColor : 'Classic Red';
    return (
      <>
        {/* Wrap Occasion selector */}
        <div className="modal-section-block">
          <span className="modal-section-title">Occasion Theme: {modalSize || "Birthday"}</span>
          <div className="modal-size-pills">
            {['Birthday', 'Anniversary', 'Wedding', 'Corporate'].map((sz) => (
              <button 
                key={sz}
                className={`modal-size-btn ${modalSize === sz ? 'active' : ''}`}
                onClick={() => setModalSize(sz)}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Wrapping Paper Selector */}
        <div className="modal-section-block">
          <span className="modal-section-title">Gift Wrapping Theme</span>
          <div className="modal-size-pills">
            {wrapThemes.map((sz) => (
              <button 
                key={sz}
                className={`modal-size-btn ${selectedTheme === sz ? 'active' : ''}`}
                onClick={() => setModalColor(sz)}
                style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem' }}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (category.includes('ACCESSORIES') || category.includes('FANCY')) {
    return (
      <>
        {/* Plating Metal selector */}
        {colors.length > 0 && (
          <div className="modal-section-block">
            <span className="modal-section-title">Metal Plating: {colors[activeImageIndex]?.name || colors[0]?.name || "Default"}</span>
            <div className="modal-color-dots">
              {colors.map((c, idx) => (
                <button 
                  key={idx}
                  className={`modal-color-dot ${activeImageIndex === idx ? 'active' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => {
                    if (idx < images.length) {
                      setActiveImageIndex(idx);
                    }
                    setModalColor(c.name);
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Static Size indicator */}
        <div className="modal-section-block">
          <span className="modal-section-title">Size:</span>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'inherit', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', width: 'fit-content' }}>
            One Size (Adjustable)
          </div>
        </div>
      </>
    );
  }

  return null;
};

const renderCategorySpecs = (prod) => {
  if (!prod) return null;
  const category = String(prod.category).toUpperCase();

  if (category.includes('CLOTHING') || category.includes('DRESS')) {
    return (
      <div className="product-detail-specs-table">
        <div className="spec-row">
          <span className="spec-label">Model No:</span>
          <span className="spec-val">{prod.modelNo || "TQ-Clothing"}</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Fabric:</span>
          <span className="spec-val">{prod.fabric || "Pure Cotton"}</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Pattern:</span>
          <span className="spec-val">Regular Fit / Printed</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Wash Care:</span>
          <span className="spec-val">Machine Washable</span>
        </div>
      </div>
    );
  }

  if (category.includes('STATIONERY')) {
    return (
      <div className="product-detail-specs-table">
        <div className="spec-row">
          <span className="spec-label">Product Type:</span>
          <span className="spec-val">Premium Journal / Notebook</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Paper Quality:</span>
          <span className="spec-val">80 GSM Acid-Free</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Pages:</span>
          <span className="spec-val">160 Pages Ruled</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Binding Type:</span>
          <span className="spec-val">Hardcover Spiral Bound</span>
        </div>
      </div>
    );
  }

  if (category.includes('GIFT')) {
    return (
      <div className="product-detail-specs-table">
        <div className="spec-row">
          <span className="spec-label">Gift Category:</span>
          <span className="spec-val">Luxury Festive Hampers</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Personalization:</span>
          <span className="spec-val">Available on Request</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Included Items:</span>
          <span className="spec-val">Curated Premium Selections</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Handcrafted:</span>
          <span className="spec-val">Yes (Artisanal Quality)</span>
        </div>
      </div>
    );
  }

  if (category.includes('ACCESSORIES') || category.includes('FANCY')) {
    return (
      <div className="product-detail-specs-table">
        <div className="spec-row">
          <span className="spec-label">Material:</span>
          <span className="spec-val">Premium Plated Alloy / Brass</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Stone Type:</span>
          <span className="spec-val">Cubic Zirconia / Kundan</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Base Plating:</span>
          <span className="spec-val">24K Gold Plated Finish</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Collection:</span>
          <span className="spec-val">Premium Ethnic Wear</span>
        </div>
      </div>
    );
  }

  return null;
};

const getColorHex = (name) => {
  const colors = {
    'White': '#ffffff',
    'Black': '#111111',
    'Pink': '#ff80ab',
    'Red': '#e53935',
    'Yellow': '#fdd835',
    'Green': '#43a047',
    'Purple': '#8e24aa',
    'Blue': '#1e88e5',
    'DarkRed': '#b71c1c',
    'Crimson Red': '#b32142',
    'Champagne Gold': '#D4AF37',
    'Midnight Black': '#111111',
    'Lavender': '#ce93d8',
    'Soft Pink': '#f8bbd0',
    'Plum': '#4a148c',
    'Sage': '#81c784',
    'Grey': '#9e9e9e',
    'Peach': '#ffcc80',
    'Cream': '#fff9c4',
    'Aqua': '#80deea',
    'Navy': '#3949ab',
    'Maroon': '#880e4f',
    'Olive': '#2e7d32'
  };
  return colors[name] || '#cccccc';
};

export default function ShopView({ authUser, setAuthUser }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState('ALL');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [fullDetailProduct, setFullDetailProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [modalSize, setModalSize] = useState('M');
  const [modalColor, setModalColor] = useState('Red');
  const [modalQty, setModalQty] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [wishlist, setWishlist] = useState(() => authUser?.wishlist || []);
  const [cart, setCart] = useState(() => authUser?.cart || []);

  useEffect(() => {
    setWishlist(authUser?.wishlist || []);
    setCart(authUser?.cart || []);
  }, [authUser]);

  const [catalogue, setCatalogue] = useState('A');
  const [priceRange, setPriceRange] = useState(5000);
  const [showInStock, setShowInStock] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Collapse/Expand States (defaulting to false/closed to match Image 2)
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isColorsOpen, setIsColorsOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isRatingsOpen, setIsRatingsOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);

  // Redesigned Sidebar Additional Filter States
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [filterNewArrivals, setFilterNewArrivals] = useState(false);
  const [filterBestSellers, setFilterBestSellers] = useState(false);
  const [filterOffers, setFilterOffers] = useState(false);

  const [isNewArrivalsOpen, setIsNewArrivalsOpen] = useState(false);
  const [isBestSellersOpen, setIsBestSellersOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);

  const [showMoreColors, setShowMoreColors] = useState(false);
  const [activeDetailAccordion, setActiveDetailAccordion] = useState(null);
  const [reviewsList, setReviewsList] = useState([]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activeSubTab, searchQuery, catalogue, priceRange, showInStock, showOutOfStock, selectedRating, selectedSize, selectedColor, filterNewArrivals, filterBestSellers, filterOffers]);

  // Dynamic mapping helpers
  const getProductSubCategory = (p) => {
    if (p.subCategory) return p.subCategory.toUpperCase();
    const title = p.title.toLowerCase();
    
    if (p.category === 'CLOTHING') {
      if (title.includes('girl')) return 'GIRLS';
      if (title.includes('boy')) return 'BOYS';
      if (title.includes('kids') || title.includes('child')) return 'KIDS';
      if (title.includes('men') || title.includes('male') || title.includes('dhoti') || title.includes('kurta')) return 'MEN';
      if (title.includes('women') || title.includes('saree') || title.includes('frock') || title.includes('lehenga') || title.includes('anarkali') || title.includes('kurti')) return 'WOMEN';
      return 'WOMEN';
    }
    if (p.category === 'STATIONERY') {
      if (title.includes('pen')) return 'PENS';
      if (title.includes('journal') || title.includes('planner')) return 'JOURNALS';
      if (title.includes('notebook') || title.includes('diary')) return 'NOTEBOOKS';
      return 'SCHOOL';
    }
    if (p.category === 'GIFTS') {
      if (title.includes('birthday')) return 'BIRTHDAY';
      if (title.includes('wedding')) return 'WEDDING';
      if (title.includes('anniversary')) return 'ANNIVERSARY';
      return 'RETURN';
    }
    if (p.category === 'ACCESSORIES') {
      if (title.includes('jewel') || title.includes('ring') || title.includes('necklace') || title.includes('choker') || title.includes('anklet')) return 'JEWELLERY';
      if (title.includes('hair') || title.includes('gajra')) return 'HAIR';
      if (title.includes('bag') || title.includes('handbag') || title.includes('wallet')) return 'FANCY';
      return 'FASHION';
    }
    return 'ALL';
  };

  const getProductSizes = (p) => {
    const idStr = String(p.id || '');
    const charCode = idStr.charCodeAt(idStr.length - 1) || 0;
    const sizes = ['S', 'M', 'L', 'XL'];
    if (charCode % 2 === 0) sizes.push('XS');
    if (charCode % 3 === 0) sizes.push('2XL');
    if (charCode % 4 === 0) sizes.push('3XL');
    if (charCode % 5 === 0) sizes.push('4XL');
    return sizes;
  };

  const getProductColors = (p) => {
    const idStr = String(p.id || '');
    const charCode = idStr.charCodeAt(idStr.length - 1) || 0;
    const colors = ['White', 'Black'];
    if (charCode % 2 === 0) colors.push('Pink');
    if (charCode % 3 === 0) colors.push('Red');
    if (charCode % 4 === 0) colors.push('Yellow');
    if (charCode % 5 === 0) colors.push('Green');
    if (charCode % 6 === 0) colors.push('Purple');
    if (charCode % 7 === 0) colors.push('Blue');
    if (charCode % 8 === 0) colors.push('DarkRed');
    return colors;
  };

  const getCategorySubCount = (category, subCategoryKey) => {
    return allProducts.filter(p => p.category === category && getProductSubCategory(p) === subCategoryKey).length;
  };

  const handleClearAllFilters = () => {
    setCatalogue('A');
    setPriceRange(15000);
    setShowInStock(true);
    setShowOutOfStock(true);
    setSelectedRating(null);
    setSelectedSize(null);
    setSelectedColor(null);
    setFilterNewArrivals(false);
    setFilterBestSellers(false);
    setFilterOffers(false);
    setActiveTab('ALL');
    setActiveSubTab('ALL');
  };

  // Reset active selectors when product selection changes
  useEffect(() => {
    setModalQty(1);
    setModalSize('M');
    setModalColor('Red');
    setActiveImageIndex(0);
  }, [quickViewProduct, fullDetailProduct]);

  // Parse category filter from URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    if (catParam) {
      setActiveTab(catParam.toUpperCase());
    }
    const subParam = params.get('subcategory');
    if (subParam) {
      setActiveSubTab(subParam.toUpperCase());
    }

    const handlePopState = () => {
      const updatedParams = new URLSearchParams(window.location.search);
      const updatedCat = updatedParams.get('category');
      if (updatedCat) {
        setActiveTab(updatedCat.toUpperCase());
      } else {
        setActiveTab('ALL');
      }
      const updatedSub = updatedParams.get('subcategory');
      if (updatedSub) {
        setActiveSubTab(updatedSub.toUpperCase());
      } else {
        setActiveSubTab('ALL');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const toggleWishlist = (id) => {
    let updated;
    if (wishlist.includes(id)) {
      updated = wishlist.filter(item => item !== id);
    } else {
      updated = [...wishlist, id];
    }
    setWishlist(updated);
    if (authUser) {
      apiService.syncWishlist(updated).then(res => {
        if (res && setAuthUser) {
          setAuthUser(prev => {
            const newUser = { ...prev, wishlist: res };
            localStorage.setItem('mithira_auth_user', JSON.stringify(newUser));
            return newUser;
          });
        }
      });
    }
  };

  const toggleCart = (id, title) => {
    let updated;
    if (cart.includes(id)) {
      updated = cart.filter(item => item !== id);
      alert(`Removed ${title} from cart!`);
    } else {
      updated = [...cart, id];
      alert(`Added ${title} to cart!`);
    }
    setCart(updated);
    if (authUser) {
      apiService.syncCart(updated).then(res => {
        if (res && setAuthUser) {
          setAuthUser(prev => {
            const newUser = { ...prev, cart: res.cart || res, cartItems: res.cartItems || prev.cartItems };
            localStorage.setItem('mithira_auth_user', JSON.stringify(newUser));
            return newUser;
          });
        }
      });
    }
  };

  const handleBackToHome = () => {
    window.history.pushState({}, '', '/#home');
    window.dispatchEvent(new Event('popstate'));
  };

  const allProductsStatic = [
    {
      id: 'p_women_kurti',
      title: "Women Kurti",
      category: "CLOTHING",
      subCategory: "WOMEN",
      price: 899,
      rating: 5,
      reviews: 12,
      image: kids_tq_109,
      badge: "MITHRA WOMEN",
      modelNo: "TQ-109",
      size: "S, M, L, XL",
      moq: "Per size 3 pcs",
      colours: "5 colours",
      fabric: "COTTON",
      description: "Relaxed fit women kurti."
    }
  ].map((p, idx) => {
    let finalImage = p.image;
    if (p.category === 'CLOTHING') {
      const isKids = p.subCategory === 'KIDS' || p.title.toLowerCase().includes('kids') || p.title.toLowerCase().includes('girl') || p.title.toLowerCase().includes('boy');
      if (isKids) {
        finalImage = (idx % 2 === 0) ? clothingUser1 : clothingUser5;
      } else {
        const pool = [clothingUser2, clothingUser3, clothingUser4];
        finalImage = pool[idx % pool.length];
      }
    }
    if (p.modelNo) {
      return {
        ...p,
        image: finalImage,
        images: getProductImages(p.modelNo, finalImage)
      };
    }
    return {
      ...p,
      image: finalImage
    };
  });

  const [allProducts, setAllProducts] = useState(allProductsStatic);

  useEffect(() => {
    apiService.getProducts().then((data) => {
      if (data && data.length > 0) {
        const mapped = data.map((p, idx) => {
          let catUpper = (p.category || 'CLOTHING').toUpperCase();
          let cleanCategory = 'CLOTHING';
          if (catUpper.includes('CLOTHING')) cleanCategory = 'CLOTHING';
          else if (catUpper.includes('STATIONERY')) cleanCategory = 'STATIONERY';
          else if (catUpper.includes('GIFT')) cleanCategory = 'GIFTS';
          else if (catUpper.includes('ACCESSORIES')) cleanCategory = 'ACCESSORIES';
          else cleanCategory = catUpper;

          const title = p.name || p.title || 'Product';
          
          let finalImage = p.image;
          if (cleanCategory === 'CLOTHING') {
            const isKids = p.subCategory === 'KIDS' || 
                           catUpper.includes('KIDS') || 
                           catUpper.includes('CHILD') || 
                           title.toLowerCase().includes('kids') || 
                           title.toLowerCase().includes('girl') || 
                           title.toLowerCase().includes('boy') || 
                           title.toLowerCase().includes('baby') || 
                           title.toLowerCase().includes('frock') || 
                           title.toLowerCase().includes('anarkali');
            if (isKids) {
              finalImage = (idx % 2 === 0) ? clothingUser1 : clothingUser5;
            } else {
              const pool = [clothingUser2, clothingUser3, clothingUser4];
              finalImage = pool[idx % pool.length];
            }
          }

          return {
            ...p,
            title,
            category: cleanCategory,
            image: finalImage,
            images: p.modelNo ? getProductImages(p.modelNo, finalImage) : [finalImage]
          };
        });
        setAllProducts(mapped);
      }
    });
  }, []);

  useEffect(() => {
    apiService.getReviews().then((data) => {
      if (data) setReviewsList(data);
    });
  }, []);

  // Helper to determine if a product is in stock
  const isProductInStock = (p) => {
    // If it has a stock field, check if stock > 0. Fallback to name calculation.
    if (p.stock !== undefined) return p.stock > 0;
    const val = p.title || p.name || '';
    return (val.length % 7 !== 0);
  };

  // Helper to get catalogue assignment
  const getProductCatalogue = (p) => {
    if (p.catalogue) {
      if (p.catalogue.toUpperCase().includes('B')) return 'B';
      return 'A';
    }
    return 'A';
  };

  // Filtering products
  let filteredProducts = activeTab === 'ALL'
    ? allProducts
    : allProducts.filter(p => p.category === activeTab);

  // Gender/Audience/Subcategory filter
  if (activeSubTab !== 'ALL') {
    filteredProducts = filteredProducts.filter(p => getProductSubCategory(p) === activeSubTab);
  }

  // Catalogue filter
  filteredProducts = filteredProducts.filter(p => getProductCatalogue(p) === catalogue);

  // Search filter
  if (searchQuery.trim() !== '') {
    filteredProducts = filteredProducts.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  // Price filter
  filteredProducts = filteredProducts.filter(p => p.price <= priceRange);

  // Availability filter
  filteredProducts = filteredProducts.filter(p => {
    const inStock = isProductInStock(p);
    if (showInStock && showOutOfStock) return true;
    if (showInStock) return inStock;
    if (showOutOfStock) return !inStock;
    return false;
  });

  // Rating filter
  if (selectedRating !== null) {
    filteredProducts = filteredProducts.filter(p => p.rating === selectedRating);
  }

  // Size filter
  if (selectedSize) {
    filteredProducts = filteredProducts.filter(p => getProductSizes(p).includes(selectedSize));
  }

  // Color filter
  if (selectedColor) {
    filteredProducts = filteredProducts.filter(p => getProductColors(p).includes(selectedColor));
  }

  // New Arrivals filter
  if (filterNewArrivals) {
    filteredProducts = filteredProducts.filter(p => p.badge === 'NEW' || p.badge === 'NEW ARRIVAL' || p.id.startsWith('n'));
  }

  // Best Sellers filter
  if (filterBestSellers) {
    filteredProducts = filteredProducts.filter(p => p.badge === 'BEST SELLER' || p.id.startsWith('t'));
  }

  // Offers filter
  if (filterOffers) {
    filteredProducts = filteredProducts.filter(p => p.badge === 'OFFER' || p.badge === 'SALE' || p.price < 1000);
  }

  // Sorting products
  if (sortBy === 'PRICE_LOW_HIGH') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'PRICE_HIGH_LOW') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'RATING') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  /*
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={13} 
        fill={i < rating ? "#d4af37" : "none"} 
        className={i < rating ? "star-filled" : "star-empty"}
        style={{ color: i < rating ? "#d4af37" : "#ccc" }}
      />
    ));
  };
  */

  const getThemeClass = (prod) => {
    switch (prod.category) {
      case 'CLOTHING': return 'prod-theme-clothing';
      case 'GIFTS': return 'prod-theme-gifts';
      case 'STATIONERY': return 'prod-theme-stationery';
      case 'ACCESSORIES': return 'prod-theme-accessories';
      default: return '';
    }
  };

  const getBannerContent = () => {
    if (activeTab === 'CLOTHING') {
      switch (activeSubTab) {
        case 'KIDS':
          return {
            tagline: "TIKQ Kids",
            title: "Baby Boutique",
            subtitle: "Adorable, skin-friendly, and ultra-soft outfits designed for play and sweet comfort"
          };
        case 'COUPLES':
          return {
            tagline: "Festive Collection",
            title: "Couple Wear",
            subtitle: "Stunning matching ethnic ensembles designed for premium celebrations and couples"
          };
        case 'MEN':
          return {
            tagline: "Men's Style",
            title: "Men's Collection",
            subtitle: "Elegant shirts, casual wear, and traditional dhotis crafted for distinction"
          };
        case 'WOMEN':
          return {
            tagline: "Designer Style",
            title: "Women's Wardrobe",
            subtitle: "Premium sarees, luxury kurtis, and ethnic wear styled for elegance"
          };
        default:
          return {
            tagline: "Shop Our",
            title: "Clothing Collection",
            subtitle: "Trendy and traditional ethnic apparel selected for your entire family"
          };
      }
    } else if (activeTab === 'GIFTS') {
      return {
        tagline: "Handcrafted Favorites",
        title: "Gifts & Return Favors",
        subtitle: "Celebrate life's special moments with luxury hampers and custom return gifts"
      };
    } else if (activeTab === 'STATIONERY') {
      return {
        tagline: "Aesthetic Planners",
        title: "Stationery & Journals",
        subtitle: "Premium journals, gold-embellished pens, and desk accessories to inspire creativity"
      };
    } else if (activeTab === 'ACCESSORIES') {
      return {
        tagline: "Luxury Accents",
        title: "Fashion Accessories",
        subtitle: "Authentic jasmine gajras, rings, and handcrafted details to elevate your style"
      };
    }
    
    return {
      tagline: "Shop Our",
      title: "Exclusive Collection",
      subtitle: "Premium Quality • Unique Designs • Best Prices"
    };
  };

  const bannerContent = getBannerContent();

  const clothingCount = allProducts.filter(p => p.category === 'CLOTHING').length;
  const stationeryCount = allProducts.filter(p => p.category === 'STATIONERY').length;
  const giftsCount = allProducts.filter(p => p.category === 'GIFTS').length;
  const accessoriesCount = allProducts.filter(p => p.category === 'ACCESSORIES').length;

  const inStockCount = allProducts.filter(p => isProductInStock(p)).length;
  const outOfStockCount = allProducts.filter(p => !isProductInStock(p)).length;

  const getRatingCount = (r) => allProducts.filter(p => p.rating === r).length;

  const productsPerPage = 12;
  const totalProductsCount = filteredProducts.length;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(totalProductsCount / productsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (fullDetailProduct) {
    const catTheme = getCategoryThemeClass(fullDetailProduct.category);
    const images = getAllProductImages(fullDetailProduct);
    const colors = getProductThemedColors(fullDetailProduct);
    return (
      <div className={`shop-view-page shop-product-detail-page-view ${catTheme}`}>
        <div className="shop-content-container">
          
          {/* Breadcrumb Navigation */}
          <div className="product-detail-nav">
            <button className="back-to-shop-btn" onClick={() => { setFullDetailProduct(null); setModalQty(1); }}>
              <ArrowLeft size={18} />
              <span>Back to Shop</span>
            </button>
            <span className="breadcrumb-divider">/</span>
            <span className="breadcrumb-category" style={{ cursor: 'pointer' }} onClick={() => { setActiveTab(fullDetailProduct.category.toUpperCase()); setFullDetailProduct(null); }}>
              {fullDetailProduct.category}
            </span>
            <span className="breadcrumb-divider">/</span>
            <span className="breadcrumb-title">{fullDetailProduct.title}</span>
          </div>

          {/* Main Layout Grid */}
          <div className="product-detail-grid-layout">
            
            {/* Left: Product Gallery Section */}
            <div className="product-detail-gallery-col">
              <div className="product-detail-gallery-container">
                {/* Thumbnails list */}
                {images.length > 1 && (
                  <div className="product-detail-thumbnails">
                    {images.map((img, idx) => (
                      <div 
                        key={idx}
                        className={`product-detail-thumbnail-wrapper ${activeImageIndex === idx ? 'active' : ''}`}
                        onClick={() => setActiveImageIndex(idx)}
                      >
                        <img src={img} alt={`thumb-${idx}`} className="product-detail-thumbnail-img" />
                      </div>
                    ))}
                  </div>
                )}
                {/* Main Display Image */}
                <div className="product-detail-main-image-wrapper">
                  <img 
                    src={images[activeImageIndex] || fullDetailProduct.image} 
                    alt={fullDetailProduct.title} 
                    className="product-detail-main-img" 
                  />
                  
                  {/* Floating badge */}
                  <div className="product-detail-badge-pill">
                    {fullDetailProduct.badge || "Premium Collection"}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Info Section */}
            <div className="product-detail-info-col">
              <div className="product-detail-category-tag">
                {fullDetailProduct.category} {fullDetailProduct.subCategory ? `| ${fullDetailProduct.subCategory}` : ''}
              </div>
              <h1 className="product-detail-title">{fullDetailProduct.title}</h1>
              <p className="product-detail-tagline">Bloom with elegance. Designed exclusively for your premium collection.</p>

              {/* Rating and reviews */}
              <div className="product-detail-rating-row">
                <span className="product-detail-rating-stars">★ {fullDetailProduct.rating || "4.8"}</span>
                <span className="product-detail-reviews">({fullDetailProduct.reviews || "120"} reviews)</span>
              </div>

              {/* Price Row */}
              <div className="product-detail-price-row">
                <span className="product-detail-price-label">Price:</span>
                <span className="product-detail-price-value">₹{fullDetailProduct.price.toLocaleString()}</span>
                <span className="product-detail-original-price">₹{(Math.round(fullDetailProduct.price * 1.5)).toLocaleString()}</span>
                <span className="product-detail-discount-badge">33% OFF</span>
              </div>

              {/* Category-specific Selectors */}
              {renderCategorySelectors(fullDetailProduct, modalSize, setModalSize, modalColor, setModalColor, activeImageIndex, setActiveImageIndex, images, colors, modalQty, setModalQty)}

              {/* Quantity */}
              <div className="product-detail-section-block qty-block">
                <span className="product-detail-section-title">Quantity</span>
                <div className="product-detail-qty-control">
                  <button onClick={() => setModalQty(prev => Math.max(1, prev - 1))}>-</button>
                  <span>{modalQty}</span>
                  <button onClick={() => setModalQty(prev => prev + 1)}>+</button>
                </div>
              </div>

              {/* Actions */}
              <div className="product-detail-actions">
                <button 
                  className={`product-detail-cart-btn ${cart.includes(fullDetailProduct.id) ? 'active' : ''}`}
                  onClick={() => {
                    toggleCart(fullDetailProduct.id, fullDetailProduct.title);
                  }}
                >
                  {cart.includes(fullDetailProduct.id) ? "Remove from Cart" : "ADD TO CART"}
                </button>
                <button 
                  className="product-detail-buy-btn"
                  onClick={() => {
                    if (!cart.includes(fullDetailProduct.id)) {
                      toggleCart(fullDetailProduct.id, fullDetailProduct.title);
                    }
                    alert("Proceeding to secure checkout!");
                  }}
                >
                  BUY NOW
                </button>
              </div>

              {/* WhatsApp Inquiry */}
              {fullDetailProduct.modelNo && (
                <a 
                  href={`https://wa.me/916384438557?text=Hi, I am interested in TIKQ Kidswear product: ${fullDetailProduct.title} (Model: ${fullDetailProduct.modelNo}). Please provide details.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="product-detail-whatsapp-btn"
                  style={{ alignSelf: 'center', width: 'fit-content', padding: '10px 24px', fontSize: '0.85rem' }}
                >
                  <Phone size={14} />
                  <span>Inquire via WhatsApp</span>
                </a>
              )}

              {/* Collapsible Tabs / Accordions */}
              <div className="product-details-accordion-wrap" style={{ marginTop: '20px' }}>
                
                {/* 1. Description Accordion */}
                <div className="detail-accordion-item">
                  <button 
                    className="detail-accordion-header"
                    onClick={() => setActiveDetailAccordion(activeDetailAccordion === 'description' ? null : 'description')}
                  >
                    <span>Description</span>
                    <ChevronDown size={16} className={`accordion-chevron ${activeDetailAccordion === 'description' ? 'rotated' : ''}`} />
                  </button>
                  {activeDetailAccordion === 'description' && (
                    <div className="detail-accordion-content">
                      <p style={{ margin: 0 }}>
                        {fullDetailProduct.description || "Indulge in our handpicked selections crafted to match your cultural roots and premium choices. Made with pure fabric, exquisite design details, and comfortable fit. Designed for both casual elegance and luxury wear."}
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Specifications Accordion */}
                <div className="detail-accordion-item">
                  <button 
                    className="detail-accordion-header"
                    onClick={() => setActiveDetailAccordion(activeDetailAccordion === 'specs' ? null : 'specs')}
                  >
                    <span>Specifications</span>
                    <ChevronDown size={16} className={`accordion-chevron ${activeDetailAccordion === 'specs' ? 'rotated' : ''}`} />
                  </button>
                  {activeDetailAccordion === 'specs' && (
                    <div className="detail-accordion-content">
                      <div className="specs-table-mini">
                        {fullDetailProduct.modelNo && (
                          <div className="specs-row-mini">
                            <span className="specs-key">Model No:</span>
                            <span className="specs-val">{fullDetailProduct.modelNo}</span>
                          </div>
                        )}
                        {fullDetailProduct.fabric && (
                          <div className="specs-row-mini">
                            <span className="specs-key">Fabric:</span>
                            <span className="specs-val">{fullDetailProduct.fabric}</span>
                          </div>
                        )}
                        {fullDetailProduct.size && (
                          <div className="specs-row-mini">
                            <span className="specs-key">Size:</span>
                            <span className="specs-val">{fullDetailProduct.size}</span>
                          </div>
                        )}
                        {fullDetailProduct.colours && (
                          <div className="specs-row-mini">
                            <span className="specs-key">Colours:</span>
                            <span className="specs-val">{fullDetailProduct.colours}</span>
                          </div>
                        )}
                        {fullDetailProduct.moq && (
                          <div className="specs-row-mini">
                            <span className="specs-key">MOQ:</span>
                            <span className="specs-val">{fullDetailProduct.moq}</span>
                          </div>
                        )}
                        <div className="specs-row-mini">
                          <span className="specs-key">Pattern:</span>
                          <span className="specs-val">{fullDetailProduct.pattern || "Regular Fit / Printed"}</span>
                        </div>
                        <div className="specs-row-mini">
                          <span className="specs-key">Wash Care:</span>
                          <span className="specs-val">{fullDetailProduct.washCare || "Machine Washable"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Reviews Accordion */}
                <div className="detail-accordion-item">
                  <button 
                    className="detail-accordion-header"
                    onClick={() => setActiveDetailAccordion(activeDetailAccordion === 'reviews' ? null : 'reviews')}
                  >
                    <span>Reviews ({reviewsList.filter(rev => rev.productName === fullDetailProduct.title || rev.productName === fullDetailProduct.name).length})</span>
                    <ChevronDown size={16} className={`accordion-chevron ${activeDetailAccordion === 'reviews' ? 'rotated' : ''}`} />
                  </button>
                  {activeDetailAccordion === 'reviews' && (
                    <div className="detail-accordion-content">
                      {(() => {
                        const productReviews = reviewsList.filter(rev => 
                          rev.productName === fullDetailProduct.title || 
                          rev.productName === fullDetailProduct.name
                        );
                        if (productReviews.length === 0) {
                          return <p className="no-reviews-text">No reviews yet. Be the first to review this product!</p>;
                        }
                        return (
                          <div className="reviews-accordion-list">
                            {productReviews.map(rev => (
                              <div key={rev.id} className="review-accordion-card">
                                <div className="review-card-top">
                                  <span className="review-cust-name">{rev.customerName}</span>
                                  <span className="review-date">{rev.date}</span>
                                </div>
                                <div className="review-rating-stars">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star 
                                      key={i} 
                                      size={12} 
                                      fill={i < rev.rating ? "#FFCC00" : "none"} 
                                      stroke={i < rev.rating ? "#FFCC00" : "#ccc"} 
                                    />
                                  ))}
                                </div>
                                <p className="review-comment-text">{rev.comment}</p>
                                {rev.reply && (
                                  <div className="review-admin-reply">
                                    <span className="reply-badge">Seller Reply:</span>
                                    <p className="reply-text">{rev.reply}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* 4. Shipping Info Accordion */}
                <div className="detail-accordion-item">
                  <button 
                    className="detail-accordion-header"
                    onClick={() => setActiveDetailAccordion(activeDetailAccordion === 'shipping' ? null : 'shipping')}
                  >
                    <span>Shipping Information</span>
                    <ChevronDown size={16} className={`accordion-chevron ${activeDetailAccordion === 'shipping' ? 'rotated' : ''}`} />
                  </button>
                  {activeDetailAccordion === 'shipping' && (
                    <div className="detail-accordion-content">
                      <ul className="shipping-info-list" style={{ paddingLeft: '20px', listStyleType: 'disc', margin: 0 }}>
                        <li style={{ marginBottom: '6px' }}>Free shipping on all orders above ₹999.</li>
                        <li style={{ marginBottom: '6px' }}>Standard delivery takes 3-5 business days depending on location.</li>
                        <li style={{ marginBottom: '6px' }}>Cash on Delivery (COD) is available on all eligible postal addresses.</li>
                        <li style={{ marginBottom: '6px' }}>We offer easy 7-day hassle-free returns and exchanges.</li>
                      </ul>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* Similar Products Row */}
          <div className="product-detail-similar-section">
            <h3 className="similar-title">Similar Products</h3>
            <div className="similar-products-grid">
              {allProducts
                .filter(p => p.category === fullDetailProduct.category && p.id !== fullDetailProduct.id)
                .slice(0, 4)
                .map((simProd) => {
                  const isClothing = simProd.category === 'CLOTHING';
                  if (isClothing) {
                    const brandName = simProd.modelNo ? "TIKQ Kids" : "Mithira Collection";
                    const originalPrice = Math.round(simProd.price * 1.5);
                    const discountPercentage = Math.round(((originalPrice - simProd.price) / originalPrice) * 100);
                    const isWishlisted = wishlist.includes(simProd.id);
                    const isInCart = cart.includes(simProd.id);
                    const inStock = isProductInStock(simProd);

                    return (
                      <div 
                        key={simProd.id} 
                        className="clothing-product-card animate-fade-in-up"
                        onClick={() => {
                          setFullDetailProduct(simProd);
                          setModalQty(1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <div className="clothing-img-wrapper" onClick={(e) => { e.stopPropagation(); setFullDetailProduct(simProd); setModalQty(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                          <div className="clothing-discount-badge">
                            {discountPercentage}% OFF
                          </div>
                          
                          <button 
                            className={`clothing-wishlist-float-btn ${isWishlisted ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(simProd.id); }}
                            aria-label="Add to Wishlist"
                          >
                            <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
                          </button>

                          <img src={simProd.image} alt={simProd.title} className="clothing-img" />

                          <div className="clothing-hover-overlay">
                            <button 
                              className={`clothing-hover-action-btn hover-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleWishlist(simProd.id); }}
                              title="Add to Wishlist"
                            >
                              <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                            </button>
                            <button 
                              className="clothing-hover-action-btn hover-quickview-btn"
                              onClick={(e) => { e.stopPropagation(); setQuickViewProduct(simProd); }}
                              title="Quick View"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className={`clothing-hover-action-btn hover-cart-btn ${isInCart ? 'in-cart' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleCart(simProd.id, simProd.title); }}
                              title="Add to Cart"
                            >
                              <ShoppingCart size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="clothing-info-section">
                          <div className="clothing-brand-row">
                            <span className="clothing-brand-name">{brandName}</span>
                            <div className="clothing-stock-badge">
                              {inStock ? (
                                <span className="stock-status-in">In Stock</span>
                              ) : (
                                <span className="stock-status-out">Out of Stock</span>
                              )}
                            </div>
                          </div>

                          <h4 className="clothing-product-title">
                            {simProd.title}
                          </h4>

                          <div className="clothing-rating-badge-container">
                            <div className="clothing-rating-pill-green">
                              <span>{(simProd.rating || 5).toFixed(1)}</span>
                              <span className="rating-star-icon">★</span>
                              <span className="rating-divider">|</span>
                              <span className="rating-count">{simProd.reviews || 0}</span>
                            </div>
                          </div>

                          <div className="clothing-price-and-action">
                            <div className="clothing-price-box">
                              <span className="clothing-selling-price">₹{simProd.price.toLocaleString()}</span>
                              <span className="clothing-original-price">₹{originalPrice.toLocaleString()}</span>
                            </div>
                            <button 
                              className={`clothing-card-add-cart-btn ${isInCart ? 'in-cart' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleCart(simProd.id, simProd.title); }}
                            >
                              {isInCart ? "IN CART" : "ADD TO CART"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={simProd.id} 
                      className={`product-card shop-prod-card ${getThemeClass(simProd)}`}
                      onClick={() => {
                        setFullDetailProduct(simProd);
                        setModalQty(1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="prod-img-wrapper">
                        <img src={simProd.image} alt={simProd.title} className="prod-img" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                      </div>
                      <div className="prod-details">
                        <span className="prod-card-category">{simProd.category} {simProd.subCategory ? `| ${simProd.subCategory}` : ''}</span>
                        <h4 className="prod-card-title">{simProd.title}</h4>
                        <div className="prod-card-price-row">
                          <span className="prod-card-price">₹{simProd.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="shop-view-page">
      
      {/* Premium Shop Header Banner */}
      <div className="shop-banner">
        {/* Background image on the right */}
        <img src={shopBannerRaw} className="shop-banner-bg-image" alt="Exclusive Collection" />
        
        {/* Left-to-right gradient overlay to blend image and provide solid text area */}
        <div className="shop-banner-overlay-gradient"></div>
        
        {/* Content positioned on the left */}
        <div className="shop-banner-content">
          <span className="shop-banner-tagline">{bannerContent.tagline}</span>
          <h1 className={`shop-banner-title ${bannerContent.title === 'Exclusive Collection' ? 'shop-banner-title-exclusive' : ''}`}>{bannerContent.title}</h1>
          <p className="shop-banner-subtitle">{bannerContent.subtitle}</p>
          <div className="shop-banner-divider">
            <span className="shop-banner-divider-line"></span>
            <span className="shop-banner-divider-motif" style={{ display: 'inline-flex', alignItems: 'center' }}>
              ✧ <img src={logoImg} alt="Logo" style={{ width: '12px', height: '12px', objectFit: 'contain', margin: '0 4px' }} /> ✧
            </span>
            <span className="shop-banner-divider-line"></span>
          </div>
        </div>
      </div>

      <div className="shop-content-container">
        
        {/* Top Circular Category Navigation Tabs */}
        <div className="shop-category-circles-wrapper">
          {[
            { key: 'CLOTHING', label: 'Clothing', img: imgClothing, count: `${clothingCount} items` },
            { key: 'STATIONERY', label: 'Stationery', img: imgStationery, count: `${stationeryCount} items` },
            { key: 'GIFTS', label: 'Gifts', img: imgGifts, count: `${giftsCount} items` },
            { key: 'ACCESSORIES', label: 'Accessories', img: imgAccessories, count: `${accessoriesCount} items` }
          ].map((item) => (
            <div 
              key={item.key} 
              data-category={item.key}
              className={`shop-category-circle-card ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.key);
                setActiveSubTab('ALL');
                const newUrl = `/Shop?category=${item.key.toLowerCase()}`;
                window.history.pushState({}, '', newUrl);
              }}
            >
              <div className="shop-category-circle-img-container">
                <img src={item.img} className="shop-category-circle-img" alt={item.label} />
              </div>
              <span className="shop-category-circle-name">{item.label}</span>
              <span className="shop-category-circle-count">{item.count}</span>
            </div>
          ))}
        </div>

        {/* Two Column Layout: Left Sidebar + Right Products */}
        <div className={`shop-main-layout ${!showSidebar ? 'filters-hidden' : ''}`}>
          
          {/* Left Sidebar Filters */}
          <aside className={`shop-sidebar-filters ${showSidebar ? 'active-sidebar' : 'inactive-sidebar'}`}>
            
            {/* Redesigned Sidebar Header (Matches Image 2) */}
            <div className="sidebar-header-row">
              <button className="sidebar-close-x-btn" onClick={() => setShowSidebar(false)}>
                <X size={18} />
              </button>
              <h2 className="sidebar-title-text">Filters</h2>
              <button className="sidebar-close-x-btn" onClick={() => setShowSidebar(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Clear All Row (Matches Image 2) */}
            <div className="sidebar-clear-all-row">
              <button className="clear-all-btn-left" onClick={handleClearAllFilters}>Clear All</button>
              <button className="clear-all-btn-right" onClick={handleClearAllFilters}>Clear All</button>
            </div>

            {/* Unified Filters Card */}
            <div className="unified-filters-card">
              
              {/* 1. Select Catalogue Accordion */}
              <div className="filter-card-section catalogue-section">
                <div className="section-title-row" onClick={() => setIsCatalogueOpen(!isCatalogueOpen)}>
                  <h3 className="section-title-text">Select Catalogue</h3>
                  <ChevronDown size={14} className={`section-chevron ${isCatalogueOpen ? 'rotated' : ''}`} />
                </div>
                {isCatalogueOpen && (
                  <div className="section-content">
                    <div className="shop-catalogue-toggle">
                      <button 
                        className={`catalogue-btn ${catalogue === 'A' ? 'active' : ''}`}
                        onClick={() => setCatalogue('A')}
                      >
                        Catalogue A
                      </button>
                      <button 
                        className={`catalogue-btn ${catalogue === 'B' ? 'active' : ''}`}
                        onClick={() => setCatalogue('B')}
                      >
                        Catalogue B
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Categories Accordion */}
              <div className="filter-card-section categories-section">
                <div className="section-title-row" onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}>
                  <h3 className="section-title-text">Categories</h3>
                  <ChevronDown size={14} className={`section-chevron ${isCategoriesOpen ? 'rotated' : ''}`} />
                </div>
                {isCategoriesOpen && (
                  <div className="section-content">
                    {/* Clothing category */}
                    <div className="category-group clothing-group">
                      <h4 className={`category-group-title ${activeTab === 'CLOTHING' ? 'active' : ''}`} onClick={() => { setActiveTab('CLOTHING'); setActiveSubTab('ALL'); }}>
                        <span><Shirt size={14} /> CLOTHING</span>
                      </h4>
                      <ul className="category-sub-list">
                        {[
                          { key: 'WOMEN', label: 'Women' },
                          { key: 'MEN', label: 'Men' },
                          { key: 'KIDS', label: 'Kids' },
                          { key: 'BOYS', label: 'Boys' },
                          { key: 'GIRLS', label: 'Girls' }
                        ].map(sub => (
                          <li 
                            key={sub.key} 
                            className={activeTab === 'CLOTHING' && activeSubTab === sub.key ? 'active' : ''}
                            onClick={() => { setActiveTab('CLOTHING'); setActiveSubTab(sub.key); }}
                          >
                            <span className="subcategory-bullet"></span>
                            <span className="sub-label">{sub.label}</span>
                            <span className="sub-count">({getCategorySubCount('CLOTHING', sub.key)})</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Stationery category */}
                    <div className="category-group stationery-group">
                      <h4 className={`category-group-title ${activeTab === 'STATIONERY' ? 'active' : ''}`} onClick={() => { setActiveTab('STATIONERY'); setActiveSubTab('ALL'); }}>
                        <span><BookOpen size={14} /> STATIONERY</span>
                      </h4>
                      <ul className="category-sub-list">
                        {[
                          { key: 'PENS', label: 'Pens' },
                          { key: 'JOURNALS', label: 'Journals' },
                          { key: 'NOTEBOOKS', label: 'Notebooks' },
                          { key: 'SCHOOL', label: 'School Items' }
                        ].map(sub => (
                          <li 
                            key={sub.key} 
                            className={activeTab === 'STATIONERY' && activeSubTab === sub.key ? 'active' : ''}
                            onClick={() => { setActiveTab('STATIONERY'); setActiveSubTab(sub.key); }}
                          >
                            <span className="subcategory-bullet"></span>
                            <span className="sub-label">{sub.label}</span>
                            <span className="sub-count">({getCategorySubCount('STATIONERY', sub.key)})</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Gifts category */}
                    <div className="category-group gifts-group">
                      <h4 className={`category-group-title ${activeTab === 'GIFTS' ? 'active' : ''}`} onClick={() => { setActiveTab('GIFTS'); setActiveSubTab('ALL'); }}>
                        <span><Gift size={14} /> GIFTS</span>
                      </h4>
                      <ul className="category-sub-list">
                        {[
                          { key: 'BIRTHDAY', label: 'Birthday Gifts' },
                          { key: 'WEDDING', label: 'Wedding Gifts' },
                          { key: 'ANNIVERSARY', label: 'Anniversary Gifts' },
                          { key: 'RETURN', label: 'Return Gifts' }
                        ].map(sub => (
                          <li 
                            key={sub.key} 
                            className={activeTab === 'GIFTS' && activeSubTab === sub.key ? 'active' : ''}
                            onClick={() => { setActiveTab('GIFTS'); setActiveSubTab(sub.key); }}
                          >
                            <span className="subcategory-bullet"></span>
                            <span className="sub-label">{sub.label}</span>
                            <span className="sub-count">({getCategorySubCount('GIFTS', sub.key)})</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Accessories category */}
                    <div className="category-group accessories-group">
                      <h4 className={`category-group-title ${activeTab === 'ACCESSORIES' ? 'active' : ''}`} onClick={() => { setActiveTab('ACCESSORIES'); setActiveSubTab('ALL'); }}>
                        <span><Crown size={14} /> ACCESSORIES</span>
                      </h4>
                      <ul className="category-sub-list">
                        {[
                          { key: 'JEWELLERY', label: 'Jewellery' },
                          { key: 'FANCY', label: 'Fancy Items' },
                          { key: 'HAIR', label: 'Hair Accessories' },
                          { key: 'FASHION', label: 'Fashion Accessories' }
                        ].map(sub => (
                          <li 
                            key={sub.key} 
                            className={activeTab === 'ACCESSORIES' && activeSubTab === sub.key ? 'active' : ''}
                            onClick={() => { setActiveTab('ACCESSORIES'); setActiveSubTab(sub.key); }}
                          >
                            <span className="subcategory-bullet"></span>
                            <span className="sub-label">{sub.label}</span>
                            <span className="sub-count">({getCategorySubCount('ACCESSORIES', sub.key)})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Price Range Accordion */}
              <div className="filter-card-section price-section">
                <div className="section-title-row" onClick={() => setIsPriceOpen(!isPriceOpen)}>
                  <h3 className="section-title-text">Price Range</h3>
                  <ChevronDown size={14} className={`section-chevron ${isPriceOpen ? 'rotated' : ''}`} />
                </div>
                {isPriceOpen && (
                  <div className="section-content price-slider-container">
                    <input 
                      type="range" 
                      min="199" 
                      max="15000" 
                      step="100"
                      value={priceRange} 
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="pink-price-slider"
                    />
                    <div className="price-labels-row">
                      <span>₹199</span>
                      <span>₹{priceRange.toLocaleString()}{priceRange >= 15000 ? '+' : ''}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Size Accordion */}
              <div className="filter-card-section size-section">
                <div className="section-title-row" onClick={() => setIsSizeOpen(!isSizeOpen)}>
                  <h3 className="section-title-text">Size</h3>
                  <ChevronDown size={14} className={`section-chevron ${isSizeOpen ? 'rotated' : ''}`} />
                </div>
                {isSizeOpen && (
                  <div className="section-content size-buttons-grid">
                    {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'].map(size => (
                      <button 
                        key={size} 
                        className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Colors Accordion */}
              <div className="filter-card-section color-section">
                <div className="section-title-row" onClick={() => setIsColorsOpen(!isColorsOpen)}>
                  <h3 className="section-title-text">Colors</h3>
                  <ChevronDown size={14} className={`section-chevron ${isColorsOpen ? 'rotated' : ''}`} />
                </div>
                {isColorsOpen && (
                  <div className="section-content color-circles-list">
                    {(showMoreColors
                      ? [
                          { name: 'Pink', value: '#E94FA8' },
                          { name: 'Red', value: '#FF0000' },
                          { name: 'Yellow', value: '#FFCC00' },
                          { name: 'Green', value: '#00CC66' },
                          { name: 'Purple', value: '#8A2BE2' },
                          { name: 'Black', value: '#000000' },
                          { name: 'DarkRed', value: '#A30000' },
                          { name: 'White', value: '#FFFFFF', border: '1px solid #ddd' },
                          { name: 'Blue', value: '#4A90E2' },
                          { name: 'Orange', value: '#FF8000' },
                          { name: 'Grey', value: '#888888' },
                          { name: 'Brown', value: '#8B4513' },
                          { name: 'Lavender', value: '#E6E6FA' },
                          { name: 'Navy', value: '#000080' },
                          { name: 'Gold', value: '#FFD700' },
                          { name: 'Silver', value: '#C0C0C0' },
                          { name: 'Peach', value: '#FFDAB9' }
                        ]
                      : [
                          { name: 'Pink', value: '#E94FA8' },
                          { name: 'Red', value: '#FF0000' },
                          { name: 'Yellow', value: '#FFCC00' },
                          { name: 'Green', value: '#00CC66' },
                          { name: 'Purple', value: '#8A2BE2' },
                          { name: 'Black', value: '#000000' },
                          { name: 'DarkRed', value: '#A30000' },
                          { name: 'White', value: '#FFFFFF', border: '1px solid #ddd' },
                          { name: 'Blue', value: '#4A90E2' }
                        ]
                    ).map(color => (
                      <button 
                        key={color.name}
                        className={`color-bubble ${selectedColor === color.name ? 'active' : ''}`}
                        style={{ backgroundColor: color.value, border: color.border || 'none' }}
                        onClick={() => setSelectedColor(selectedColor === color.name ? null : color.name)}
                        title={color.name}
                      />
                    ))}
                    <div className="more-colors-btn" onClick={(e) => { e.stopPropagation(); setShowMoreColors(!showMoreColors); }}>
                      <div className="gradient-color-bubble">
                        <div className="mixer-icon"></div>
                      </div>
                      <span className="more-text">{showMoreColors ? 'Less' : '→ More'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Availability Accordion */}
              <div className="filter-card-section availability-accordion">
                <div className="section-title-row" onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}>
                  <h3 className="section-title-text">Availability</h3>
                  <ChevronDown size={14} className={`section-chevron ${isAvailabilityOpen ? 'rotated' : ''}`} />
                </div>
                {isAvailabilityOpen && (
                  <div className="section-content">
                    <label className="checkbox-filter-row">
                      <input 
                        type="checkbox" 
                        checked={showInStock} 
                        onChange={(e) => setShowInStock(e.target.checked)} 
                      />
                      <span>In Stock</span>
                    </label>
                    <label className="checkbox-filter-row">
                      <input 
                        type="checkbox" 
                        checked={showOutOfStock} 
                        onChange={(e) => setShowOutOfStock(e.target.checked)} 
                      />
                      <span>Out of Stock</span>
                    </label>
                  </div>
                )}
              </div>

              {/* 7. Rating Accordion */}
              <div className="filter-card-section rating-accordion">
                <div className="section-title-row" onClick={() => setIsRatingsOpen(!isRatingsOpen)}>
                  <h3 className="section-title-text">Rating</h3>
                  <div className="accordion-right-info">
                    {selectedRating ? `${selectedRating} ★ & Up` : '⭐⭐⭐⭐⭐ & Up'}
                    <ChevronDown size={14} className={`section-chevron ${isRatingsOpen ? 'rotated' : ''}`} />
                  </div>
                </div>
                {isRatingsOpen && (
                  <div className="section-content">
                    <ul className="rating-selector-list">
                      {[5, 4, 3, 2, 1].map(stars => (
                        <li 
                          key={stars} 
                          className={`rating-item ${selectedRating === stars ? 'active' : ''}`}
                          onClick={() => setSelectedRating(selectedRating === stars ? null : stars)}
                        >
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              fill={i < stars ? "#FFCC00" : "none"} 
                              stroke={i < stars ? "#FFCC00" : "#ccc"} 
                              style={{ marginRight: '2px' }}
                            />
                          ))}
                          <span className="rating-label-text"> & Up</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 8. New Arrivals Accordion */}
              <div className="filter-card-section new-arrivals-accordion">
                <div className="section-title-row" onClick={() => setIsNewArrivalsOpen(!isNewArrivalsOpen)}>
                  <h3 className="section-title-text">New Arrivals</h3>
                  <ChevronDown size={14} className={`section-chevron ${isNewArrivalsOpen ? 'rotated' : ''}`} />
                </div>
                {isNewArrivalsOpen && (
                  <div className="section-content">
                    <label className="checkbox-filter-row">
                      <input 
                        type="checkbox" 
                        checked={filterNewArrivals} 
                        onChange={(e) => setFilterNewArrivals(e.target.checked)} 
                      />
                      <span>Show New Arrivals</span>
                    </label>
                  </div>
                )}
              </div>

              {/* 9. Best Sellers Accordion */}
              <div className="filter-card-section best-sellers-accordion">
                <div className="section-title-row" onClick={() => setIsBestSellersOpen(!isBestSellersOpen)}>
                  <h3 className="section-title-text">Best Sellers</h3>
                  <ChevronDown size={14} className={`section-chevron ${isBestSellersOpen ? 'rotated' : ''}`} />
                </div>
                {isBestSellersOpen && (
                  <div className="section-content">
                    <label className="checkbox-filter-row">
                      <input 
                        type="checkbox" 
                        checked={filterBestSellers} 
                        onChange={(e) => setFilterBestSellers(e.target.checked)} 
                      />
                      <span>Show Best Sellers</span>
                    </label>
                  </div>
                )}
              </div>

              {/* 10. Offers & Discounts Accordion */}
              <div className="filter-card-section offers-accordion">
                <div className="section-title-row" onClick={() => setIsOffersOpen(!isOffersOpen)}>
                  <h3 className="section-title-text">Offers & Discounts</h3>
                  <ChevronDown size={14} className={`section-chevron ${isOffersOpen ? 'rotated' : ''}`} />
                </div>
                {isOffersOpen && (
                  <div className="section-content">
                    <label className="checkbox-filter-row">
                      <input 
                        type="checkbox" 
                        checked={filterOffers} 
                        onChange={(e) => setFilterOffers(e.target.checked)} 
                      />
                      <span>Show Active Offers</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Apply Filters Button (Matches Image 2) */}
              <button className="apply-filters-footer-btn" onClick={() => setShowSidebar(false)}>
                Apply Filters
              </button>

            </div>
          </aside>

          {/* Right Product List Column */}
          <div className="shop-products-column">
            
            {/* Header controls (Showing results count + Sort box + Search Box) */}
            <div className="shop-products-header">
              <div className="shop-results-count" style={{ display: 'flex', alignItems: 'center' }}>
                <button 
                  className={`shop-filters-toggle-btn ${showSidebar ? 'active' : ''}`}
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  <Menu size={16} className="menu-icon" />
                  <span className="filters-text">FILTERS</span>
                  <X size={16} className="close-x-icon" />
                </button>
                <span className="results-count-text">
                  Showing {totalProductsCount > 0 ? indexOfFirstProduct + 1 : 0}–{Math.min(indexOfLastProduct, totalProductsCount)} of {totalProductsCount} results
                </span>
              </div>
              
              <div className="shop-header-actions">
                <div className="shop-search-box">
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="shop-search-input"
                  />
                </div>

                <div className="shop-sort-box">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="shop-sort-select"
                  >
                    <option value="DEFAULT">Sort by: Newest</option>
                    <option value="PRICE_LOW_HIGH">Price: Low to High</option>
                    <option value="PRICE_HIGH_LOW">Price: High to Low</option>
                    <option value="RATING">Rating: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Grid View */}
            {currentProducts.length > 0 ? (
              <>
                <div className="shop-products-grid animate-fade-in-up">
                  {currentProducts.map((prod) => {
                    const isClothing = prod.category === 'CLOTHING';
                    
                    if (isClothing) {
                      const brandName = prod.modelNo ? "TIKQ Kids" : "Mithira Collection";
                      const originalPrice = Math.round(prod.price * 1.5);
                      const discountPercentage = Math.round(((originalPrice - prod.price) / originalPrice) * 100);
                      const isWishlisted = wishlist.includes(prod.id);
                      const isInCart = cart.includes(prod.id);
                      const inStock = isProductInStock(prod);

                      return (
                        <div 
                          key={prod.id} 
                          className="clothing-product-card animate-fade-in-up"
                          onClick={() => setFullDetailProduct(prod)}
                        >
                          <div className="clothing-img-wrapper" onClick={(e) => { e.stopPropagation(); setFullDetailProduct(prod); }}>
                            {/* Discount Badge */}
                            <div className="clothing-discount-badge">
                              {discountPercentage}% OFF
                            </div>
                            
                            {/* Wishlist floating button (top-right of image) */}
                            <button 
                              className={`clothing-wishlist-float-btn ${isWishlisted ? 'active' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                              aria-label="Add to Wishlist"
                            >
                              <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
                            </button>

                            <img src={prod.image} alt={prod.title} className="clothing-img" />

                            {/* Image Hover Overlay */}
                            <div className="clothing-hover-overlay">
                              <button 
                                className={`clothing-hover-action-btn hover-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                                title="Add to Wishlist"
                              >
                                <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                              </button>
                              <button 
                                className="clothing-hover-action-btn hover-quickview-btn"
                                onClick={(e) => { e.stopPropagation(); setQuickViewProduct(prod); }}
                                title="Quick View"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                className={`clothing-hover-action-btn hover-cart-btn ${isInCart ? 'in-cart' : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleCart(prod.id, prod.title); }}
                                title="Add to Cart"
                              >
                                <ShoppingCart size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="clothing-info-section">
                            <div className="clothing-brand-row">
                              <span className="clothing-brand-name">{brandName}</span>
                              <div className="clothing-stock-badge">
                                {inStock ? (
                                  <span className="stock-status-in">In Stock</span>
                                ) : (
                                  <span className="stock-status-out">Out of Stock</span>
                                )}
                              </div>
                            </div>

                            <h4 className="clothing-product-title" onClick={() => setFullDetailProduct(prod)}>
                              {prod.title}
                            </h4>

                            <div className="clothing-rating-badge-container">
                              <div className="clothing-rating-pill-green">
                                <span>{(prod.rating || 5).toFixed(1)}</span>
                                <span className="rating-star-icon">★</span>
                                <span className="rating-divider">|</span>
                                <span className="rating-count">{prod.reviews || 0}</span>
                              </div>
                            </div>

                            <div className="clothing-price-and-action">
                              <div className="clothing-price-box">
                                <span className="clothing-selling-price">₹{prod.price.toLocaleString()}</span>
                                <span className="clothing-original-price">₹{originalPrice.toLocaleString()}</span>
                              </div>
                              <button 
                                className={`clothing-card-add-cart-btn ${isInCart ? 'in-cart' : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleCart(prod.id, prod.title); }}
                              >
                                {isInCart ? "IN CART" : "ADD TO CART"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // For non-clothing products, keep the original design exactly
                    return (
                      <div 
                        key={prod.id} 
                        className={`product-card shop-prod-card ${getThemeClass(prod)}`}
                        onClick={() => setQuickViewProduct(prod)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="prod-img-wrapper" style={{ aspectRatio: '1 / 1.15' }}>
                          <div className="prod-card-crown-motif">
                            <img src={logoImg} alt="Logo" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                          </div>
                          <button 
                            className={`prod-wishlist-btn ${wishlist.includes(prod.id) ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                            aria-label="Add to Wishlist"
                          >
                            <Heart size={16} fill={wishlist.includes(prod.id) ? "currentColor" : "none"} />
                          </button>
                          <img src={prod.image} alt={prod.title} className="prod-img" />
                          <div className="shop-card-hover-overlay">
                            <button 
                              className="shop-action-icon-btn quick-view-btn"
                              onClick={(e) => { e.stopPropagation(); setQuickViewProduct(prod); }}
                              title="Quick View"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              className={`shop-action-icon-btn add-cart-btn ${cart.includes(prod.id) ? 'in-cart' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleCart(prod.id, prod.title); }}
                              title="Add to Cart"
                            >
                              <ShoppingCart size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="prod-details">
                          <span className="prod-card-category">{prod.category} {prod.subCategory ? `| ${prod.subCategory}` : ''}</span>
                          <h4 
                            className="prod-card-title"
                            onClick={(e) => { e.stopPropagation(); setFullDetailProduct(prod); }}
                          >
                            {prod.title}
                          </h4>
                          <div className="prod-card-price-row">
                            <span className="prod-card-price">₹{prod.price.toLocaleString()}</span>
                            <button 
                              className={`prod-card-buy-pill ${cart.includes(prod.id) ? 'active' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleCart(prod.id, prod.title); }}
                            >
                              {cart.includes(prod.id) ? "In Cart" : "ADD TO CART"}
                            </button>
                          </div>
                        </div>
                        <div className="celeb-shimmer-sweep"></div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="shop-pagination">
                    {pageNumbers.map(number => (
                      <button
                        key={number}
                        onClick={() => {
                          setCurrentPage(number);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        className={`pagination-number-btn ${currentPage === number ? 'active' : ''}`}
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        if (currentPage < totalPages) {
                          setCurrentPage(prev => prev + 1);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }
                      }}
                      disabled={currentPage === totalPages}
                      className="pagination-next-btn"
                    >
                      Next &rarr;
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="shop-empty-state">
                <h3>No products found matching your criteria</h3>
                <p>Try checking your search query or selecting a different category filter</p>
              </div>
            )}

            {/* Back to homepage button */}
            <div className="shop-footer-actions">
              <button onClick={handleBackToHome} className="shop-back-home-btn">
                Back to Homepage
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* 1. Quick View Side-by-Side Modal */}
      {quickViewProduct && (() => {
        const images = getAllProductImages(quickViewProduct);
        const colors = getProductThemedColors(quickViewProduct);

        const handlePrevThumbnail = () => {
          setActiveImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
        };
        const handleNextThumbnail = () => {
          setActiveImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
        };

        return (
          <div className={`modal-overlay quickview-split-overlay animate-fade-in ${getCategoryThemeClass(quickViewProduct.category)}`} onClick={() => setQuickViewProduct(null)}>
            <div className="quickview-split-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
              
              {/* Modal Top Header Bar */}
              <div className="quickview-modal-header">
                <span className="quickview-modal-title-top">Quick View</span>
                <button className="modal-close-btn" onClick={() => setQuickViewProduct(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="quickview-split-layout">
                {/* Left Pane: Gallery Section */}
                <div className="quickview-split-gallery-pane">
                  {/* Thumbnails column with Nav Chevrons */}
                  {images.length > 1 ? (
                    <div className="quickview-thumbnails-nav-wrapper">
                      <button className="thumbnail-nav-arrow up" onClick={handlePrevThumbnail}>
                        <ChevronUp size={14} />
                      </button>
                      <div className="quickview-gallery-thumbnails">
                        {images.map((img, idx) => (
                          <div 
                            key={idx}
                            className={`quickview-thumbnail-wrapper ${activeImageIndex === idx ? 'active' : ''}`}
                            onClick={() => setActiveImageIndex(idx)}
                          >
                            <img src={img} alt={`thumb-${idx}`} className="quickview-thumbnail-img" />
                          </div>
                        ))}
                      </div>
                      <button className="thumbnail-nav-arrow down" onClick={handleNextThumbnail}>
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  ) : null}
                  
                  {/* Main Image display */}
                  <div className="quickview-main-image-wrapper">
                    <img 
                      src={images[activeImageIndex] || quickViewProduct.image} 
                      alt={quickViewProduct.title} 
                      className="quickview-split-img" 
                    />
                  </div>
                </div>

                {/* Right Pane: Info & Selector Controls */}
                <div className="quickview-split-info-pane">
                  <h2 className="modal-title">{quickViewProduct.title}</h2>
                  
                  {/* Ratings */}
                  <div className="modal-rating-row">
                    <span className="modal-stars" style={{ color: '#ffb300' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={15} fill={i < (quickViewProduct.rating || 5) ? '#ffb300' : 'none'} color="#ffb300" style={{ display: 'inline-block', marginRight: '2px' }} />
                      ))}
                    </span>
                    <span className="modal-reviews-count">({quickViewProduct.reviews || "48"} Reviews)</span>
                  </div>

                  <div className="modal-price-row">
                    <span className="modal-price">₹{quickViewProduct.price.toLocaleString()}</span>
                    <span className="modal-original-price">₹{(Math.round(quickViewProduct.price * 1.5)).toLocaleString()}</span>
                  </div>

                  <div className="modal-availability-row">
                    <span className="availability-label">Availability:</span>
                    <span className="availability-status">In Stock</span>
                  </div>

                  <p className="modal-desc">
                    {quickViewProduct.description || "Elegant and premium collection item designed to complement your cultural roots. Crafted with pure fabric and detailed quality finishes."}
                  </p>

                  {/* Category-specific Selectors */}
                  {renderCategorySelectors(quickViewProduct, modalSize, setModalSize, modalColor, setModalColor, activeImageIndex, setActiveImageIndex, images, colors, modalQty, setModalQty)}

                  {/* Quantity Block (Aligned to match reference image) */}
                  <div className="modal-section-block quantity-section">
                    <span className="modal-section-title">Quantity:</span>
                    <div className="modal-quantity-selector">
                      <button className="qty-btn" onClick={() => setModalQty(Math.max(1, modalQty - 1))}>-</button>
                      <span className="qty-value">{modalQty}</span>
                      <button className="qty-btn" onClick={() => setModalQty(modalQty + 1)}>+</button>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="modal-actions-buttons-row">
                    <button 
                      className="modal-primary-action-btn"
                      onClick={() => {
                        toggleCart(quickViewProduct.id, quickViewProduct.title);
                      }}
                    >
                      {cart.includes(quickViewProduct.id) ? "Remove from Cart" : "Add to Cart"}
                    </button>
                    <button 
                      className="modal-secondary-action-btn"
                      onClick={() => {
                        setFullDetailProduct(quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                    >
                      Go to Product
                    </button>
                  </div>
                  
                  {/* Bottom Wishlist Link (Compare & Specifications removed) */}
                  <div className="modal-extra-links-row">
                    <button 
                      className={`modal-extra-link-btn ${wishlist.includes(quickViewProduct.id) ? 'active' : ''}`}
                      onClick={() => toggleWishlist(quickViewProduct.id)}
                    >
                      <Heart size={16} fill={wishlist.includes(quickViewProduct.id) ? "currentColor" : "none"} style={{ marginRight: '6px' }} />
                      <span>{wishlist.includes(quickViewProduct.id) ? "Added to Wishlist" : "Add to Wishlist"}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 2. Full Product Detail View is handled inline at the top of the render function */}

    </div>
  );
}
