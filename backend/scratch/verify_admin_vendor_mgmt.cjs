require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { Vendor } = require('../db/database');
const adminRouter = require('../routes/admin');

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

async function runTests() {
  console.log('🚀 Starting Admin Vendor Management Verification Tests...');

  try {
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('open', resolve));
    }

    const testTime = Date.now();
    const vendorId1 = 'v-mgmt-1-' + testTime;
    const vendorId2 = 'v-mgmt-2-' + testTime;

    const email1 = `v1-${testTime}@test.com`;
    const email2 = `v2-${testTime}@test.com`;

    // Clean up prior runs
    await Vendor.deleteMany({ id: { $regex: /^v-mgmt-/ } });

    // Seed test vendors
    const vendor1 = await Vendor.create({
      id: vendorId1,
      businessName: 'Original Business Name',
      ownerName: 'Original Owner',
      email: email1,
      password: 'Password123!',
      phone: '9876543210',
      status: 'Approved'
    });

    const vendor2 = await Vendor.create({
      id: vendorId2,
      businessName: 'Other Vendor',
      ownerName: 'Other Owner',
      email: email2,
      password: 'Password123!',
      phone: '8765432109',
      status: 'Approved'
    });

    const editVendorHandler = getRouteHandler(adminRouter, '/vendors/:id', 'put');
    const updateStatusHandler = getRouteHandler(adminRouter, '/vendors/:id/status', 'put');

    // ─── 1. Test Admin Edit Vendor Details ───
    console.log('\n--- 1. Testing Admin Edit Vendor Details ---');
    const reqEdit = {
      params: { id: vendorId1 },
      body: {
        businessName: 'Updated Business Corp',
        ownerName: 'Updated Owner Name',
        phone: '9123456780',
        businessCategory: 'Textiles',
        gstin: '33ABCDE1234F1Z0',
        pan: 'ABCDE5678F',
        bankDetails: {
          accountHolder: 'Updated Holder',
          accountNumber: '9988776655',
          ifscCode: 'ICIC0000123',
          bankName: 'ICICI Bank'
        },
        address: {
          street: '123 Cotton Road',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          pincode: '641001'
        }
      }
    };
    const resEdit = mockRes();
    await editVendorHandler(reqEdit, resEdit);

    console.log(`- API Update status code: ${resEdit.statusCode} (Expected: 200)`);
    if (resEdit.statusCode !== 200) {
      throw new Error('Admin edit vendor details API failed.');
    }

    const updatedV1 = await Vendor.findOne({ id: vendorId1 }).lean();
    console.log(`- Business name updated: ${updatedV1.businessName === 'Updated Business Corp' ? '✅ Yes' : '❌ No'}`);
    console.log(`- Phone number updated: ${updatedV1.phone === '9123456780' ? '✅ Yes' : '❌ No'}`);
    console.log(`- Category updated: ${updatedV1.businessCategory === 'Textiles' ? '✅ Yes' : '❌ No'}`);
    console.log(`- GSTIN/PAN updated: ${updatedV1.gstin === '33ABCDE1234F1Z0' && updatedV1.pan === 'ABCDE5678F' ? '✅ Yes' : '❌ No'}`);
    console.log(`- Bank Details updated: ${updatedV1.bankDetails?.bankName === 'ICICI Bank' ? '✅ Yes' : '❌ No'}`);
    console.log(`- Address Details updated: ${updatedV1.address?.city === 'Coimbatore' ? '✅ Yes' : '❌ No'}`);

    if (
      updatedV1.businessName !== 'Updated Business Corp' ||
      updatedV1.phone !== '9123456780' ||
      updatedV1.gstin !== '33ABCDE1234F1Z0' ||
      updatedV1.bankDetails?.bankName !== 'ICICI Bank'
    ) {
      throw new Error('Persisted edit vendor details mismatches update payload.');
    }

    // ─── 2. Test Phone Uniqueness Verification ───
    console.log('\n--- 2. Testing Phone Uniqueness Constraints ---');
    const reqDuplicatePhone = {
      params: { id: vendorId1 },
      body: {
        phone: '8765432109' // Already registered by vendor2
      }
    };
    const resDuplicatePhone = mockRes();
    await editVendorHandler(reqDuplicatePhone, resDuplicatePhone);

    console.log(`- Duplicate phone edit returns 409: ${resDuplicatePhone.statusCode === 409 ? '✅ Passed' : '❌ Failed'}`);
    if (resDuplicatePhone.statusCode !== 409) {
      throw new Error('Admin edit vendor allowed duplicate phone number registration.');
    }

    // ─── 3. Test Suspend Vendor Status ───
    console.log('\n--- 3. Testing Suspend Vendor status ---');
    const reqSuspend = {
      params: { id: vendorId1 },
      body: {
        status: 'Suspended'
      }
    };
    const resSuspend = mockRes();
    await updateStatusHandler(reqSuspend, resSuspend);

    console.log(`- API Update status code: ${resSuspend.statusCode} (Expected: 200)`);
    if (resSuspend.statusCode !== 200) {
      throw new Error('Suspend status update API failed.');
    }

    const suspendedV1 = await Vendor.findOne({ id: vendorId1 }).lean();
    console.log(`- Vendor status is Suspended: ${suspendedV1.status === 'Suspended' ? '✅ Yes' : '❌ No'}`);
    if (suspendedV1.status !== 'Suspended') {
      throw new Error('Vendor status failed to update to Suspended in DB.');
    }

    // Clean up
    await Vendor.deleteMany({ id: { $regex: /^v-mgmt-/ } });

    console.log('\n🎉 All Admin Vendor Management verification tests passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Verification failed with error:', err);
    process.exit(1);
  }
}

mongoose.connection.once('open', runTests);
