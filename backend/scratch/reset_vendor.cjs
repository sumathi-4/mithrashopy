const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Vendor } = require('../db/database');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithirashoppy';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const vendors = await Vendor.find().lean();
    console.log('Current Vendors in Database:');
    vendors.forEach(v => {
      console.log(`- ID: ${v.id}, Business: ${v.businessName}, Email: ${v.email}, Status: ${v.status}`);
    });

    // If there is any vendor, reset their password to a known one
    if (vendors.length > 0) {
      const vendorToReset = vendors[0];
      const hashed = bcrypt.hashSync('Password123!', 12);
      await Vendor.updateOne(
        { id: vendorToReset.id },
        { $set: { password: hashed, status: 'Approved' } }
      );
      console.log(`\nUpdated vendor ${vendorToReset.email} password to 'Password123!' and status to 'Approved'`);
    } else {
      // Create a test vendor
      const hashed = bcrypt.hashSync('Password123!', 12);
      const newVendor = await Vendor.create({
        id: 'test-vendor-uuid',
        businessName: 'Mathi Stores',
        ownerName: 'Mathi',
        email: 'mathi@gmail.com',
        phone: '9876543210',
        password: hashed,
        status: 'Approved',
        gstin: '29ABCDE1234F1Z5',
        pan: 'ABCDE1234F',
        businessCategory: 'Clothing',
        businessDescription: 'Premium fashion collections'
      });
      console.log(`\nCreated new approved vendor: mathi@gmail.com with password 'Password123!'`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log('DB Connection closed');
  }
}

run();
