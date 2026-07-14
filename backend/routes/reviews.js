const express = require('express');
const { Review, Product, Order } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

// Helper to recalculate average rating and review count for a product
async function recalculateProductRating(productName) {
  try {
    const approvedReviews = await Review.find({ 
      productName: { $regex: new RegExp("^" + productName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") },
      status: 'Approved' 
    });
    const reviewsCount = approvedReviews.length;
    let avgRating = 0;
    if (reviewsCount > 0) {
      const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = Math.round((sum / reviewsCount) * 10) / 10;
    } else {
      avgRating = 0; // Default if no approved reviews
    }
    await Product.updateOne(
      { name: { $regex: new RegExp("^" + productName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") } },
      { $set: { rating: avgRating, reviews: reviewsCount } }
    );
  } catch (err) {
    console.error('Error recalculating product rating:', err);
  }
}

// GET /api/reviews - Get reviews (all for admin, only Approved for customers/guests)
router.get('/', async (req, res) => {
  try {
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.role === 'admin') {
          isAdmin = true;
        }
      } catch (err) {
        // Ignore verify error, treat as non-admin
      }
    }

    let filter = {};
    if (!isAdmin) {
      filter.status = 'Approved';
    }

    const reviews = await Review.find(filter).lean();
    res.json({ success: true, reviews });
  } catch (err) {
    console.error('Fetch reviews error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// GET /api/reviews/my-reviews - Get reviews written by the logged-in user
router.get('/my-reviews', authenticate, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id }).sort({ id: -1 }).lean();
    res.json({ success: true, reviews });
  } catch (err) {
    console.error('Fetch my-reviews error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch your reviews.' });
  }
});

// POST /api/reviews - Submit a new review
router.post('/', authenticate, async (req, res) => {
  try {
    const { productName, rating, comment, productImage, productId, images } = req.body;
    if (!productName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Product name, rating and review text are required.' });
    }

    const cleanProductName = productName.trim();

    // 1. Check if user already submitted a review for this product
    const existingReview = await Review.findOne({
      userId: req.user.id,
      productName: { $regex: new RegExp("^" + cleanProductName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") }
    });
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this product. Please edit or delete your existing review.' 
      });
    }

    // 2. Check if user has a delivered order for this product
    const userOrders = await Order.find({ userId: req.user.id }).lean();
    let hasDeliveredOrder = false;
    for (const o of userOrders) {
      if (o.status && o.status.toLowerCase() === 'delivered') {
        const match = o.items && o.items.some(item => 
          (item.name && String(item.name).toLowerCase().trim() === cleanProductName.toLowerCase()) ||
          (productId && String(item.productId) === String(productId))
        );
        if (match) {
          hasDeliveredOrder = true;
          break;
        }
      }
    }

    if (!hasDeliveredOrder) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customers who have successfully received a Delivered order can submit a review.' 
      });
    }

    // Verify images count limit (up to 5 images)
    let reviewImages = [];
    if (Array.isArray(images)) {
      if (images.length > 5) {
        return res.status(400).json({ success: false, message: 'You can upload up to 5 images.' });
      }
      reviewImages = images;
    }

    const maxReview = await Review.findOne().sort({ id: -1 });
    const id = maxReview ? maxReview.id + 1 : 1;

    const newReview = await Review.create({
      id,
      productName: cleanProductName,
      productImage: productImage || 'Kids',
      customerName: req.user.name,
      rating: parseInt(rating, 10) || 5,
      comment: comment.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Pending',
      reply: '',
      userId: req.user.id,
      verifiedPurchase: true,
      images: reviewImages
    });

    // Recalculate rating
    await recalculateProductRating(cleanProductName);

    res.status(201).json({ success: true, message: 'Review submitted successfully! It will appear once approved.', review: newReview });
  } catch (err) {
    console.error('Submit review error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

// PUT /api/reviews/:id - Update review (customer edits, or admin moderates/replies)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid review ID.' });

    const review = await Review.findOne({ id });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = review.userId === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this review.' });
    }

    if (isOwner && !isAdmin) {
      // Customer is editing their own review
      const { rating, comment, images } = req.body;
      if (rating === undefined && comment === undefined && images === undefined) {
        return res.status(400).json({ success: false, message: 'Nothing to update.' });
      }

      if (rating !== undefined) review.rating = parseInt(rating, 10) || 5;
      if (comment !== undefined) review.comment = comment.trim();
      if (images !== undefined) {
        if (Array.isArray(images)) {
          if (images.length > 5) {
            return res.status(400).json({ success: false, message: 'You can upload up to 5 images.' });
          }
          review.images = images;
        }
      }

      // Revert status to Pending on edit and clear reply
      review.status = 'Pending';
      review.reply = '';
      
      await review.save();
      await recalculateProductRating(review.productName);

      return res.json({ 
        success: true, 
        message: 'Review updated successfully and is now pending admin approval.', 
        review 
      });
    } else {
      // Admin is moderating
      const { status } = req.body;

      if (status !== undefined) {
        review.status = status;
      }

      await review.save();
      await recalculateProductRating(review.productName);

      return res.json({ 
        success: true, 
        message: 'Review updated successfully!', 
        review 
      });
    }
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({ success: false, message: 'Failed to update review.' });
  }
});

// POST /api/reviews/:id/helpful - Toggle helpful vote
router.post('/:id/helpful', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid review ID.' });

    const review = await Review.findOne({ id });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.status !== 'Approved') {
      return res.status(400).json({ success: false, message: 'Only approved reviews can be marked helpful.' });
    }

    if (!review.helpfulUsers) {
      review.helpfulUsers = [];
    }

    const userId = req.user.id;
    const index = review.helpfulUsers.indexOf(userId);
    let voted = false;

    if (index > -1) {
      review.helpfulUsers.splice(index, 1);
      review.helpfulCount = Math.max(0, (review.helpfulCount || 0) - 1);
    } else {
      review.helpfulUsers.push(userId);
      review.helpfulCount = (review.helpfulCount || 0) + 1;
      voted = true;
    }

    await review.save();

    res.json({ 
      success: true, 
      helpfulCount: review.helpfulCount, 
      voted, 
      message: voted ? 'Marked as helpful!' : 'Removed helpful mark.' 
    });
  } catch (err) {
    console.error('Helpful review toggle error:', err);
    res.status(500).json({ success: false, message: 'Failed to update helpful status.' });
  }
});

// DELETE /api/reviews/:id - Delete review (by owner or admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid review ID.' });

    const review = await Review.findOne({ id });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = review.userId === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this review.' });
    }

    const productName = review.productName;
    await Review.deleteOne({ id });
    await recalculateProductRating(productName);

    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
});

module.exports = router;
