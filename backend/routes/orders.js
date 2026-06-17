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
    const { product, amount, payment, items, catalogueDetails } = req.body;
    if ((!product && (!items || items.length === 0)) || !amount) {
      return res.status(400).json({ success: false, message: 'Product details and amount are required.' });
    }

    const orderItems = items || [];
    const summaryProduct = product || orderItems.map(item => `${item.name} (${item.quantity})`).join(', ');

    const newOrder = await Order.create({
      id: '#ORD' + Math.floor(1000 + Math.random() * 9000),
      userId: req.user.id,
      customer: req.user.name,
      product: summaryProduct,
      amount: amount.startsWith('₹') ? amount : `₹${amount}`,
      payment: payment || 'Razorpay',
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      items: orderItems,
      catalogueDetails: catalogueDetails || {}
    });

    // Update stock and sales for products
    for (const item of orderItems) {
      const dbProduct = await Product.findOne({ id: item.productId });
      if (dbProduct) {
        let updatedStock = Math.max(0, (dbProduct.stock || 0) - item.quantity);
        let updatedSales = (dbProduct.sales || 0) + item.quantity;
        let variants = dbProduct.variants || [];

        // If specific variant matches size/color, decrement that variant's stock
        if (item.variant && (item.variant.size || item.variant.color)) {
          variants = variants.map(v => {
            const vObj = v.toObject ? v.toObject() : v;
            if (
              (!item.variant.size || vObj.size === item.variant.size) &&
              (!item.variant.color || vObj.color === item.variant.color)
            ) {
              return { ...vObj, stock: Math.max(0, (vObj.stock || 0) - item.quantity) };
            }
            return vObj;
          });
        }

        // Low stock warning recalculation
        const lowStockThreshold = dbProduct.lowStockThreshold || 5;
        const isLowStock = updatedStock <= lowStockThreshold;

        await Product.updateOne(
          { id: dbProduct.id },
          { 
            $set: { 
              stock: updatedStock,
              sales: updatedSales,
              variants,
              isLowStock
            } 
          }
        );
      }
    }

    // Fallback legacy logic if no items array was passed (e.g. legacy client)
    if (orderItems.length === 0 && product) {
      const matchedProd = await Product.findOne({ name: product });
      if (matchedProd) {
        const updatedStock = Math.max(0, (matchedProd.stock || 1) - 1);
        const lowStockThreshold = matchedProd.lowStockThreshold || 5;
        const isLowStock = updatedStock <= lowStockThreshold;
        await Product.updateOne(
          { id: matchedProd.id },
          { 
            $set: { 
              sales: (matchedProd.sales || 0) + 1,
              stock: updatedStock,
              isLowStock
            } 
          }
        );
      }
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
