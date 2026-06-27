const express = require('express');
const { Vendor, Product, VendorNotification, Order, User } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// ─── Helper: push event-driven notification to vendor ─────────────────────────
async function notifyVendor(vendorId, type, title, message, metadata = {}) {
  try {
    await VendorNotification.create({ vendorId, type, title, message, metadata });
  } catch (_) { /* non-critical */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/vendors — list all vendors
router.get('/vendors', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;

    const vendors = await Vendor.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, vendors });
  } catch (err) {
    console.error('Admin get vendors error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch vendors.' });
  }
});

// GET /api/admin/vendors/:id — get single vendor
router.get('/vendors/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ id: req.params.id }).select('-password').lean();
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found.' });
    return res.json({ success: true, vendor });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vendor.' });
  }
});

// PUT /api/admin/vendors/:id/status — approve or reject a vendor
router.put('/vendors/:id/status', async (req, res) => {
  try {
    const { status, rejectReason, adminNotes } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected.' });
    }

    const update = { status };
    if (rejectReason !== undefined) update.rejectReason = rejectReason;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    const vendor = await Vendor.findOneAndUpdate(
      { id: req.params.id },
      { $set: update },
      { new: true }
    ).select('-password').lean();

    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found.' });

    // Fire event-driven notification to vendor
    if (status === 'Approved') {
      await notifyVendor(
        vendor.id, 'vendor_approved',
        '🎉 Application Approved!',
        `Congratulations! Your vendor application for "${vendor.businessName}" has been approved. You can now log in to your seller portal and start listing products.`,
        { status: 'Approved' }
      );
    } else {
      await notifyVendor(
        vendor.id, 'vendor_rejected',
        '❌ Application Not Approved',
        `Your vendor application for "${vendor.businessName}" was not approved. Reason: ${rejectReason || 'Not specified'}. ${adminNotes ? `Admin notes: ${adminNotes}` : ''} Please contact support if you have questions.`,
        { status: 'Rejected', rejectReason }
      );
    }

    return res.json({ success: true, message: `Vendor ${status.toLowerCase()}.`, vendor });
  } catch (err) {
    console.error('Admin update vendor status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update vendor status.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT APPROVALS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/pending-products — list all products awaiting approval
router.get('/pending-products', async (req, res) => {
  try {
    const products = await Product.find({ vendorId: { $ne: null }, status: 'Pending' })
      .sort({ _id: -1 })
      .lean();

    // Attach vendor business name to each product
    const vendorIds = [...new Set(products.map(p => p.vendorId).filter(Boolean))];
    const vendors = await Vendor.find({ id: { $in: vendorIds } }).select('id businessName').lean();
    const vendorMap = {};
    vendors.forEach(v => { vendorMap[v.id] = v.businessName; });

    const enriched = products.map(p => ({
      ...p,
      vendorBusinessName: vendorMap[p.vendorId] || 'Unknown Vendor'
    }));

    return res.json({ success: true, products: enriched });
  } catch (err) {
    console.error('Admin pending products error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch pending products.' });
  }
});

// GET /api/admin/all-vendor-products — list ALL vendor products (any status)
router.get('/all-vendor-products', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { vendorId: { $ne: null } };
    if (status && status !== 'All') filter.status = status;

    const products = await Product.find(filter).sort({ _id: -1 }).lean();
    const vendorIds = [...new Set(products.map(p => p.vendorId).filter(Boolean))];
    const vendors = await Vendor.find({ id: { $in: vendorIds } }).select('id businessName').lean();
    const vendorMap = {};
    vendors.forEach(v => { vendorMap[v.id] = v.businessName; });

    const enriched = products.map(p => ({
      ...p,
      vendorBusinessName: vendorMap[p.vendorId] || 'Unknown Vendor'
    }));

    return res.json({ success: true, products: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vendor products.' });
  }
});

// PUT /api/admin/products/:id/status — approve or reject a vendor product
router.put('/products/:id/status', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { status, rejectReason, adminNotes } = req.body;

    if (!['Active', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Active or Rejected.' });
    }

    const update = { status };
    if (rejectReason !== undefined) update.rejectReason = rejectReason;

    const product = await Product.findOneAndUpdate(
      { id: productId },
      { $set: update },
      { new: true }
    ).lean();

    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // Event-driven notification to vendor
    if (product.vendorId) {
      if (status === 'Active') {
        await notifyVendor(
          product.vendorId, 'product_approved',
          '✅ Product Approved',
          `Your product "${product.name}" has been approved and is now live on the marketplace.`,
          { productId, productName: product.name }
        );
      } else {
        await notifyVendor(
          product.vendorId, 'product_rejected',
          '❌ Product Not Approved',
          `Your product "${product.name}" was not approved. Reason: ${rejectReason || 'Not specified'}. ${adminNotes ? `Admin notes: ${adminNotes}` : ''} Please update the product and resubmit.`,
          { productId, productName: product.name, rejectReason }
        );
      }
    }

    return res.json({ success: true, message: `Product ${status === 'Active' ? 'approved' : 'rejected'}.`, product });
  } catch (err) {
    console.error('Admin update product status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update product status.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM STATS (Admin dashboard overview)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalVendors, pendingVendors, approvedVendors, pendingProducts, totalOrders] =
      await Promise.all([
        Vendor.countDocuments(),
        Vendor.countDocuments({ status: 'Pending' }),
        Vendor.countDocuments({ status: 'Approved' }),
        Product.countDocuments({ vendorId: { $ne: null }, status: 'Pending' }),
        Order.countDocuments()
      ]);

    return res.json({
      success: true,
      stats: { totalVendors, pendingVendors, approvedVendors, pendingProducts, totalOrders }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
});

module.exports = router;
