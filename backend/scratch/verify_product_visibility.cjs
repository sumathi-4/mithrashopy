require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Product } = require('../db/database');
const productsRouter = require('../routes/products');

const JWT_SECRET = process.env.JWT_SECRET;

function getRouteHandler(path, method) {
  const layer = productsRouter.stack.find(s => s.route && s.route.path === path && s.route.methods[method]);
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
  console.log('🚀 Starting Product Visibility Verification Tests...');

  try {
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('open', resolve));
    }

    const testId1 = 99991;
    const testId2 = 99992;

    // Clean up
    await Product.deleteMany({ id: { $in: [testId1, testId2] } });

    // Seed one Pending product and one Active product
    const pendingProduct = await Product.create({
      id: testId1,
      name: 'Unapproved Seller Product',
      price: 150,
      stock: 5,
      status: 'Pending'
    });

    const approvedProduct = await Product.create({
      id: testId2,
      name: 'Approved Seller Product',
      price: 250,
      stock: 12,
      status: 'Active'
    });

    const getProductsHandler = getRouteHandler('/', 'get');
    const getProductDetailHandler = getRouteHandler('/:id', 'get');

    // ─── 1. Guest/Customer list queries ───
    console.log('\n--- 1. Guest/Customer Products Query ---');
    const reqGuestList = { headers: {} };
    const resGuestList = mockRes();
    await getProductsHandler(reqGuestList, resGuestList);

    const guestList = resGuestList.responseData.products;
    const hasPendingInGuestList = guestList.some(p => p.id === testId1);
    const hasApprovedInGuestList = guestList.some(p => p.id === testId2);

    console.log(`- Guest list contains approved product: ${hasApprovedInGuestList ? '✅ Passed' : '❌ Failed'}`);
    console.log(`- Guest list excludes pending product: ${!hasPendingInGuestList ? '✅ Passed' : '❌ Failed'}`);

    if (!hasApprovedInGuestList || hasPendingInGuestList) {
      throw new Error('Unapproved products leak to guests/customers.');
    }

    // ─── 2. Guest/Customer detail queries ───
    console.log('\n--- 2. Guest/Customer Product Details Query ---');
    const reqGuestDetail1 = { params: { id: String(testId1) }, headers: {} };
    const resGuestDetail1 = mockRes();
    await getProductDetailHandler(reqGuestDetail1, resGuestDetail1);

    console.log(`- Guest detail unapproved returns 404: ${resGuestDetail1.statusCode === 404 ? '✅ Passed' : '❌ Failed'}`);
    if (resGuestDetail1.statusCode !== 404) {
      throw new Error('Guest was able to access unapproved product details.');
    }

    const reqGuestDetail2 = { params: { id: String(testId2) }, headers: {} };
    const resGuestDetail2 = mockRes();
    await getProductDetailHandler(reqGuestDetail2, resGuestDetail2);

    console.log(`- Guest detail approved returns 200: ${resGuestDetail2.statusCode === 200 ? '✅ Passed' : '❌ Failed'}`);
    if (resGuestDetail2.statusCode !== 200 || resGuestDetail2.responseData.product.id !== testId2) {
      throw new Error('Guest was unable to retrieve approved product details.');
    }

    // ─── 3. Admin queries (bypass restrictions) ───
    console.log('\n--- 3. Admin Products Query (Bypass Check) ---');
    
    // Generate valid admin token
    const adminToken = jwt.sign({ id: 'admin-uuid', role: 'admin' }, JWT_SECRET);

    const reqAdminList = {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    };
    const resAdminList = mockRes();
    await getProductsHandler(reqAdminList, resAdminList);

    const adminList = resAdminList.responseData.products;
    const hasPendingInAdminList = adminList.some(p => p.id === testId1);
    const hasApprovedInAdminList = adminList.some(p => p.id === testId2);

    console.log(`- Admin list contains approved product: ${hasApprovedInAdminList ? '✅ Passed' : '❌ Failed'}`);
    console.log(`- Admin list contains pending product: ${hasPendingInAdminList ? '✅ Passed' : '❌ Failed'}`);

    if (!hasApprovedInAdminList || !hasPendingInAdminList) {
      throw new Error('Admin did not see pending products in general list query.');
    }

    const reqAdminDetail1 = {
      params: { id: String(testId1) },
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    };
    const resAdminDetail1 = mockRes();
    await getProductDetailHandler(reqAdminDetail1, resAdminDetail1);

    console.log(`- Admin detail unapproved returns 200: ${resAdminDetail1.statusCode === 200 ? '✅ Passed' : '❌ Failed'}`);
    if (resAdminDetail1.statusCode !== 200 || resAdminDetail1.responseData.product.id !== testId1) {
      throw new Error('Admin was unable to access unapproved product details.');
    }

    // Clean up
    await Product.deleteMany({ id: { $in: [testId1, testId2] } });

    console.log('\n🎉 All Product Visibility Verification tests passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Verification failed with error:', err);
    process.exit(1);
  }
}

mongoose.connection.once('open', runTests);
