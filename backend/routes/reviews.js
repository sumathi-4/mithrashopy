const express = require('express');
const { Review } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/reviews - Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().lean();
    res.json({ success: true, reviews });
  } catch (err) {
    console.error('Fetch reviews error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// POST /api/reviews - Submit a new review
router.post('/', authenticate, async (req, res) => {
  try {
    const { productName, rating, comment, productImage } = req.body;
    if (!productName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Product name, rating and review text are required.' });
    }

    const maxReview = await Review.findOne().sort({ id: -1 });
    const id = maxReview ? maxReview.id + 1 : 1;

    const newReview = await Review.create({
      id,
      productName: productName.trim(),
      productImage: productImage || 'Kids',
      customerName: req.user.name,
      rating: parseInt(rating, 10) || 5,
      comment: comment.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Pending',
      reply: ''
    });

    res.status(201).json({ success: true, message: 'Review submitted successfully! It will appear once approved.', review: newReview });
  } catch (err) {
    console.error('Submit review error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

// PUT /api/reviews/:id - Moderate review (Approve/Reject/Reply)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid review ID.' });

    const { status, reply } = req.body;

    const review = await Review.findOne({ id });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (reply !== undefined) updateFields.reply = reply.trim();

    const updated = await Review.findOneAndUpdate(
      { id },
      { $set: updateFields },
      { new: true }
    ).lean();

    res.json({ success: true, message: 'Review moderated successfully!', review: updated });
  } catch (err) {
    console.error('Moderate review error:', err);
    res.status(500).json({ success: false, message: 'Failed to moderate review.' });
  }
});

// DELETE /api/reviews/:id - Delete review
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid review ID.' });

    const result = await Review.deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
});

module.exports = router;
