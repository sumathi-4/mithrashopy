const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Vendor, Product, Order, VendorNotification } = require('../db/database');
const { authenticateVendor } = require('../middleware/authMiddleware');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ─── Helper ───────────────────────────────────────────────────────────────────
function generateVendorToken(vendor) {
  return jwt.sign(
    { id: vendor.id, email: vendor.email, businessName: vendor.businessName, role: 'vendor' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function safeVendor(v) {
  const { password, ...rest } = v;
  return rest;
}

async function pushNotification(vendorId, type, title, message, metadata = {}) {
  try {
    await VendorNotification.create({ vendorId, type, title, message, metadata });
  } catch (_) { /* non-critical */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/vendors/register
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const {
      businessName, ownerName, email, phone, password,
      gstin, pan, businessCategory, businessDescription,
      logo, panDocument, cancelledCheque
    } = req.body;

    if (!businessName || !ownerName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Business name, owner name, email, phone and password are required.' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address format.' });
    }

    // Phone format validation (10 to 15 digits)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Phone number must be between 10 and 15 digits.' });
    }

    // Strong password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    // GSTIN format validation (optional)
    if (gstin) {
      const gstRegex = /^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ][0-9a-zA-Z]{1}$/;
      if (!gstRegex.test(gstin)) {
        return res.status(400).json({ success: false, message: 'Invalid GSTIN format.' });
      }
    }

    // PAN format validation (optional)
    if (pan) {
      const panRegex = /^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/;
      if (!panRegex.test(pan)) {
        return res.status(400).json({ success: false, message: 'Invalid PAN format.' });
      }
    }

    const existing = await Vendor.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashed = bcrypt.hashSync(password, 12);
    const vendor = await Vendor.create({
      id: uuidv4(),
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashed,
      gstin: gstin || '',
      pan: pan || '',
      businessCategory: businessCategory || '',
      businessDescription: businessDescription || '',
      logo: logo || '',
      panDocument: panDocument || '',
      cancelledCheque: cancelledCheque || '',
      status: 'Pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Your application is under review. We will notify you within 24–48 hours.',
      vendor: safeVendor(vendor.toObject())
    });
  } catch (err) {
    console.error('Vendor register error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/vendors/login
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const vendor = await Vendor.findOne({ email: email.toLowerCase().trim() });
    if (!vendor) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, vendor.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (vendor.status === 'Pending') {
      return res.status(403).json({
        success: false,
        status: 'Pending',
        message: 'Your application is pending admin approval. We will notify you via email once reviewed.'
      });
    }
    if (vendor.status === 'Rejected') {
      return res.status(403).json({
        success: false,
        status: 'Rejected',
        message: `Your application has been rejected. Reason: ${vendor.rejectReason || 'Not specified'}. Please contact support.`
      });
    }
    if (vendor.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        status: 'Suspended',
        message: 'Your vendor account has been suspended. Please contact support.'
      });
    }

    // Update lastLoginAt on successful login
    const loginTime = new Date();
    await Vendor.updateOne({ id: vendor.id }, { $set: { lastLoginAt: loginTime } });
    
    // Create a plain object of the vendor doc for JWT token generation
    const vendorObj = vendor.toObject();
    vendorObj.lastLoginAt = loginTime;

    const token = generateVendorToken(vendorObj);
    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      vendor: {
        id: vendorObj.id,
        businessName: vendorObj.businessName,
        ownerName: vendorObj.ownerName,
        email: vendorObj.email,
        status: vendorObj.status
      }
    });
  } catch (err) {
    console.error('Vendor login error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/vendors/me
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', authenticateVendor, async (req, res) => {
  return res.json({ success: true, vendor: safeVendor(req.vendor) });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/vendors/profile
// ─────────────────────────────────────────────────────────────────────────────
router.get('/profile', authenticateVendor, async (req, res) => {
  return res.json({ success: true, vendor: safeVendor(req.vendor) });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/vendors/profile
// ─────────────────────────────────────────────────────────────────────────────
router.put('/profile', authenticateVendor, async (req, res) => {
  try {
    if (req.body.email !== undefined) {
      delete req.body.email;
    }
    const {
      businessName, ownerName, phone, gstin, pan, businessCategory, businessDescription,
      logo, address, bankDetails, panDocument, cancelledCheque
    } = req.body;

    const update = {};
    if (businessName !== undefined) update.businessName = businessName.trim();
    if (ownerName !== undefined) update.ownerName = ownerName.trim();

    if (phone) {
      const phoneTrimmed = phone.trim();
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(phoneTrimmed)) {
        return res.status(400).json({ success: false, message: 'Phone number must be between 10 and 15 digits.' });
      }
      const phoneConflict = await Vendor.findOne({ phone: phoneTrimmed, id: { $ne: req.vendor.id } });
      if (phoneConflict) {
        return res.status(409).json({ success: false, message: 'This phone number is already registered by another vendor.' });
      }
      update.phone = phoneTrimmed;
    }

    if (gstin) {
      const gstRegex = /^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ][0-9a-zA-Z]{1}$/;
      if (!gstRegex.test(gstin)) {
        return res.status(400).json({ success: false, message: 'Invalid GSTIN format.' });
      }
      update.gstin = gstin;
    } else if (gstin === '') {
      update.gstin = '';
    }

    if (pan) {
      const panRegex = /^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/;
      if (!panRegex.test(pan)) {
        return res.status(400).json({ success: false, message: 'Invalid PAN format.' });
      }
      update.pan = pan;
    } else if (pan === '') {
      update.pan = '';
    }

    if (businessCategory !== undefined) update.businessCategory = businessCategory;
    if (businessDescription !== undefined) update.businessDescription = businessDescription;
    if (logo !== undefined) update.logo = logo;
    if (panDocument !== undefined) update.panDocument = panDocument;
    if (cancelledCheque !== undefined) update.cancelledCheque = cancelledCheque;

    if (address) {
      update.address = {
        street: address.street !== undefined ? address.street : (req.vendor.address?.street || ''),
        city: address.city !== undefined ? address.city : (req.vendor.address?.city || ''),
        state: address.state !== undefined ? address.state : (req.vendor.address?.state || ''),
        pincode: address.pincode !== undefined ? address.pincode : (req.vendor.address?.pincode || ''),
        country: address.country !== undefined ? address.country : (req.vendor.address?.country || 'India')
      };
    }

    if (bankDetails) {
      const ifscVal = bankDetails.ifscCode || bankDetails.ifsc;
      if (ifscVal) {
        const ifscRegex = /^[a-zA-Z]{4}0[a-zA-Z0-9]{6}$/;
        if (!ifscRegex.test(ifscVal)) {
          return res.status(400).json({ success: false, message: 'Invalid IFSC code format.' });
        }
      }
      update.bankDetails = {
        accountHolder: bankDetails.accountHolder !== undefined ? bankDetails.accountHolder : (req.vendor.bankDetails?.accountHolder || ''),
        accountNumber: bankDetails.accountNumber !== undefined ? bankDetails.accountNumber : (req.vendor.bankDetails?.accountNumber || ''),
        ifscCode: ifscVal !== undefined ? ifscVal : (req.vendor.bankDetails?.ifscCode || ''),
        bankName: bankDetails.bankName !== undefined ? bankDetails.bankName : (req.vendor.bankDetails?.bankName || '')
      };
    }

    const updated = await Vendor.findOneAndUpdate(
      { id: req.vendor.id },
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    return res.json({ success: true, message: 'Profile updated.', vendor: safeVendor(updated) });
  } catch (err) {
    console.error('Vendor profile update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/vendors/profile/business
// ─────────────────────────────────────────────────────────────────────────────
router.put('/profile/business', authenticateVendor, async (req, res) => {
  try {
    if (req.body.email !== undefined) {
      delete req.body.email;
    }
    const { businessName, ownerName, phone, businessCategory, businessDescription, logo } = req.body;
    const update = {};
    if (businessName !== undefined) update.businessName = businessName.trim();
    if (ownerName !== undefined) update.ownerName = ownerName.trim();

    if (phone) {
      const phoneTrimmed = phone.trim();
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(phoneTrimmed)) {
        return res.status(400).json({ success: false, message: 'Phone number must be between 10 and 15 digits.' });
      }
      const phoneConflict = await Vendor.findOne({ phone: phoneTrimmed, id: { $ne: req.vendor.id } });
      if (phoneConflict) {
        return res.status(409).json({ success: false, message: 'This phone number is already registered by another vendor.' });
      }
      update.phone = phoneTrimmed;
    }

    if (businessCategory !== undefined) update.businessCategory = businessCategory;
    if (businessDescription !== undefined) update.businessDescription = businessDescription;
    if (logo !== undefined) update.logo = logo;

    const updated = await Vendor.findOneAndUpdate(
      { id: req.vendor.id },
      { $set: update },
      { new: true }
    ).lean();

    return res.json({ success: true, message: 'Business profile updated.', vendor: safeVendor(updated) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update business profile.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/vendors/profile/address
// ─────────────────────────────────────────────────────────────────────────────
router.put('/profile/address', authenticateVendor, async (req, res) => {
  try {
    if (req.body.email !== undefined) {
      delete req.body.email;
    }
    const { street, city, state, pincode, country } = req.body;
    const update = {
      address: {
        street: street !== undefined ? street : (req.vendor.address?.street || ''),
        city: city !== undefined ? city : (req.vendor.address?.city || ''),
        state: state !== undefined ? state : (req.vendor.address?.state || ''),
        pincode: pincode !== undefined ? pincode : (req.vendor.address?.pincode || ''),
        country: country !== undefined ? country : (req.vendor.address?.country || 'India')
      }
    };

    const updated = await Vendor.findOneAndUpdate(
      { id: req.vendor.id },
      { $set: update },
      { new: true }
    ).lean();

    return res.json({ success: true, message: 'Business address updated.', vendor: safeVendor(updated) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update address.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/vendors/profile/gst-pan
// ─────────────────────────────────────────────────────────────────────────────
router.put('/profile/gst-pan', authenticateVendor, async (req, res) => {
  try {
    if (req.body.email !== undefined) {
      delete req.body.email;
    }
    const { gstin, pan, panDocument, cancelledCheque } = req.body;
    const update = {};

    if (gstin) {
      const gstRegex = /^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ][0-9a-zA-Z]{1}$/;
      if (!gstRegex.test(gstin)) {
        return res.status(400).json({ success: false, message: 'Invalid GSTIN format.' });
      }
      update.gstin = gstin;
    } else if (gstin === '') {
      update.gstin = '';
    }

    if (pan) {
      const panRegex = /^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/;
      if (!panRegex.test(pan)) {
        return res.status(400).json({ success: false, message: 'Invalid PAN format.' });
      }
      update.pan = pan;
    } else if (pan === '') {
      update.pan = '';
    }

    if (panDocument !== undefined) update.panDocument = panDocument;
    if (cancelledCheque !== undefined) update.cancelledCheque = cancelledCheque;

    const updated = await Vendor.findOneAndUpdate(
      { id: req.vendor.id },
      { $set: update },
      { new: true }
    ).lean();

    return res.json({ success: true, message: 'GST & PAN details updated.', vendor: safeVendor(updated) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update GST & PAN details.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/vendors/profile/bank
// ─────────────────────────────────────────────────────────────────────────────
router.put('/profile/bank', authenticateVendor, async (req, res) => {
  try {
    if (req.body.email !== undefined) {
      delete req.body.email;
    }
    const { accountHolder, accountNumber, ifsc, ifscCode, bankName } = req.body;
    const ifscVal = ifscCode || ifsc;

    if (ifscVal) {
      const ifscRegex = /^[a-zA-Z]{4}0[a-zA-Z0-9]{6}$/;
      if (!ifscRegex.test(ifscVal)) {
        return res.status(400).json({ success: false, message: 'Invalid IFSC code format.' });
      }
    }

    const update = {
      bankDetails: {
        accountHolder: accountHolder !== undefined ? accountHolder : (req.vendor.bankDetails?.accountHolder || ''),
        accountNumber: accountNumber !== undefined ? accountNumber : (req.vendor.bankDetails?.accountNumber || ''),
        ifscCode: ifscVal !== undefined ? ifscVal : (req.vendor.bankDetails?.ifscCode || ''),
        bankName: bankName !== undefined ? bankName : (req.vendor.bankDetails?.bankName || '')
      }
    };

    const updated = await Vendor.findOneAndUpdate(
      { id: req.vendor.id },
      { $set: update },
      { new: true }
    ).lean();

    return res.json({ success: true, message: 'Bank details updated.', vendor: safeVendor(updated) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update bank details.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/vendors/change-password
// ─────────────────────────────────────────────────────────────────────────────
router.put('/change-password', authenticateVendor, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    const vendor = await Vendor.findOne({ id: req.vendor.id });
    const isMatch = bcrypt.compareSync(currentPassword, vendor.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    vendor.password = bcrypt.hashSync(newPassword, 12);
    await vendor.save();
    return res.json({ success: true, message: 'Password changed successfully.', vendor: safeVendor(vendor.toObject()) });
  } catch (err) {
    console.error('Vendor change password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/vendors/products
// ─────────────────────────────────────────────────────────────────────────────
router.get('/products', authenticateVendor, async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.vendor.id }).lean();
    return res.json({ success: true, products });
  } catch (err) {
    console.error('Vendor get products error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/vendors/products
// ─────────────────────────────────────────────────────────────────────────────
router.post('/products', authenticateVendor, async (req, res) => {
  try {
    const {
      name, category, subCategory, catalogue, price, stock,
      image, images, description, brand, discount, originalPrice,
      badge, isNewArrival, isOffer, attributes, variants
    } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Name, price and stock are required.' });
    }

    const maxProd = await Product.findOne().sort({ id: -1 });
    const id = maxProd ? maxProd.id + 1 : 1;

    const product = await Product.create({
      id,
      name: name.trim(),
      category: category || 'Clothing > Kids',
      subCategory: subCategory || '',
      catalogue: catalogue || 'Catalogue A',
      price: parseFloat(price) || 0,
      stock: parseInt(stock, 10) || 0,
      sales: 0,
      status: 'Pending', // Awaiting admin approval
      image: image || '',
      images: images || (image ? [image] : []),
      description: description || '',
      brand: brand || '',
      rating: 4.8,
      reviews: 0,
      discount: discount || 0,
      originalPrice: originalPrice || null,
      badge: badge || '',
      isNewArrival: isNewArrival || false,
      isOffer: isOffer || false,
      attributes: attributes || [],
      variants: variants || [],
      vendorId: req.vendor.id,
      includeInLuckyCharm: false,
      luckyStock: 0
    });

    // Low stock check
    const threshold = 5;
    if (parseInt(stock, 10) <= threshold) {
      await pushNotification(
        req.vendor.id, 'low_stock',
        '⚠️ Low Stock Alert',
        `Product "${name}" has low stock (${stock} units remaining).`,
        { productId: id }
      );
    }

    return res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('Vendor create product error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/vendors/products/:id
// ─────────────────────────────────────────────────────────────────────────────
router.put('/products/:id', authenticateVendor, async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const product = await Product.findOne({ id: productId, vendorId: req.vendor.id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or access denied.' });
    }

    const allowedFields = ['name', 'category', 'subCategory', 'catalogue', 'price', 'stock',
      'image', 'images', 'description', 'brand', 'discount', 'originalPrice',
      'badge', 'isNewArrival', 'isOffer', 'attributes', 'variants'];
    const update = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    update.status = 'Pending'; // Reset to pending for re-approval
    update.rejectReason = '';

    const updated = await Product.findOneAndUpdate(
      { id: productId, vendorId: req.vendor.id },
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    return res.json({ success: true, product: updated });
  } catch (err) {
    console.error('Vendor update product error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/vendors/products/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/products/:id', authenticateVendor, async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const deleted = await Product.findOneAndDelete({ id: productId, vendorId: req.vendor.id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found or access denied.' });
    }
    return res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    console.error('Vendor delete product error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/vendors/orders  — orders containing this vendor's products
// ─────────────────────────────────────────────────────────────────────────────
router.get('/orders', authenticateVendor, async (req, res) => {
  try {
    const myProducts = await Product.find({ vendorId: req.vendor.id }).lean();
    const myProductIds = new Set(myProducts.map(p => p.id));

    const allOrders = await Order.find().lean();
    const vendorOrders = [];

    for (const order of allOrders) {
      const vendorItems = (order.items || []).filter(item => myProductIds.has(item.productId));
      if (vendorItems.length > 0) {
        const vendorAmount = vendorItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        vendorOrders.push({ ...order, items: vendorItems, vendorAmount });
      }
    }

    return res.json({ success: true, orders: vendorOrders });
  } catch (err) {
    console.error('Vendor get orders error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/vendors/orders/:id/status
// ─────────────────────────────────────────────────────────────────────────────
router.put('/orders/:id/status', authenticateVendor, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status } },
      { new: true }
    ).lean();

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    return res.json({ success: true, order });
  } catch (err) {
    console.error('Vendor update order status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/vendors/analytics — Dashboard KPIs + charts
// ─────────────────────────────────────────────────────────────────────────────
router.get('/analytics', authenticateVendor, async (req, res) => {
  try {
    const myProducts = await Product.find({ vendorId: req.vendor.id }).lean();
    const myProductIds = new Set(myProducts.map(p => p.id));

    const allOrders = await Order.find().lean();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let todayOrders = 0, todayRevenue = 0, pendingOrders = 0,
      deliveredOrders = 0, cancelledOrders = 0, totalRevenue = 0;
    const dailyMap = {};

    for (const order of allOrders) {
      const vendorItems = (order.items || []).filter(i => myProductIds.has(i.productId));
      if (!vendorItems.length) continue;

      const amount = vendorItems.reduce((s, i) => s + (i.price * i.quantity), 0);
      totalRevenue += amount;

      // Today filter
      const orderDate = order.date ? order.date.substring(0, 10) : '';
      if (orderDate === todayStr) { todayOrders++; todayRevenue += amount; }

      // Status counts
      if (order.status === 'Pending' || order.status === 'Processing') pendingOrders++;
      if (order.status === 'Delivered') deliveredOrders++;
      if (order.status === 'Cancelled') cancelledOrders++;

      // Daily chart (last 7 days)
      if (dailyMap[orderDate]) {
        dailyMap[orderDate].orders++;
        dailyMap[orderDate].revenue += amount;
      } else {
        dailyMap[orderDate] = { orders: 1, revenue: amount };
      }
    }

    // Build daily chart for last 14 days
    const dailyChart = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyChart.push({
        date: key,
        label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        orders: dailyMap[key]?.orders || 0,
        revenue: dailyMap[key]?.revenue || 0
      });
    }

    // Best selling product
    const salesMap = {};
    for (const order of allOrders) {
      for (const item of (order.items || [])) {
        if (myProductIds.has(item.productId)) {
          salesMap[item.productId] = (salesMap[item.productId] || 0) + item.quantity;
        }
      }
    }
    const bestProductId = Object.entries(salesMap).sort((a, b) => b[1] - a[1])[0]?.[0];
    const bestProduct = bestProductId ? myProducts.find(p => p.id == bestProductId) : null;

    // Low stock products
    const lowStockProducts = myProducts.filter(p => p.stock <= (p.lowStockThreshold || 5));

    return res.json({
      success: true,
      kpis: {
        todayOrders,
        todayRevenue,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        totalProducts: myProducts.length,
        lowStockCount: lowStockProducts.length
      },
      bestProduct: bestProduct ? { id: bestProduct.id, name: bestProduct.name, sales: salesMap[bestProduct.id] || 0, image: bestProduct.image } : null,
      dailyChart,
      lowStockProducts,
      recentOrders: allOrders
        .filter(o => (o.items || []).some(i => myProductIds.has(i.productId)))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    });
  } catch (err) {
    console.error('Vendor analytics error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch analytics.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/vendors/notifications
// ─────────────────────────────────────────────────────────────────────────────
router.get('/notifications', authenticateVendor, async (req, res) => {
  try {
    const notifications = await VendorNotification
      .find({ vendorId: req.vendor.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return res.json({ success: true, notifications });
  } catch (err) {
    console.error('Vendor notifications error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

// PUT /api/vendors/notifications/read-all
router.put('/notifications/read-all', authenticateVendor, async (req, res) => {
  try {
    await VendorNotification.updateMany({ vendorId: req.vendor.id }, { $set: { isRead: true } });
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to mark notifications as read.' });
  }
});

// PUT /api/vendors/notifications/:id/read
router.put('/notifications/:id/read', authenticateVendor, async (req, res) => {
  try {
    await VendorNotification.findOneAndUpdate(
      { _id: req.params.id, vendorId: req.vendor.id },
      { $set: { isRead: true } }
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to mark notification as read.' });
  }
});

// GET /api/vendors/public-stats
router.get('/public-stats', async (req, res) => {
  try {
    const totalSellers = await Vendor.countDocuments({ status: 'Approved' });
    const totalProducts = await Product.countDocuments({ status: 'Approved' });
    const allOrders = await Order.find({ status: 'Delivered' }).lean();
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || o.amount || 0), 0);

    return res.json({
      success: true,
      stats: {
        totalSellers: totalSellers || 12,
        totalProducts: totalProducts || 148,
        totalRevenue: totalRevenue || 348200
      }
    });
  } catch (err) {
    console.error('Public stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch public stats.' });
  }
});

module.exports = router;

