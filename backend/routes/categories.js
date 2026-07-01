const express = require('express');
const { Category } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
const fs = require('fs');
const path = require('path');
const CONFIGS_FILE_PATH = path.join(__dirname, '../uploads/category_configurations.json');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const readConfigsFile = () => {
  try {
    if (fs.existsSync(CONFIGS_FILE_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIGS_FILE_PATH, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading configs file:', e);
  }
  return {};
};

const writeConfigsFile = (data) => {
  const uploadsDir = path.dirname(CONFIGS_FILE_PATH);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  fs.writeFileSync(CONFIGS_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
};

// ─── IMPORTANT: Static routes MUST be defined BEFORE parameterized /:name routes ─
// GET /api/categories/configurations - Get all category configurations
router.get('/configurations', async (req, res) => {
  try {
    const configs = readConfigsFile();
    return res.json({ success: true, configurations: configs });
  } catch (err) {
    console.error('Fetch configurations error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch category configurations.' });
  }
});

// POST /api/categories/configurations - Save ALL category configurations (admin only)
router.post('/configurations', authenticate, requireAdmin, async (req, res) => {
  try {
    const { configurations } = req.body;
    if (!configurations || typeof configurations !== 'object') {
      return res.status(400).json({ success: false, message: 'Configurations body is required.' });
    }
    writeConfigsFile(configurations);
    res.json({ success: true, message: 'Category configurations saved successfully!' });
  } catch (err) {
    console.error('Save configurations error:', err);
    res.status(500).json({ success: false, message: 'Failed to save category configurations.' });
  }
});

// PUT /api/categories/configurations/:categoryName - Update single category config (admin only)
router.put('/configurations/:categoryName', authenticate, requireAdmin, async (req, res) => {
  try {
    const { categoryName } = req.params;
    const config = req.body;
    if (!config || typeof config !== 'object') {
      return res.status(400).json({ success: false, message: 'Configuration body is required.' });
    }
    const configs = readConfigsFile();
    configs[categoryName] = config;
    writeConfigsFile(configs);
    res.json({ success: true, message: `Configuration for "${categoryName}" updated successfully!` });
  } catch (err) {
    console.error('Update configuration error:', err);
    res.status(500).json({ success: false, message: 'Failed to update category configuration.' });
  }
});

// DELETE /api/categories/configurations/:categoryName - Delete single category config (admin only)
router.delete('/configurations/:categoryName', authenticate, requireAdmin, async (req, res) => {
  try {
    const { categoryName } = req.params;
    const configs = readConfigsFile();
    if (!configs[categoryName]) {
      return res.status(404).json({ success: false, message: `No configuration found for "${categoryName}".` });
    }
    delete configs[categoryName];
    writeConfigsFile(configs);
    res.json({ success: true, message: `Configuration for "${categoryName}" deleted successfully!` });
  } catch (err) {
    console.error('Delete configuration error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete category configuration.' });
  }
});

// ─── Category CRUD Routes ──────────────────────────────────────────────────────

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
    const { name, parent, count, status, image } = req.body;
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
      status: status || 'Active',
      image: image || ''
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
    const { name, parent, count, status, image } = req.body;

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
    const newImage = image !== undefined ? image : category.image;

    await Category.updateOne(
      { name: originalName },
      { $set: { name: newName, parent: newParent, count: newCount, status: newStatus, image: newImage } }
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
