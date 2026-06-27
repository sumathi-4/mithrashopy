require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Vendor } = require('../db/database');
const vendorsRouter = require('../routes/vendors');
const { authenticateVendor } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET;

// Helper to mock req/res and invoke Express router handlers
function getRouteHandler(path, method) {
  const layer = vendorsRouter.stack.find(s => s.route && s.route.path === path && s.route.methods[method]);
  if (!layer) throw new Error(`Route not found: ${method.toUpperCase()} ${path}`);
  return layer.route.stack[layer.route.stack.length - 1].handle;
}

function mockRes() {
  const res = {
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
  return res;
}

async function runTests() {
  console.log('🚀 Starting Vendor Authentication Verification Tests...');

  try {
    // Wait for connection to open
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('open', resolve));
    }

    const testEmail = `auth-test-${Date.now()}@domain.com`;
    const testPassword = 'StrongPassword123!';
    let testVendorId = null;

    // Clean up any test vendors from prior aborted runs
    await Vendor.deleteMany({ email: { $regex: /^auth-test-/ } });

    const registerHandler = getRouteHandler('/register', 'post');
    const loginHandler = getRouteHandler('/login', 'post');
    
    const profileRoute = vendorsRouter.stack.find(s => s.route && s.route.path === '/me' && s.route.methods.get);
    if (!profileRoute) throw new Error('Route not found: GET /me');
    const profileHandler = profileRoute.route.stack[profileRoute.route.stack.length - 1].handle;

    // ─── 1. REGISTER VALIDATIONS ──────────────────────────────────────────────
    console.log('\n--- 1. Testing Registration Validation ---');

    // Test missing fields
    let req = { body: { businessName: 'Business' } };
    let res = mockRes();
    await registerHandler(req, res);
    console.log(`- Missing fields returns 400: ${res.statusCode === 400 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 400) throw new Error('Missing fields check failed.');

    // Test invalid email
    req = { body: { businessName: 'B', ownerName: 'O', email: 'invalid', phone: '9876543210', password: testPassword } };
    res = mockRes();
    await registerHandler(req, res);
    console.log(`- Invalid email returns 400: ${res.statusCode === 400 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 400) throw new Error('Email format validation check failed.');

    // Test invalid phone
    req = { body: { businessName: 'B', ownerName: 'O', email: testEmail, phone: '123', password: testPassword } };
    res = mockRes();
    await registerHandler(req, res);
    console.log(`- Invalid phone returns 400: ${res.statusCode === 400 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 400) throw new Error('Phone format validation check failed.');

    // Test weak password
    req = { body: { businessName: 'B', ownerName: 'O', email: testEmail, phone: '9876543210', password: 'weak' } };
    res = mockRes();
    await registerHandler(req, res);
    console.log(`- Weak password returns 400: ${res.statusCode === 400 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 400) throw new Error('Weak password validation check failed.');

    // Test invalid GSTIN (optional)
    req = { body: { businessName: 'B', ownerName: 'O', email: testEmail, phone: '9876543210', password: testPassword, gstin: 'invalid' } };
    res = mockRes();
    await registerHandler(req, res);
    console.log(`- Invalid GSTIN returns 400: ${res.statusCode === 400 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 400) throw new Error('GSTIN format validation check failed.');

    // Test invalid PAN (optional)
    req = { body: { businessName: 'B', ownerName: 'O', email: testEmail, phone: '9876543210', password: testPassword, pan: 'invalid' } };
    res = mockRes();
    await registerHandler(req, res);
    console.log(`- Invalid PAN returns 400: ${res.statusCode === 400 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 400) throw new Error('PAN format validation check failed.');


    // ─── 2. SUCCESSFUL REGISTRATION ───────────────────────────────────────────
    console.log('\n--- 2. Testing Successful Registration ---');
    req = { body: { businessName: 'Auth Test Shop', ownerName: 'Auth Owner', email: testEmail, phone: '9876543210', password: testPassword } };
    res = mockRes();
    await registerHandler(req, res);
    console.log(`- Successful registration returns 201: ${res.statusCode === 201 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 201) throw new Error('Valid registration failed.');
    
    testVendorId = res.responseData.vendor.id;
    console.log(`- Vendor registered with status: ${res.responseData.vendor.status} (Expected: Pending)`);
    if (res.responseData.vendor.status !== 'Pending') throw new Error('Vendor default status is not Pending.');

    // Verify Password was hashed
    const dbVendor = await Vendor.findOne({ id: testVendorId });
    const isPasswordPlainText = dbVendor.password === testPassword;
    console.log(`- Password hashed (not plaintext): ${!isPasswordPlainText ? '✅ Yes' : '❌ No'}`);
    if (isPasswordPlainText) throw new Error('Password was saved in plaintext!');


    // ─── 3. DUPLICATE EMAIL CHECK ─────────────────────────────────────────────
    console.log('\n--- 3. Testing Duplicate Email Check ---');
    req = { body: { businessName: 'B', ownerName: 'O', email: testEmail, phone: '9876543210', password: testPassword } };
    res = mockRes();
    await registerHandler(req, res);
    console.log(`- Duplicate registration returns 409: ${res.statusCode === 409 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 409) throw new Error('Duplicate email registration did not return 409 Conflict.');


    // ─── 4. LOGIN ACCESS CONTROL BY STATUS ────────────────────────────────────
    console.log('\n--- 4. Testing Login Access Control By Status ---');

    // Case A: PENDING
    req = { body: { email: testEmail, password: testPassword } };
    res = mockRes();
    await loginHandler(req, res);
    console.log(`- Pending vendor login returns 403: ${res.statusCode === 403 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 403 || res.responseData.status !== 'Pending') {
      throw new Error('Pending login access control failed.');
    }

    // Case B: REJECTED
    await Vendor.updateOne({ id: testVendorId }, { $set: { status: 'Rejected', rejectReason: 'Wrong documents' } });
    res = mockRes();
    await loginHandler(req, res);
    console.log(`- Rejected vendor login returns 403: ${res.statusCode === 403 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 403 || res.responseData.status !== 'Rejected') {
      throw new Error('Rejected login access control failed.');
    }

    // Case C: SUSPENDED
    await Vendor.updateOne({ id: testVendorId }, { $set: { status: 'Suspended' } });
    res = mockRes();
    await loginHandler(req, res);
    console.log(`- Suspended vendor login returns 403: ${res.statusCode === 403 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 403 || res.responseData.status !== 'Suspended') {
      throw new Error('Suspended login access control failed.');
    }

    // Case D: APPROVED (Should Login successfully)
    await Vendor.updateOne({ id: testVendorId }, { $set: { status: 'Approved' } });
    res = mockRes();
    await loginHandler(req, res);
    console.log(`- Approved vendor login returns 200: ${res.statusCode === 200 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 200) {
      throw new Error(`Approved login failed with status ${res.statusCode}: ${res.responseData ? res.responseData.message : ''}`);
    }

    const { token, vendor: loggedInVendor } = res.responseData;
    console.log(`- Token returned: ${token ? '✅ Yes' : '❌ No'}`);
    if (!token) throw new Error('No JWT token returned upon login.');

    // Verify response message and structure
    console.log(`- Response message: "${res.responseData.message}" (Expected: "Login successful.")`);
    if (res.responseData.message !== 'Login successful.') {
      throw new Error(`Login response message is incorrect: "${res.responseData.message}"`);
    }

    const vendorKeys = Object.keys(loggedInVendor);
    const expectedKeys = ['id', 'businessName', 'ownerName', 'email', 'status'];
    const hasCorrectKeys = expectedKeys.every(k => vendorKeys.includes(k)) && vendorKeys.length === expectedKeys.length;
    console.log(`- Vendor object has exactly expected keys: ${hasCorrectKeys ? '✅ Yes' : '❌ No'}`);
    if (!hasCorrectKeys) {
      throw new Error(`Vendor response structure keys are incorrect: ${JSON.stringify(vendorKeys)}`);
    }

    // Verify JWT Token
    const decodedToken = jwt.verify(token, JWT_SECRET);
    console.log(`- JWT payload role is vendor: ${decodedToken.role === 'vendor' ? '✅ Yes' : '❌ No'}`);
    if (decodedToken.role !== 'vendor') throw new Error('JWT role payload mismatch.');

    // Verify Expiry (7 days)
    const tokenAgeSec = decodedToken.exp - decodedToken.iat;
    const expectedAgeSec = 7 * 24 * 60 * 60; // 7 days in seconds
    console.log(`- JWT expiration time: ${tokenAgeSec}s (Expected: ${expectedAgeSec}s)`);
    if (Math.abs(tokenAgeSec - expectedAgeSec) > 10) throw new Error('JWT expiration time is not 7 days.');

    // Verify lastLoginAt field was updated
    const updatedVendor = await Vendor.findOne({ id: testVendorId });
    console.log(`- lastLoginAt updated: ${updatedVendor.lastLoginAt instanceof Date ? '✅ Yes' : '❌ No'}`);
    if (!(updatedVendor.lastLoginAt instanceof Date)) throw new Error('lastLoginAt was not updated on successful login.');


    // ─── 5. MIDDLEWARE ACCESS CONTROL BY STATUS ───────────────────────────────
    console.log('\n--- 5. Testing authenticateVendor Middleware Access Control ---');

    const invokeMiddleware = async (tokenString) => {
      let middlewareErr = null;
      let nextCalled = false;
      const mReq = {
        headers: tokenString ? { authorization: `Bearer ${tokenString}` } : {}
      };
      const mRes = mockRes();
      const mNext = (err) => {
        if (err) middlewareErr = err;
        nextCalled = true;
      };

      await authenticateVendor(mReq, mRes, mNext);
      return { req: mReq, res: mRes, nextCalled, middlewareErr };
    };

    // Case A: Missing token
    let mResult = await invokeMiddleware(null);
    console.log(`- Missing token middleware returns 401: ${mResult.res.statusCode === 401 ? '✅ Passed' : '❌ Failed'}`);
    if (mResult.res.statusCode !== 401) throw new Error('Middleware missing token check failed.');

    // Case B: Approved token access
    mResult = await invokeMiddleware(token);
    console.log(`- Approved vendor token middleware calls next(): ${mResult.nextCalled && !mResult.res.responseData ? '✅ Passed' : '❌ Failed'}`);
    if (!mResult.nextCalled || mResult.res.statusCode !== 200) throw new Error('Approved vendor blocked by middleware.');

    // Case C: Pending vendor token access (we generate a token using our payload for testing)
    await Vendor.updateOne({ id: testVendorId }, { $set: { status: 'Pending' } });
    mResult = await invokeMiddleware(token);
    console.log(`- Pending vendor token middleware returns 403: ${mResult.res.statusCode === 403 && mResult.res.responseData.status === 'Pending' ? '✅ Passed' : '❌ Failed'}`);
    if (mResult.res.statusCode !== 403) throw new Error('Pending vendor not blocked by middleware.');

    // Case D: Rejected vendor token access
    await Vendor.updateOne({ id: testVendorId }, { $set: { status: 'Rejected' } });
    mResult = await invokeMiddleware(token);
    console.log(`- Rejected vendor token middleware returns 403: ${mResult.res.statusCode === 403 && mResult.res.responseData.status === 'Rejected' ? '✅ Passed' : '❌ Failed'}`);
    if (mResult.res.statusCode !== 403) throw new Error('Rejected vendor not blocked by middleware.');

    // Case E: Suspended vendor token access
    await Vendor.updateOne({ id: testVendorId }, { $set: { status: 'Suspended' } });
    mResult = await invokeMiddleware(token);
    console.log(`- Suspended vendor token middleware returns 403: ${mResult.res.statusCode === 403 && mResult.res.responseData.status === 'Suspended' ? '✅ Passed' : '❌ Failed'}`);
    if (mResult.res.statusCode !== 403) throw new Error('Suspended vendor not blocked by middleware.');


    // Clean up test vendor
    await Vendor.deleteOne({ id: testVendorId });

    console.log('\n🎉 All Vendor Authentication Verification tests passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Verification failed with error:', err);
    process.exit(1);
  }
}

mongoose.connection.once('open', runTests);
