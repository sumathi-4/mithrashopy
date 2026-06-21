const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://localhost:27017/mithirashoppy';

// ── Image resolution helper from ShopView.jsx ──
const isRealImg = (img) => img && (img.startsWith('http') || img.startsWith('/') || img.includes('.') || img.startsWith('data:'));

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const Product = mongoose.connection.model('Product', new mongoose.Schema({}, { strict: false }), 'products');
    const p = await Product.findOne({ name: 'dhothri' }).lean();
    if (!p) {
      console.log('dhothri not found!');
      mongoose.disconnect();
      return;
    }

    let catUpper = (p.category || 'CLOTHING').toUpperCase();
    let cleanCategory = 'CLOTHING';
    let extractedSub = p.subCategory || '';

    if (p.category && p.category.includes('>')) {
      const parts = p.category.split('>').map(x => x.trim());
      const rootCat = parts[0].toUpperCase();
      if (rootCat.includes('CLOTHING')) cleanCategory = 'CLOTHING';
      else if (rootCat.includes('STATIONERY')) cleanCategory = 'STATIONERY';
      else if (rootCat.includes('GIFT')) cleanCategory = 'GIFTS';
      else if (rootCat.includes('ACCESSORIES')) cleanCategory = 'ACCESSORIES';
      else cleanCategory = rootCat;

      extractedSub = parts[parts.length - 1];
    } else {
      if (catUpper.includes('CLOTHING')) cleanCategory = 'CLOTHING';
      else if (catUpper.includes('STATIONERY')) cleanCategory = 'STATIONERY';
      else if (catUpper.includes('GIFT')) cleanCategory = 'GIFTS';
      else if (catUpper.includes('ACCESSORIES')) cleanCategory = 'ACCESSORIES';
      else cleanCategory = catUpper;
    }

    const title = p.name || p.title || 'Product';
    
    // Collect real images from the images array first
    let productImages = [];
    if (p.images && p.images.length > 0) {
      const realOnes = p.images.filter(isRealImg);
      if (realOnes.length > 0) productImages = realOnes;
    }

    // Also add variant images
    if (p.variants && p.variants.length > 0) {
      const varImgs = p.variants.map(v => v.image).filter(img => isRealImg(img));
      varImgs.forEach(vi => { if (!productImages.includes(vi)) productImages.push(vi); });
    }

    // Determine the primary display image
    let finalImage;
    if (productImages.length > 0) {
      finalImage = productImages[0];
    } else if (isRealImg(p.image)) {
      finalImage = p.image;
      productImages = [finalImage];
    } else {
      finalImage = 'fallback-girl';
      productImages = [finalImage];
    }

    console.log('MAPPED PRODUCT:');
    console.log('- image:', finalImage);
    console.log('- images:', productImages);

    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });
