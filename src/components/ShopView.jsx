/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { categoryConfigService } from '../services/categoryConfigService';
import { useToast } from './ToastProvider';
import Breadcrumbs from './ui/Breadcrumbs';
import Skeleton, { ProductCardSkeleton } from './ui/Skeleton';
import { Heart, Star, ShoppingCart, Search, Eye, X, ChevronDown, ChevronUp, ArrowLeft, Filter, Crown, Menu, Shirt, BookOpen, Gift, Shield, Globe, Award, Sparkles, RotateCcw, ThumbsUp, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveProductImage, resolveProductGallery, isRealImg } from '../utils/imageHelper';
import { COLOR_MAP, getColorHex, getValuesForFilter, getFilterOptions, applyDynamicFilters, getProductBadge, getMergedFiltersForPath } from '../utils/filterUtils';
import { loadPersistentFilters, savePersistentFilters, clearPersistentFilters } from '../utils/filterPersistence';
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
                      border: modalColor === c.name ? '2px solid #fff' : '1px solid #cbd5e1',
                      outline: modalColor === c.name ? '2px solid var(--primary-rose, #1d4ed8)' : 'none',
                      cursor: 'pointer',
                      opacity: isColAvail ? 1 : 0.45,
                      background: isColAvail ? c.hex : `linear-gradient(45deg, ${c.hex} 48%, #94a3b8 49%, #94a3b8 51%, ${c.hex} 52%)`,
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
                    background: c.hex,
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
  const [isUrlParsed, setIsUrlParsed] = useState(false);
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

    categoryConfigService.getCategoryConfigurations().then(confs => {
      if (confs) {
        setCategoryConfigs(confs);
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

  const [categoryConfigs, setCategoryConfigs] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  const [openSections, setOpenSections] = useState({});

  const activeCategoryConfig = (() => {
    if (!activeTab || activeTab === 'ALL') return null;
    const lowerTab = activeTab.toLowerCase();
    let matchKey = Object.keys(categoryConfigs).find(k => k.toLowerCase() === lowerTab);
    if (!matchKey) {
      matchKey = Object.keys(categoryConfigs).find(k => k.toLowerCase().includes(lowerTab) || lowerTab.includes(k.toLowerCase()));
    }
    return matchKey ? categoryConfigs[matchKey] : null;
  })();



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
  const [reviewSortOption, setReviewSortOption] = useState('Newest');
  const [helpfulLoadingIds, setHelpfulLoadingIds] = useState(new Set());
  const [reviewLightbox, setReviewLightbox] = useState(null); // { images: [], index: 0 }

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activeSubTab, searchQuery, catalogue, priceRange, showInStock, showOutOfStock, selectedRatings, selectedSubcategories, selectedShopFor, selectedSizes, selectedColors, selectedDiscounts, filterNewArrivals, filterBestSellers, filterOffers, activeFilters]);

  // Compute merged category filters from parent + subcategory configs (case-insensitive, no duplicates)
  const categoryFilters = getMergedFiltersForPath(
    categoryConfigs,
    activeTab,
    activeSubTab,
    selectedSubcategories,
    categoriesList
  );

  const dynamicFilterNames = categoryFilters.filter(f => f && typeof f === 'string' && f.toLowerCase() !== 'price');

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
    setActiveFilters({});
    setOpenSections({});
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
    
    // Clear URL state
    window.history.replaceState(null, '', '/shop');
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

  // Parse category/subcategory/search/filters from URL (both path slugs and query params)
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
      setFullDetailProduct(null);

      // Always sync search query directly from URL param, never from sessionStorage
      if (searchParam) {
        setSearchQuery(decodeURIComponent(searchParam));
      } else {
        setSearchQuery('');
      }

      // Check if URL contains any filter parameters
      const hasUrlFilters = Array.from(params.keys()).some(k => 
        ['search', 'price', 'instock', 'outofstock', 'rating', 'discount', 'subcategories', 'offers', 'newarrivals', 'bestsellers'].includes(k.toLowerCase()) ||
        !['category', 'subcategory'].includes(k.toLowerCase())
      );

      let loaded = null;
      if (!hasUrlFilters) {
        loaded = loadPersistentFilters();
      }

      if (loaded) {
        if (loaded.priceRange !== undefined) setPriceRange(loaded.priceRange);
        if (loaded.showInStock !== undefined) setShowInStock(loaded.showInStock);
        if (loaded.showOutOfStock !== undefined) setShowOutOfStock(loaded.showOutOfStock);
        if (loaded.selectedRatings !== undefined) setSelectedRatings(loaded.selectedRatings);
        if (loaded.selectedDiscounts !== undefined) setSelectedDiscounts(loaded.selectedDiscounts);
        if (loaded.selectedSubcategories !== undefined) setSelectedSubcategories(loaded.selectedSubcategories);
        if (loaded.filterNewArrivals !== undefined) setFilterNewArrivals(loaded.filterNewArrivals);
        if (loaded.filterBestSellers !== undefined) setFilterBestSellers(loaded.filterBestSellers);
        if (loaded.filterOffers !== undefined) setFilterOffers(loaded.filterOffers);
        if (loaded.activeFilters !== undefined) setActiveFilters(loaded.activeFilters);
        if (loaded.catalogue !== undefined) setCatalogue(loaded.catalogue);
        
        if (loaded.filterNewArrivals || loaded.filterBestSellers || loaded.filterOffers) {
          setIsNewArrivalsOpen(true);
        }
      } else {
        // Parse query params for dynamic filters
        const dynamicFilters = {};
        const ignoredParams = ['category', 'subcategory', 'search', 'catalogue', 'price', 'instock', 'outofstock', 'rating', 'discount', 'subcategories', 'offers', 'newarrivals', 'bestsellers'];
        params.forEach((value, key) => {
          if (!ignoredParams.includes(key.toLowerCase())) {
            dynamicFilters[key] = value.split(',').map(v => decodeURIComponent(v));
          }
        });
        setActiveFilters(dynamicFilters);

        const priceVal = params.get('price');
        if (priceVal) {
          setPriceRange(Number(priceVal));
        } else {
          setPriceRange(15000);
        }

        const instockVal = params.get('instock');
        if (instockVal === 'false') {
          setShowInStock(false);
        } else {
          setShowInStock(true);
        }

        const outofstockVal = params.get('outofstock');
        if (outofstockVal === 'false') {
          setShowOutOfStock(false);
        } else {
          setShowOutOfStock(true);
        }

        const ratingVal = params.get('rating');
        if (ratingVal) {
          setSelectedRatings(ratingVal.split(',').map(Number));
        } else {
          setSelectedRatings([]);
        }

        const discountVal = params.get('discount');
        if (discountVal) {
          setSelectedDiscounts(discountVal.split(',').map(Number));
        } else {
          setSelectedDiscounts([]);
        }

        const catalogueVal = params.get('catalogue');
        if (catalogueVal) {
          setCatalogue(catalogueVal);
        } else {
          setCatalogue('A');
        }

        const subcategoriesVal = params.get('subcategories');
        if (subcategoriesVal) {
          setSelectedSubcategories(subcategoriesVal.split(',').map(v => decodeURIComponent(v)));
        } else {
          setSelectedSubcategories([]);
        }

        const offersVal = params.get('offers');
        if (offersVal === 'true') {
          setFilterOffers(true);
          setIsNewArrivalsOpen(true);
        } else {
          setFilterOffers(false);
        }

        const newArrivalsVal = params.get('newarrivals');
        if (newArrivalsVal === 'true') {
          setFilterNewArrivals(true);
          setIsNewArrivalsOpen(true);
        } else {
          setFilterNewArrivals(false);
        }

        const bestSellersVal = params.get('bestsellers');
        if (bestSellersVal === 'true') {
          setFilterBestSellers(true);
          setIsBestSellersOpen(true);
        } else {
          setFilterBestSellers(false);
        }
      }

      setIsUrlParsed(true);
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  // Sync filter state to URL query parameters
  useEffect(() => {
    if (!isUrlParsed) return;
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (priceRange !== 15000) params.set('price', priceRange);
    if (!showInStock) params.set('instock', 'false');
    if (!showOutOfStock) params.set('outofstock', 'false');
    if (selectedRatings.length > 0) params.set('rating', selectedRatings.join(','));
    if (selectedDiscounts.length > 0) params.set('discount', selectedDiscounts.join(','));
    if (catalogue !== 'A') params.set('catalogue', catalogue);
    if (selectedSubcategories.length > 0) params.set('subcategories', selectedSubcategories.map(v => encodeURIComponent(v)).join(','));
    if (filterOffers) params.set('offers', 'true');
    if (filterNewArrivals) params.set('newarrivals', 'true');
    if (filterBestSellers) params.set('bestsellers', 'true');
    
    Object.entries(activeFilters).forEach(([key, values]) => {
      if (values && values.length > 0) {
        params.set(key, values.map(v => encodeURIComponent(v)).join(','));
      }
    });

    const path = activeTab !== 'ALL'
      ? `/shop/${activeTab.toLowerCase()}${activeSubTab !== 'ALL' ? '/' + activeSubTab.toLowerCase().replace(/\s+/g, '-') : ''}`
      : '/shop';
    
    const queryString = params.toString();
    const newUrl = `${path}${queryString ? '?' + queryString : ''}`;
    
    // Save to persistent filters storage
    savePersistentFilters({
      searchQuery: '',
      priceRange,
      showInStock,
      showOutOfStock,
      selectedRatings,
      selectedDiscounts,
      selectedSubcategories,
      filterNewArrivals,
      filterBestSellers,
      filterOffers,
      activeFilters,
      catalogue
    });

    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.pushState(null, '', newUrl);
    }
  }, [isUrlParsed, activeTab, activeSubTab, searchQuery, priceRange, showInStock, showOutOfStock, selectedRatings, selectedDiscounts, catalogue, activeFilters, selectedSubcategories, filterOffers, filterNewArrivals, filterBestSellers]);


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

  const handleToggleHelpful = async (reviewId) => {
    const token = localStorage.getItem('mithira_auth_token');
    if (!token) {
      addToast({ message: 'Please log in to vote on reviews.', type: 'info' });
      return;
    }
    if (helpfulLoadingIds.has(reviewId)) return; // prevent double-click
    // Optimistic update
    const prevReviews = reviewsList;
    const authUser = (() => { try { return JSON.parse(localStorage.getItem('mithira_auth_user') || 'null'); } catch { return null; } })();
    const uid = authUser?.id || authUser?._id || null;
    setReviewsList(prev => prev.map(r => {
      if (r.id !== reviewId && r._id !== reviewId && String(r.id) !== String(reviewId) && String(r._id) !== String(reviewId)) return r;
      const alreadyVoted = uid && r.helpfulUsers && r.helpfulUsers.includes(uid);
      return {
        ...r,
        helpfulCount: alreadyVoted ? Math.max(0, (r.helpfulCount || 0) - 1) : (r.helpfulCount || 0) + 1,
        helpfulUsers: alreadyVoted
          ? (r.helpfulUsers || []).filter(u => u !== uid)
          : [...(r.helpfulUsers || []), uid]
      };
    }));
    setHelpfulLoadingIds(prev => new Set([...prev, reviewId]));
    try {
      const res = await apiService.toggleHelpful(reviewId);
      if (res && res.success) {
        // Sync with real backend values
        const updatedReviews = await apiService.getReviews();
        if (updatedReviews) {
          setReviewsList(updatedReviews);
          const channel = new BroadcastChannel('mithirashoppy_reviews');
          channel.postMessage({ type: 'reviews_updated' });
          channel.close();
          window.dispatchEvent(new CustomEvent('mithira_reviews_updated'));
        }
      } else {
        setReviewsList(prevReviews); // rollback
        addToast({ message: 'Failed to update helpful status.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setReviewsList(prevReviews); // rollback on error
      addToast({ message: 'Failed to update helpful status.', type: 'error' });
    } finally {
      setHelpfulLoadingIds(prev => { const next = new Set(prev); next.delete(reviewId); return next; });
    }
  };



  const handleBackToHome = () => {
    window.history.pushState({}, '', '/#home');
    window.dispatchEvent(new Event('popstate'));
  };

  const allProductsStatic = [];
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
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
      } else {
        setAllProducts([]);
      }
    })
    .catch((err) => {
      console.error('Error fetching products:', err);
      setAllProducts([]);
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // Initial fetch of reviews
    apiService.getReviews().then((data) => {
      if (data) setReviewsList(data);
    });

    const channel = new BroadcastChannel('mithirashoppy_reviews');

    const refreshData = () => {
      apiService.getReviews().then((data) => {
        if (data) setReviewsList(data);
      });
      apiService.getProducts().then((data) => {
        if (data) {
          setAllProducts(data);
          if (fullDetailProduct) {
            const fresh = data.find(p => p.id === fullDetailProduct.id);
            if (fresh) setFullDetailProduct(fresh);
          }
        }
      });
    };

    channel.onmessage = (event) => {
      if (event.data && event.data.type === 'reviews_updated') {
        refreshData();
      }
    };

    const interval = setInterval(refreshData, 4000);

    // Also listen to local window events for instant same-tab communication
    const handleLocalUpdate = () => refreshData();
    window.addEventListener('mithira_reviews_updated', handleLocalUpdate);

    return () => {
      channel.close();
      clearInterval(interval);
      window.removeEventListener('mithira_reviews_updated', handleLocalUpdate);
    };
  }, [fullDetailProduct]);

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

  // Get all products matching the selected category and active subcategory
  const categoryProducts = allProducts.filter(p => {
    // 1. Root Category filter
    if (activeTab !== 'ALL') {
      const rootCat = String(p.category || '').split('>')[0].trim().toUpperCase();
      if (activeTab === 'ACCESSORIES') {
        if (rootCat !== 'ACCESSORIES' && rootCat !== 'FANCY') return false;
      } else {
        if (rootCat !== activeTab) return false;
      }
    }
    // 2. Subcategory filter
    if (activeSubTab !== 'ALL') {
      const subKeys = getAllSubcategoryKeysUnder(activeSubTab).map(k => k.toUpperCase());
      const productSubs = getProductSubCategories(p).map(s => s.toUpperCase());
      if (!productSubs.some(subName => subKeys.includes(subName) || subName === activeSubTab.toUpperCase())) return false;
    }
    return true;
  });



  const handleToggleFilter = (filterName, value) => {
    setActiveFilters(prev => {
      const current = prev[filterName] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      const newFilters = { ...prev };
      if (updated.length > 0) {
        newFilters[filterName] = updated;
      } else {
        delete newFilters[filterName];
      }
      return newFilters;
    });
  };

  const toggleSection = (sectionName) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
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
    const qLower = searchQuery.toLowerCase().trim();
    filteredProducts = filteredProducts.filter(p => {
      // Name / Title
      const name = (p.title || p.name || '').toLowerCase();
      // Category
      const category = (p.category || '').toLowerCase();
      // Subcategory
      const subCategory = (p.subCategory || '').toLowerCase();
      // Brand
      const brand = (p.brand || p.attributes?.brand || '').toLowerCase();
      // Tags
      const tags = Array.isArray(p.tags) 
        ? p.tags.join(' ').toLowerCase() 
        : (typeof p.tags === 'string' ? p.tags.toLowerCase() : '');
      // Keywords
      const keywords = Array.isArray(p.keywords) 
        ? p.keywords.join(' ').toLowerCase() 
        : (typeof p.keywords === 'string' ? p.keywords.toLowerCase() : '');
      // Descriptions
      const shortDesc = (p.shortDescription || p.attributes?.shortDescription || '').toLowerCase();
      const longDesc = (p.description || '').toLowerCase();

      return name.includes(qLower) || 
             category.includes(qLower) || 
             subCategory.includes(qLower) || 
             brand.includes(qLower) || 
             tags.includes(qLower) || 
             keywords.includes(qLower) ||
             shortDesc.includes(qLower) ||
             longDesc.includes(qLower);
    });
  }

  // 4. Subcategories Checkbox Filter
  if (selectedSubcategories.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const productSubs = getProductSubCategories(p).map(s => s.toUpperCase());
      return productSubs.some(sub => selectedSubcategories.includes(sub));
    });
  }

  // 5. Dynamic Attribute and Variant Filters
  filteredProducts = applyDynamicFilters(filteredProducts, activeFilters);

  // 6. Price Filter
  const hasPriceFilter = categoryFilters.some(f => f && typeof f === 'string' && f.toLowerCase() === 'price') || activeTab === 'ALL';
  if (hasPriceFilter) {
    filteredProducts = filteredProducts.filter(p => {
      const priceNum = typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0;
      return priceNum <= priceRange;
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
      const isOffer = p.isOffer || p.badge?.toUpperCase().includes('OFFER') || p.badge?.toUpperCase().includes('DEAL') || getProductDiscount(p) > 0;
      
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
            <span className="breadcrumb-category" style={{ cursor: 'pointer' }} onClick={() => { setActiveTab(fullDetailProduct.category.toUpperCase()); setSearchQuery(''); setFullDetailProduct(null); }}>
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
                  {fullDetailProduct.badge && (
                    <div className="product-detail-badge-pill">
                      {fullDetailProduct.badge}
                    </div>
                  )}
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

              {/* Rating and reviews — computed dynamically from Approved reviews */}
              {(() => {
                const approvedRevs = reviewsList.filter(r =>
                  (r.productName === fullDetailProduct.title || r.productName === fullDetailProduct.name) &&
                  r.status === 'Approved'
                );
                const dynamicCount = approvedRevs.length;
                const dynamicRating = dynamicCount > 0
                  ? (approvedRevs.reduce((s, r) => s + (r.rating || 0), 0) / dynamicCount).toFixed(1)
                  : (fullDetailProduct.rating || '4.8');
                const displayCount = dynamicCount > 0 ? dynamicCount : (fullDetailProduct.reviews || 0);
                return (
                  <div className="product-detail-rating-row">
                    <span className="product-detail-rating-stars">★ {dynamicRating}</span>
                    <span className="product-detail-reviews">({displayCount} {displayCount === 1 ? 'review' : 'reviews'})</span>
                  </div>
                );
              })()}

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

                      {/* Image Lightbox Overlay */}
                      {reviewLightbox && (
                        <div
                          style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            background: 'rgba(0,0,0,0.92)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column', gap: '12px'
                          }}
                          onClick={() => setReviewLightbox(null)}
                        >
                          <button
                            onClick={() => setReviewLightbox(null)}
                            style={{
                              position: 'absolute', top: '18px', right: '24px',
                              background: 'rgba(255,255,255,0.12)', border: 'none',
                              color: '#fff', borderRadius: '50%', width: '40px', height: '40px',
                              cursor: 'pointer', display: 'flex',
                              alignItems: 'center', justifyContent: 'center', zIndex: 10000
                            }}
                          ><X size={20} /></button>
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
                            onClick={e => e.stopPropagation()}
                          >
                            {reviewLightbox.images.length > 1 && (
                              <button
                                onClick={() => setReviewLightbox(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }))}
                                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              ><ChevronLeft size={22} /></button>
                            )}
                            <img
                              src={reviewLightbox.images[reviewLightbox.index]}
                              alt={`Review image ${reviewLightbox.index + 1}`}
                              style={{ maxHeight: '80vh', maxWidth: '80vw', borderRadius: '10px', objectFit: 'contain', boxShadow: '0 8px 40px rgba(0,0,0,0.7)' }}
                            />
                            {reviewLightbox.images.length > 1 && (
                              <button
                                onClick={() => setReviewLightbox(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }))}
                                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              ><ChevronRight size={22} /></button>
                            )}
                          </div>
                          {reviewLightbox.images.length > 1 && (
                            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                              {reviewLightbox.images.map((_, di) => (
                                <button key={di} onClick={e => { e.stopPropagation(); setReviewLightbox(prev => ({ ...prev, index: di })); }} style={{ width: '8px', height: '8px', borderRadius: '50%', border: 'none', background: di === reviewLightbox.index ? '#D4AF37' : 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 0 }} />
                              ))}
                            </div>
                          )}
                          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '4px' }}>{reviewLightbox.index + 1} / {reviewLightbox.images.length}</p>
                        </div>
                      )}

                      {(() => {
                        const productReviews = reviewsList.filter(rev =>
                          (rev.productName === fullDetailProduct.title || rev.productName === fullDetailProduct.name) &&
                          rev.status === 'Approved'
                        );

                        const totalCount = productReviews.length;
                        const avgRating = totalCount > 0
                          ? (productReviews.reduce((s, r) => s + (r.rating || 0), 0) / totalCount)
                          : 0;
                        const starCounts = [5, 4, 3, 2, 1].map(star => ({
                          star,
                          count: productReviews.filter(r => r.rating === star).length
                        }));

                        const sortedReviews = [...productReviews].sort((a, b) => {
                          if (reviewSortOption === 'Most Helpful') return (b.helpfulCount || 0) - (a.helpfulCount || 0);
                          if (reviewSortOption === 'Highest Rating') return b.rating - a.rating;
                          if (reviewSortOption === 'Lowest Rating') return a.rating - b.rating;
                          return (b.id || 0) - (a.id || 0);
                        });

                        const meUser = (() => { try { return JSON.parse(localStorage.getItem('mithira_auth_user') || 'null'); } catch { return null; } })();
                        const meId = meUser?.id || meUser?._id || null;

                        const avatarColor = (name) => {
                          const colors = ['#1E3A5F','#2D5016','#6B2D3E','#1A4A5C','#4A2D6B','#5C3A1A','#2D4A1A'];
                          let h = 0; for (let c of (name || 'U')) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
                          return colors[Math.abs(h) % colors.length];
                        };

                        if (totalCount === 0) {
                          return (
                            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                              <Star size={40} stroke="#c5a880" fill="none" style={{ marginBottom: '14px', opacity: 0.4 }} />
                              <p style={{ color: '#c5a880', fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>No approved reviews yet</p>
                              <p style={{ color: 'rgba(197,168,128,0.6)', fontSize: '0.875rem' }}>Be the first to share your experience with this product!</p>
                            </div>
                          );
                        }

                        return (
                          <div>
                            <div style={{
                              display: 'flex', gap: '32px', alignItems: 'flex-start',
                              background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(30,58,95,0.12) 100%)',
                              border: '1px solid rgba(212,175,55,0.18)',
                              borderRadius: '14px', padding: '24px 28px', marginBottom: '28px',
                              flexWrap: 'wrap'
                            }}>
                              <div style={{ textAlign: 'center', minWidth: '110px' }}>
                                <div style={{ fontSize: '3.2rem', fontWeight: 800, color: '#D4AF37', lineHeight: 1 }}>{avgRating.toFixed(1)}</div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', margin: '8px 0 4px' }}>
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} size={16}
                                      fill={s <= Math.round(avgRating) ? '#D4AF37' : 'none'}
                                      stroke={s <= Math.round(avgRating) ? '#D4AF37' : 'rgba(212,175,55,0.35)'}
                                    />
                                  ))}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'rgba(197,168,128,0.7)', marginTop: '2px' }}>{totalCount} {totalCount === 1 ? 'review' : 'reviews'}</div>
                              </div>
                              <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '7px', justifyContent: 'center' }}>
                                {starCounts.map(({ star, count }) => {
                                  const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                                  return (
                                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <span style={{ fontSize: '0.78rem', color: '#D4AF37', minWidth: '18px', textAlign: 'right', fontWeight: 600 }}>{star}</span>
                                      <Star size={12} fill="#D4AF37" stroke="#D4AF37" />
                                      <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #D4AF37, #F0C84A)', borderRadius: '6px', transition: 'width 0.5s ease' }} />
                                      </div>
                                      <span style={{ fontSize: '0.73rem', color: 'rgba(197,168,128,0.65)', minWidth: '32px' }}>{count > 0 ? `${count}` : "—"}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                              <span style={{ fontSize: '0.85rem', color: 'rgba(197,168,128,0.7)' }}>
                                Showing <strong style={{ color: '#D4AF37' }}>{totalCount}</strong> verified {totalCount === 1 ? 'review' : 'reviews'}
                              </span>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {['Newest', 'Most Helpful', 'Highest Rating', 'Lowest Rating'].map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => setReviewSortOption(opt)}
                                    style={{
                                      padding: '5px 12px', borderRadius: '20px', border: '1px solid',
                                      borderColor: reviewSortOption === opt ? '#D4AF37' : 'rgba(197,168,128,0.3)',
                                      background: reviewSortOption === opt ? 'rgba(212,175,55,0.15)' : 'transparent',
                                      color: reviewSortOption === opt ? '#D4AF37' : 'rgba(197,168,128,0.6)',
                                      fontSize: '0.75rem', fontWeight: reviewSortOption === opt ? 700 : 400,
                                      cursor: 'pointer', transition: 'all 0.2s ease'
                                    }}
                                  >{opt}</button>
                                ))}
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                              {sortedReviews.map(rev => {
                                const name = rev.customerName || 'Customer';
                                const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                                const bgColor = avatarColor(name);
                                const isVoted = meId && rev.helpfulUsers && rev.helpfulUsers.includes(meId);
                                const isLoading = helpfulLoadingIds.has(rev.id);
                                const hasImages = rev.images && rev.images.length > 0;

                                return (
                                  <div key={rev.id || rev._id} style={{
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(30,58,95,0.06) 100%)',
                                    border: '1px solid rgba(212,175,55,0.12)',
                                    borderRadius: '14px', padding: '20px 22px',
                                    transition: 'border-color 0.2s ease'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', gap: '12px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                          width: '42px', height: '42px', borderRadius: '50%',
                                          background: bgColor, border: '2px solid rgba(212,175,55,0.3)',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          fontSize: '0.85rem', fontWeight: 700, color: '#D4AF37',
                                          flexShrink: 0, letterSpacing: '0.5px'
                                        }}>{initials}</div>
                                        <div>
                                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e8d5b0' }}>{name}</div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                              {[1,2,3,4,5].map(s => (
                                                <Star key={s} size={14}
                                                  fill={s <= rev.rating ? '#D4AF37' : 'none'}
                                                  stroke={s <= rev.rating ? '#D4AF37' : 'rgba(212,175,55,0.3)'}
                                                />
                                              ))}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#D4AF37' }}>{rev.rating}/5</span>
                                          </div>
                                        </div>
                                      </div>
                                      <span style={{ fontSize: '0.78rem', color: 'rgba(197,168,128,0.55)', whiteSpace: 'nowrap', marginTop: '4px' }}>{rev.date}</span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'rgba(232,213,176,0.85)', margin: '0 0 14px 0' }}>{rev.comment}</p>
                                    {hasImages && (
                                      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                                        {rev.images.map((imgUrl, idx) => (
                                          <div
                                            key={idx}
                                            onClick={() => setReviewLightbox({ images: rev.images, index: idx })}
                                            style={{
                                              width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden',
                                              border: '1.5px solid rgba(212,175,55,0.25)', cursor: 'pointer',
                                              background: 'rgba(30,58,95,0.2)', flexShrink: 0,
                                              transition: 'transform 0.18s ease, border-color 0.18s ease'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.borderColor = '#D4AF37'; }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)'; }}
                                          >
                                            <img
                                              src={imgUrl}
                                              alt={`Review image ${idx + 1}`}
                                              loading="lazy"
                                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                              onError={e => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement.style.background = 'rgba(30,58,95,0.35)';
                                              }}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '4px' }}>
                                      <span style={{ fontSize: '0.78rem', color: 'rgba(197,168,128,0.5)' }}>Helpful?</span>
                                      <button
                                        onClick={() => handleToggleHelpful(rev.id !== undefined ? rev.id : rev._id)}
                                        disabled={isLoading}
                                        style={{
                                          display: 'flex', alignItems: 'center', gap: '6px',
                                          padding: '5px 14px', borderRadius: '20px', border: '1.5px solid',
                                          borderColor: isVoted ? '#D4AF37' : 'rgba(197,168,128,0.3)',
                                          background: isVoted ? 'rgba(212,175,55,0.15)' : 'transparent',
                                          color: isVoted ? '#D4AF37' : 'rgba(197,168,128,0.6)',
                                          fontSize: '0.78rem', fontWeight: isVoted ? 700 : 400,
                                          cursor: isLoading ? 'not-allowed' : 'pointer',
                                          opacity: isLoading ? 0.6 : 1, transition: 'all 0.2s ease'
                                        }}
                                      >
                                        {isLoading
                                          ? <span style={{ width: '14px', height: '14px', border: '2px solid rgba(212,175,55,0.4)', borderTopColor: '#D4AF37', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                                          : <ThumbsUp size={13} fill={isVoted ? '#D4AF37' : 'none'} stroke={isVoted ? '#D4AF37' : 'rgba(197,168,128,0.6)'} />
                                        }
                                        <span>Helpful ({rev.helpfulCount || 0})</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
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
                        {/* Badge Logic */}
                        {(() => {
                          const badgeInfo = getProductBadge(simProd, discountPercentage);
                          if (!badgeInfo) return null;
                          if (badgeInfo.type === 'NEW') {
                            return <div className="clothing-new-badge">NEW</div>;
                          } else if (badgeInfo.type === 'DISCOUNT') {
                            return <div className="clothing-discount-badge">{badgeInfo.text}</div>;
                          }
                          return null;
                        })()}
                        
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
              {/* 3. Price Range Accordion (Rendered dynamically if 'Price' filter is configured) */}
              {hasPriceFilter && (
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
              )}

              {/* Dynamic Configuration-Driven Filters */}
              {dynamicFilterNames.map(filterName => {
                const options = getFilterOptions(categoryProducts, filterName);
                if (options.length === 0) return null; // Hide if no values

                const isSectionOpen = openSections[filterName] !== false; // Default open
                const selectedVals = activeFilters[filterName] || [];

                return (
                  <div key={filterName} className="filter-card-section dynamic-accordion">
                    <div className="section-title-row" onClick={() => toggleSection(filterName)}>
                      <h3 className="section-title-text">{filterName}</h3>
                      <ChevronDown size={14} className={`section-chevron ${isSectionOpen ? 'rotated' : ''}`} />
                    </div>
                    {isSectionOpen && (
                      <div className="section-content" style={{ marginTop: '10px' }}>
                        {/* Special case: Color circle bubbles */}
                        {(filterName.toLowerCase() === 'color' || filterName.toLowerCase() === 'colors') ? (
                          <div className="color-circles-list">
                            {options.map(colorName => {
                              const isChecked = selectedVals.includes(colorName);
                              const colorVal = getColorHex(colorName);
                              const borderStyle = colorName.toLowerCase() === 'white' ? '1px solid #ddd' : 'none';
                              return (
                                <button 
                                  key={colorName}
                                  className={`color-bubble ${isChecked ? 'active' : ''}`}
                                  style={{ backgroundColor: colorVal, border: borderStyle }}
                                  onClick={() => handleToggleFilter(filterName, colorName)}
                                  title={colorName}
                                />
                              );
                            })}
                          </div>
                        ) : /* Special case: Size button grid */
                        (filterName.toLowerCase() === 'size' || filterName.toLowerCase() === 'sizes') ? (
                          <div className="size-buttons-grid">
                            {options.map(sizeName => {
                              const isChecked = selectedVals.includes(sizeName);
                              return (
                                <button 
                                  key={sizeName}
                                  className={`size-btn ${isChecked ? 'active' : ''}`}
                                  onClick={() => handleToggleFilter(filterName, sizeName)}
                                >
                                  {sizeName}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          /* Standard check-box list */
                          options.map(val => {
                            const isChecked = selectedVals.includes(val);
                            return (
                              <label key={val} className="checkbox-filter-row">
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleFilter(filterName, val)}
                                />
                                <span>{val}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

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
                {searchQuery.trim() ? (
                  <>
                    Search results for "<span className="gold-count">{searchQuery}</span>" (Found <span className="gold-count">{filteredProducts.length}</span> products)
                  </>
                ) : (
                  <>
                    Showing <span className="gold-count">{filteredProducts.length}</span> premium products
                  </>
                )}
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
            {loading ? (
              <div className="shop-products-grid animate-fade-in-up">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <ProductCardSkeleton key={idx} />
                ))}
              </div>
            ) : currentProducts.length > 0 ? (
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
                          {/* Badge Logic */}
                          {(() => {
                            const badgeInfo = getProductBadge(product, discountPercentage);
                            if (!badgeInfo) return null;
                            if (badgeInfo.type === 'NEW') {
                              return <div className="clothing-new-badge">NEW</div>;
                            } else if (badgeInfo.type === 'DISCOUNT') {
                              return <div className="clothing-discount-badge">{badgeInfo.text}</div>;
                            }
                            return null;
                          })()}
                          
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
              <div className="shop-empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                {searchQuery.trim() ? (
                  <>
                    <h3 style={{ fontSize: '1.4rem', color: '#051838', marginBottom: '8px' }}>No products found for "{searchQuery}"</h3>
                    <p style={{ color: '#64748b' }}>We couldn't find any matches. Double check your spelling or try search keywords like clothing, gifts, stationery, etc.</p>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: '1.4rem', color: '#051838', marginBottom: '8px' }}>No products found matching your criteria</h3>
                    <p style={{ color: '#64748b' }}>Try adjusting your filters or selecting a different category.</p>
                  </>
                )}
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
