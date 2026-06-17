const express = require('express');
const { Catalogue, Product } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/catalogues - Get all catalogues
router.get('/', async (req, res) => {
  try {
    const catalogues = await Catalogue.find().lean();
    res.json({ success: true, catalogues });
  } catch (err) {
    console.error('Fetch catalogues error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch catalogues.' });
  }
});

// POST /api/catalogues - Create catalogue
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, subtitle, count, status, revenue, image } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Catalogue name is required.' });
    }

    const existing = await Catalogue.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A catalogue with this name already exists.' });
    }

    const newCatalogue = await Catalogue.create({
      name: name.trim(),
      subtitle: subtitle || 'Custom Collection',
      count: parseInt(count, 10) || 0,
      status: status || 'Active',
      revenue: revenue || '₹0',
      image: image || 'Kids'
    });

    res.status(201).json({ success: true, message: 'Catalogue created successfully!', catalogue: newCatalogue });
  } catch (err) {
    console.error('Create catalogue error:', err);
    res.status(500).json({ success: false, message: 'Failed to create catalogue.' });
  }
});

// PUT /api/catalogues/:name - Update catalogue
router.put('/:name', authenticate, requireAdmin, async (req, res) => {
  try {
    const originalName = req.params.name;
    const { name, subtitle, count, status, revenue, image } = req.body;

    const catalogue = await Catalogue.findOne({ name: originalName });
    if (!catalogue) {
      return res.status(404).json({ success: false, message: 'Catalogue not found.' });
    }

    if (name && name.toLowerCase() !== originalName.toLowerCase()) {
      const existing = await Catalogue.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
      if (existing) {
        return res.status(409).json({ success: false, message: 'A catalogue with this name already exists.' });
      }
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (subtitle !== undefined) updateFields.subtitle = subtitle.trim();
    if (count !== undefined) updateFields.count = parseInt(count, 10) || 0;
    if (status !== undefined) updateFields.status = status;
    if (revenue !== undefined) updateFields.revenue = revenue;
    if (image !== undefined) updateFields.image = image;

    const updated = await Catalogue.findOneAndUpdate(
      { name: originalName },
      { $set: updateFields },
      { new: true }
    ).lean();

    // Re-link products if catalogue name changed
    if (name && name.trim() !== originalName) {
      await Product.updateMany({ catalogue: originalName }, { $set: { catalogue: name.trim() } });
    }

    res.json({ success: true, message: 'Catalogue updated successfully!', catalogue: updated });
  } catch (err) {
    console.error('Update catalogue error:', err);
    res.status(500).json({ success: false, message: 'Failed to update catalogue.' });
  }
});

// DELETE /api/catalogues/:name - Delete catalogue
router.delete('/:name', authenticate, requireAdmin, async (req, res) => {
  try {
    const name = req.params.name;
    const result = await Catalogue.deleteOne({ name });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Catalogue not found.' });
    }

    res.json({ success: true, message: `Catalogue "${name}" deleted successfully.` });
  } catch (err) {
    console.error('Delete catalogue error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete catalogue.' });
  }
});

module.exports = router;
