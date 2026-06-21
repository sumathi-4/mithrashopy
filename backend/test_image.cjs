const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://localhost:27017/mithirashoppy';

const isRealImg = (img) => {
  if (!img) return false;
  const str = String(img).toLowerCase();
  return (
    str.startsWith('http') ||
    str.startsWith('/') ||
    str.startsWith('data:') ||
    /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?|$)/.test(str)
  );
};

const resolveProductImage = (prod) => {
  if (!prod) return 'fallback';
  const imageVal = prod.image || '';
  if (isRealImg(imageVal)) {
    return imageVal;
  }
  return 'fallback-to-girl';
};

const resolveProductGallery = (prod) => {
  if (!prod) return [];
  if (prod.images && prod.images.length > 0) {
    const realImgs = prod.images.filter(isRealImg);
    if (realImgs.length > 0) {
      if (prod.variants && prod.variants.length > 0) {
        const varImgs = prod.variants.map(v => v.image).filter(img => isRealImg(img) && !realImgs.includes(img));
        return [...realImgs, ...varImgs];
      }
      return realImgs;
    }
  }
  if (isRealImg(prod.image)) {
    const imgs = [prod.image];
    if (prod.variants && prod.variants.length > 0) {
      const varImgs = prod.variants.map(v => v.image).filter(img => isRealImg(img) && img !== prod.image);
      return [...imgs, ...varImgs];
    }
    return imgs;
  }
  return ['static-fallback'];
};

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const Product = mongoose.connection.model('Product', new mongoose.Schema({}, { strict: false }), 'products');
    const p = await Product.findOne({ name: 'dhothri' }).lean();
    if (!p) {
      console.log('Product dhothri not found!');
    } else {
      console.log('dhothri raw:', JSON.stringify(p, null, 2));
      console.log('isRealImg(p.image):', isRealImg(p.image));
      console.log('resolveProductImage(p):', resolveProductImage(p));
      console.log('resolveProductGallery(p):', resolveProductGallery(p));
    }
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });
