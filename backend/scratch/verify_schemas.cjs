require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { Vendor, Product, Order, User } = require('../db/database');

async function runTests() {
  console.log('🚀 Starting Schema Verification Tests...');

  try {
    // Wait for connection to open
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('open', resolve));
    }

    // Wait a brief period for the database.js connection then handler (seeding & migrations) to finish
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const testVendorId = 'test-vendor-uuid-' + Date.now();
    const testEmail = `vendor-${Date.now()}@test.com`;
    const testProductId = 99999;
    const testOrderId = 'test-order-id-' + Date.now();

    // Clean up any leftover test data from prior aborted runs
    await Vendor.deleteMany({ id: { $regex: /^test-vendor-uuid-/ } });
    await Product.deleteMany({ id: testProductId });
    await Order.deleteMany({ id: { $regex: /^test-order-id-/ } });

    // 1. Verify Database Indexes
    console.log('\n--- 1. Verifying Database Indexes ---');
    
    // Ensure all indexes are applied
    await Vendor.syncIndexes();
    await Product.syncIndexes();
    await Order.syncIndexes();

    const vendorIndexes = await Vendor.collection.indexes();
    const productIndexes = await Product.collection.indexes();
    const orderIndexes = await Order.collection.indexes();

    const hasVendorEmailIndex = vendorIndexes.some(idx => idx.key.email === 1);
    const hasVendorStatusIndex = vendorIndexes.some(idx => idx.key.status === 1);
    const hasProductVendorIdIndex = productIndexes.some(idx => idx.key.vendorId === 1);
    const hasProductApprovalStatusIndex = productIndexes.some(idx => idx.key.approvalStatus === 1);
    const hasOrderStatusIndex = orderIndexes.some(idx => idx.key.status === 1);

    console.log(`- Vendor Email Index: ${hasVendorEmailIndex ? '✅ Found' : '❌ Missing'}`);
    console.log(`- Vendor Status Index: ${hasVendorStatusIndex ? '✅ Found' : '❌ Missing'}`);
    console.log(`- Product VendorId Index: ${hasProductVendorIdIndex ? '✅ Found' : '❌ Missing'}`);
    console.log(`- Product ApprovalStatus Index: ${hasProductApprovalStatusIndex ? '✅ Found' : '❌ Missing'}`);
    console.log(`- Order Status Index: ${hasOrderStatusIndex ? '✅ Found' : '❌ Missing'}`);

    if (!hasVendorEmailIndex || !hasVendorStatusIndex || !hasProductVendorIdIndex || !hasProductApprovalStatusIndex || !hasOrderStatusIndex) {
      throw new Error('Some required indexes are missing!');
    }

    // 2. Verify Vendor Schema Creation with Statuses and Approvals
    console.log('\n--- 2. Verifying Vendor Schema ---');

    const vendor = await Vendor.create({
      id: testVendorId,
      businessName: 'Test Business',
      ownerName: 'Test Owner',
      email: testEmail,
      password: 'password123',
      phone: '9876543210',
      status: 'Suspended',
      approvedBy: 'admin-user-uuid',
      approvedAt: new Date(),
      gstin: '29ABCDE1234F1Z5',
      pan: 'ABCDE1234F',
      logo: 'http://example.com/logo.png',
      bankDetails: {
        accountHolder: 'Test Owner',
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        bankName: 'SBI'
      }
    });

    console.log('✅ Vendor created successfully!');
    console.log(`- Vendor Status: ${vendor.status} (Expected: Suspended)`);
    console.log(`- Approved By: ${vendor.approvedBy} (Expected: admin-user-uuid)`);
    console.log(`- Approved At: ${vendor.approvedAt instanceof Date ? '✅ Date Object' : '❌ Invalid Date'}`);
    console.log(`- Timestamps: createdAt=${vendor.createdAt}, updatedAt=${vendor.updatedAt}`);

    if (vendor.status !== 'Suspended' || vendor.approvedBy !== 'admin-user-uuid' || !vendor.createdAt || !vendor.updatedAt) {
      throw new Error('Vendor schema properties validation failed.');
    }

    // Clean up test vendor
    await Vendor.deleteOne({ id: testVendorId });

    // 3. Verify Product Status & ApprovalStatus Synchronization
    console.log('\n--- 3. Verifying Product Status Synchronization ---');
    
    // Create new product
    let prod = await Product.create({
      id: testProductId,
      name: 'Sync Test Product',
      price: 100,
      stock: 10,
      status: 'Pending'
    });

    console.log(`- Created product with status: 'Pending' -> approvalStatus: '${prod.approvalStatus}'`);
    if (prod.approvalStatus !== 'Pending') {
      throw new Error('Product approvalStatus did not sync to Pending.');
    }

    // Update status to Active
    prod.status = 'Active';
    await prod.save();
    console.log(`- Saved product with status: 'Active' -> approvalStatus: '${prod.approvalStatus}'`);
    if (prod.approvalStatus !== 'Approved') {
      throw new Error('Product approvalStatus did not sync to Approved when status set to Active.');
    }

    // Update approvalStatus directly to Rejected
    prod.approvalStatus = 'Rejected';
    await prod.save();
    console.log(`- Saved product with approvalStatus: 'Rejected' -> status: '${prod.status}'`);
    if (prod.status !== 'Rejected') {
      throw new Error('Product status did not sync to Rejected when approvalStatus set to Rejected.');
    }

    // Test findOneAndUpdate
    await Product.findOneAndUpdate(
      { id: testProductId },
      { $set: { status: 'Active' } }
    );
    prod = await Product.findOne({ id: testProductId });
    console.log(`- Product.findOneAndUpdate status: 'Active' -> approvalStatus: '${prod.approvalStatus}'`);
    if (prod.approvalStatus !== 'Approved') {
      throw new Error('Product findOneAndUpdate did not sync status and approvalStatus.');
    }

    // Test approvedBy and approvedAt save
    prod.approvedBy = 'admin-user-uuid';
    prod.approvedAt = new Date();
    await prod.save();
    console.log(`- Product approvedBy: '${prod.approvedBy}', approvedAt: '${prod.approvedAt}' saved successfully.`);
    if (prod.approvedBy !== 'admin-user-uuid' || !(prod.approvedAt instanceof Date)) {
      throw new Error('Product approvedBy/approvedAt saving failed.');
    }

    // Clean up test product
    await Product.deleteOne({ id: testProductId });

    // 4. Verify Order Item and Order Schema Modifications
    console.log('\n--- 4. Verifying Order Item Schema ---');
    const order = await Order.create({
      id: testOrderId,
      customer: 'Test Customer',
      product: 'Test Item',
      amount: '₹500',
      date: 'Jun 26, 2026',
      status: 'Pending',
      items: [
        {
          productId: 101,
          name: 'Purple Notebook',
          quantity: 1,
          price: 500,
          vendorId: 'test-vendor-uuid'
        }
      ]
    });

    console.log('✅ Order created successfully!');
    console.log(`- Ordered Item VendorId: ${order.items[0].vendorId} (Expected: test-vendor-uuid)`);
    console.log(`- Order Status: ${order.status} (Expected: Pending)`);

    if (order.items[0].vendorId !== 'test-vendor-uuid') {
      throw new Error('Order item vendorId not saved correctly.');
    }

    // Clean up test order
    await Order.deleteOne({ id: testOrderId });

    // 5. Verify Existing Customer Products without vendorId continue to work
    console.log('\n--- 5. Verifying Existing Customer Products ---');
    const existingProduct = await Product.findOne({ vendorId: null });
    if (existingProduct) {
      console.log(`- Existing product found: id: ${existingProduct.id}, name: "${existingProduct.name}", vendorId: ${existingProduct.vendorId}`);
      console.log(`- Existing product status: "${existingProduct.status}", approvalStatus: "${existingProduct.approvalStatus}"`);
      if (existingProduct.status === 'Active' && existingProduct.approvalStatus !== 'Approved') {
        throw new Error('Existing active product has incorrect approvalStatus.');
      }
      console.log('✅ Existing customer products checked and are compatible!');
    } else {
      console.log('⚠️ No existing platform products (vendorId: null) found in database for check.');
    }

    console.log('\n🎉 All verification tests passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Verification failed with error:', err);
    process.exit(1);
  }
}

mongoose.connection.once('open', runTests);
