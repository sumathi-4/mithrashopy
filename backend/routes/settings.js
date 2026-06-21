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
    const {
      storeName,
      supportEmail,
      taxPercentage,
      defaultCurrency,
      shippingInfoLines,
      freeShippingAbove,
      standardCharge,
      expressCharge,
      codCharges,
      enableCod,
      enableExpress,
      enableInternational
    } = req.body;

    const updateFields = {};
    if (storeName !== undefined) updateFields.storeName = storeName.trim();
    if (supportEmail !== undefined) updateFields.supportEmail = supportEmail.trim();
    if (taxPercentage !== undefined) updateFields.taxPercentage = parseInt(taxPercentage, 10);
    if (defaultCurrency !== undefined) updateFields.defaultCurrency = defaultCurrency;

    if (shippingInfoLines !== undefined) {
      if (Array.isArray(shippingInfoLines)) {
        updateFields.shippingInfoLines = shippingInfoLines.map(line => line.trim()).filter(line => line.length > 0);
      }
    }
    if (freeShippingAbove !== undefined) updateFields.freeShippingAbove = parseFloat(freeShippingAbove);
    if (standardCharge !== undefined) updateFields.standardCharge = parseFloat(standardCharge);
    if (expressCharge !== undefined) updateFields.expressCharge = parseFloat(expressCharge);
    if (codCharges !== undefined) updateFields.codCharges = parseFloat(codCharges);
    if (enableCod !== undefined) updateFields.enableCod = !!enableCod;
    if (enableExpress !== undefined) updateFields.enableExpress = !!enableExpress;
    if (enableInternational !== undefined) updateFields.enableInternational = !!enableInternational;

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
