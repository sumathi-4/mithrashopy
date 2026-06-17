const express = require('express');
const { Order, Product } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/orders - Get orders (admin gets all, user gets their own)
router.get('/', authenticate, async (req, res) => {
  try {
    let orders = [];
    if (req.user.role === 'admin') {
      orders = await Order.find().lean();
    } else {
      orders = await Order.find({ userId: req.user.id }).lean();
    }
    res.json({ success: true, orders });
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

// POST /api/orders - Place a new order
router.post('/', authenticate, async (req, res) => {
  try {
    const { product, amount, payment } = req.body;
    if (!product || !amount) {
      return res.status(400).json({ success: false, message: 'Product title and amount are required.' });
    }

    const newOrder = await Order.create({
      id: '#ORD' + Math.floor(1000 + Math.random() * 9000),
      userId: req.user.id,
      customer: req.user.name,
      product: product,
      amount: amount.startsWith('₹') ? amount : `₹${amount}`,
      payment: payment || 'Razorpay',
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    });

    // Increment sales for matched product if we have it
    const matchedProd = await Product.findOne({ name: product });
    if (matchedProd) {
      await Product.updateOne(
        { id: matchedProd.id },
        { 
          $set: { 
            sales: (matchedProd.sales || 0) + 1,
            stock: Math.max(0, (matchedProd.stock || 1) - 1)
          } 
        }
      );
    }

    res.status(201).json({ success: true, message: 'Order placed successfully!', order: newOrder });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: 'Failed to place order.' });
  }
});

// PUT /api/orders/:id - Update order status (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const order = await Order.findOne({ id: orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const updated = await Order.findOneAndUpdate(
      { id: orderId },
      { $set: { status: status || order.status } },
      { new: true }
    ).lean();

    res.json({ success: true, message: 'Order status updated successfully!', order: updated });
  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ success: false, message: 'Failed to update order.' });
  }
});

// DELETE /api/orders/:id - Delete order record (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const result = await Order.deleteOne({ id: orderId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, message: 'Order record deleted successfully.' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete order.' });
  }
});

module.exports = router;
