const mongoose = require('mongoose');
const { User, Order } = require('../db/database');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithirashoppy';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find().lean();
    console.log('\n--- Users in Database ---');
    users.forEach(u => {
      console.log(`- ID: ${u.id}`);
      console.log(`  Name: ${u.name}`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Cart: ${JSON.stringify(u.cart)}`);
      console.log(`  CartItems Count: ${u.cartItems?.length || 0}`);
      console.log(`  Wishlist: ${JSON.stringify(u.wishlist)}`);
      console.log(`  Addresses Count: ${u.addresses?.length || 0}`);
      console.log(`  OrderIds: ${JSON.stringify(u.orderIds)}`);
    });

    const orders = await Order.find().lean();
    console.log('\n--- Orders in Database ---');
    orders.forEach(o => {
      console.log(`- ID: ${o.id}, UserID: ${o.userId}, Customer: ${o.customer}, Amount: ${o.amount}, Status: ${o.status}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log('DB Connection closed');
  }
}

run();
