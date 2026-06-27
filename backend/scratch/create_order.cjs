const mongoose = require('mongoose');
const { Product, Order } = require('../db/database');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithirashoppy';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const vendorId = 'c4b4300e-150c-4520-9623-b83ac62f50ed'; // kalai's vendor ID
    
    // Find or create a product for this vendor
    let product = await Product.findOne({ vendorId });
    if (!product) {
      product = await Product.create({
        id: 1671,
        name: 'jwell',
        category: 'Clothing > Women',
        subCategory: 'Jewelry',
        price: 233,
        stock: 100,
        sales: 0,
        status: 'Approved',
        image: 'http://example.com/jewel.png',
        images: ['http://example.com/jewel.png'],
        description: 'Traditional jewelry item',
        brand: 'Local Weaver',
        vendorId
      });
      console.log('Created test product: jwell');
    } else {
      console.log(`Found existing product for vendor: ${product.name}`);
    }

    // Check if order exists
    const orderId = '#ORD1671';
    let order = await Order.findOne({ id: orderId });
    if (order) {
      await Order.deleteOne({ id: orderId });
      console.log('Deleted existing order #ORD1671');
    }

    order = await Order.create({
      id: orderId,
      userId: 'test-user-id',
      customer: 'Anonymous Customer',
      product: product.name,
      amount: 233,
      payment: 'UPI',
      status: 'Processing',
      date: new Date().toISOString(),
      items: [{
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }]
    });
    console.log('Created test order #ORD1671 with status Processing');

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log('DB Connection closed');
  }
}

run();
