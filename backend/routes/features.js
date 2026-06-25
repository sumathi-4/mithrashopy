const express = require('express');
const { Feature } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/features - Get all website features/functionalities
router.get('/', async (req, res) => {
  try {
    const features = await Feature.find().sort({ order: 1 }).lean();
    res.json({ success: true, features });
  } catch (err) {
    console.error('Fetch features error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch features.' });
  }
});

// POST /api/features - Create a new custom functionality (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, key, title, subtitle, status, order } = req.body;
    if (!name || !key) {
      return res.status(400).json({ success: false, message: 'Feature name and key are required.' });
    }

    const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
    const existing = await Feature.findOne({ key: cleanKey });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A feature with this key already exists.' });
    }

    // Get max ID and max order for seeding default values
    const maxFeature = await Feature.findOne().sort({ id: -1 });
    const nextId = maxFeature ? maxFeature.id + 1 : 1;

    const maxOrderFeature = await Feature.findOne().sort({ order: -1 });
    const nextOrder = order !== undefined ? parseInt(order, 10) : (maxOrderFeature ? maxOrderFeature.order + 1 : 1);

    const newFeature = await Feature.create({
      id: nextId,
      key: cleanKey,
      name: name.trim(),
      title: (title || '').trim(),
      subtitle: (subtitle || '').trim(),
      status: status || 'Active',
      order: nextOrder
    });

    res.status(201).json({ success: true, message: 'Feature created successfully!', feature: newFeature });
  } catch (err) {
    console.error('Create feature error:', err);
    res.status(500).json({ success: false, message: 'Failed to create feature.' });
  }
});

// PUT /api/features/:id - Update feature functionality details (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, title, subtitle, status, order } = req.body;

    const feature = await Feature.findOne({ id });
    if (!feature) {
      return res.status(404).json({ success: false, message: 'Feature not found.' });
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (title !== undefined) updateFields.title = title.trim();
    if (subtitle !== undefined) updateFields.subtitle = subtitle.trim();
    if (status !== undefined) updateFields.status = status;
    if (order !== undefined) updateFields.order = parseInt(order, 10);

    const updated = await Feature.findOneAndUpdate(
      { id },
      { $set: updateFields },
      { new: true }
    ).lean();

    res.json({ success: true, message: 'Feature updated successfully!', feature: updated });
  } catch (err) {
    console.error('Update feature error:', err);
    res.status(500).json({ success: false, message: 'Failed to update feature.' });
  }
});

// DELETE /api/features/:id - Delete custom feature functionality (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const feature = await Feature.findOne({ id });
    if (!feature) {
      return res.status(404).json({ success: false, message: 'Feature not found.' });
    }

    // Do not allow deleting core features if we want to ensure basic sections exist
    // However, if they want to delete any feature, we can support it. We will allow deleting.
    await Feature.deleteOne({ id });

    res.json({ success: true, message: `Feature "${feature.name}" deleted successfully.` });
  } catch (err) {
    console.error('Delete feature error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete feature.' });
  }
});

module.exports = router;
