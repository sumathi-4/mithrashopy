const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://localhost:27017/mithirashoppy';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const Product = mongoose.connection.model('Product', new mongoose.Schema({}, { strict: false }), 'products');
    const products = await Product.find().lean();
    console.log('PRODUCTS:');
    products.forEach(p => {
      console.log(`- ID: ${p._id}, Title/Name: ${p.title || p.name}, Image: ${p.image}, Images: ${JSON.stringify(p.images)}, Category: ${p.category}`);
    });
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });
