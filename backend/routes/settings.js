const express = require('express');
const { Settings } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/settings - Fetch general configuration settings
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.findOne().lean();
    res.json({ success: true, settings });
  } catch (err) {
    console.error('Fetch settings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
});

// PUT /api/settings - Update general store settings (admin only)
router.put('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { storeName, supportEmail, taxPercentage, defaultCurrency } = req.body;

    const current = await Settings.findOne();
    const updateFields = {};
    if (storeName !== undefined) updateFields.storeName = storeName.trim();
    if (supportEmail !== undefined) updateFields.supportEmail = supportEmail.trim();
    if (taxPercentage !== undefined) updateFields.taxPercentage = parseInt(taxPercentage, 10);
    if (defaultCurrency !== undefined) updateFields.defaultCurrency = defaultCurrency;

    const saved = await Settings.findOneAndUpdate(
      {},
      { $set: updateFields },
      { new: true, upsert: true }
    ).lean();

    res.json({ success: true, message: 'Settings saved successfully!', settings: saved });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ success: false, message: 'Failed to save settings.' });
  }
});

module.exports = router;
