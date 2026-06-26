const express = require('express');
const { Order, Product, LuckySpinHistory } = require('../db/database');
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

const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('✅ Razorpay initialized successfully');
  } catch (err) {
    console.error('❌ Failed to initialize Razorpay:', err);
  }
} else {
  console.log('⚠️ Razorpay credentials missing from .env. Running in Mock Mode.');
}

async function decreaseProductStock(orderItems, productSummary) {
  try {
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
    if (orderItems.length === 0 && productSummary) {
      const matchedProd = await Product.findOne({ name: productSummary });
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
  } catch (err) {
    console.error('Error decreasing product stock:', err);
  }
}

async function increaseProductStock(orderItems, productSummary) {
  try {
    for (const item of orderItems) {
      const dbProduct = await Product.findOne({ id: item.productId });
      if (dbProduct) {
        let updatedStock = (dbProduct.stock || 0) + item.quantity;
        let updatedSales = Math.max(0, (dbProduct.sales || 0) - item.quantity);
        let variants = dbProduct.variants || [];

        // If specific variant matches size/color, increment that variant's stock
        if (item.variant && (item.variant.size || item.variant.color)) {
          variants = variants.map(v => {
            const vObj = v.toObject ? v.toObject() : v;
            if (
              (!item.variant.size || vObj.size === item.variant.size) &&
              (!item.variant.color || vObj.color === item.variant.color)
            ) {
              return { ...vObj, stock: (vObj.stock || 0) + item.quantity };
            }
            return vObj;
          });
        }

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

    if (orderItems.length === 0 && productSummary) {
      const matchedProd = await Product.findOne({ name: productSummary });
      if (matchedProd) {
        const updatedStock = (matchedProd.stock || 0) + 1;
        const lowStockThreshold = matchedProd.lowStockThreshold || 5;
        const isLowStock = updatedStock <= lowStockThreshold;
        await Product.updateOne(
          { id: matchedProd.id },
          { 
            $set: { 
              sales: Math.max(0, (matchedProd.sales || 0) - 1),
              stock: updatedStock,
              isLowStock
            } 
          }
        );
      }
    }
  } catch (err) {
    console.error('Error increasing product stock:', err);
  }
}

// POST /api/orders - Place a new order
router.post('/', authenticate, async (req, res) => {
  try {
    const { product, amount, payment, items, catalogueDetails } = req.body;
    if ((!product && (!items || items.length === 0)) || !amount) {
      return res.status(400).json({ success: false, message: 'Product details and amount are required.' });
    }

    const orderItems = items || [];
    const summaryProduct = product || orderItems.map(item => `${item.name} (${item.quantity})`).join(', ');

    // Normalize amount to a number
    let cleanAmountStr = String(amount).replace(/[₹,]/g, '').trim();
    const cleanAmount = parseFloat(cleanAmountStr);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order amount.' });
    }

    const orderId = '#ORD' + Math.floor(1000 + Math.random() * 9000);

    const isLuckyCharmOrder = orderItems.some(item => item.variant && item.variant.isLuckyCharm === true);

    // If payment is Razorpay or UPI, check if we should create a Razorpay order
    if (payment === 'Razorpay' || payment === 'UPI') {
      const amountInPaise = Math.round(cleanAmount * 100);

      // Create Order in DB, but with a status like "Pending Payment"
      const tempOrder = await Order.create({
        id: orderId,
        userId: req.user.id,
        customer: req.user.name,
        product: summaryProduct,
        amount: `₹${cleanAmount}`,
        payment: payment,
        status: 'Pending Payment',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        items: orderItems,
        catalogueDetails: catalogueDetails || {},
        isLuckyCharmOrder
      });

      // If Razorpay instance is active, create real order
      if (razorpayInstance) {
        try {
          const rzpOrder = await razorpayInstance.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: orderId
          });

          return res.status(201).json({
            success: true,
            requiresRazorpay: true,
            razorpayOrderId: rzpOrder.id,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            amount: amountInPaise,
            currency: 'INR',
            orderId: orderId,
            user: {
              name: req.user.name,
              email: req.user.email,
              phone: req.user.phone || ''
            }
          });
        } catch (rzpErr) {
          console.error('Razorpay order creation failed, falling back to mock mode:', rzpErr);
        }
      }

      // Mock Mode Fallback if credentials are missing or Razorpay API failed
      return res.status(201).json({
        success: true,
        requiresRazorpay: true,
        mock: true,
        razorpayOrderId: 'mock_order_' + Math.floor(100000 + Math.random() * 900000),
        razorpayKeyId: 'rzp_test_mock_key',
        amount: amountInPaise,
        currency: 'INR',
        orderId: orderId,
        user: {
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone || ''
        }
      });
    }

    // Cash on Delivery (COD) Flow - directly create the order and decrease stock
    const newOrder = await Order.create({
      id: orderId,
      userId: req.user.id,
      customer: req.user.name,
      product: summaryProduct,
      amount: `₹${cleanAmount}`,
      payment: 'COD',
      status: 'Processing',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      items: orderItems,
      catalogueDetails: catalogueDetails || {},
      isLuckyCharmOrder
    });

    // Update pending lucky spin history records if any
    if (isLuckyCharmOrder) {
      for (const item of orderItems) {
        if (item.variant && item.variant.isLuckyCharm === true) {
          await LuckySpinHistory.findOneAndUpdate(
            { productId: item.productId, claimStatus: 'Pending', ...(req.user ? { userId: req.user.id } : {}) },
            { $set: { claimStatus: 'Claimed', orderId: orderId, order: orderId } },
            { sort: { spinTime: -1 } }
          );
        }
      }
    }

    // Decrease stock for items (same as existing logic)
    await decreaseProductStock(orderItems, product);

    res.status(201).json({ success: true, message: 'Order placed successfully!', order: newOrder });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: 'Failed to place order.' });
  }
});

// POST /api/orders/verify - Verify Razorpay payment signature
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !orderId) {
      return res.status(400).json({ success: false, message: 'Missing payment verification details.' });
    }

    const isMock = razorpay_order_id.startsWith('mock_') || razorpay_order_id === 'mock_checkout';
    let verified = false;

    if (isMock) {
      verified = true;
    } else {
      const secret = process.env.RAZORPAY_KEY_SECRET || '';
      const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

      if (generated_signature === razorpay_signature) {
        verified = true;
      }
    }

    if (!verified) {
      // Payment verification failed
      await Order.updateOne({ id: orderId }, { $set: { status: 'Payment Failed' } });
      return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
    }

    // Fetch order
    const order = await Order.findOne({ id: orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found.' });
    }

    // Update order status to Processing
    await Order.updateOne({ id: orderId }, { $set: { status: 'Processing' } });

    // Update pending lucky spin history records if any
    if (order.isLuckyCharmOrder) {
      for (const item of order.items || []) {
        if (item.variant && item.variant.isLuckyCharm === true) {
          await LuckySpinHistory.findOneAndUpdate(
            { productId: item.productId, claimStatus: 'Pending', ...(req.user ? { userId: req.user.id } : {}) },
            { $set: { claimStatus: 'Claimed', orderId: orderId, order: orderId } },
            { sort: { spinTime: -1 } }
          );
        }
      }
    }

    // Decrease product stock (since payment succeeded)
    await decreaseProductStock(order.items || [], order.product);

    // Return the updated order
    const updatedOrder = await Order.findOne({ id: orderId }).lean();
    res.json({ success: true, message: 'Payment verified successfully!', order: updatedOrder });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
});


// PUT /api/orders/:id/cancel - Cancel order by customer
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({ id: orderId, userId: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const currentStatus = order.status ? order.status.toLowerCase() : '';
    if (currentStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled.' });
    }

    if (currentStatus !== 'pending' && currentStatus !== 'processing' && currentStatus !== 'pending payment') {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled in its current state.' });
    }

    // Re-increment stock
    await increaseProductStock(order.items || [], order.product);

    order.status = 'Cancelled';
    await order.save();

    // If it is a lucky charm order, mark the claims as Cancelled/Pending again so they can claim it
    if (order.isLuckyCharmOrder) {
      for (const item of order.items || []) {
        if (item.variant && item.variant.isLuckyCharm === true) {
          await LuckySpinHistory.findOneAndUpdate(
            { orderId: orderId, claimStatus: 'Claimed' },
            { $set: { claimStatus: 'Pending', orderId: null, order: null } }
          );
        }
      }
    }

    res.json({ success: true, message: 'Order cancelled successfully.', order });
  } catch (err) {
    console.error('Cancel order error:', err);
    res.status(500).json({ success: false, message: 'Failed to cancel order.' });
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

    const oldStatus = order.status ? order.status.toLowerCase() : '';
    const newStatus = status ? status.toLowerCase() : '';

    // If changing to Cancelled and it was not previously Cancelled, increase stock
    if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
      await increaseProductStock(order.items || [], order.product);
      
      // Revert lucky charm claims back to pending so they can claim again
      if (order.isLuckyCharmOrder) {
        for (const item of order.items || []) {
          if (item.variant && item.variant.isLuckyCharm === true) {
            await LuckySpinHistory.findOneAndUpdate(
              { orderId: orderId, claimStatus: 'Claimed' },
              { $set: { claimStatus: 'Pending', orderId: null, order: null } }
            );
          }
        }
      }
    } 
    // If reversing from Cancelled to something else (e.g. Processing), decrease stock again
    else if (oldStatus === 'cancelled' && newStatus !== 'cancelled' && newStatus !== '') {
      await decreaseProductStock(order.items || [], order.product);
      
      // Update claim status if it's lucky charm
      if (order.isLuckyCharmOrder) {
        for (const item of order.items || []) {
          if (item.variant && item.variant.isLuckyCharm === true) {
            await LuckySpinHistory.findOneAndUpdate(
              { productId: item.productId, claimStatus: 'Pending', ...(order.userId ? { userId: order.userId } : {}) },
              { $set: { claimStatus: 'Claimed', orderId: orderId, order: orderId } },
              { sort: { spinTime: -1 } }
            );
          }
        }
      }
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
