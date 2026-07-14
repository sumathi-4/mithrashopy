import imgClothing from '../../../src/assets/hero_clothing.jpg';
import imgStationery from '../../../src/assets/hero_stationery.jpg';
import imgGifts from '../../../src/assets/hero_gifts.jpg';
import imgAccessories from '../../../src/assets/hero_accessories.jpg';
import clothingUser1 from '../../../src/assets/clothing_user_1.jpg';
import clothingUser2 from '../../../src/assets/clothing_user_2.jpg';
import clothingUser3 from '../../../src/assets/clothing_user_3.jpg';
import clothingUser4 from '../../../src/assets/clothing_user_4.jpg';
import clothingUser5 from '../../../src/assets/clothing_user_5.jpg';
import purpleNotebook from '../../../src/assets/purple_notebook.jpg';
import greenAnarkali from '../../../src/assets/green_anarkali.jpg';
import blueSuit from '../../../src/assets/blue_suit.jpg';
import whiteGown from '../../../src/assets/white_gown.jpg';
import premiumGiftSet from '../../../src/assets/premium_gift_set.jpg';
import kidsFormalSuit from '../../../src/assets/kids_formal_suit.jpg';
import goldAnklets from '../../../src/assets/gold_anklets.jpg';
import diamondRing from '../../../src/assets/diamond_ring.jpg';
import heavyJokerNecklace from '../../../src/assets/heavy_joker_necklace.jpg';
import simpleChainJewellery from '../../../src/assets/simple_chain_jewellery.jpg';
import luxeLeatherNotebook from '../../../src/assets/luxe_leather_notebook.jpg';
import greenAnarkali2 from '../../../src/assets/green_anarkali2.jpg';
import blueFormalSuit2 from '../../../src/assets/blue_formal_suit2.jpg';
import schoolStationeryKit from '../../../src/assets/school_stationery_kit.jpg';
import bridalHairAccessory from '../../../src/assets/bridal_hair_accessory.jpg';
import tealRuffleFrock from '../../../src/assets/teal_ruffle_frock.jpg';

// Helper to check if it's a real URL or a local path reference
export const isRealImg = (img) => {
  if (!img) return false;
  const str = String(img).toLowerCase();
  return (
    str.startsWith('http') ||
    str.startsWith('/') ||
    str.startsWith('data:') ||
    /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?|$)/.test(str)
  );
};

export const resolveProductImage = (prod) => {
  if (!prod) return imgClothing;
  const imageVal = prod.image || '';
  
  if (imageVal === 'purple_notebook.jpg' || imageVal.includes('purple_notebook')) {
    return purpleNotebook;
  }
  if (imageVal === 'green_anarkali.jpg' || imageVal.includes('green_anarkali') || imageVal.includes('anarkali')) {
    return greenAnarkali;
  }
  if (imageVal === 'blue_suit.jpg' || imageVal.includes('blue_suit')) {
    return blueSuit;
  }
  if (imageVal === 'white_gown.jpg' || imageVal.includes('white_gown')) {
    return whiteGown;
  }
  if (imageVal === 'premium_gift_set.jpg' || imageVal.includes('premium_gift_set')) {
    return premiumGiftSet;
  }
  if (imageVal === 'kids_formal_suit.jpg' || imageVal.includes('kids_formal_suit')) {
    return kidsFormalSuit;
  }
  if (imageVal === 'gold_anklets.jpg' || imageVal.includes('gold_anklets')) {
    return goldAnklets;
  }
  if (imageVal === 'diamond_ring.jpg' || imageVal.includes('diamond_ring')) {
    return diamondRing;
  }
  if (imageVal === 'heavy_joker_necklace.jpg' || imageVal.includes('heavy_joker_necklace')) {
    return heavyJokerNecklace;
  }
  if (imageVal === 'simple_chain_jewellery.jpg' || imageVal.includes('simple_chain_jewellery')) {
    return simpleChainJewellery;
  }
  if (imageVal === 'luxe_leather_notebook.jpg' || imageVal.includes('luxe_leather_notebook')) {
    return luxeLeatherNotebook;
  }
  if (imageVal === 'green_anarkali2.jpg' || imageVal.includes('green_anarkali2')) {
    return greenAnarkali2;
  }
  if (imageVal === 'blue_formal_suit2.jpg' || imageVal.includes('blue_formal_suit2')) {
    return blueFormalSuit2;
  }
  if (imageVal === 'school_stationery_kit.jpg' || imageVal.includes('school_stationery_kit')) {
    return schoolStationeryKit;
  }
  if (imageVal === 'bridal_hair_accessory.jpg' || imageVal.includes('bridal_hair_accessory')) {
    return bridalHairAccessory;
  }
  if (imageVal === 'teal_ruffle_frock.jpg' || imageVal.includes('teal_ruffle_frock')) {
    return tealRuffleFrock;
  }
  
  if (isRealImg(imageVal)) {
    if (imageVal.startsWith('/uploads/') || imageVal.startsWith('uploads/')) {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const cleanPath = imageVal.startsWith('/') ? imageVal : `/${imageVal}`;
      return `${BASE_URL}${cleanPath}`;
    }
    return imageVal;
  }
  
  // Fallback map based on category / subCategory / title
  const cat = String(prod.category || '').toUpperCase();
  const sub = String(prod.subCategory || '').toUpperCase();
  const title = String(prod.title || prod.name || '').toLowerCase();
  
  if (cat.includes('CLOTHING') || title.includes('dress') || title.includes('kurti') || title.includes('wear') || title.includes('frock')) {
    const isKids = sub === 'KIDS' || title.includes('kids') || title.includes('girl') || title.includes('boy') || title.includes('baby');
    if (isKids) {
      return clothingUser1;
    }
    return clothingUser2;
  }
  
  if (cat.includes('STATIONERY') || title.includes('pen') || title.includes('book') || title.includes('journal') || title.includes('note')) {
    return imgStationery;
  }
  
  if (cat.includes('GIFT') || title.includes('hamper') || title.includes('box')) {
    return imgGifts;
  }
  
  if (cat.includes('ACCESSORIES') || cat.includes('FANCY') || title.includes('necklace') || title.includes('jewel') || title.includes('ring') || title.includes('bag') || title.includes('gajra') || title.includes('clip')) {
    return imgAccessories;
  }
  
  return imgClothing;
};

export const resolveProductGallery = (prod, selectedColor = '') => {
  if (!prod) return [];
  
  // 1. Check if we have color variants with at least one variant having a valid image
  const hasVariantImages = prod.variants && prod.variants.some(v => v.image && isRealImg(v.image));
  
  if (hasVariantImages) {
    const uniqueColors = [];
    const seenColors = new Set();
    for (const v of prod.variants) {
      if (v.color) {
        const norm = v.color.trim().toLowerCase();
        if (norm && !seenColors.has(norm)) {
          seenColors.add(norm);
          uniqueColors.push(v.color.trim());
        }
      }
    }
    
    if (uniqueColors.length > 0) {
      // Return one image for each unique color
      const galleryImgs = uniqueColors.map(color => {
        // Find first variant for this color that has a valid image
        const match = prod.variants.find(v => v.color?.toLowerCase() === color.toLowerCase() && isRealImg(v.image));
        if (match) return resolveProductImage({ image: match.image });
        
        // Fallback to first variant matching this color regardless of image validity
        const anyMatch = prod.variants.find(v => v.color?.toLowerCase() === color.toLowerCase());
        if (anyMatch && isRealImg(anyMatch.image)) return resolveProductImage({ image: anyMatch.image });
        
        // Fallback to main product images
        if (prod.images && prod.images.length > 0) {
          const realOnes = prod.images.filter(isRealImg);
          if (realOnes.length > 0) return resolveProductImage({ image: realOnes[0] });
        }
        if (isRealImg(prod.image)) return resolveProductImage({ image: prod.image });
        
        // Ultimate fallback to category default image
        return resolveProductImage(prod);
      });
      
      return galleryImgs;
    }
  }

  // 2. Get main product images if no variant images
  let imgs = [];
  if (prod.images && prod.images.length > 0) {
    const realOnes = prod.images.filter(isRealImg);
    if (realOnes.length > 0) imgs = realOnes;
  }
  
  if (imgs.length === 0 && isRealImg(prod.image)) {
    imgs = [prod.image];
  }
  
  if (imgs.length > 0) {
    return imgs.map(img => resolveProductImage({ image: img }));
  }
  
  // 3. Fallback static gallery
  const cat = String(prod.category || '').toUpperCase();
  const sub = String(prod.subCategory || '').toUpperCase();
  const title = String(prod.title || prod.name || '').toLowerCase();
  
  if (cat.includes('CLOTHING') || title.includes('dress') || title.includes('kurti')) {
    const isKids = sub === 'KIDS' || title.includes('kids') || title.includes('girl') || title.includes('boy');
    if (isKids) {
      return [clothingUser1, clothingUser5];
    }
    return [clothingUser2, clothingUser3, clothingUser4];
  }
  
  if (cat.includes('STATIONERY') || title.includes('pen')) {
    return [imgStationery];
  }
  
  if (cat.includes('GIFT')) {
    return [imgGifts];
  }
  
  if (cat.includes('ACCESSORIES')) {
    return [imgAccessories];
  }
  
  return [resolveProductImage(prod)];
};
