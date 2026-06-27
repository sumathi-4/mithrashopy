require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { User, Vendor, Product, Order } = require('../db/database');
const ordersRouter = require('../routes/orders');
const adminRouter = require('../routes/admin');

const SENT_EMAILS_FILE = path.resolve(__dirname, 'sent_emails.json');

// Mocks helper
function getRouteHandler(router, path, method) {
  const layer = router.stack.find(s => s.route && s.route.path === path && s.route.methods[method]);
  if (!layer) throw new Error(`Route not found: ${method.toUpperCase()} ${path}`);
  return layer.route.stack[layer.route.stack.length - 1].handle;
}

function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    responseData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.responseData = data;
      return this;
    },
    setHeader(name, val) {
      this.headers[name] = val;
      return this;
    }
  };
}

function readSentEmails() {
  if (fs.existsSync(SENT_EMAILS_FILE)) {
    try {
      const data = fs.readFileSync(SENT_EMAILS_FILE, 'utf8');
      return data.trim() ? JSON.parse(data) : [];
    } catch (_) {
      return [];
    }
  }
  return [];
}

async function runTests() {
  console.log('🚀 Starting Email Notification System Verification Tests...');

  try {
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('open', resolve));
    }

    // Reset email log
    if (fs.existsSync(SENT_EMAILS_FILE)) {
      fs.writeFileSync(SENT_EMAILS_FILE, '[]', 'utf8');
    }

    const testTime = Date.now();
    const testUserId = 'u-notify-' + testTime;
    const testVendorId = 'v-notify-' + testTime;
    const testProductId = 99995;
    const testOrderId = 'o-notify-' + testTime;

    const userEmail = `cust-${testTime}@domain.com`;
    const vendorEmail = `seller-${testTime}@domain.com`;

    // ─── Clean up prior data ───
    await User.deleteMany({ id: { $regex: /^u-notify-/ } });
    await Vendor.deleteMany({ id: { $regex: /^v-notify-/ } });
    await Product.deleteMany({ id: testProductId });
    await Order.deleteMany({ id: { $regex: /^o-notify-/ } });

    // Seed test user, vendor, order, and product
    const customer = await User.create({
      id: testUserId,
      name: 'Customer Name',
      email: userEmail,
      password: 'Password123!'
    });

    const vendor = await Vendor.create({
      id: testVendorId,
      businessName: 'Business Name',
      ownerName: 'Owner Name',
      email: vendorEmail,
      password: 'Password123!',
      phone: '9999988888',
      status: 'Pending'
    });

    const product = await Product.create({
      id: testProductId,
      name: 'Vendor Novelty Mug',
      price: 299,
      stock: 20,
      vendorId: testVendorId,
      status: 'Pending'
    });

    const order = await Order.create({
      id: testOrderId,
      userId: testUserId,
      customer: 'Customer Name',
      product: 'Vendor Novelty Mug',
      amount: '₹299',
      date: 'Jun 27, 2026',
      status: 'Pending',
      items: [
        {
          productId: testProductId,
          name: 'Vendor Novelty Mug',
          quantity: 1,
          price: 299,
          vendorId: testVendorId
        }
      ]
    });

    // Get route handlers
    const updateOrderStatusHandler = getRouteHandler(ordersRouter, '/:id', 'put');
    const updateVendorStatusHandler = getRouteHandler(adminRouter, '/vendors/:id/status', 'put');
    const updateProductStatusHandler = getRouteHandler(adminRouter, '/products/:id/status', 'put');

    // ─── 1. TEST CUSTOMER ORDER STATUS EMAIL ──────────────────────────────────
    console.log('\n--- 1. Testing Customer Order Status Email ---');
    
    // Update order status to 'Shipped' simulating admin request
    const orderReq = {
      params: { id: testOrderId },
      body: { status: 'Shipped' }
    };
    const orderRes = mockRes();
    await updateOrderStatusHandler(orderReq, orderRes);

    console.log(`- API Update status code: ${orderRes.statusCode} (Expected: 200)`);
    if (orderRes.statusCode !== 200) throw new Error('Order status update failed.');

    let sent = readSentEmails();
    const orderEmail = sent.find(e => e.type === 'customer_order_status');
    
    console.log(`- Email logged to JSON: ${orderEmail ? '✅ Yes' : '❌ No'}`);
    if (!orderEmail) throw new Error('Order status email was not generated.');

    console.log(`- Recipient email matches customer: ${orderEmail.to === userEmail ? '✅ Yes' : '❌ No'}`);
    console.log(`- Subject contains order ID: ${orderEmail.subject.includes(testOrderId) ? '✅ Yes' : '❌ No'}`);
    console.log(`- Body contains updated status Shipped: ${orderEmail.body.includes('Shipped') ? '✅ Yes' : '❌ No'}`);

    if (orderEmail.to !== userEmail || !orderEmail.subject.includes(testOrderId) || !orderEmail.body.includes('Shipped')) {
      throw new Error('Order status email content verification failed.');
    }

    // ─── 2. TEST VENDOR APPROVAL EMAIL ────────────────────────────────────────
    console.log('\n--- 2. Testing Vendor Approval Email ---');

    // Approve the vendor simulating admin request
    const vendorReq = {
      params: { id: testVendorId },
      body: { status: 'Approved' }
    };
    const vendorRes = mockRes();
    await updateVendorStatusHandler(vendorReq, vendorRes);

    console.log(`- API Update status code: ${vendorRes.statusCode} (Expected: 200)`);
    if (vendorRes.statusCode !== 200) throw new Error('Vendor approval update failed.');

    sent = readSentEmails();
    const approvalEmail = sent.find(e => e.type === 'vendor_approval');

    console.log(`- Email logged to JSON: ${approvalEmail ? '✅ Yes' : '❌ No'}`);
    if (!approvalEmail) throw new Error('Vendor approval email was not generated.');

    console.log(`- Recipient email matches vendor: ${approvalEmail.to === vendorEmail ? '✅ Yes' : '❌ No'}`);
    console.log(`- Body contains business name: ${approvalEmail.body.includes('Business Name') ? '✅ Yes' : '❌ No'}`);

    if (approvalEmail.to !== vendorEmail || !approvalEmail.body.includes('Business Name')) {
      throw new Error('Vendor approval email content verification failed.');
    }

    // ─── 3. TEST VENDOR PRODUCT APPROVAL EMAIL ────────────────────────────────
    console.log('\n--- 3. Testing Vendor Product Approval Email ---');

    // Approve the product to Active simulating admin request
    const prodReq = {
      params: { id: String(testProductId) },
      body: { status: 'Active' }
    };
    const prodRes = mockRes();
    await updateProductStatusHandler(prodReq, prodRes);

    console.log(`- API Update status code: ${prodRes.statusCode} (Expected: 200)`);
    if (prodRes.statusCode !== 200) throw new Error('Product approval update failed.');

    sent = readSentEmails();
    const productEmail = sent.find(e => e.type === 'vendor_product_approval' && e.status === 'APPROVED');

    console.log(`- Email logged to JSON: ${productEmail ? '✅ Yes' : '❌ No'}`);
    if (!productEmail) throw new Error('Product approval email was not generated.');

    console.log(`- Recipient email matches vendor: ${productEmail.to === vendorEmail ? '✅ Yes' : '❌ No'}`);
    console.log(`- Body contains product name: ${productEmail.body.includes('Vendor Novelty Mug') ? '✅ Yes' : '❌ No'}`);

    if (productEmail.to !== vendorEmail || !productEmail.body.includes('Vendor Novelty Mug')) {
      throw new Error('Vendor product approval email content verification failed.');
    }

    // Test rejection email flow
    const rejectReq = {
      params: { id: String(testProductId) },
      body: { status: 'Rejected', rejectReason: 'Improper product image.' }
    };
    const rejectRes = mockRes();
    await updateProductStatusHandler(rejectReq, rejectRes);

    sent = readSentEmails();
    const productRejectEmail = sent.find(e => e.type === 'vendor_product_approval' && e.status === 'REJECTED');

    console.log(`- Rejection email logged to JSON: ${productRejectEmail ? '✅ Yes' : '❌ No'}`);
    if (!productRejectEmail) throw new Error('Product rejection email was not generated.');
    console.log(`- Body contains reject reason: ${productRejectEmail.body.includes('Improper product image.') ? '✅ Yes' : '❌ No'}`);

    if (!productRejectEmail.body.includes('Improper product image.')) {
      throw new Error('Vendor product rejection email reason verification failed.');
    }

    // ─── 4. TEST VENDOR REJECTION EMAIL ───────────────────────────────────────
    console.log('\n--- 4. Testing Vendor Rejection Email ---');

    const testVendorIdReject = 'v-notify-reject-' + testTime;
    await Vendor.create({
      id: testVendorIdReject,
      businessName: 'Rejected Vendor Corp',
      ownerName: 'Rejected Owner',
      email: 'vendor-reject@domain.com',
      password: 'Password123!',
      phone: '9999900000',
      status: 'Pending'
    });

    const vendorRejectReq = {
      params: { id: testVendorIdReject },
      body: { status: 'Rejected', rejectReason: 'Invalid GSTIN document.' }
    };
    const vendorRejectRes = mockRes();
    await updateVendorStatusHandler(vendorRejectReq, vendorRejectRes);

    console.log(`- API Update status code: ${vendorRejectRes.statusCode} (Expected: 200)`);
    if (vendorRejectRes.statusCode !== 200) throw new Error('Vendor rejection status update failed.');

    sent = readSentEmails();
    const rejectionEmail = sent.find(e => e.type === 'vendor_rejection');

    console.log(`- Email logged to JSON: ${rejectionEmail ? '✅ Yes' : '❌ No'}`);
    if (!rejectionEmail) throw new Error('Vendor rejection email was not generated.');

    console.log(`- Recipient email matches: ${rejectionEmail.to === 'vendor-reject@domain.com' ? '✅ Yes' : '❌ No'}`);
    console.log(`- Body contains reject reason: ${rejectionEmail.body.includes('Invalid GSTIN document.') ? '✅ Yes' : '❌ No'}`);

    if (rejectionEmail.to !== 'vendor-reject@domain.com' || !rejectionEmail.body.includes('Invalid GSTIN document.')) {
      throw new Error('Vendor rejection email verification failed.');
    }

    // Clean up
    await User.deleteMany({ id: { $regex: /^u-notify-/ } });
    await Vendor.deleteMany({ id: { $regex: /^v-notify-/ } });
    await Product.deleteMany({ id: testProductId });
    await Order.deleteMany({ id: { $regex: /^o-notify-/ } });

    // Reset email log
    fs.writeFileSync(SENT_EMAILS_FILE, '[]', 'utf8');

    console.log('\n🎉 All Email Notification System verification tests passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Verification failed with error:', err);
    process.exit(1);
  }
}

mongoose.connection.once('open', runTests);
