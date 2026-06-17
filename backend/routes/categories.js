const express = require('express');
const { Category } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.json({ success: true, categories });
  } catch (err) {
    console.error('Fetch categories error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
});

// POST /api/categories - Create category
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, parent, count, status } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const existing = await Category.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A category with this name already exists.' });
    }

    const newCategory = await Category.create({
      name: name.trim(),
      parent: parent || '—',
      count: parseInt(count, 10) || 0,
      status: status || 'Active'
    });

    res.status(201).json({ success: true, message: 'Category created successfully!', category: newCategory });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
});

// PUT /api/categories/:name - Update category
router.put('/:name', authenticate, requireAdmin, async (req, res) => {
  try {
    const originalName = req.params.name;
    const { name, parent, count, status } = req.body;

    const category = await Category.findOne({ name: originalName });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (name && name.toLowerCase() !== originalName.toLowerCase()) {
      const existing = await Category.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
      if (existing) {
        return res.status(409).json({ success: false, message: 'A category with this name already exists.' });
      }
    }

    const newParent = parent !== undefined ? parent : category.parent;
    const newCount = count !== undefined ? parseInt(count, 10) : category.count;
    const newStatus = status !== undefined ? status : category.status;
    const newName = name !== undefined ? name.trim() : category.name;

    await Category.updateOne(
      { name: originalName },
      { $set: { name: newName, parent: newParent, count: newCount, status: newStatus } }
    );

    // Re-link subcategories if the parent name changed
    if (name && name.trim() !== originalName) {
      await Category.updateMany({ parent: originalName }, { $set: { parent: name.trim() } });
    }

    res.json({ success: true, message: 'Category updated successfully!' });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
});

// DELETE /api/categories/:name - Delete category
router.delete('/:name', authenticate, requireAdmin, async (req, res) => {
  try {
    const name = req.params.name;
    const category = await Category.findOne({ name });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const parentOfDeleted = category.parent || '—';

    // Remove the category
    await Category.deleteOne({ name });

    // Reassign subcategories to parent of deleted
    await Category.updateMany({ parent: name }, { $set: { parent: parentOfDeleted } });

    res.json({ success: true, message: `Category "${name}" deleted successfully.` });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
});

module.exports = router;
