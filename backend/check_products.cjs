const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://localhost:27017/mithirashoppy';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const Product = mongoose.connection.model('Product', new mongoose.Schema({}, { strict: false }), 'products');
    const products = await Product.find().lean();
    products.forEach(p => {
      console.log(JSON.stringify(p, null, 2));
    });
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });
