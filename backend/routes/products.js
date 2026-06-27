const express = require('express');
const { Product } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

const formatAttributesForFrontend = (attributesArray) => {
  const obj = {};
  if (Array.isArray(attributesArray)) {
    attributesArray.forEach(attr => {
      if (attr && attr.key) {
        obj[attr.key] = attr.value;
      }
    });
  }
  return obj;
};

const formatAttributesForDatabase = (attributesObj) => {
  const arr = [];
  if (attributesObj && typeof attributesObj === 'object') {
    Object.entries(attributesObj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        arr.push({ key, value: String(value) });
      }
    });
  }
  return arr;
};

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.role === 'admin') {
          isAdmin = true;
        }
      } catch (e) {
        // ignore
      }
    }

    const filter = {};
    if (!isAdmin) {
      filter.status = 'Active';
    }

    const rawProducts = await Product.find(filter).lean();
    const products = rawProducts.map(p => ({
      ...p,
      attributes: formatAttributesForFrontend(p.attributes)
    }));
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

    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.role === 'admin') {
          isAdmin = true;
        }
      } catch (e) {
        // ignore
      }
    }

    const filter = { id };
    if (!isAdmin) {
      filter.status = 'Active';
    }

    const rawProduct = await Product.findOne(filter).lean();
    if (!rawProduct) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    const product = {
      ...rawProduct,
      attributes: formatAttributesForFrontend(rawProduct.attributes)
    };
    res.json({ success: true, product });
  } catch (err) {
    console.error('Fetch product error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch product.' });
  }
});

// POST /api/products - Create a new product
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, category, subCategory, catalogue, price, stock, status, image, description, images, attributes, variants, brand, rating, reviews, discount, originalPrice, badge, isNewArrival, isOffer, includeInLuckyCharm, luckyStock } = req.body;
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Product name, price and stock are required.' });
    }

    if (variants && Array.isArray(variants) && variants.length > 0) {
      if (variants.some(v => !v.image || !v.image.trim())) {
        return res.status(400).json({ success: false, message: 'Each product variant must have an image uploaded.' });
      }
    }

    // Auto-generate sequential numeric ID
    const maxProd = await Product.findOne().sort({ id: -1 });
    const id = maxProd ? maxProd.id + 1 : 1;

    const newProduct = await Product.create({
      id,
      name: name.trim(),
      category: category || 'Clothing > Kids',
      subCategory: subCategory || '',
      catalogue: catalogue || 'Catalogue A',
      price: parseFloat(price) || 0,
      stock: parseInt(stock, 10) || 0,
      sales: 0,
      status: status || 'Active',
      image: image || 'Kids',
      images: images || (image ? [image] : []),
      description: description || '',
      brand: brand || '',
      rating: rating !== undefined ? parseFloat(rating) : 4.8,
      reviews: reviews !== undefined ? parseInt(reviews, 10) : 120,
      discount: discount !== undefined ? parseInt(discount, 10) : 0,
      originalPrice: originalPrice !== undefined ? (parseFloat(originalPrice) || null) : null,
      badge: badge || '',
      isNewArrival: isNewArrival === true || isNewArrival === 'true',
      isOffer: isOffer === true || isOffer === 'true',
      attributes: formatAttributesForDatabase(attributes),
      variants: variants || [],
      includeInLuckyCharm: includeInLuckyCharm === true || includeInLuckyCharm === 'true',
      luckyStock: parseInt(luckyStock, 10) || 0
    });

    const responseProduct = newProduct.toObject();
    responseProduct.attributes = formatAttributesForFrontend(responseProduct.attributes);

    res.status(201).json({ success: true, message: 'Product added successfully!', product: responseProduct });
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

    const { name, category, subCategory, catalogue, price, stock, status, image, description, images, attributes, variants, brand, rating, reviews, discount, originalPrice, badge, isNewArrival, isOffer, includeInLuckyCharm, luckyStock } = req.body;

    if (variants && Array.isArray(variants) && variants.length > 0) {
      if (variants.some(v => !v.image || !v.image.trim())) {
        return res.status(400).json({ success: false, message: 'Each product variant must have an image uploaded.' });
      }
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (category !== undefined) updateFields.category = category;
    if (subCategory !== undefined) updateFields.subCategory = subCategory;
    if (catalogue !== undefined) updateFields.catalogue = catalogue;
    if (price !== undefined) updateFields.price = parseFloat(price) || 0;
    if (stock !== undefined) updateFields.stock = parseInt(stock, 10) || 0;
    if (status !== undefined) updateFields.status = status;
    if (image !== undefined) updateFields.image = image;
    if (description !== undefined) updateFields.description = description;
    if (images !== undefined) updateFields.images = images;
    if (brand !== undefined) updateFields.brand = brand;
    if (rating !== undefined) updateFields.rating = parseFloat(rating);
    if (reviews !== undefined) updateFields.reviews = parseInt(reviews, 10);
    if (discount !== undefined) updateFields.discount = parseInt(discount, 10);
    if (originalPrice !== undefined) updateFields.originalPrice = originalPrice !== null ? (parseFloat(originalPrice) || null) : null;
    if (badge !== undefined) updateFields.badge = badge;
    if (isNewArrival !== undefined) updateFields.isNewArrival = isNewArrival === true || isNewArrival === 'true';
    if (isOffer !== undefined) updateFields.isOffer = isOffer === true || isOffer === 'true';
    if (attributes !== undefined) updateFields.attributes = formatAttributesForDatabase(attributes);
    if (variants !== undefined) updateFields.variants = variants;
    if (includeInLuckyCharm !== undefined) updateFields.includeInLuckyCharm = includeInLuckyCharm === true || includeInLuckyCharm === 'true';
    if (luckyStock !== undefined) updateFields.luckyStock = parseInt(luckyStock, 10) || 0;

    const updated = await Product.findOneAndUpdate(
      { id },
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const responseProduct = {
      ...updated,
      attributes: formatAttributesForFrontend(updated.attributes)
    };

    res.json({ success: true, message: 'Product updated successfully!', product: responseProduct });
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
