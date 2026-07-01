/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { useToast } from './ToastProvider';
import Breadcrumbs from './ui/Breadcrumbs';
import Skeleton, { ProductCardSkeleton } from './ui/Skeleton';
import { Heart, Star, ShoppingCart, Search, Eye, X, Phone, ChevronDown, ChevronUp, ArrowLeft, Filter, Crown, Menu, Shirt, BookOpen, Gift, Shield, Globe, Award, Sparkles, RotateCcw } from 'lucide-react';
import { resolveProductImage, resolveProductGallery, isRealImg } from '../utils/imageHelper';
import bannerVideo from '../assets/banner_video.mp4';
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
import imgClothing from '../assets/hero_clothing_banner.jpg';
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
const getAllProductImages = (prod, selectedColor = '') => {
  return resolveProductGallery(prod, selectedColor);
};

const resolveImagesArray = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images.filter(isRealImg);
  if (typeof images === 'string') {
    return images.split(',')
      .map(img => img.trim())
      .filter(img => img && isRealImg(img));
  }
  return [];
};

// Handle color change and select the variant image in gallery
const handleColorChange = (colorName, prod, setModalColor, setActiveImageIndex, setModalSize, currentSize) => {
  setModalColor(colorName);
  if (prod && prod.variants) {
    const hasVariantImages = prod.variants.some(v => v.image && isRealImg(v.image));
    if (hasVariantImages) {
      const colors = getProductThemedColors(prod);
      const colorIdx = colors.findIndex(c => c.name.toLowerCase() === colorName.toLowerCase());
      if (colorIdx !== -1) {
        setActiveImageIndex(colorIdx);
      }
    }

    // Selection Retention
    const isSizeAvailable = prod.variants.some(v => 
      v.color?.toLowerCase() === colorName.toLowerCase() && 
      v.size?.toLowerCase() === currentSize?.toLowerCase() && 
      v.stock > 0
    );

    if (isSizeAvailable) {
      setModalSize(currentSize);
    } else {
      const fallbackVar = prod.variants.find(v => 
        v.color?.toLowerCase() === colorName.toLowerCase() && 
        v.stock > 0
      ) || prod.variants.find(v => 
        v.color?.toLowerCase() === colorName.toLowerCase()
      );
      if (fallbackVar && fallbackVar.size) {
        setModalSize(fallbackVar.size);
      }
    }
  }
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
      { name: 'Blue', hex: '#051838' }
    ];
    if (model.includes('TQ-63') || model.includes('TQ-93')) return [
      { name: 'Maroon', hex: '#880e4f' },
      { name: 'Plum', hex: '#4a148c' },
      { name: 'Olive', hex: '#558b2f' },
      { name: 'Beige', hex: '#d7ccc8' },
      { name: 'Green', hex: '#a5d6a7' }
    ];
    if (model.includes('TQ-87') || model.includes('TQ-145')) return [
      { name: 'Blue', hex: '#051838' },
      { name: 'Rose', hex: '#e91e63' },
      { name: 'Olive', hex: '#2e7d32' },
      { name: 'Yellow', hex: '#fbc02d' },
      { name: 'Purple', hex: '#6a1b9a' }
    ];
    if (model.includes('TQ-89') || model.includes('TQ-95')) return [
      { name: 'Blue', hex: '#051838' },
      { name: 'Sage', hex: '#4caf50' },
      { name: 'Rose', hex: '#e91e63' },
      { name: 'Yellow', hex: '#ffeb3b' },
      { name: 'Grey', hex: '#9e9e9e' }
    ];
    if (model.includes('TQ-103')) return [
      { name: 'Blue-White', hex: '#051838' }
    ];
    if (model.includes('TQ-109') || model.includes('TQ-110') || model.includes('TQ-113')) return [
      { name: 'Black', hex: '#212121' },
      { name: 'Blue', hex: '#051838' },
      { name: 'Grey', hex: '#757575' },
      { name: 'Green', hex: '#43a047' },
      { name: 'Brown', hex: '#8d6e63' }
    ];
    if (model.includes('TQ-126') || model.includes('TQ-138')) return [
      { name: 'Purple', hex: '#6a1b9a' },
      { name: 'Dark Grey', hex: '#424242' },
      { name: 'Maroon', hex: '#880e4f' },
      { name: 'Olive', hex: '#2e7d32' },
      { name: 'Blue', hex: '#051838' }
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
        { name: 'Ocean Blue', hex: '#051838' }
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
  if (cat.includes('STATIONERY') || cat.includes('PEN') || cat.includes('PENCIL') || cat.includes('NOTEBOOK') || cat.includes('OFFICE') || cat.includes('PAPER') || cat.includes('WRITING')) return 'theme-stationery';
  if (cat.includes('GIFT') || cat.includes('VALENTINE')) return 'theme-gifts';
  if (cat.includes('ACCESSORIES') || cat.includes('FANCY') || cat.includes('JEWEL') || cat.includes('WATCH')) return 'theme-accessories';
  return 'theme-clothing';
};

const renderCategorySelectors = (
  prod,
  modalSize,
  setModalSize,
  modalColor,
  setModalColor,
  activeImageIndex,
  setActiveImageIndex,
  images,
  colors,
  modalQty,
  setModalQty,
  personalizationText = '',
  setPersonalizationText = () => {},
  personalizationError = false,
  setPersonalizationError = () => {}
) => {
  if (!prod) return null;

  const category = String(prod.category).toUpperCase();

  // If the product has custom variants defined by a vendor:
  if (prod.variants && prod.variants.length > 0) {
    const varColors = getProductThemedColors(prod);
    const activeColor = modalColor || (varColors[0] ? varColors[0].name : '');
    
    // Available options in list
    const sizes = [...new Set(prod.variants.map(v => v.size).filter(Boolean))];
    const fabrics = [...new Set(prod.variants.map(v => v.fabric || v.material).filter(Boolean))];
    const fits = [...new Set(prod.variants.map(v => v.fit || v.style).filter(Boolean))];

    // Helper to check if a combination is available (in-stock)
    const isCombAvailable = (col, sz, fab, ft) => {
      return prod.variants.some(v => 
        (!col || v.color?.toLowerCase() === col.toLowerCase()) &&
        (!sz || v.size?.toLowerCase() === sz.toLowerCase()) &&
        (!fab || (v.fabric || v.material)?.toLowerCase() === fab.toLowerCase()) &&
        (!ft || (v.fit || v.style)?.toLowerCase() === ft.toLowerCase()) &&
        v.stock > 0
      );
    };

    return (
      <div className="variant-selectors-group" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Colors (Swatches) */}
        {varColors.length > 0 && (
          <div className="modal-section-block">
            <span className="modal-section-title" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Color: <span className="color-name" style={{ color: 'var(--primary-rose)', fontWeight: 700 }}>{modalColor || varColors[0]?.name}</span>
            </span>
            <div className="modal-color-dots" style={{ display: 'flex', gap: '10px' }}>
              {varColors.map((c, idx) => {
                const isColAvail = prod.variants.some(v => v.color?.toLowerCase() === c.name.toLowerCase() && v.stock > 0);
                return (
                  <button 
                    key={idx}
                    type="button"
                    className={`modal-color-dot ${modalColor === c.name ? 'active' : ''}`}
                    style={{ 
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: c.hex,
                      border: modalColor === c.name ? '2px solid #fff' : '1px solid #cbd5e1',
                      outline: modalColor === c.name ? '2px solid var(--primary-rose, #1d4ed8)' : 'none',
                      cursor: 'pointer',
                      opacity: isColAvail ? 1 : 0.45,
                      background: isColAvail ? undefined : `linear-gradient(45deg, ${c.hex} 48%, #94a3b8 49%, #94a3b8 51%, ${c.hex} 52%)`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => {
                      handleColorChange(c.name, prod, setModalColor, setActiveImageIndex, setModalSize, modalSize);
                    }}
                    title={`${c.name} ${isColAvail ? '' : '(Out of stock)'}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Sizes (Grid) */}
        {sizes.length > 0 && (
          <div className="modal-section-block">
            <span className="modal-section-title" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Select Size</span>
            <div className="modal-size-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {sizes.map((sz) => {
                const isSzAvail = isCombAvailable(activeColor, sz);
                return (
                  <button 
                    key={sz}
                    type="button"
                    className={`modal-size-btn ${modalSize === sz ? 'active' : ''}`}
                    style={{ 
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: modalSize === sz ? '1.5px solid var(--primary-rose)' : '1px solid #e2e8f0',
                      color: modalSize === sz ? 'var(--primary-rose)' : '#475569',
                      background: modalSize === sz ? 'var(--bg-cream, #fffef9)' : (isSzAvail ? '#ffffff' : 'linear-gradient(45deg, #ffffff 48%, #ef4444 49%, #ef4444 51%, #ffffff 52%)'),
                      opacity: isSzAvail ? 1 : 0.4,
                      cursor: isSzAvail ? 'pointer' : 'not-allowed',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => isSzAvail && setModalSize(sz)}
                    disabled={!isSzAvail}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Fabrics/Materials */}
        {fabrics.length > 0 && (
          <div className="modal-section-block">
            <span className="modal-section-title" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Material / Fabric</span>
            <div className="modal-size-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {fabrics.map((fab) => {
                const isFabAvail = isCombAvailable(activeColor, modalSize, fab);
                return (
                  <button 
                    key={fab}
                    type="button"
                    className="modal-size-btn"
                    style={{ 
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      color: '#475569',
                      background: isFabAvail ? '#ffffff' : 'linear-gradient(45deg, #ffffff 48%, #ef4444 49%, #ef4444 51%, #ffffff 52%)',
                      opacity: isFabAvail ? 1 : 0.4,
                      cursor: 'default',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  >
                    {fab}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Fits/Styles */}
        {fits.length > 0 && (
          <div className="modal-section-block">
            <span className="modal-section-title" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Style / Fit</span>
            <div className="modal-size-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {fits.map((ft) => {
                const isFtAvail = isCombAvailable(activeColor, modalSize, null, ft);
                return (
                  <button 
                    key={ft}
                    type="button"
                    className="modal-size-btn"
                    style={{ 
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      color: '#475569',
                      background: isFtAvail ? '#ffffff' : 'linear-gradient(45deg, #ffffff 48%, #ef4444 49%, #ef4444 51%, #ffffff 52%)',
                      opacity: isFtAvail ? 1 : 0.4,
                      cursor: 'default',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  >
                    {ft}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback category-based static selectors (when no Mongoose variants exist)
  if (category.includes('CLOTHING') || category.includes('DRESS')) {
    const sizeOptions = prod.attributes?.size 
      ? prod.attributes.size.split(',').map(s => s.trim()).filter(Boolean) 
      : (prod.subCategory === 'KIDS' ? ['2y', '4y', '6y', '8y'] : ['XS', 'S', 'M', 'L', 'XL', 'XXL']);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {colors.length > 0 && (
          <div className="modal-section-block">
            <span className="modal-section-title" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Color: <span className="color-name" style={{ color: 'var(--primary-rose)', fontWeight: 700 }}>{colors[activeImageIndex]?.name || colors[0]?.name}</span>
            </span>
            <div className="modal-color-dots" style={{ display: 'flex', gap: '10px' }}>
              {colors.map((c, idx) => (
                <button 
                  key={idx}
                  type="button"
                  className={`modal-color-dot ${activeImageIndex === idx ? 'active' : ''}`}
                  style={{ 
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: activeImageIndex === idx ? '2px solid #fff' : '1px solid #cbd5e1',
                    outline: activeImageIndex === idx ? '2px solid var(--primary-rose)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
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

        <div className="modal-section-block">
          <span className="modal-section-title" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Select Size</span>
          <div className="modal-size-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {sizeOptions.map((sz) => (
              <button 
                key={sz}
                type="button"
                className={`modal-size-btn ${modalSize === sz ? 'active' : ''}`}
                style={{ 
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: modalSize === sz ? '1.5px solid var(--primary-rose)' : '1px solid #e2e8f0',
                  color: modalSize === sz ? 'var(--primary-rose)' : '#475569',
                  background: modalSize === sz ? 'var(--bg-cream)' : '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
                onClick={() => setModalSize(sz)}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (category.includes('STATIONERY')) {
    const packs = ['Pack of 1', 'Pack of 3', 'Pack of 5', 'Pack of 10'];
    const packSize = modalSize.includes('Pack') ? modalSize : 'Pack of 3';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="modal-section-block">
          <span className="modal-section-title" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Ink Color: {modalColor || "Blue"}</span>
          <div className="modal-color-dots" style={{ display: 'flex', gap: '10px' }}>
            {[
              { name: 'Blue', hex: '#0d47a1' },
              { name: 'Black', hex: '#212121' },
              { name: 'Red', hex: '#b71c1c' }
            ].map((c, idx) => (
              <button 
                key={idx}
                type="button"
                className={`modal-color-dot ${modalColor === c.name ? 'active' : ''}`}
                style={{ 
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: c.hex,
                  border: modalColor === c.name ? '2px solid #fff' : '1px solid #cbd5e1',
                  outline: modalColor === c.name ? '2px solid var(--primary-rose)' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setModalColor(c.name)}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div className="modal-section-block">
          <span className="modal-section-title" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Pack Size</span>
          <div className="modal-size-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {packs.map((sz) => (
              <button 
                key={sz}
                type="button"
                className={`modal-size-btn ${packSize === sz ? 'active' : ''}`}
                style={{ 
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: packSize === sz ? '1.5px solid var(--primary-rose)' : '1px solid #e2e8f0',
                  color: packSize === sz ? 'var(--primary-rose)' : '#475569',
                  background: packSize === sz ? 'var(--bg-cream)' : '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
                onClick={() => setModalSize(sz)}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (category.includes('GIFT')) {
    const wrapThemes = ['Classic Red', 'Mystic Violet', 'Minimalist White', 'Premium Gold'];
    const selectedTheme = modalColor.includes('Classic') || modalColor.includes('Mystic') || modalColor.includes('Minimal') || modalColor.includes('Premium') ? modalColor : 'Classic Red';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="modal-section-block">
          <span className="modal-section-title" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Occasion Theme: {modalSize || "Birthday"}</span>
          <div className="modal-size-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Birthday', 'Anniversary', 'Wedding', 'Corporate'].map((sz) => (
              <button 
                key={sz}
                type="button"
                className={`modal-size-btn ${modalSize === sz ? 'active' : ''}`}
                style={{ 
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: modalSize === sz ? '1.5px solid var(--primary-rose)' : '1px solid #e2e8f0',
                  color: modalSize === sz ? 'var(--primary-rose)' : '#475569',
                  background: modalSize === sz ? 'var(--bg-cream)' : '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
                onClick={() => setModalSize(sz)}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Gift Wrapping Toggle */}
        <div className="modal-section-block">
          <span className="modal-section-title" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Gift Wrapping Theme</span>
          <div className="modal-size-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {wrapThemes.map((sz) => (
              <button 
                key={sz}
                type="button"
                className={`modal-size-btn ${selectedTheme === sz ? 'active' : ''}`}
                style={{ 
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: selectedTheme === sz ? '1.5px solid var(--primary-rose)' : '1px solid #e2e8f0',
                  color: selectedTheme === sz ? 'var(--primary-rose)' : '#475569',
                  background: selectedTheme === sz ? 'var(--bg-cream)' : '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.82rem'
                }}
                onClick={() => setModalColor(sz)}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Personalization textarea */}
        {prod.attributes?.personalization && prod.attributes.personalization !== 'No' && (
          <div className="modal-section-block" id="personalization-input-container" style={{ scrollMarginTop: '100px' }}>
            <span className="modal-section-title" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Personalization Message *</span>
            <textarea 
              className="modal-input" 
              value={personalizationText}
              onChange={(e) => {
                setPersonalizationText(e.target.value);
                setPersonalizationError(false);
              }}
              placeholder="Enter name or message to print on gift..." 
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '8px', 
                border: personalizationError ? '2px solid #ef4444' : '1px solid #eae6df', 
                marginTop: '6px', 
                outline: 'none',
                height: '80px',
                resize: 'none',
                boxShadow: personalizationError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none'
              }}
            />
            {personalizationError && (
              <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                Please provide custom message / name for personalization!
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  if (category.includes('ACCESSORIES') || category.includes('FANCY')) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {colors.length > 0 && (
          <div className="modal-section-block">
            <span className="modal-section-title" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Metal Plating: {colors[activeImageIndex]?.name || colors[0]?.name}</span>
            <div className="modal-color-dots" style={{ display: 'flex', gap: '10px' }}>
              {colors.map((c, idx) => (
                <button 
                  key={idx}
                  type="button"
                  className={`modal-color-dot ${activeImageIndex === idx ? 'active' : ''}`}
                  style={{ 
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: activeImageIndex === idx ? '2px solid #fff' : '1px solid #cbd5e1',
                    outline: activeImageIndex === idx ? '2px solid var(--primary-rose)' : 'none',
                    cursor: 'pointer'
                  }}
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

        <div className="modal-section-block">
          <span className="modal-section-title" style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Size:</span>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', width: 'fit-content', background: '#f8fafc' }}>
            One Size (Adjustable)
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const renderCategorySpecs = (prod) => {
  if (!prod) return null;

  if (prod.attributes && Object.keys(prod.attributes).length > 0) {
    return (
      <div className="product-detail-specs-table">
        {Object.entries(prod.attributes).map(([key, val]) => (
          <div className="spec-row" key={key}>
            <span className="spec-label" style={{ textTransform: 'capitalize' }}>{key}:</span>
            <span className="spec-val">{Array.isArray(val) ? val.join(', ') : String(val)}</span>
          </div>
        ))}
      </div>
    );
  }

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
  if (!name) return '#cccccc';
  const colors = {
    'white': '#ffffff',
    'black': '#111111',
    'pink': '#ff80ab',
    'red': '#e53935',
    'yellow': '#fdd835',
    'green': '#43a047',
    'purple': '#8e24aa',
    'blue': 'hsla(225, 75%, 45%, 1)',
    'darkred': '#b71c1c',
    'crimson red': '#b32142',
    'champagne gold': '#D4AF37',
    'midnight black': '#111111',
    'lavender': '#ce93d8',
    'soft pink': '#f8bbd0',
    'plum': '#4a148c',
    'sage': '#81c784',
    'grey': '#9e9e9e',
    'peach': '#ffcc80',
    'cream': '#fff9c4',
    'aqua': '#80deea',
    'navy': '#051838',
    'olive': '#2e7d32'
  };
  const key = name.toLowerCase().trim();
  return colors[key] || name.trim() || '#cccccc';
};

const getSelectedVariant = (prod, color, size) => {
  if (!prod || !prod.variants || prod.variants.length === 0) return null;
  // Try exact match for both color and size
  let matched = prod.variants.find(v => 
    (color && v.color && String(v.color).toLowerCase() === String(color).toLowerCase()) &&
    (size && v.size && String(v.size).toLowerCase() === String(size).toLowerCase())
  );
  if (!matched && color) {
    // Fallback to color match
    matched = prod.variants.find(v => v.color && String(v.color).toLowerCase() === String(color).toLowerCase());
  }
  return matched;
};

const getSimilarProducts = (currentProd, allProds) => {
  if (!currentProd) return [];
  
  const currentId = String(currentProd.id || currentProd._id || '');
  const candidates = allProds.filter(p => {
    const pId = String(p.id || p._id || '');
    return p.category === currentProd.category && pId !== currentId;
  });
  
  // Score candidates
  const scored = candidates.map(p => {
    let score = 0;
    
    // 1. Check colors
    const currentColors = getProductThemedColors(currentProd).map(c => String(c.name).toLowerCase());
    const candidateColors = getProductThemedColors(p).map(c => String(c.name).toLowerCase());
    const commonColors = currentColors.filter(c => candidateColors.includes(c));
    score += commonColors.length * 3; // 3 points per matching color
    
    // 2. Check sub-category
    if (p.subCategory && currentProd.subCategory && String(p.subCategory).toLowerCase() === String(currentProd.subCategory).toLowerCase()) {
      score += 5; // 5 points for matching subCategory
    }
    
    // 3. Check attributes/specs (fabric, theme, material, pages, etc.)
    const currAttrs = currentProd.attributes || {};
    const candAttrs = p.attributes || {};
    Object.keys(currAttrs).forEach(key => {
      if (currAttrs[key] && candAttrs[key] && String(currAttrs[key]).toLowerCase() === String(candAttrs[key]).toLowerCase()) {
        score += 4; // 4 points for matching custom specifications/styles
      }
    });
    
    return { product: p, score };
  });
  
  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.product);
};

const getProductVideo = (prod) => {
  if (prod && prod.video && isRealImg(prod.video)) return prod.video;
  return null;
};

export default function ShopView({ authUser, setAuthUser }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState('ALL');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [fullDetailProduct, setFullDetailProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center', transform: 'scale(1)' });
  const [personalizationText, setPersonalizationText] = useState('');
  const [personalizationError, setPersonalizationError] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [modalSize, setModalSize] = useState('M');
  const [modalColor, setModalColor] = useState('Red');
  const [modalQty, setModalQty] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('DEFAULT');

  // Category specific filter states
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [selectedPaperSizes, setSelectedPaperSizes] = useState([]);
  const [selectedPaperTypes, setSelectedPaperTypes] = useState([]);
  const [selectedPackSizes, setSelectedPackSizes] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedGiftThemes, setSelectedGiftThemes] = useState([]);
  
  const [isFabricOpen, setIsFabricOpen] = useState(false);
  const [isPaperSizeOpen, setIsPaperSizeOpen] = useState(false);
  const [isPaperTypeOpen, setIsPaperTypeOpen] = useState(false);
  const [isPackSizeOpen, setIsPackSizeOpen] = useState(false);
  const [isMaterialOpen, setIsMaterialOpen] = useState(false);
  const [isGiftThemeOpen, setIsGiftThemeOpen] = useState(false);

  // Infinite Scroll state
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    if (authUser) return authUser.wishlist || [];
    try {
      const local = localStorage.getItem('mithira_guest_wishlist');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });
  const [cart, setCart] = useState(() => {
    if (authUser) return authUser.cart || [];
    try {
      const local = localStorage.getItem('mithira_guest_cart');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });
  const [categoriesList, setCategoriesList] = useState([]);
  const [storeSettings, setStoreSettings] = useState({
    shippingInfoLines: [
      "Free shipping on all orders above ₹999.",
      "Standard delivery takes 3-5 business days depending on location.",
      "Cash on Delivery (COD) is available on all eligible postal addresses.",
      "We offer easy 7-day hassle-free returns and exchanges."
    ]
  });
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const toggleSubcategoryExpand = (subKey) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subKey]: !prev[subKey]
    }));
  };

  useEffect(() => {
    if (authUser) {
      setWishlist(authUser.wishlist || []);
      setCart(authUser.cart || []);
    } else {
      try {
        const localWish = localStorage.getItem('mithira_guest_wishlist');
        const localCart = localStorage.getItem('mithira_guest_cart');
        setWishlist(localWish ? JSON.parse(localWish) : []);
        setCart(localCart ? JSON.parse(localCart) : []);
      } catch {
        setWishlist([]);
        setCart([]);
      }
    }
  }, [authUser]);

  useEffect(() => {
    apiService.getCategories().then(data => {
      if (data && data.length > 0) {
        setCategoriesList(data);
      }
    }).catch(console.error);

    apiService.getSettings().then(data => {
      if (data) {
        setStoreSettings(data);
      }
    }).catch(console.error);
  }, []);

  const getGroupColor = (groupKey) => {
    return '#dfb743';
  };

  const getUnifiedCategories = () => {
    const defaultGroups = [
      { name: 'Clothing', key: 'CLOTHING', icon: <Shirt size={14} /> },
      { name: 'Stationery', key: 'STATIONERY', icon: <BookOpen size={14} /> },
      { name: 'Gifts', key: 'GIFTS', icon: <Gift size={14} /> },
      { name: 'Accessories', key: 'ACCESSORIES', icon: <Crown size={14} /> }
    ];

    const buildTree = (parentName, parentKey) => {
      if (!categoriesList || categoriesList.length === 0) return [];
      const dbChildren = categoriesList.filter(cat => {
        if (!cat.parent) return false;
        const pName = cat.parent.toLowerCase().trim();
        const searchName = parentName.toLowerCase().trim();
        if (pName === searchName) return true;
        if (searchName === 'accessories') {
          return pName === 'accessories' || pName === 'fancy' || pName === 'accessories & fancy' || pName === 'accessories and fancy';
        }
        return false;
      });
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

    const dbRoots = categoriesList.filter(
      cat =>
        (!cat.parent || cat.parent === '—') &&
        cat.name !== '—' &&
        cat.showInFilters !== false
    );

    defaultGroups.forEach(def => {
      const dbRoot = dbRoots.find(r => {
        const rName = r.name.toLowerCase().trim();
        const defName = def.name.toLowerCase().trim();
        if (rName === defName) return true;
        if (def.key === 'ACCESSORIES') {
          return rName === 'accessories' || rName === 'fancy' || rName === 'accessories & fancy' || rName === 'accessories and fancy';
        }
        return false;
      });
      const subcategories = dbRoot ? buildTree(dbRoot.name, def.key) : [];
      structure.push({
        name: def.name,
        key: def.key,
        icon: def.icon,
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
          icon: <Shirt size={14} />,
          subcategories: buildTree(dbRoot.name, key)
        });
      }
    });

    return structure;
  };

  const getAllSubcategoryKeysUnder = (subCategoryDbName) => {
    if (!subCategoryDbName || subCategoryDbName === 'ALL') return [];
    const unified = getUnifiedCategories();
    
    const collectDbNames = (node) => {
      let names = [node.dbName.toUpperCase()];
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          names = [...names, ...collectDbNames(child)];
        });
      }
      return names;
    };

    const findNode = (nodes) => {
      for (const node of nodes) {
        if (node.dbName.toUpperCase() === subCategoryDbName.toUpperCase()) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    for (const group of unified) {
      const found = findNode(group.subcategories);
      if (found) {
        return collectDbNames(found);
      }
    }
    return [subCategoryDbName.toUpperCase()];
  };

  const [catalogue, setCatalogue] = useState('A');
  const [priceRange, setPriceRange] = useState(15000);
  const [showInStock, setShowInStock] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Collapse/Expand States (Category and Gender/Shop For default to true, others false)
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isColorsOpen, setIsColorsOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isRatingsOpen, setIsRatingsOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(true);

  // Redesigned Sidebar Additional Filter States (Multi-select)
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedShopFor, setSelectedShopFor] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [filterNewArrivals, setFilterNewArrivals] = useState(false);
  const [filterBestSellers, setFilterBestSellers] = useState(false);
  const [filterOffers, setFilterOffers] = useState(false);

  const [isNewArrivalsOpen, setIsNewArrivalsOpen] = useState(false);
  const [isBestSellersOpen, setIsBestSellersOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);

  const [showMoreColors, setShowMoreColors] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('description');
  const [reviewsList, setReviewsList] = useState([]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activeSubTab, searchQuery, catalogue, priceRange, showInStock, showOutOfStock, selectedRatings, selectedSubcategories, selectedShopFor, selectedSizes, selectedColors, selectedDiscounts, filterNewArrivals, filterBestSellers, filterOffers]);

  const getCategoriesToShow = () => {
    let list = [];
    if (categoriesList && categoriesList.length > 0) {
      const namesSet = new Set();
      categoriesList.forEach(cat => {
        if (cat.name && cat.name !== '—' && cat.showInFilters !== false) {
          const nameUpper = cat.name.toUpperCase().trim();
          const parentUpper = cat.parent ? cat.parent.toUpperCase().trim() : '';
          const mainGroups = ['CLOTHING', 'STATIONERY', 'GIFTS', 'ACCESSORIES', 'FANCY'];
          
          let include = false;
          if (activeTab === 'ALL') {
            if (parentUpper && parentUpper !== '—') {
              include = true;
            } else if (!mainGroups.includes(nameUpper)) {
              include = true;
            }
          } else {
            if (parentUpper === activeTab) {
              include = true;
            } else if (activeTab === 'ACCESSORIES') {
              if (parentUpper === 'ACCESSORIES' || parentUpper === 'FANCY' || parentUpper === 'ACCESSORIES & FANCY' || parentUpper === 'ACCESSORIES AND FANCY') {
                include = true;
              }
            }
            
            if (!include && parentUpper) {
              const parentCat = categoriesList.find(c => c.name.toUpperCase().trim() === parentUpper);
              if (parentCat && parentCat.parent) {
                const grandParentUpper = parentCat.parent.toUpperCase().trim();
                if (grandParentUpper === activeTab || (activeTab === 'ACCESSORIES' && (grandParentUpper === 'ACCESSORIES' || grandParentUpper === 'FANCY'))) {
                  include = true;
                }
              }
            }
          }
          
          if (include) {
            namesSet.add(cat.name.trim());
          }
        }
      });
      list = Array.from(namesSet);
    }
    
    if (list.length === 0) {
      const fallbacks = {
        CLOTHING: ['Girls', 'Boys', 'Kids', 'Women', 'Men'],
        STATIONERY: ['Pens', 'Journals', 'Notebooks', 'School'],
        GIFTS: ['Birthday', 'Wedding', 'Anniversary', 'Return Gifts'],
        ACCESSORIES: ['Jewellery', 'Hair Accessories', 'Fancy Bags', 'Fashion Accessories']
      };
      
      if (activeTab === 'ALL') {
        list = Object.values(fallbacks).flat();
      } else {
        list = fallbacks[activeTab] || [];
      }
    }
    
    return list.sort((a, b) => a.localeCompare(b));
  };

  const renderDynamicCategoriesFilter = () => {
    const allCategories = getCategoriesToShow();
    const filtered = allCategories.filter(cat => 
      cat.toLowerCase().includes(categorySearchQuery.toLowerCase())
    );
    const displayed = showAllCategories ? filtered : filtered.slice(0, 8);
    
    return (
      <div className="flat-category-checklist-container">
        <input 
          type="text"
          className="category-list-search"
          placeholder="Search categories..."
          value={categorySearchQuery}
          onChange={(e) => setCategorySearchQuery(e.target.value)}
        />
        
        <div className="filter-category-list-m3">
          {displayed.length > 0 ? (
            displayed.map(catName => {
              const catUpper = catName.toUpperCase();
              const isChecked = selectedSubcategories.includes(catUpper);
              return (
                <label key={catName} className="checkbox-filter-row">
                  <input 
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      if (isChecked) {
                        setSelectedSubcategories(selectedSubcategories.filter(s => s !== catUpper));
                      } else {
                        setSelectedSubcategories([...selectedSubcategories, catUpper]);
                      }
                    }}
                  />
                  <span>{catName}</span>
                </label>
              );
            })
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', padding: '4px 0' }}>
              No categories found
            </div>
          )}
        </div>
        
        {filtered.length > 8 && (
          <button 
            type="button"
            className="show-more-toggle-btn"
            onClick={() => setShowAllCategories(!showAllCategories)}
          >
            {showAllCategories ? 'Show Less ▴' : 'Show More ▾'}
          </button>
        )}
      </div>
    );
  };

  // Dynamic mapping helpers
  const getProductSubCategoryFallback = (p) => {
    const title = (p.title || p.name || '').toLowerCase();
    const cat = String(p.category || '').split('>')[0].trim().toUpperCase();
    
    if (cat === 'CLOTHING') {
      if (title.includes('girl')) return 'GIRLS';
      if (title.includes('boy')) return 'BOYS';
      if (title.includes('kids') || title.includes('child')) return 'KIDS';
      if (title.includes('women') || title.includes('saree') || title.includes('frock') || title.includes('lehenga') || title.includes('anarkali') || title.includes('kurti')) return 'WOMEN';
      if (title.includes('men') || title.includes('male') || title.includes('dhoti') || title.includes('kurta') || title.includes('shirt')) return 'MEN';
      return 'WOMEN';
    }
    if (cat === 'STATIONERY') {
      if (title.includes('pen')) return 'PENS';
      if (title.includes('journal') || title.includes('planner')) return 'JOURNALS';
      if (title.includes('notebook') || title.includes('diary')) return 'NOTEBOOKS';
      return 'SCHOOL';
    }
    if (cat === 'GIFTS') {
      if (title.includes('birthday')) return 'BIRTHDAY';
      if (title.includes('wedding')) return 'WEDDING';
      if (title.includes('anniversary')) return 'ANNIVERSARY';
      return 'RETURN';
    }
    if (cat === 'ACCESSORIES') {
      if (title.includes('jewel') || title.includes('ring') || title.includes('necklace') || title.includes('choker') || title.includes('anklet')) return 'JEWELLERY';
      if (title.includes('hair') || title.includes('gajra') || title.includes('clip')) return 'HAIR';
      if (title.includes('bag') || title.includes('handbag') || title.includes('wallet')) return 'FANCY';
      return 'FASHION';
    }
    return 'ALL';
  };

  const getProductSubCategories = (p) => {
    const subs = [];
    
    // 1. From category path (e.g. "Clothing > Men > Shirts" -> ["MEN", "SHIRTS"])
    const parts = String(p.category || '').split('>').map(s => s.trim().toUpperCase());
    if (parts.length > 1) {
      parts.slice(1).forEach(part => {
        if (part) subs.push(part);
      });
    }
    
    // 2. From subCategory field (e.g. "Checked Shirts" -> ["CHECKED SHIRTS"])
    if (p.subCategory) {
      const subUpper = p.subCategory.trim().toUpperCase();
      if (!subs.includes(subUpper)) {
        subs.push(subUpper);
      }
    }
    
    // 3. Fallback/Guess from title (for old/seeded products) - ONLY if no subcategory was found in path or field!
    if (subs.length === 0) {
      const guessed = getProductSubCategoryFallback(p);
      if (guessed && guessed !== 'ALL') {
        subs.push(guessed);
      }
    }
    
    return subs;
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
    const allowedKeys = getAllSubcategoryKeysUnder(subCategoryKey);
    return allProducts.filter(p => {
      const rootCat = String(p.category || '').split('>')[0].trim().toUpperCase();
      if (rootCat !== category.toUpperCase()) return false;
      const productSubs = getProductSubCategories(p);
      return productSubs.some(sub => allowedKeys.includes(sub));
    }).length;
  };

  // Auto-expand parents of active subcategory
  useEffect(() => {
    if (activeSubTab && activeSubTab !== 'ALL') {
      const unified = getUnifiedCategories();
      const newExpanded = { ...expandedSubcategories };
      let expandedAny = false;

      const traceAndExpand = (nodes, targetDbName, parentKeys = []) => {
        for (const node of nodes) {
          if (node.dbName.toUpperCase() === targetDbName.toUpperCase()) {
            parentKeys.forEach(pk => {
              newExpanded[pk] = true;
            });
            expandedAny = true;
            return true;
          }
          if (node.children && node.children.length > 0) {
            const found = traceAndExpand(node.children, targetDbName, [...parentKeys, node.key]);
            if (found) return true;
          }
        }
        return false;
      };

      for (const group of unified) {
        traceAndExpand(group.subcategories, activeSubTab, []);
      }

      if (expandedAny) {
        setExpandedSubcategories(newExpanded);
      }
    }
  }, [activeSubTab, categoriesList]);

  const handleClearAllFilters = () => {
    setCatalogue('A');
    setPriceRange(15000);
    setShowInStock(true);
    setShowOutOfStock(true);
    setSelectedRatings([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedSubcategories([]);
    setSelectedShopFor([]);
    setSelectedDiscounts([]);
    setFilterNewArrivals(false);
    setFilterBestSellers(false);
    setFilterOffers(false);
    setActiveTab('ALL');
    setActiveSubTab('ALL');
    setSearchQuery('');
    setCategorySearchQuery('');
    setShowAllCategories(false);
    
    // Reset category-specific filters
    setSelectedFabrics([]);
    setSelectedPaperSizes([]);
    setSelectedPaperTypes([]);
    setSelectedPackSizes([]);
    setSelectedMaterials([]);
    setSelectedGiftThemes([]);
  };

  // Reset active selectors when product selection changes
  useEffect(() => {
    const activeProd = quickViewProduct || fullDetailProduct;
    setModalQty(1);
    setActiveImageIndex(0);
    if (activeProd) {
      const colors = getProductThemedColors(activeProd);
      let initialColor = '';
      if (colors && colors.length > 0) {
        initialColor = colors[0].name;
        setModalColor(initialColor);
      } else {
        setModalColor('');
      }
      
      if (activeProd.variants && activeProd.variants.length > 0) {
        // Find variant matching the first color (if color exists)
        const matchVar = activeProd.variants.find(v => !initialColor || v.color?.toLowerCase() === initialColor.toLowerCase());
        if (matchVar && matchVar.size) {
          setModalSize(matchVar.size);
        } else {
          setModalSize(activeProd.variants[0].size || 'M');
        }
      } else {
        const category = String(activeProd.category).toUpperCase();
        if (category.includes('CLOTHING') || category.includes('DRESS')) {
          const sizeOptions = activeProd.attributes?.size 
            ? activeProd.attributes.size.split(',').map(s => s.trim()).filter(Boolean) 
            : (activeProd.subCategory === 'KIDS' ? ['2y'] : ['M']);
          setModalSize(sizeOptions[0] || 'M');
        } else if (category.includes('STATIONERY')) {
          setModalSize('Pack of 3');
        } else {
          setModalSize('Default');
        }
      }
    } else {
      setModalSize('M');
      setModalColor('Red');
    }
  }, [quickViewProduct, fullDetailProduct]);

  // Parse category/subcategory/search from URL (both path slugs and query params)
  useEffect(() => {
    const parseUrl = () => {
      const path = window.location.pathname.toLowerCase();
      const segments = path.split('/').filter(Boolean); // e.g. ["shop", "clothing", "kids-wear"]
      
      let cat = 'ALL';
      let sub = 'ALL';

      if (segments[0] === 'shop') {
        if (segments[1]) {
          cat = segments[1].toUpperCase();
          if (segments[2]) {
            // decode hyphen to space (e.g. "kids-wear" -> "KIDS WEAR")
            sub = segments[2].toUpperCase().replace(/-/g, ' ');
          }
        }
      }

      // Query param overrides/fallbacks (backward compatibility)
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category');
      if (catParam) cat = catParam.toUpperCase();
      const subParam = params.get('subcategory');
      if (subParam) sub = subParam.toUpperCase();
      const searchParam = params.get('search');

      setActiveTab(cat);
      setActiveSubTab(sub);
      if (searchParam) {
        setSearchQuery(decodeURIComponent(searchParam));
      }
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);


  const { addToast } = useToast();

  const toggleWishlist = (id) => {
    let updated;
    const prod = allProducts.find(p => p.id === id || p._id === id || String(p.id) === String(id) || String(p._id) === String(id));
    const prodName = prod ? (prod.title || prod.name) : 'Item';
    if (wishlist.includes(id)) {
      updated = wishlist.filter(item => item !== id);
      addToast({ message: `Removed from wishlist`, type: 'wishlist' });
    } else {
      updated = [...wishlist, id];
      addToast({ message: `❤️ Added to wishlist!`, type: 'wishlist' });
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
    } else {
      localStorage.setItem('mithira_guest_wishlist', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('mithira_cart_update'));
    }
  };

  const toggleCart = (id, title, size = null, color = null) => {
    let updated;
    let updatedItems = [];
    if (cart.includes(id)) {
      updated = cart.filter(item => item !== id);
      addToast({ message: `Removed from cart`, type: 'cart' });
    } else {
      updated = [...cart, id];
      addToast({ message: `🛒 Added "${title}" to cart!`, type: 'cart' });
    }
    setCart(updated);

    const prevItems = authUser ? (authUser.cartItems || []) : (JSON.parse(localStorage.getItem('mithira_guest_cart_items') || '[]'));
    const isRemoving = !updated.includes(id);

    if (isRemoving) {
      updatedItems = prevItems.filter(item => item.productId !== id);
    } else {
      const prod = allProducts.find(p => p.id === id || p._id === id || String(p.id) === String(id) || String(p._id) === String(id));
      const selectedVariant = getSelectedVariant(prod, color, size);
      const variantId = selectedVariant ? (selectedVariant._id || selectedVariant.id || '') : null;
      const rawSku = selectedVariant ? selectedVariant.sku : null;
      const sku = rawSku && rawSku.includes('||') ? rawSku.split('||')[0] : rawSku;

      updatedItems = [...prevItems.filter(item => item.productId !== id), {
        productId: id,
        quantity: 1,
        variant: { size, color, variantId, sku }
      }];
    }

    if (authUser) {
      apiService.syncCart(updated, updatedItems).then(res => {
        if (res && setAuthUser) {
          setAuthUser(prev => {
            const newUser = { ...prev, cart: res.cart || updated, cartItems: res.cartItems || updatedItems };
            localStorage.setItem('mithira_auth_user', JSON.stringify(newUser));
            return newUser;
          });
        }
      });
    } else {
      localStorage.setItem('mithira_guest_cart', JSON.stringify(updated));
      localStorage.setItem('mithira_guest_cart_items', JSON.stringify(updatedItems));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('mithira_cart_update'));
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
          let extractedSub = p.subCategory || '';

          if (p.category && p.category.includes('>')) {
            const parts = p.category.split('>').map(x => x.trim());
            const rootCat = parts[0].toUpperCase();
            if (rootCat.includes('CLOTHING') || rootCat.includes('DRESS')) cleanCategory = 'CLOTHING';
            else if (rootCat.includes('STATIONERY') || rootCat.includes('PEN') || rootCat.includes('PENCIL') || rootCat.includes('NOTEBOOK') || rootCat.includes('WRITING') || rootCat.includes('PAPER')) cleanCategory = 'STATIONERY';
            else if (rootCat.includes('GIFT') || rootCat.includes('VALENTINE')) cleanCategory = 'GIFTS';
            else if (rootCat.includes('ACCESSORIES') || rootCat.includes('FANCY') || rootCat.includes('JEWEL') || rootCat.includes('WATCH')) cleanCategory = 'ACCESSORIES';
            else cleanCategory = rootCat;

            extractedSub = parts[parts.length - 1];
          } else {
            if (catUpper.includes('CLOTHING') || catUpper.includes('DRESS')) cleanCategory = 'CLOTHING';
            else if (catUpper.includes('STATIONERY') || catUpper.includes('PEN') || catUpper.includes('PENCIL') || catUpper.includes('NOTEBOOK') || catUpper.includes('WRITING') || catUpper.includes('PAPER')) cleanCategory = 'STATIONERY';
            else if (catUpper.includes('GIFT') || catUpper.includes('VALENTINE')) cleanCategory = 'GIFTS';
            else if (catUpper.includes('ACCESSORIES') || catUpper.includes('FANCY') || catUpper.includes('JEWEL') || catUpper.includes('WATCH')) cleanCategory = 'ACCESSORIES';
            else cleanCategory = catUpper;
          }

          const title = p.name || p.title || 'Product';
          
          // ── Image resolution: real uploaded images always take priority ──
          const isRealImg = (img) => img && (img.startsWith('http') || img.startsWith('/') || img.includes('.') || img.startsWith('data:'));

          // Collect real images from the images array first
          let productImages = [];
          const rawImagesArray = Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? p.images.split(',').map(s => s.trim()) : []);
          if (rawImagesArray.length > 0) {
            const realOnes = rawImagesArray.filter(isRealImg);
            if (realOnes.length > 0) productImages = realOnes;
          }

          // Determine the primary display image
          let finalImage;
          if (productImages.length > 0) {
            // Admin uploaded images → use first real one
            finalImage = productImages[0];
          } else if (isRealImg(p.image)) {
            // Single real image field
            finalImage = p.image;
            productImages = [finalImage];
          } else if (p.modelNo) {
            // Kids model-number based static gallery
            productImages = getProductImages(p.modelNo, p.image);
            finalImage = productImages[0] || p.image;
          } else {
            // Fallback static placeholder per category
            if (cleanCategory === 'CLOTHING') {
              const isKids = p.subCategory === 'KIDS' ||
                             catUpper.includes('KIDS') || catUpper.includes('CHILD') ||
                             title.toLowerCase().includes('kids') || title.toLowerCase().includes('girl') ||
                             title.toLowerCase().includes('boy') || title.toLowerCase().includes('baby') ||
                             title.toLowerCase().includes('frock') || title.toLowerCase().includes('anarkali');
              finalImage = isKids
                ? ((idx % 2 === 0) ? clothingUser1 : clothingUser5)
                : [clothingUser2, clothingUser3, clothingUser4][idx % 3];
            } else {
              finalImage = p.image || '';
            }
            productImages = [finalImage];
          }

          console.log('MAPPED PRODUCT:', p.name || p.title, 'finalImage:', finalImage, 'productImages:', productImages);
          return {
            ...p,
            title,
            category: cleanCategory,
            subCategory: extractedSub,
            image: finalImage,
            images: productImages
          };
        });
        setAllProducts(mapped);
        
        const autoOpenId = sessionStorage.getItem('auto_open_product_id');
        if (autoOpenId) {
          sessionStorage.removeItem('auto_open_product_id');
          const found = mapped.find(p => String(p.id) === String(autoOpenId));
          if (found) {
            setFullDetailProduct(found);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
        
        const autoQuickViewId = sessionStorage.getItem('auto_quickview_product_id');
        if (autoQuickViewId) {
          sessionStorage.removeItem('auto_quickview_product_id');
          const found = mapped.find(p => String(p.id) === String(autoQuickViewId));
          if (found) {
            setActiveImageIndex(0);
            setModalColor('');
            setModalSize('M');
            setQuickViewProduct(found);
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    apiService.getReviews().then((data) => {
      if (data) setReviewsList(data);
    });
  }, []);

  useEffect(() => {
    if (fullDetailProduct) {
      if (fullDetailProduct.variants && fullDetailProduct.variants.length > 0) {
        const defaultVar = fullDetailProduct.variants.find(v => v.stock > 0) || fullDetailProduct.variants[0];
        if (defaultVar) {
          setModalColor(defaultVar.color || 'Red');
          setModalSize(defaultVar.size || 'M');
        }
      } else {
        setModalColor(fullDetailProduct.color || 'Red');
        setModalSize(fullDetailProduct.size || 'M');
      }
      setPersonalizationText('');
      setPersonalizationError(false);
    }
  }, [fullDetailProduct]);

  // Helper to determine if a product is in stock
  const isProductInStock = (p) => {
    // If it has a stock field, check if stock > 0. Fallback to name calculation.
    if (p.stock !== undefined) return p.stock > 0;
    const val = p.title || p.name || '';
    return (val.length % 7 !== 0);
  };

  const getProductDiscount = (p) => {
    if (!p) return 0;
    const originalPriceNum = p.originalPrice ? parseFloat(String(p.originalPrice).replace(/[^0-9.]/g, '')) : 0;
    const priceNum = typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0;
    if (originalPriceNum && originalPriceNum > priceNum) {
      return Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100);
    }
    if (p.discount) {
      const dVal = parseFloat(String(p.discount).replace(/[^0-9.]/g, ''));
      if (!isNaN(dVal) && dVal <= 100) {
        return Math.round(dVal);
      }
    }
    return 0;
  };

  const getProductGender = (p) => {
    const title = (p.title || p.name || '').toLowerCase();
    const cat = String(p.category || '').toLowerCase();
    const sub = String(p.subCategory || '').toLowerCase();
    
    if (title.includes('women') || title.includes('girl') || title.includes('lady') || title.includes('ladies') || title.includes('saree') || title.includes('kurti') || title.includes('lehenga') || title.includes('frock') || title.includes('anarkali') || cat.includes('women') || cat.includes('girl')) {
      return 'Women';
    }
    if (title.includes('men') || title.includes('boy') || title.includes('gent') || title.includes('gents') || title.includes('dhoti') || title.includes('kurta') || title.includes('shirt') || cat.includes('men') || cat.includes('boy')) {
      return 'Men';
    }
    if (title.includes('kids') || title.includes('child') || title.includes('baby') || cat.includes('kids') || cat.includes('child')) {
      return 'Kids';
    }
    return 'Other';
  };

  // Helper to get catalogue assignment
  const getProductCatalogue = (p) => {
    if (p.catalogue) {
      if (p.catalogue.toUpperCase().includes('B')) return 'B';
      return 'A';
    }
    return 'A';
  };

  // Dynamic database-driven filtering of all products
  let filteredProducts = allProducts;

  // 1. Root Category filter (activeTab)
  if (activeTab !== 'ALL') {
    filteredProducts = filteredProducts.filter(p => {
      const rootCat = String(p.category || '').split('>')[0].trim().toUpperCase();
      if (activeTab === 'ACCESSORIES') {
        return rootCat === 'ACCESSORIES' || rootCat === 'FANCY';
      }
      return rootCat === activeTab;
    });
  }

  // 2. Active Subcategory filter (activeSubTab)
  if (activeSubTab !== 'ALL') {
    filteredProducts = filteredProducts.filter(p => {
      const subKeys = getAllSubcategoryKeysUnder(activeSubTab).map(k => k.toUpperCase());
      const productSubs = getProductSubCategories(p).map(s => s.toUpperCase());
      return productSubs.some(subName => subKeys.includes(subName) || subName === activeSubTab.toUpperCase());
    });
  }

  // 3. Search Query
  if (searchQuery.trim() !== '') {
    filteredProducts = filteredProducts.filter(p => 
      (p.title || p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  // 4. Subcategories Checkbox Filter
  if (selectedSubcategories.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const productSubs = getProductSubCategories(p).map(s => s.toUpperCase());
      return productSubs.some(sub => selectedSubcategories.includes(sub));
    });
  }

  // 5. Shop For (Gender) Filter
  if (selectedShopFor.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const gender = getProductGender(p);
      return selectedShopFor.includes(gender);
    });
  }

  // 6. Price Filter
  filteredProducts = filteredProducts.filter(p => {
    const priceNum = typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0;
    return priceNum <= priceRange;
  });

  // 7. Sizes Filter
  if (selectedSizes.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const pSizes = getProductSizes(p);
      return pSizes.some(size => selectedSizes.includes(size));
    });
  }

  // 8. Colors Filter
  if (selectedColors.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const pColors = getProductColors(p);
      return pColors.some(color => selectedColors.includes(color));
    });
  }

  // Category-Specific Filters
  if (activeTab === 'CLOTHING' && selectedFabrics.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const fab = p.fabric || p.attributes?.fabric || '';
      return selectedFabrics.some(f => fab.toUpperCase().includes(f.toUpperCase()));
    });
  }
  if (activeTab === 'STATIONERY' && selectedPaperSizes.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const size = p.attributes?.paperSize || '';
      return selectedPaperSizes.some(s => size.toUpperCase().includes(s.toUpperCase()));
    });
  }
  if (activeTab === 'STATIONERY' && selectedPaperTypes.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const type = p.attributes?.paperType || '';
      return selectedPaperTypes.some(t => type.toUpperCase().includes(t.toUpperCase()));
    });
  }
  if (activeTab === 'STATIONERY' && selectedPackSizes.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const pack = p.attributes?.packSize || '';
      return selectedPackSizes.some(pk => pack.toUpperCase().includes(pk.toUpperCase()));
    });
  }
  if (activeTab === 'ACCESSORIES' && selectedMaterials.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const mat = p.attributes?.material || p.material || '';
      return selectedMaterials.some(m => mat.toUpperCase().includes(m.toUpperCase()));
    });
  }
  if (activeTab === 'GIFTS' && selectedGiftThemes.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const th = p.attributes?.theme || '';
      return selectedGiftThemes.some(t => th.toUpperCase().includes(t.toUpperCase()));
    });
  }

  // 9. Availability Filter
  filteredProducts = filteredProducts.filter(p => {
    const inStock = isProductInStock(p);
    if (showInStock && showOutOfStock) return true;
    if (showInStock) return inStock;
    if (showOutOfStock) return !inStock;
    return false;
  });

  // 10. Ratings Filter
  if (selectedRatings.length > 0) {
    const minRating = Math.min(...selectedRatings);
    filteredProducts = filteredProducts.filter(p => p.rating >= minRating);
  }

  // 11. Discounts Filter
  if (selectedDiscounts.length > 0) {
    const minDiscount = Math.min(...selectedDiscounts);
    filteredProducts = filteredProducts.filter(p => getProductDiscount(p) >= minDiscount);
  }

  // 12. Collections Filter
  if (filterNewArrivals || filterBestSellers || filterOffers) {
    filteredProducts = filteredProducts.filter(p => {
      const isNew = p.isNewArrival || p.badge === 'NEW' || p.badge === 'NEW ARRIVAL' || String(p.id).startsWith('n');
      const isBest = p.badge === 'BEST SELLER' || p.sales > 20 || String(p.id).startsWith('t');
      const isOffer = p.isOffer || p.badge?.toUpperCase().includes('OFFER') || p.badge?.toUpperCase().includes('DEAL') || p.discount > 0;
      
      if (filterNewArrivals && filterBestSellers && filterOffers) return isNew || isBest || isOffer;
      if (filterNewArrivals && filterBestSellers) return isNew || isBest;
      if (filterNewArrivals && filterOffers) return isNew || isOffer;
      if (filterBestSellers && filterOffers) return isBest || isOffer;
      if (filterNewArrivals) return isNew;
      if (filterBestSellers) return isBest;
      if (filterOffers) return isOffer;
      return true;
    });
  }

  // Apply sorting
  if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      const pA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
      const pB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
      return pA - pB;
    });
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      const pA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
      const pB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
      return pB - pA;
    });
  } else if (sortBy === 'rating') {
    filteredProducts = [...filteredProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0));
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
            tagline: "NEW ARRIVALS",
            title: "Timeless Looks, Everyday You",
            subtitle: "Comfort meets elegance in every stitch."
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
        tagline: "NEW ARRIVALS",
        title: "Design Your Plans, Inspire Your Days",
        subtitle: "Premium stationery to elevate your everyday."
      };
    } else if (activeTab === 'ACCESSORIES') {
      return {
        tagline: "MITHRASHOPY EXCLUSIVES",
        title: "Adorn Yourself in Royal Elegance",
        subtitle: "Exquisite jewellery, premium hair accents, and fancy details that elevate your look"
      };
    }
    
    return {
      tagline: "Shop Our",
      title: "Exclusive Collection",
      subtitle: "Premium Quality • Unique Designs • Best Prices"
    };
  };

  const bannerContent = getBannerContent();

  const getRootCatCount = (cat) => allProducts.filter(p => String(p.category || '').split('>')[0].trim().toUpperCase() === cat).length;
  const clothingCount = getRootCatCount('CLOTHING');
  const stationeryCount = getRootCatCount('STATIONERY');
  const giftsCount = getRootCatCount('GIFTS');
  const accessoriesCount = getRootCatCount('ACCESSORIES');

  const inStockCount = allProducts.filter(p => isProductInStock(p)).length;
  const outOfStockCount = allProducts.filter(p => !isProductInStock(p)).length;

  const getRatingCount = (r) => allProducts.filter(p => p.rating === r).length;

  const productsPerPage = 24;
  const totalProductsCount = filteredProducts.length;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(0, indexOfLastProduct);
  const totalPages = Math.ceil(totalProductsCount / productsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Infinite scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight * 0.85) {
        if (currentPage < totalPages && !isFetchingNextPage) {
          setIsFetchingNextPage(true);
          setTimeout(() => {
            setCurrentPage(prev => prev + 1);
            setIsFetchingNextPage(false);
          }, 600);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, totalPages, isFetchingNextPage]);

  if (fullDetailProduct) {
    const catTheme = getCategoryThemeClass(fullDetailProduct.category);
    const images = getAllProductImages(fullDetailProduct, modalColor);
    const colors = getProductThemedColors(fullDetailProduct);

    // Find selected variant matching active modalColor and modalSize
    const selectedVariant = getSelectedVariant(fullDetailProduct, modalColor, modalSize);
    const displayPrice = (selectedVariant && selectedVariant.price !== null && selectedVariant.price !== undefined) 
      ? selectedVariant.price 
      : fullDetailProduct.price;
    
    const displayStock = selectedVariant ? selectedVariant.stock : fullDetailProduct.stock;
    const isOutOfStock = displayStock <= 0;
    
    const mainImageUrl = images[activeImageIndex] || resolveProductImage(fullDetailProduct);
    const prodVideo = getProductVideo(fullDetailProduct);
    const hasVideo = !!prodVideo;
    const isVideoActive = hasVideo && activeImageIndex === images.length;

    const handleMouseMove = (e) => {
      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setZoomStyle({
        transformOrigin: `${x}% ${y}%`,
        transform: 'scale(1.8)'
      });
    };

    const handleMouseLeave = () => {
      setZoomStyle({ transformOrigin: 'center', transform: 'scale(1)' });
    };

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
                {(images.length > 1 || hasVideo) && (() => {
                  const hasVariantImages = fullDetailProduct.variants && fullDetailProduct.variants.some(v => v.image && isRealImg(v.image));
                  return (
                    <div className="product-detail-thumbnails">
                      {images.map((img, idx) => (
                        <div 
                          key={idx}
                          className={`product-detail-thumbnail-wrapper ${activeImageIndex === idx ? 'active' : ''}`}
                          onClick={() => {
                            setActiveImageIndex(idx);
                            if (hasVariantImages && colors && colors[idx]) {
                              setModalColor(colors[idx].name);
                              const matchVar = fullDetailProduct.variants.find(v => v.color?.toLowerCase() === colors[idx].name.toLowerCase());
                              if (matchVar && matchVar.size) {
                                  setModalSize(matchVar.size);
                              }
                            }
                          }}
                        >
                          <img src={img} alt={`thumb-${idx}`} className="product-detail-thumbnail-img" />
                        </div>
                      ))}
                      
                      {/* Video Thumbnail Handle */}
                      {hasVideo && (
                        <div 
                          className={`product-detail-thumbnail-wrapper video-thumb-wrapper ${activeImageIndex === images.length ? 'active' : ''}`}
                          onClick={() => setActiveImageIndex(images.length)}
                          style={{ position: 'relative' }}
                        >
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(5, 24, 56, 0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                            borderRadius: '6px'
                          }}>
                            <span style={{ color: '#fff', fontSize: '14px' }}>▶</span>
                          </div>
                          <img src={images[0] || resolveProductImage(fullDetailProduct)} alt="video-thumb" className="product-detail-thumbnail-img" />
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Main Display Area with Hover Zoom / Video Support */}
                <div 
                  className="product-detail-main-image-wrapper" 
                  style={{ overflow: 'hidden', position: 'relative', cursor: isVideoActive ? 'default' : 'zoom-in' }}
                >
                  {isVideoActive ? (
                    <video 
                      src={prodVideo} 
                      controls 
                      autoPlay 
                      muted 
                      className="product-detail-main-img" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#091e42' }} 
                    />
                  ) : (
                    <img 
                      src={mainImageUrl} 
                      alt={fullDetailProduct.title} 
                      className="product-detail-main-img" 
                      style={{ 
                        transform: zoomStyle.transform, 
                        transformOrigin: zoomStyle.transformOrigin,
                        transition: 'transform 0.05s ease-out',
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    />
                  )}

                  {!isVideoActive && images.length > 1 && (
                    <>
                      <button 
                        type="button"
                        className="gallery-nav-arrow arrow-left" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
                        }}
                      >
                        ‹
                      </button>
                      <button 
                        type="button"
                        className="gallery-nav-arrow arrow-right" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
                        }}
                      >
                        ›
                      </button>
                    </>
                  )}
                  
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
              <p className="product-detail-tagline">{fullDetailProduct.attributes?.shortDescription || fullDetailProduct.shortDescription || "Bloom with elegance. Designed exclusively for your premium collection."}</p>

              {/* Rating and reviews */}
              <div className="product-detail-rating-row">
                <span className="product-detail-rating-stars">★ {fullDetailProduct.rating || "4.8"}</span>
                <span className="product-detail-reviews">({fullDetailProduct.reviews || "120"} reviews)</span>
              </div>

              {/* Price Row */}
              <div className="product-detail-price-row">
                <span className="product-detail-price-label">Price:</span>
                <span className="product-detail-price-value">₹{displayPrice.toLocaleString()}</span>
                <span className="product-detail-original-price">₹{(fullDetailProduct.originalPrice || Math.round(displayPrice * 1.5)).toLocaleString()}</span>
                {getProductDiscount(fullDetailProduct) > 0 && (
                  <span className="product-detail-discount-badge">
                    {getProductDiscount(fullDetailProduct)}% OFF
                  </span>
                )}
              </div>

              {/* Availability Info */}
              <div className="product-detail-availability-row" style={{ margin: '12px 0 16px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="product-detail-availability-label" style={{ fontWeight: 600, color: '#555' }}>Availability:</span>
                <span className={`product-detail-availability-status ${isOutOfStock ? 'out-of-stock-status' : ''}`} style={{ color: isOutOfStock ? '#ff3333' : '#D4AF37', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: isOutOfStock ? '#ffebee' : '#FDFBF7', fontSize: '0.82rem' }}>
                  {isOutOfStock ? "Out of Stock" : "In Stock"}
                </span>
              </div>

              {/* Low stock alert chip */}
              {displayStock > 0 && displayStock <= (selectedVariant?.lowStockAlert || 5) && (
                <div 
                  className="low-stock-badge-chip animate-fade-in" 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    margin: '0 0 16px 0',
                    border: '1px solid #fca5a5'
                  }}
                >
                  ⚠️ Only {displayStock} left in {modalColor} - {modalSize}!
                </div>
              )}

              {/* Category-specific Selectors */}
              {renderCategorySelectors(fullDetailProduct, modalSize, setModalSize, modalColor, setModalColor, activeImageIndex, setActiveImageIndex, images, colors, modalQty, setModalQty, personalizationText, setPersonalizationText, personalizationError, setPersonalizationError)}

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
                  disabled={isOutOfStock}
                  style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                  onClick={() => {
                    const isGift = String(fullDetailProduct.category).toUpperCase().includes('GIFT');
                    const needsPersonalization = fullDetailProduct.attributes?.personalization && fullDetailProduct.attributes.personalization !== 'No';
                    if (isGift && needsPersonalization && !personalizationText.trim()) {
                      setPersonalizationError(true);
                      const container = document.getElementById('personalization-input-container');
                      if (container) {
                        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                      return;
                    }
                    toggleCart(fullDetailProduct.id, fullDetailProduct.title, modalSize, modalColor);
                  }}
                >
                  {isOutOfStock ? "OUT OF STOCK" : (cart.includes(fullDetailProduct.id) ? "Remove from Cart" : "ADD TO CART")}
                </button>
                <button 
                  className="product-detail-buy-btn"
                  disabled={isOutOfStock}
                  style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                  onClick={() => {
                    const isGift = String(fullDetailProduct.category).toUpperCase().includes('GIFT');
                    const needsPersonalization = fullDetailProduct.attributes?.personalization && fullDetailProduct.attributes.personalization !== 'No';
                    if (isGift && needsPersonalization && !personalizationText.trim()) {
                      setPersonalizationError(true);
                      const container = document.getElementById('personalization-input-container');
                      if (container) {
                        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                      return;
                    }
                    if (!cart.includes(fullDetailProduct.id)) {
                      toggleCart(fullDetailProduct.id, fullDetailProduct.title, modalSize, modalColor);
                    }
                    alert("Proceeding to secure checkout!");
                  }}
                >
                  BUY NOW
                </button>
              </div>

              {/* Trust Badges */}
              <div className="product-detail-trust-badges">
                <div className="trust-badge-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>Secure Payment</span>
                </div>
                <div className="trust-badge-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/></svg>
                  <span>Easy Returns</span>
                </div>
                <div className="trust-badge-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  <span>Free Shipping</span>
                </div>
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

              {/* Horizontal Tabs for Product Details */}
              <div className="detail-tabs-container">
                <div className="detail-tabs-header">
                  <button
                    className={`detail-tab-btn ${activeDetailTab === 'description' ? 'active' : ''}`}
                    onClick={() => setActiveDetailTab('description')}
                  >
                    Description
                  </button>
                  <button
                    className={`detail-tab-btn ${activeDetailTab === 'specs' ? 'active' : ''}`}
                    onClick={() => setActiveDetailTab('specs')}
                  >
                    Specifications
                  </button>
                  <button
                    className={`detail-tab-btn ${activeDetailTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveDetailTab('reviews')}
                  >
                    Reviews ({reviewsList.filter(rev => rev.productName === fullDetailProduct.title || rev.productName === fullDetailProduct.name).length})
                  </button>
                  <button
                    className={`detail-tab-btn ${activeDetailTab === 'shipping' ? 'active' : ''}`}
                    onClick={() => setActiveDetailTab('shipping')}
                  >
                    Shipping Info
                  </button>
                </div>

                <div className="detail-tab-panel">
                  {activeDetailTab === 'description' && (
                    <div className="detail-tab-content description-panel">
                      <p style={{ margin: 0 }}>
                        {fullDetailProduct.description || "Indulge in our handpicked selections crafted to match your cultural roots and premium choices. Made with pure fabric, exquisite design details, and comfortable fit. Designed for both casual elegance and luxury wear."}
                      </p>
                    </div>
                  )}

                  {activeDetailTab === 'specs' && (
                    <div className="detail-tab-content specs-panel">
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
                        {/* Dynamic specifications/attributes from admin panel */}
                        {fullDetailProduct.attributes && Object.entries(fullDetailProduct.attributes).map(([key, val]) => {
                          if (val && key !== 'modelNo') {
                            return (
                              <div className="specs-row-mini" key={key}>
                                <span className="specs-key" style={{ textTransform: 'capitalize' }}>{key}:</span>
                                <span className="specs-val">{val}</span>
                              </div>
                            );
                          }
                          return null;
                        })}
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

                  {activeDetailTab === 'reviews' && (
                    <div className="detail-tab-content reviews-panel">
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

                  {activeDetailTab === 'shipping' && (
                    <div className="detail-tab-content shipping-panel">
                      <ul className="shipping-info-list" style={{ paddingLeft: '20px', listStyleType: 'disc', margin: 0 }}>
                        {(storeSettings.shippingInfoLines && storeSettings.shippingInfoLines.length > 0
                          ? storeSettings.shippingInfoLines
                          : [
                              "Free shipping on all orders above ₹999.",
                              "Standard delivery takes 3-5 business days depending on location.",
                              "Cash on Delivery (COD) is available on all eligible postal addresses.",
                              "We offer easy 7-day hassle-free returns and exchanges."
                            ]
                        ).map((line, idx) => (
                          <li key={idx} style={{ marginBottom: '6px' }}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Similar Products Row */}
          <div className="product-detail-similar-section">
            <div className="similar-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', width: '100%' }}>
              <h3 className="similar-title" style={{ margin: 0 }}>Similar Products</h3>
              <span className="similar-view-all" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#dfb743' }} onClick={() => setFullDetailProduct(null)}>
                View All &gt;
              </span>
            </div>
            <div className="similar-products-grid">
              {getSimilarProducts(fullDetailProduct, allProducts)
                .slice(0, 6)
                .map((simProd) => {
                  const isWishlisted = wishlist.includes(simProd.id);
                  const isInCart = cart.includes(simProd.id);
                  const inStock = isProductInStock(simProd);

                  const originalPriceNum = simProd.originalPrice ? parseFloat(String(simProd.originalPrice).replace(/[^0-9.]/g, '')) : 0;
                  const priceNum = typeof simProd.price === 'number' ? simProd.price : parseFloat(String(simProd.price).replace(/[^0-9.]/g, '')) || 0;
                  const discountPercentage = (originalPriceNum && originalPriceNum > priceNum) 
                    ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
                    : (simProd.discount && parseFloat(String(simProd.discount)) <= 100 
                        ? Math.round(parseFloat(String(simProd.discount))) 
                        : 0);
                  const brandName = simProd.brand || 'Mithira Collection';

                  return (
                    <div 
                      key={simProd.id} 
                      className="clothing-product-card theme-clothing animate-fade-in-up"
                      onClick={() => {
                        setFullDetailProduct(simProd);
                        setModalQty(1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="clothing-img-wrapper" onClick={(e) => { e.stopPropagation(); setFullDetailProduct(simProd); setModalQty(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        {discountPercentage > 0 && (
                          <div className="clothing-discount-badge">
                            {discountPercentage}% OFF
                          </div>
                        )}
                        
                        <button 
                          className={`clothing-wishlist-float-btn ${isWishlisted ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(simProd.id); }}
                          aria-label="Add to Wishlist"
                        >
                          <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>

                        <img src={resolveProductImage(simProd)} alt={simProd.title} className="clothing-img primary-card-img" loading="lazy" />
                        {resolveImagesArray(simProd.images).length > 1 && (
                          <img 
                            src={resolveProductImage({ image: resolveImagesArray(simProd.images)[1] })} 
                            alt={`${simProd.title} Alternate`} 
                            className="clothing-img hover-card-img" 
                            loading="lazy"
                          />
                        )}

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
                            onClick={(e) => { e.stopPropagation(); setActiveImageIndex(0); setModalColor(''); setModalSize('M'); setQuickViewProduct(simProd); }}
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
                            <span className="clothing-selling-price">₹{priceNum.toLocaleString()}</span>
                            {originalPriceNum > priceNum && (
                              <span className="clothing-original-price">₹{originalPriceNum.toLocaleString()}</span>
                            )}
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
                })}
            </div>
          </div>

        </div>
      </div>
    );
  }

  const getCategoryCirclesData = () => {
    if (activeTab === 'CLOTHING') {
      const unified = getUnifiedCategories();
      const clothingGroup = unified.find(g => g.key === 'CLOTHING');
      if (clothingGroup && clothingGroup.subcategories && clothingGroup.subcategories.length > 0) {
        const subItems = clothingGroup.subcategories.map(sub => {
          const dbCat = categoriesList.find(c => c.name.toLowerCase() === sub.dbName.toLowerCase());
          const customImg = dbCat?.image;
          const subKeys = getAllSubcategoryKeysUnder(sub.dbName).map(k => k.toUpperCase());
          const count = allProducts.filter(p => {
            const rootCat = String(p.category || '').split('>')[0].trim().toUpperCase();
            if (rootCat !== 'CLOTHING') return false;
            if (getProductCatalogue(p) !== catalogue) return false;
            const productSubs = getProductSubCategories(p).map(s => s.toUpperCase());
            return productSubs.some(subName => subKeys.includes(subName));
          }).length;

          return {
            key: sub.dbName.toUpperCase(),
            label: sub.label,
            img: customImg || imgClothing,
            count: `${count} items`,
            isSub: true,
            dbName: sub.dbName
          };
        });

        const totalClothingCount = allProducts.filter(p => {
          const rootCat = String(p.category || '').split('>')[0].trim().toUpperCase();
          return rootCat === 'CLOTHING' && getProductCatalogue(p) === catalogue;
        }).length;

        const allCircle = {
          key: 'ALL',
          label: 'All Clothing',
          img: imgClothing,
          count: `${totalClothingCount} items`,
          isSub: true,
          dbName: 'ALL'
        };

        const rootDbCat = categoriesList.find(c => c.name.toLowerCase() === 'clothing');
        if (rootDbCat?.image) {
          allCircle.img = rootDbCat.image;
        }

        return [allCircle, ...subItems];
      }
    }

    if (activeTab === 'ACCESSORIES') {
      const unified = getUnifiedCategories();
      const accGroup = unified.find(g => g.key === 'ACCESSORIES');
      if (accGroup && accGroup.subcategories && accGroup.subcategories.length > 0) {
        const subItems = accGroup.subcategories.map(sub => {
          const dbCat = categoriesList.find(c => c.name.toLowerCase() === sub.dbName.toLowerCase());
          const customImg = dbCat?.image;
          const subKeys = getAllSubcategoryKeysUnder(sub.dbName).map(k => k.toUpperCase());
          const count = allProducts.filter(p => {
            const rootCat = String(p.category || '').split('>')[0].trim().toUpperCase();
            if (rootCat !== 'ACCESSORIES') return false;
            if (getProductCatalogue(p) !== catalogue) return false;
            const productSubs = getProductSubCategories(p).map(s => s.toUpperCase());
            return productSubs.some(subName => subKeys.includes(subName));
          }).length;

          return {
            key: sub.dbName.toUpperCase(),
            label: sub.label,
            img: customImg || imgAccessories,
            count: `${count} items`,
            isSub: true,
            dbName: sub.dbName
          };
        });

        const totalAccCount = allProducts.filter(p => {
          const rootCat = String(p.category || '').split('>')[0].trim().toUpperCase();
          return rootCat === 'ACCESSORIES' && getProductCatalogue(p) === catalogue;
        }).length;

        const allCircle = {
          key: 'ALL',
          label: 'All Accessories',
          img: imgAccessories,
          count: `${totalAccCount} items`,
          isSub: true,
          dbName: 'ALL'
        };

        const rootDbCat = categoriesList.find(c => c.name.toLowerCase() === 'accessories');
        if (rootDbCat?.image) {
          allCircle.img = rootDbCat.image;
        }

        return [allCircle, ...subItems];
      }
    }

    if (activeTab === 'GIFTS') {
      const unified = getUnifiedCategories();
      const giftsGroup = unified.find(g => g.key === 'GIFTS');
      if (giftsGroup && giftsGroup.subcategories && giftsGroup.subcategories.length > 0) {
        const subItems = giftsGroup.subcategories.map(sub => {
          const dbCat = categoriesList.find(c => c.name.toLowerCase() === sub.dbName.toLowerCase());
          const customImg = dbCat?.image;
          const subKeys = getAllSubcategoryKeysUnder(sub.dbName).map(k => k.toUpperCase());
          const count = allProducts.filter(p => {
            const rootCat = String(p.category || '').split('>')[0].trim().toUpperCase();
            if (rootCat !== 'GIFTS') return false;
            if (getProductCatalogue(p) !== catalogue) return false;
            const productSubs = getProductSubCategories(p).map(s => s.toUpperCase());
            return productSubs.some(subName => subKeys.includes(subName));
          }).length;

          return {
            key: sub.dbName.toUpperCase(),
            label: sub.label,
            img: customImg || imgGifts,
            count: `${count} items`,
            isSub: true,
            dbName: sub.dbName
          };
        });

        const totalGiftsCount = allProducts.filter(p => {
          const rootCat = String(p.category || '').split('>')[0].trim().toUpperCase();
          return rootCat === 'GIFTS' && getProductCatalogue(p) === catalogue;
        }).length;

        const allCircle = {
          key: 'ALL',
          label: 'All Gifts',
          img: imgGifts,
          count: `${totalGiftsCount} items`,
          isSub: true,
          dbName: 'ALL'
        };

        const rootDbCat = categoriesList.find(c => c.name.toLowerCase() === 'gifts');
        if (rootDbCat?.image) {
          allCircle.img = rootDbCat.image;
        }

        return [allCircle, ...subItems];
      }
    }

    if (activeTab === 'STATIONERY') {
      const unified = getUnifiedCategories();
      const stationeryGroup = unified.find(g => g.key === 'STATIONERY');
      if (stationeryGroup && stationeryGroup.subcategories && stationeryGroup.subcategories.length > 0) {
        const subItems = stationeryGroup.subcategories.map(sub => {
          const dbCat = categoriesList.find(c => c.name.toLowerCase() === sub.dbName.toLowerCase());
          const customImg = dbCat?.image;
          const subKeys = getAllSubcategoryKeysUnder(sub.dbName).map(k => k.toUpperCase());
          const count = allProducts.filter(p => {
            const rootCat = String(p.category || '').split('>')[0].trim().toUpperCase();
            if (rootCat !== 'STATIONERY') return false;
            if (getProductCatalogue(p) !== catalogue) return false;
            const productSubs = getProductSubCategories(p).map(s => s.toUpperCase());
            return productSubs.some(subName => subKeys.includes(subName));
          }).length;

          return {
            key: sub.dbName.toUpperCase(),
            label: sub.label,
            img: customImg || imgStationery,
            count: `${count} items`,
            isSub: true,
            dbName: sub.dbName
          };
        });

        const totalStationeryCount = allProducts.filter(p => {
          const rootCat = String(p.category || '').split('>')[0].trim().toUpperCase();
          return rootCat === 'STATIONERY' && getProductCatalogue(p) === catalogue;
        }).length;

        const allCircle = {
          key: 'ALL',
          label: 'All Stationery',
          img: imgStationery,
          count: `${totalStationeryCount} items`,
          isSub: true,
          dbName: 'ALL'
        };

        const rootDbCat = categoriesList.find(c => c.name.toLowerCase() === 'stationery');
        if (rootDbCat?.image) {
          allCircle.img = rootDbCat.image;
        }

        return [allCircle, ...subItems];
      }
    }

    return getUnifiedCategories().map(group => {
      const key = group.key;
      let img = imgClothing;
      if (key.includes('STATIONERY')) img = imgStationery;
      else if (key.includes('GIFT')) img = imgGifts;
      else if (key.includes('ACCESSORIES') || key.includes('FANCY')) img = imgAccessories;

      const dbCat = categoriesList.find(c => c.name.toLowerCase() === group.name.toLowerCase());
      if (dbCat?.image) {
        img = dbCat.image;
      }

      const count = allProducts.filter(p => {
        const rootCat = String(p.category || '').split('>')[0].trim().toUpperCase();
        return rootCat === key && getProductCatalogue(p) === catalogue;
      }).length;

      return {
        key,
        label: group.name,
        img,
        count: `${count} items`,
        isSub: false,
        dbName: group.name
      };
    });
  };

  const getCategoryBannerImage = () => {
    switch (activeTab) {
      case 'CLOTHING': return imgClothing;
      case 'STATIONERY': return imgStationery;
      case 'GIFTS': return imgGifts;
      case 'ACCESSORIES': return imgAccessories;
      default: return shopBannerRaw;
    }
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', onClick: () => { setActiveTab('ALL'); setActiveSubTab('ALL'); window.history.pushState({}, '', '/shop'); window.dispatchEvent(new Event('popstate')); } }
  ];
  if (activeTab !== 'ALL') {
    const cleanCat = activeTab.charAt(0) + activeTab.slice(1).toLowerCase();
    breadcrumbItems.push({
      label: cleanCat,
      onClick: () => { setActiveTab(activeTab); setActiveSubTab('ALL'); window.history.pushState({}, '', `/shop/${activeTab.toLowerCase()}`); window.dispatchEvent(new Event('popstate')); }
    });
    if (activeSubTab !== 'ALL') {
      const cleanSub = activeSubTab.charAt(0) + activeSubTab.slice(1).toLowerCase();
      breadcrumbItems.push({
        label: cleanSub
      });
    }
  }

  return (
    <div className="shop-view-page">
      <div className="shop-content-container">
        {/* Breadcrumb Navigation */}
        <div className="category-breadcrumbs-container" style={{ margin: '15px 0 25px 0' }}>
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        
        {/* Toggle Button Row for Collapsing Sidebar */}
        <div className="filters-toggle-row-m3" style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
          <button 
            className={`exclusive-filters-toggle-btn ${showSidebar ? 'active' : ''}`}
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <X size={16} /> : <Menu size={16} />}
            <span>{showSidebar ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        <div className={`exclusive-products-layout ${!showSidebar ? 'filters-hidden' : ''}`}>
          
          {/* Left Sidebar: Collapsible Filters */}
          <aside className={`exclusive-filters-sidebar ${showSidebar ? 'active-sidebar' : 'inactive-sidebar'}`}>
            
            {/* Filters Header Container with RESET button */}
            <div className="filters-header-box-m3">
              <div className="filters-title-row">
                <span className="filters-title-m3">Filters</span>
              </div>
              <button className="filter-reset-btn" onClick={handleClearAllFilters}>
                RESET
              </button>
            </div>

            {/* Search Block */}
            <div className="filter-block-m3">
              <span className="filter-label-m3">SEARCH</span>
              <div className="filter-search-box-m3">
                <span className="search-icon-m3">🔍</span>
                <input
                  type="text"
                  className="filter-search-input-m3"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="unified-filters-card">
              {/* 1. Category Accordion (default open) */}
              <div className="filter-card-section category-accordion">
                <div className="section-title-row" onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}>
                  <h3 className="section-title-text">Category</h3>
                  <ChevronDown size={14} className={`section-chevron ${isCategoriesOpen ? 'rotated' : ''}`} />
                </div>
                {isCategoriesOpen && (
                  <div className="section-content" style={{ marginTop: '10px' }}>
                    {renderDynamicCategoriesFilter()}
                  </div>
                )}
              </div>

              {/* 2. Shop For Accordion (default open) */}
              <div className="filter-card-section shop-for-accordion">
                <div className="section-title-row" onClick={() => setIsGenderOpen(!isGenderOpen)}>
                  <h3 className="section-title-text">Shop For</h3>
                  <ChevronDown size={14} className={`section-chevron ${isGenderOpen ? 'rotated' : ''}`} />
                </div>
                {isGenderOpen && (
                  <div className="section-content" style={{ marginTop: '10px' }}>
                    {['Men', 'Women', 'Kids', 'Other'].map(gender => {
                      const isChecked = selectedShopFor.includes(gender);
                      return (
                        <label key={gender} className="checkbox-filter-row">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedShopFor(selectedShopFor.filter(g => g !== gender));
                              } else {
                                setSelectedShopFor([...selectedShopFor, gender]);
                              }
                            }}
                          />
                          <span>{gender}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Price Range Accordion */}
              <div className="filter-card-section price-accordion">
                <div className="section-title-row" onClick={() => setIsPriceOpen(!isPriceOpen)}>
                  <h3 className="section-title-text">Price Range</h3>
                  <ChevronDown size={14} className={`section-chevron ${isPriceOpen ? 'rotated' : ''}`} />
                </div>
                {isPriceOpen && (
                  <div className="section-content price-slider-container" style={{ marginTop: '10px' }}>
                    <input 
                      type="range" 
                      min="100" 
                      max="15000" 
                      step="100"
                      value={priceRange} 
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="pink-price-slider"
                    />
                    <div className="price-labels-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>₹100</span>
                      <span>₹{priceRange.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Category-Specific Dynamic Filters */}
              {activeTab === 'CLOTHING' && (
                <>
                  {/* Size Accordion */}
                  <div className="filter-card-section size-accordion">
                    <div className="section-title-row" onClick={() => setIsSizeOpen(!isSizeOpen)}>
                      <h3 className="section-title-text">Size</h3>
                      <ChevronDown size={14} className={`section-chevron ${isSizeOpen ? 'rotated' : ''}`} />
                    </div>
                    {isSizeOpen && (
                      <div className="section-content" style={{ marginTop: '10px' }}>
                        <div className="size-buttons-grid">
                          {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'].map(size => {
                            const isChecked = selectedSizes.includes(size);
                            return (
                              <button 
                                key={size}
                                className={`size-btn ${isChecked ? 'active' : ''}`}
                                onClick={() => {
                                  if (isChecked) {
                                    setSelectedSizes(selectedSizes.filter(s => s !== size));
                                  } else {
                                    setSelectedSizes([...selectedSizes, size]);
                                  }
                                }}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Colors Accordion */}
                  <div className="filter-card-section color-accordion">
                    <div className="section-title-row" onClick={() => setIsColorsOpen(!isColorsOpen)}>
                      <h3 className="section-title-text">Colors</h3>
                      <ChevronDown size={14} className={`section-chevron ${isColorsOpen ? 'rotated' : ''}`} />
                    </div>
                    {isColorsOpen && (
                      <div className="section-content" style={{ marginTop: '10px' }}>
                        <div className="color-circles-list">
                          {[
                            { name: 'Pink', value: '#E94FA8' },
                            { name: 'Red', value: '#FF0000' },
                            { name: 'Yellow', value: '#FFCC00' },
                            { name: 'Green', value: '#00CC66' },
                            { name: 'Purple', value: '#8A2BE2' },
                            { name: 'Black', value: '#000000' },
                            { name: 'White', value: '#FFFFFF', border: '1px solid #ddd' },
                            { name: 'Blue', value: '#051838' }
                          ].map(color => {
                            const isChecked = selectedColors.includes(color.name);
                            return (
                              <button 
                                key={color.name}
                                className={`color-bubble ${isChecked ? 'active' : ''}`}
                                style={{ backgroundColor: color.value, border: color.border || 'none' }}
                                onClick={() => {
                                  if (isChecked) {
                                    setSelectedColors(selectedColors.filter(c => c !== color.name));
                                  } else {
                                    setSelectedColors([...selectedColors, color.name]);
                                  }
                                }}
                                title={color.name}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fabric Accordion */}
                  <div className="filter-card-section fabric-accordion">
                    <div className="section-title-row" onClick={() => setIsFabricOpen(!isFabricOpen)}>
                      <h3 className="section-title-text">Fabric</h3>
                      <ChevronDown size={14} className={`section-chevron ${isFabricOpen ? 'rotated' : ''}`} />
                    </div>
                    {isFabricOpen && (
                      <div className="section-content" style={{ marginTop: '10px' }}>
                        {['Cotton', 'Rayon', 'Silk', 'Polyester'].map(fab => {
                          const isChecked = selectedFabrics.includes(fab);
                          return (
                            <label key={fab} className="checkbox-filter-row">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedFabrics(selectedFabrics.filter(f => f !== fab));
                                  } else {
                                    setSelectedFabrics([...selectedFabrics, fab]);
                                  }
                                }}
                              />
                              <span>{fab}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'STATIONERY' && (
                <>
                  {/* Paper Size Accordion */}
                  <div className="filter-card-section paper-size-accordion">
                    <div className="section-title-row" onClick={() => setIsPaperSizeOpen(!isPaperSizeOpen)}>
                      <h3 className="section-title-text">Paper Size</h3>
                      <ChevronDown size={14} className={`section-chevron ${isPaperSizeOpen ? 'rotated' : ''}`} />
                    </div>
                    {isPaperSizeOpen && (
                      <div className="section-content" style={{ marginTop: '10px' }}>
                        {['A4', 'A5', 'A6'].map(size => {
                          const isChecked = selectedPaperSizes.includes(size);
                          return (
                            <label key={size} className="checkbox-filter-row">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedPaperSizes(selectedPaperSizes.filter(s => s !== size));
                                  } else {
                                    setSelectedPaperSizes([...selectedPaperSizes, size]);
                                  }
                                }}
                              />
                              <span>{size}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Paper Type Accordion */}
                  <div className="filter-card-section paper-type-accordion">
                    <div className="section-title-row" onClick={() => setIsPaperTypeOpen(!isPaperTypeOpen)}>
                      <h3 className="section-title-text">Paper Type</h3>
                      <ChevronDown size={14} className={`section-chevron ${isPaperTypeOpen ? 'rotated' : ''}`} />
                    </div>
                    {isPaperTypeOpen && (
                      <div className="section-content" style={{ marginTop: '10px' }}>
                        {['Ruled', 'Plain'].map(type => {
                          const isChecked = selectedPaperTypes.includes(type);
                          return (
                            <label key={type} className="checkbox-filter-row">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedPaperTypes(selectedPaperTypes.filter(t => t !== type));
                                  } else {
                                    setSelectedPaperTypes([...selectedPaperTypes, type]);
                                  }
                                }}
                              />
                              <span>{type}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Pack Size Accordion */}
                  <div className="filter-card-section pack-size-accordion">
                    <div className="section-title-row" onClick={() => setIsPackSizeOpen(!isPackSizeOpen)}>
                      <h3 className="section-title-text">Pack Size</h3>
                      <ChevronDown size={14} className={`section-chevron ${isPackSizeOpen ? 'rotated' : ''}`} />
                    </div>
                    {isPackSizeOpen && (
                      <div className="section-content" style={{ marginTop: '10px' }}>
                        {['Pack of 1', 'Pack of 3', 'Pack of 5', 'Pack of 10'].map(pack => {
                          const isChecked = selectedPackSizes.includes(pack);
                          return (
                            <label key={pack} className="checkbox-filter-row">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedPackSizes(selectedPackSizes.filter(p => p !== pack));
                                  } else {
                                    setSelectedPackSizes([...selectedPackSizes, pack]);
                                  }
                                }}
                              />
                              <span>{pack}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'ACCESSORIES' && (
                <>
                  {/* Material Accordion */}
                  <div className="filter-card-section material-accordion">
                    <div className="section-title-row" onClick={() => setIsMaterialOpen(!isMaterialOpen)}>
                      <h3 className="section-title-text">Material</h3>
                      <ChevronDown size={14} className={`section-chevron ${isMaterialOpen ? 'rotated' : ''}`} />
                    </div>
                    {isMaterialOpen && (
                      <div className="section-content" style={{ marginTop: '10px' }}>
                        {['Gold', 'Silver', 'Brass', 'Alloy', 'Leather'].map(mat => {
                          const isChecked = selectedMaterials.includes(mat);
                          return (
                            <label key={mat} className="checkbox-filter-row">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedMaterials(selectedMaterials.filter(m => m !== mat));
                                  } else {
                                    setSelectedMaterials([...selectedMaterials, mat]);
                                  }
                                }}
                              />
                              <span>{mat}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'GIFTS' && (
                <>
                  {/* Theme Accordion */}
                  <div className="filter-card-section gift-theme-accordion">
                    <div className="section-title-row" onClick={() => setIsGiftThemeOpen(!isGiftThemeOpen)}>
                      <h3 className="section-title-text">Occasion Theme</h3>
                      <ChevronDown size={14} className={`section-chevron ${isGiftThemeOpen ? 'rotated' : ''}`} />
                    </div>
                    {isGiftThemeOpen && (
                      <div className="section-content" style={{ marginTop: '10px' }}>
                        {['Festive', 'Anniversary', 'Birthday', 'Kids', 'Corporate'].map(theme => {
                          const isChecked = selectedGiftThemes.includes(theme);
                          return (
                            <label key={theme} className="checkbox-filter-row">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedGiftThemes(selectedGiftThemes.filter(t => t !== theme));
                                  } else {
                                    setSelectedGiftThemes([...selectedGiftThemes, theme]);
                                  }
                                }}
                              />
                              <span>{theme}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'ALL' && (
                <>
                  {/* Default Size Accordion */}
                  <div className="filter-card-section size-accordion">
                    <div className="section-title-row" onClick={() => setIsSizeOpen(!isSizeOpen)}>
                      <h3 className="section-title-text">Size</h3>
                      <ChevronDown size={14} className={`section-chevron ${isSizeOpen ? 'rotated' : ''}`} />
                    </div>
                    {isSizeOpen && (
                      <div className="section-content" style={{ marginTop: '10px' }}>
                        <div className="size-buttons-grid">
                          {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'].map(size => {
                            const isChecked = selectedSizes.includes(size);
                            return (
                              <button 
                                key={size}
                                className={`size-btn ${isChecked ? 'active' : ''}`}
                                onClick={() => {
                                  if (isChecked) {
                                    setSelectedSizes(selectedSizes.filter(s => s !== size));
                                  } else {
                                    setSelectedSizes([...selectedSizes, size]);
                                  }
                                }}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Default Colors Accordion */}
                  <div className="filter-card-section color-accordion">
                    <div className="section-title-row" onClick={() => setIsColorsOpen(!isColorsOpen)}>
                      <h3 className="section-title-text">Colors</h3>
                      <ChevronDown size={14} className={`section-chevron ${isColorsOpen ? 'rotated' : ''}`} />
                    </div>
                    {isColorsOpen && (
                      <div className="section-content" style={{ marginTop: '10px' }}>
                        <div className="color-circles-list">
                          {[
                            { name: 'Pink', value: '#E94FA8' },
                            { name: 'Red', value: '#FF0000' },
                            { name: 'Yellow', value: '#FFCC00' },
                            { name: 'Green', value: '#00CC66' },
                            { name: 'Purple', value: '#8A2BE2' },
                            { name: 'Black', value: '#000000' },
                            { name: 'White', value: '#FFFFFF', border: '1px solid #ddd' },
                            { name: 'Blue', value: '#051838' }
                          ].map(color => {
                            const isChecked = selectedColors.includes(color.name);
                            return (
                              <button 
                                key={color.name}
                                className={`color-bubble ${isChecked ? 'active' : ''}`}
                                style={{ backgroundColor: color.value, border: color.border || 'none' }}
                                onClick={() => {
                                  if (isChecked) {
                                    setSelectedColors(selectedColors.filter(c => c !== color.name));
                                  } else {
                                    setSelectedColors([...selectedColors, color.name]);
                                  }
                                }}
                                title={color.name}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* 6. Availability Accordion */}
              <div className="filter-card-section availability-accordion">
                <div className="section-title-row" onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}>
                  <h3 className="section-title-text">Availability</h3>
                  <ChevronDown size={14} className={`section-chevron ${isAvailabilityOpen ? 'rotated' : ''}`} />
                </div>
                {isAvailabilityOpen && (
                  <div className="section-content" style={{ marginTop: '10px' }}>
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
                  <ChevronDown size={14} className={`section-chevron ${isRatingsOpen ? 'rotated' : ''}`} />
                </div>
                {isRatingsOpen && (
                  <div className="section-content" style={{ marginTop: '10px' }}>
                    {[5, 4, 3, 2, 1].map(stars => {
                      const isChecked = selectedRatings.includes(stars);
                      return (
                        <label key={stars} className="checkbox-filter-row">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedRatings(selectedRatings.filter(r => r !== stars));
                              } else {
                                setSelectedRatings([...selectedRatings, stars]);
                              }
                            }}
                          />
                          <span>{stars}★ & above</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 8. Discount & Offers Accordion */}
              <div className="filter-card-section offers-accordion">
                <div className="section-title-row" onClick={() => setIsOffersOpen(!isOffersOpen)}>
                  <h3 className="section-title-text">Discount & Offers</h3>
                  <ChevronDown size={14} className={`section-chevron ${isOffersOpen ? 'rotated' : ''}`} />
                </div>
                {isOffersOpen && (
                  <div className="section-content" style={{ marginTop: '10px' }}>
                    {[10, 20, 30, 40].map(pct => {
                      const isChecked = selectedDiscounts.includes(pct);
                      return (
                        <label key={pct} className="checkbox-filter-row">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedDiscounts(selectedDiscounts.filter(d => d !== pct));
                              } else {
                                setSelectedDiscounts([...selectedDiscounts, pct]);
                              }
                            }}
                          />
                          <span>{pct}% and above</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 9. Collections Accordion */}
              <div className="filter-card-section collections-accordion">
                <div className="section-title-row" onClick={() => setIsNewArrivalsOpen(!isNewArrivalsOpen)}>
                  <h3 className="section-title-text">Collections</h3>
                  <ChevronDown size={14} className={`section-chevron ${isNewArrivalsOpen ? 'rotated' : ''}`} />
                </div>
                {isNewArrivalsOpen && (
                  <div className="section-content" style={{ marginTop: '10px' }}>
                    <label className="checkbox-filter-row">
                      <input 
                        type="checkbox"
                        checked={filterNewArrivals}
                        onChange={(e) => setFilterNewArrivals(e.target.checked)}
                      />
                      <span>New Arrivals</span>
                    </label>
                    <label className="checkbox-filter-row">
                      <input 
                        type="checkbox"
                        checked={filterBestSellers}
                        onChange={(e) => setFilterBestSellers(e.target.checked)}
                      />
                      <span>Best Sellers</span>
                    </label>
                    <label className="checkbox-filter-row">
                      <input 
                        type="checkbox"
                        checked={filterOffers}
                        onChange={(e) => setFilterOffers(e.target.checked)}
                      />
                      <span>Offers</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

          </aside>

          {/* Right Side: Redesigned Product Grid */}
          <main className="exclusive-products-content" style={{ flex: 1 }}>
            
            {/* Premium Sort Bar */}
            <div className="premium-sort-bar-m2">
              <div className="showing-products-count">
                Showing <span className="gold-count">{filteredProducts.length}</span> premium products
              </div>
              <div className="sort-by-container">
                <span className="sort-by-label">SORT BY:</span>
                <select 
                  className="premium-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="DEFAULT">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>

            {/* Product Grid View */}
            {currentProducts.length > 0 ? (
              <>
                <div className="shop-products-grid animate-fade-in-up">
                  {currentProducts.map((product) => {
                    const isWishlisted = wishlist.includes(product.id);
                    const isInCart = cart.includes(product.id);
                    
                    const originalPriceNum = product.originalPrice ? parseFloat(String(product.originalPrice).replace(/[^0-9.]/g, '')) : 0;
                    const priceNum = typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
                    const discountPercentage = (originalPriceNum && originalPriceNum > priceNum) 
                      ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
                      : (product.discount && parseFloat(String(product.discount)) <= 100 
                          ? Math.round(parseFloat(String(product.discount))) 
                          : 0);
                    
                    const brandName = product.brand || 'Mithira Collection';
                    const inStock = isProductInStock(product);

                    return (
                      <div 
                        key={product.id} 
                        className="clothing-product-card theme-clothing animate-fade-in-up"
                        onClick={() => setFullDetailProduct(product)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="clothing-img-wrapper" onClick={(e) => { e.stopPropagation(); setFullDetailProduct(product); }}>
                          {/* Discount Badge */}
                          {discountPercentage > 0 && (
                            <div className="clothing-discount-badge">
                              {discountPercentage}% OFF
                            </div>
                          )}
                          
                          {/* Wishlist float button (top-right of image) */}
                          <button 
                            className={`clothing-wishlist-float-btn ${isWishlisted ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                            aria-label="Add to Wishlist"
                          >
                            <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
                          </button>

                          <img src={resolveProductImage(product)} alt={product.title} className="clothing-img primary-card-img" loading="lazy" />
                          {resolveImagesArray(product.images).length > 1 && (
                            <img 
                              src={resolveProductImage({ image: resolveImagesArray(product.images)[1] })} 
                              alt={`${product.title} Alternate`} 
                              className="clothing-img hover-card-img" 
                              loading="lazy"
                            />
                          )}

                          {/* Image Hover Overlay */}
                          <div className="clothing-hover-overlay">
                            <button 
                              className={`clothing-hover-action-btn hover-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                              title="Add to Wishlist"
                            >
                              <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                            </button>
                            <button 
                              className="clothing-hover-action-btn hover-quickview-btn"
                              onClick={(e) => { e.stopPropagation(); setActiveImageIndex(0); setModalColor(''); setModalSize('M'); setQuickViewProduct(product); }}
                              title="Quick View"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className={`clothing-hover-action-btn hover-cart-btn ${isInCart ? 'in-cart' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleCart(product.id, product.title); }}
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

                          <h4 className="clothing-product-title" onClick={() => setFullDetailProduct(product)}>
                            {product.title}
                          </h4>

                          <div className="clothing-rating-badge-container">
                            <div className="clothing-rating-pill-green">
                              <span>{(product.rating || 5).toFixed(1)}</span>
                              <span className="rating-star-icon">★</span>
                              <span className="rating-divider">|</span>
                              <span className="rating-count">{product.reviews || 0}</span>
                            </div>
                          </div>

                          <div className="clothing-price-and-action">
                            <div className="clothing-price-box">
                              <span className="clothing-selling-price">
                                {typeof product.price === 'number' ? `₹${product.price.toLocaleString()}` : (String(product.price).startsWith('₹') ? product.price : `₹${product.price}`)}
                              </span>
                              {product.originalPrice && (
                                <span className="clothing-original-price">
                                  {typeof product.originalPrice === 'number' ? `₹${product.originalPrice.toLocaleString()}` : (String(product.originalPrice).startsWith('₹') ? product.originalPrice : `₹${product.originalPrice}`)}
                                </span>
                              )}
                            </div>
                            <button 
                              className={`clothing-card-add-cart-btn ${isInCart ? 'in-cart' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleCart(product.id, product.title); }}
                            >
                              {isInCart ? "IN CART" : "ADD TO CART"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Infinite Scroll Pulsing Skeleton Loader */}
                {isFetchingNextPage && (
                  <div className="shop-products-grid animate-fade-in-up" style={{ marginTop: '20px' }}>
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <ProductCardSkeleton key={idx} />
                    ))}
                  </div>
                )}

                {/* Fallback Load More Button */}
                {currentPage < totalPages && (
                  <div className="load-more-container" style={{ display: 'flex', justifyContent: 'center', margin: '40px 0 20px 0' }}>
                    <button
                      className="ms-btn ms-btn--secondary"
                      style={{
                        padding: '12px 30px',
                        borderRadius: '30px',
                        border: '1.5px solid var(--primary-rose)',
                        color: 'var(--primary-rose)',
                        fontWeight: '600',
                        background: '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => {
                        setIsFetchingNextPage(true);
                        setTimeout(() => {
                          setCurrentPage(prev => prev + 1);
                          setIsFetchingNextPage(false);
                        }, 500);
                      }}
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? 'Loading more products...' : 'Load More Products'}
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

          </main>

        </div>

      </div>

      {/* 1. Quick View Side-by-Side Modal */}
      {quickViewProduct && (() => {
        const images = getAllProductImages(quickViewProduct, modalColor);
        const colors = getProductThemedColors(quickViewProduct);

        // Find selected variant matching active modalColor and modalSize
        const selectedVariant = getSelectedVariant(quickViewProduct, modalColor, modalSize);
        const displayPrice = (selectedVariant && selectedVariant.price !== null && selectedVariant.price !== undefined) 
          ? selectedVariant.price 
          : quickViewProduct.price;
        
        const displayStock = selectedVariant ? selectedVariant.stock : quickViewProduct.stock;
        const isOutOfStock = displayStock <= 0;
        
        const mainImageUrl = images[activeImageIndex] || resolveProductImage(quickViewProduct);

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
                        {(() => {
                          const hasVariantImages = quickViewProduct.variants && quickViewProduct.variants.some(v => v.image && isRealImg(v.image));
                          return images.map((img, idx) => (
                            <div 
                              key={idx}
                              className={`quickview-thumbnail-wrapper ${activeImageIndex === idx ? 'active' : ''}`}
                              onClick={() => {
                                setActiveImageIndex(idx);
                                if (hasVariantImages && colors && colors[idx]) {
                                  setModalColor(colors[idx].name);
                                  const matchVar = quickViewProduct.variants.find(v => v.color?.toLowerCase() === colors[idx].name.toLowerCase());
                                  if (matchVar && matchVar.size) {
                                    setModalSize(matchVar.size);
                                  }
                                }
                              }}
                            >
                              <img src={img} alt={`thumb-${idx}`} className="quickview-thumbnail-img" />
                            </div>
                          ));
                        })()}
                      </div>
                      <button className="thumbnail-nav-arrow down" onClick={handleNextThumbnail}>
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  ) : null}
                  
                  {/* Main Image display */}
                  <div className="quickview-main-image-wrapper">
                    <img 
                      src={mainImageUrl} 
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
                    <span className="modal-price">₹{displayPrice.toLocaleString()}</span>
                    <span className="modal-original-price">₹{(quickViewProduct.originalPrice || Math.round(displayPrice * 1.5)).toLocaleString()}</span>
                    {getProductDiscount(quickViewProduct) > 0 && (
                      <span className="modal-discount-badge" style={{ background: '#e53935', color: '#fff', borderRadius: '4px', padding: '2px 7px', fontSize: '0.78rem', fontWeight: 700, marginLeft: '8px' }}>
                        {getProductDiscount(quickViewProduct)}% OFF
                      </span>
                    )}
                  </div>

                  <div className="modal-availability-row">
                    <span className="availability-label">Availability:</span>
                    <span className={`availability-status ${isOutOfStock ? 'out-of-stock-status' : ''}`} style={{ color: isOutOfStock ? '#ff3333' : '#43a047' }}>{isOutOfStock ? "Out of Stock" : "In Stock"}</span>
                  </div>

                  <p className="modal-desc">
                    {quickViewProduct.description || "Elegant and premium collection item designed to complement your cultural roots. Crafted with pure fabric and detailed quality finishes."}
                  </p>

                  {/* Category-specific Selectors */}
                  {renderCategorySelectors(quickViewProduct, modalSize, setModalSize, modalColor, setModalColor, activeImageIndex, setActiveImageIndex, images, colors, modalQty, setModalQty, personalizationText, setPersonalizationText, personalizationError, setPersonalizationError)}

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
                      disabled={isOutOfStock}
                      style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                      onClick={() => {
                        const isGift = String(quickViewProduct.category).toUpperCase().includes('GIFT');
                        const needsPersonalization = quickViewProduct.attributes?.personalization && quickViewProduct.attributes.personalization !== 'No';
                        if (isGift && needsPersonalization && !personalizationText.trim()) {
                          setPersonalizationError(true);
                          const container = document.getElementById('personalization-input-container');
                          if (container) {
                            container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                          return;
                        }
                        toggleCart(quickViewProduct.id, quickViewProduct.title, modalSize, modalColor);
                      }}
                    >
                      {isOutOfStock ? "OUT OF STOCK" : (cart.includes(quickViewProduct.id) ? "Remove from Cart" : "Add to Cart")}
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
