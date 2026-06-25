const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://localhost:27017/mithirashoppy';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const Product = mongoose.connection.model('Product', new mongoose.Schema({}, { strict: false }), 'products');
    const products = await Product.find().lean();
    console.log('PRODUCTS IN DB WITH isNewArrival:');
    products.forEach(p => {
      console.log(`- ID: ${p._id}, Title: ${p.title || p.name}, isNewArrival: ${p.isNewArrival}, badge: ${p.badge}`);
    });
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });
