import imgClothing from '../assets/hero_clothing.jpg';
import imgStationery from '../assets/hero_stationery.jpg';
import imgGifts from '../assets/hero_gifts.jpg';
import imgAccessories from '../assets/hero_accessories.jpg';
import clothingUser1 from '../assets/clothing_user_1.jpg';
import clothingUser2 from '../assets/clothing_user_2.jpg';
import clothingUser3 from '../assets/clothing_user_3.jpg';
import clothingUser4 from '../assets/clothing_user_4.jpg';
import clothingUser5 from '../assets/clothing_user_5.jpg';

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
  
  if (isRealImg(imageVal)) {
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
        if (match) return match.image;
        
        // Fallback to first variant matching this color regardless of image validity
        const anyMatch = prod.variants.find(v => v.color?.toLowerCase() === color.toLowerCase());
        if (anyMatch && isRealImg(anyMatch.image)) return anyMatch.image;
        
        // Fallback to main product images
        if (prod.images && prod.images.length > 0) {
          const realOnes = prod.images.filter(isRealImg);
          if (realOnes.length > 0) return realOnes[0];
        }
        if (isRealImg(prod.image)) return prod.image;
        
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
    return imgs;
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
