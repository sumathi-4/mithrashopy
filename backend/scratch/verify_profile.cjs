require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Vendor } = require('../db/database');
const vendorsRouter = require('../routes/vendors');

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
  console.log('🚀 Starting Profile Management Verification Tests...');

  try {
    // Wait for connection to open
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('open', resolve));
    }

    const testId1 = 'v-profile-1-' + Date.now();
    const testId2 = 'v-profile-2-' + Date.now();
    const email1 = `v1-${Date.now()}@domain.com`;
    const email2 = `v2-${Date.now()}@domain.com`;
    const phone1 = '9999911111';
    const phone2 = '9999922222';
    const originalPassword = 'OriginalPassword123!';

    // Clean up any test vendors from prior aborted runs
    await Vendor.deleteMany({ email: { $regex: /^v1-/ } });
    await Vendor.deleteMany({ email: { $regex: /^v2-/ } });

    // Seed two test approved vendors
    const vendor1 = await Vendor.create({
      id: testId1,
      businessName: 'Business One',
      ownerName: 'Owner One',
      email: email1,
      password: bcrypt.hashSync(originalPassword, 12),
      phone: phone1,
      status: 'Approved'
    });

    const vendor2 = await Vendor.create({
      id: testId2,
      businessName: 'Business Two',
      ownerName: 'Owner Two',
      email: email2,
      password: bcrypt.hashSync(originalPassword, 12),
      phone: phone2,
      status: 'Approved'
    });

    const updateProfileHandler = getRouteHandler('/profile', 'put');
    const updateBusinessHandler = getRouteHandler('/profile/business', 'put');
    const updateAddressHandler = getRouteHandler('/profile/address', 'put');
    const updateGstPanHandler = getRouteHandler('/profile/gst-pan', 'put');
    const updateBankHandler = getRouteHandler('/profile/bank', 'put');
    const changePasswordHandler = getRouteHandler('/change-password', 'put');

    // Helper to simulate request authenticated as vendor1
    const runAsVendor1 = async (handler, body) => {
      const req = {
        vendor: vendor1.toObject(),
        body
      };
      const res = mockRes();
      await handler(req, res);
      return res;
    };


    // ─── 1. EMAIL IMMUTABILITY ────────────────────────────────────────────────
    console.log('\n--- 1. Testing Email Immutability ---');
    
    // Vendor tries to change email to new email
    let res = await runAsVendor1(updateProfileHandler, { email: 'new-email@test.com', businessName: 'Business One Updated' });
    let dbV1 = await Vendor.findOne({ id: testId1 });
    
    console.log(`- General profile update ignores email: ${dbV1.email === email1 ? '✅ Passed' : '❌ Failed'}`);
    if (dbV1.email !== email1) throw new Error('Vendor email was successfully updated through general profile endpoint.');

    res = await runAsVendor1(updateBusinessHandler, { email: 'new-email@test.com', businessName: 'Shop One' });
    dbV1 = await Vendor.findOne({ id: testId1 });
    console.log(`- Modular business profile ignores email: ${dbV1.email === email1 ? '✅ Passed' : '❌ Failed'}`);
    if (dbV1.email !== email1) throw new Error('Vendor email was successfully updated through modular business endpoint.');


    // ─── 2. PHONE UNIQUENESS VALIDATION ───────────────────────────────────────
    console.log('\n--- 2. Testing Phone Uniqueness Validation ---');

    // Update vendor1 phone to vendor2's phone
    res = await runAsVendor1(updateBusinessHandler, { phone: phone2 });
    console.log(`- Duplicate phone update returns 409: ${res.statusCode === 409 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 409) throw new Error('Phone uniqueness conflict was not detected.');

    // Update vendor1 phone to a valid unique phone
    const newPhone = '9876540000';
    res = await runAsVendor1(updateBusinessHandler, { phone: newPhone });
    console.log(`- Unique phone update returns 200: ${res.statusCode === 200 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 200) throw new Error('Valid phone number update failed.');
    
    dbV1 = await Vendor.findOne({ id: testId1 });
    console.log(`- Phone persisted in DB: ${dbV1.phone === newPhone ? '✅ Passed' : '❌ Failed'}`);
    if (dbV1.phone !== newPhone) throw new Error('Unique phone was not persisted in database.');


    // ─── 3. RETURN UPDATED OBJECT EXCLUDING PASSWORD ─────────────────────────
    console.log('\n--- 3. Testing Return Updated Payload ---');
    
    res = await runAsVendor1(updateAddressHandler, { street: 'Main Road', city: 'Telangana' });
    console.log(`- Response status: ${res.statusCode} (Expected: 200)`);
    console.log(`- Response returns updated vendor: ${res.responseData.vendor ? '✅ Yes' : '❌ No'}`);
    if (!res.responseData.vendor) throw new Error('Updated vendor object not returned.');
    
    console.log(`- Password field excluded from return payload: ${res.responseData.vendor.password === undefined ? '✅ Yes' : '❌ No'}`);
    if (res.responseData.vendor.password !== undefined) throw new Error('Password returned in update profile response.');


    // ─── 4. ACCESS CONTROL: CANNOT MODIFY ANOTHER VENDOR ───────────────────────
    console.log('\n--- 4. Testing Access Control (Strict Scoping) ---');
    
    // The handlers use req.vendor.id to identify the target vendor document rather than path params
    // So if a logged in vendor tries to modify fields, the update is strictly applied to req.vendor.id
    // Here we verify that req.vendor.id is the only one updated
    res = await runAsVendor1(updateAddressHandler, { street: '123 Avenue' });
    const dbV2 = await Vendor.findOne({ id: testId2 });
    console.log(`- Other vendor's document remains unmodified: ${dbV2.address.street !== '123 Avenue' ? '✅ Passed' : '❌ Failed'}`);
    if (dbV2.address.street === '123 Avenue') throw new Error('Security leak: vendor modified another vendor\'s profile.');

    // Try to modify vendor2's profile fields by passing vendor2's id/vendorId in req.body
    res = await runAsVendor1(updateBusinessHandler, { id: testId2, vendorId: testId2, businessName: 'Hacked Shop' });
    const checkDbV2 = await Vendor.findOne({ id: testId2 });
    console.log(`- Cannot modify other vendor via ID in body: ${checkDbV2.businessName !== 'Hacked Shop' ? '✅ Passed' : '❌ Failed'}`);
    if (checkDbV2.businessName === 'Hacked Shop') throw new Error('Security leak: vendor was able to modify another vendor\'s business name by passing id/vendorId in body.');


    // ─── 5. PASSWORD CHANGE: HASHED AND VERIFIED ──────────────────────────────
    console.log('\n--- 5. Testing Password Change ---');

    const newPassword = 'NewStrongPassword123!';
    res = await runAsVendor1(changePasswordHandler, { currentPassword: 'wrongPassword', newPassword });
    console.log(`- Incorrect current password returns 400: ${res.statusCode === 400 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 400) throw new Error('Incorrect current password check failed.');

    res = await runAsVendor1(changePasswordHandler, { currentPassword: originalPassword, newPassword: 'weak' });
    console.log(`- Weak new password returns 400: ${res.statusCode === 400 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 400) throw new Error('Weak new password validation failed.');

    res = await runAsVendor1(changePasswordHandler, { currentPassword: originalPassword, newPassword });
    console.log(`- Successful password change returns 200: ${res.statusCode === 200 ? '✅ Passed' : '❌ Failed'}`);
    if (res.statusCode !== 200) throw new Error('Valid password change failed.');

    // Check password is still hashed
    dbV1 = await Vendor.findOne({ id: testId1 });
    const isNewPasswordPlainText = dbV1.password === newPassword;
    console.log(`- New password hashed in database: ${!isNewPasswordPlainText ? '✅ Yes' : '❌ No'}`);
    if (isNewPasswordPlainText) throw new Error('New password was saved in plaintext!');

    // Check password hash format is valid bcrypt
    const isBcryptHash = dbV1.password.startsWith('$2a$') || dbV1.password.startsWith('$2b$');
    console.log(`- Password hash format is valid bcrypt: ${isBcryptHash ? '✅ Yes' : '❌ No'}`);
    if (!isBcryptHash) throw new Error('Password is not hashed using bcrypt.');

    // Check we can verify/match it using bcrypt
    const match = bcrypt.compareSync(newPassword, dbV1.password);
    console.log(`- New password verified by bcrypt: ${match ? '✅ Yes' : '❌ No'}`);
    if (!match) throw new Error('Password mismatch in database.');


    // ─── 6. PERSISTENCE AFTER RE-LOGIN ────────────────────────────────────────
    console.log('\n--- 6. Testing Persistence After Re-login ---');

    const loginHandler = getRouteHandler('/login', 'post');
    const loginReq = { body: { email: email1, password: newPassword } };
    const loginRes = mockRes();
    await loginHandler(loginReq, loginRes);
    console.log(`- Login with new password returns 200: ${loginRes.statusCode === 200 ? '✅ Passed' : '❌ Failed'}`);
    if (loginRes.statusCode !== 200) throw new Error('Failed to log in after password change.');

    const token = loginRes.responseData.token;
    if (!token) throw new Error('No token returned in login response.');

    // Authenticate using the new token and get profile
    const { authenticateVendor } = require('../middleware/authMiddleware');
    const getProfileHandler = getRouteHandler('/profile', 'get');

    const getReq = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    const getRes = mockRes();

    let nextCalled = false;
    await authenticateVendor(getReq, getRes, () => { nextCalled = true; });
    if (!nextCalled) {
      throw new Error(`Authentication middleware failed: ${getRes.responseData ? getRes.responseData.message : 'Unknown error'}`);
    }

    await getProfileHandler(getReq, getRes);
    const profileVendor = getRes.responseData.vendor;

    console.log(`- Profile has updated businessName: ${profileVendor.businessName === 'Hacked Shop' ? '✅ Yes' : '❌ No'}`);
    console.log(`- Profile has updated phone: ${profileVendor.phone === newPhone ? '✅ Yes' : '❌ No'}`);
    if (profileVendor.businessName !== 'Hacked Shop') throw new Error('Updated businessName did not persist after re-login.');
    if (profileVendor.phone !== newPhone) throw new Error('Updated phone number did not persist after re-login.');


    // Clean up
    await Vendor.deleteOne({ id: testId1 });
    await Vendor.deleteOne({ id: testId2 });

    console.log('\n🎉 All Vendor Profile Management Verification tests passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Verification failed with error:', err);
    process.exit(1);
  }
}

mongoose.connection.once('open', runTests);
