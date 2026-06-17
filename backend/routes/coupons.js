const express = require('express');
const { Coupon } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/coupons - Get all coupons
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find().lean();
    res.json({ success: true, coupons });
  } catch (err) {
    console.error('Fetch coupons error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch coupons.' });
  }
});

// POST /api/coupons - Create coupon
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { code, discount, type, minCart, expiry, usageLimit } = req.body;
    if (!code || !discount || !expiry) {
      return res.status(400).json({ success: false, message: 'Coupon code, discount and expiry date are required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A coupon with this code already exists.' });
    }

    const newCoupon = await Coupon.create({
      code: cleanCode,
      discount: discount.trim(),
      type: type || 'Percentage',
      minCart: minCart ? (minCart.startsWith('₹') ? minCart : `₹${minCart}`) : '₹0',
      expiry: expiry.trim(),
      usage: `0/${usageLimit || '500'}`,
      status: 'Active'
    });

    res.status(201).json({ success: true, message: 'Coupon created successfully!', coupon: newCoupon });
  } catch (err) {
    console.error('Create coupon error:', err);
    res.status(500).json({ success: false, message: 'Failed to create coupon.' });
  }
});

// PUT /api/coupons/:code - Edit coupon details or toggle status
router.put('/:code', authenticate, requireAdmin, async (req, res) => {
  try {
    const originalCode = req.params.code.toUpperCase();
    const { code, discount, type, minCart, expiry, usage, status } = req.body;

    const coupon = await Coupon.findOne({ code: originalCode });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    let cleanCode = originalCode;
    if (code && code.toUpperCase() !== originalCode) {
      cleanCode = code.trim().toUpperCase();
      const existing = await Coupon.findOne({ code: cleanCode });
      if (existing) {
        return res.status(409).json({ success: false, message: 'A coupon with this code already exists.' });
      }
    }

    const updateFields = {};
    updateFields.code = cleanCode;
    if (discount !== undefined) updateFields.discount = discount.trim();
    if (type !== undefined) updateFields.type = type;
    if (minCart !== undefined) updateFields.minCart = minCart.startsWith('₹') ? minCart : `₹${minCart}`;
    if (expiry !== undefined) updateFields.expiry = expiry.trim();
    if (usage !== undefined) updateFields.usage = usage;
    if (status !== undefined) updateFields.status = status;

    const updated = await Coupon.findOneAndUpdate(
      { code: originalCode },
      { $set: updateFields },
      { new: true }
    ).lean();

    res.json({ success: true, message: 'Coupon updated successfully!', coupon: updated });
  } catch (err) {
    console.error('Update coupon error:', err);
    res.status(500).json({ success: false, message: 'Failed to update coupon.' });
  }
});

// DELETE /api/coupons/:code - Delete coupon
router.delete('/:code', authenticate, requireAdmin, async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const result = await Coupon.deleteOne({ code });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    res.json({ success: true, message: `Coupon ${code} deleted successfully.` });
  } catch (err) {
    console.error('Delete coupon error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
  }
});

module.exports = router;
