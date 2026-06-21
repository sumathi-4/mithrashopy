const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithirashoppy';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const Product = mongoose.connection.model('Product', new mongoose.Schema({}, { strict: false }), 'products');
    const Category = mongoose.connection.model('Category', new mongoose.Schema({}, { strict: false }), 'categories');
    
    const products = await Product.find({ name: /checked/i }).lean();
    console.log('PRODUCTS:', JSON.stringify(products, null, 2));
    
    const categories = await Category.find().lean();
    console.log('CATEGORIES:', JSON.stringify(categories, null, 2));
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });
