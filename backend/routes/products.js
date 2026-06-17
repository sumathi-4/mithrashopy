const express = require('express');
const { Product } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json({ success: true, products });
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid product ID.' });

    const product = await Product.findOne({ id }).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (err) {
    console.error('Fetch product error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch product.' });
  }
});

// POST /api/products - Create a new product
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, category, catalogue, price, stock, status, image } = req.body;
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Product name, price and stock are required.' });
    }

    // Auto-generate sequential numeric ID
    const maxProd = await Product.findOne().sort({ id: -1 });
    const id = maxProd ? maxProd.id + 1 : 1;

    const newProduct = await Product.create({
      id,
      name: name.trim(),
      category: category || 'Clothing > Kids',
      catalogue: catalogue || 'Catalogue A',
      price: parseFloat(price) || 0,
      stock: parseInt(stock, 10) || 0,
      sales: 0,
      status: status || 'Active',
      image: image || 'Kids'
    });

    res.status(201).json({ success: true, message: 'Product added successfully!', product: newProduct });
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ success: false, message: 'Failed to add product.' });
  }
});

// PUT /api/products/:id - Update product details
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid product ID.' });

    const { name, category, catalogue, price, stock, status, image } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (category !== undefined) updateFields.category = category;
    if (catalogue !== undefined) updateFields.catalogue = catalogue;
    if (price !== undefined) updateFields.price = parseFloat(price) || 0;
    if (stock !== undefined) updateFields.stock = parseInt(stock, 10) || 0;
    if (status !== undefined) updateFields.status = status;
    if (image !== undefined) updateFields.image = image;

    const updated = await Product.findOneAndUpdate(
      { id },
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, message: 'Product updated successfully!', product: updated });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid product ID.' });

    const result = await Product.deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

module.exports = router;
