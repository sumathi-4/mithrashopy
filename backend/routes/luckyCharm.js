const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { Product, Order, Campaign, LuckySpinHistory, User, LuckyWheelSession } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mithirashoppy_secret_key';

// Helper: Decode user ID from token optionally
function getUserIdFromRequest(req) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded.id || decoded.userId || null;
    }
  } catch (err) {
    // Ignore, treat as guest
  }
  return null;
}

// Helper: Normalize and SHA-256 hash cart items
function generateCartHash(cartItems) {
  if (!cartItems || !Array.isArray(cartItems)) return '';
  const normalized = cartItems
    .map(item => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity) || 1,
      variant: item.variant || {}
    }))
    .sort((a, b) => a.productId - b.productId);
  return crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

// Helper: Calculate cart total (excluding lucky charm items)
async function calculateCartTotal(cartItems) {
  let total = 0;
  if (!cartItems || !Array.isArray(cartItems)) return total;

  for (const item of cartItems) {
    if (item.variant && item.variant.isLuckyCharm === true) {
      continue;
    }

    const productId = Number(item.productId);
    if (isNaN(productId)) continue;

    const product = await Product.findOne({ id: productId });
    if (!product) continue;

    let price = product.price;

    // Check variant pricing if color/size specified
    if (item.variant && product.variants && product.variants.length > 0) {
      const color = item.variant.color;
      const size = item.variant.size;
      let matchedVar = product.variants.find(v => 
        (color && v.color && String(v.color).toLowerCase() === String(color).toLowerCase()) &&
        (size && v.size && String(v.size).toLowerCase() === String(size).toLowerCase())
      );
      if (!matchedVar && color) {
        matchedVar = product.variants.find(v => v.color && String(v.color).toLowerCase() === String(color).toLowerCase());
      }
      if (matchedVar && matchedVar.price !== null && matchedVar.price !== undefined) {
        price = matchedVar.price;
      }
    }

    total += price * (parseInt(item.quantity, 10) || 1);
  }
  return total;
}

// Helper: Extract cart items from request body/session fallback
async function getCartItemsFromRequest(req) {
  let cartItems = [];
  if (req.body && req.body.cartItems) {
    cartItems = req.body.cartItems;
  }
  
  if ((!cartItems || cartItems.length === 0)) {
    const userId = getUserIdFromRequest(req);
    if (userId) {
      const user = await User.findOne({ id: userId });
      if (user && user.cartItems && user.cartItems.length > 0) {
        cartItems = user.cartItems;
      }
    }
  }
  return cartItems;
}

// GET /api/lucky-charms/my-claims - Fetch logged-in user's claims/spins
router.get('/my-claims', authenticate, async (req, res) => {
  try {
    const history = await LuckySpinHistory.find({ userId: req.user.id }).sort({ spinTime: -1 }).lean();
    const mapped = [];
    for (const h of history) {
      let image = 'Accessories';
      if (h.productId) {
        const prod = await Product.findOne({ id: h.productId });
        if (prod) image = prod.image;
      }
      mapped.push({
        _id: h._id,
        rewardType: 'product',
        productId: h.productId,
        rewardName: h.wonProduct,
        rewardValue: 0,
        status: h.claimStatus,
        claimedAt: h.spinTime,
        image
      });
    }
    res.json({ success: true, claims: mapped });
  } catch (err) {
    console.error('Fetch my-claims error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch claims.' });
  }
});

// GET /api/lucky-charms/campaign-products - Fetch campaign products for wheel creation (Backward compatibility)
router.get('/campaign-products', async (req, res) => {
  try {
    const now = new Date();
    const activeCampaign = await Campaign.findOne({
      status: 'Active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    const limit = activeCampaign ? activeCampaign.wheelProductCount : 8;

    // Fetch active products
    const activeProducts = await Product.find({
      includeInLuckyCharm: true,
      luckyStock: { $gt: 0 }
    }).limit(limit).lean();

    const unifiedList = activeProducts.map(p => ({
      _id: p._id,
      rewardName: p.name,
      rewardType: 'product',
      productId: p.id,
      couponId: null,
      luckyStock: p.luckyStock || 0,
      luckyPrice: 0,
      image: p.image,
      value: 0
    }));

    res.json({ success: true, rewards: unifiedList });
  } catch (err) {
    console.error('Fetch campaign products error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch campaign products.' });
  }
});

// POST /api/lucky-charms/check-eligibility - Check eligibility and generate session-bound wheel products
router.post('/check-eligibility', async (req, res) => {
  try {
    const cartItems = await getCartItemsFromRequest(req);
    const cartTotal = await calculateCartTotal(cartItems);
    
    // Prevent multiple spins for the same cart/order:
    // 1. Check if cart already has a claimed reward
    const hasReward = cartItems.some(item => item.variant && item.variant.isLuckyCharm === true);
    if (hasReward) {
      return res.json({ success: true, available: false, message: 'You have already claimed a Lucky Charm reward for this cart.', cartTotal });
    }

    // 2. Check if logged in user has a pending spin history record
    const userId = getUserIdFromRequest(req);
    if (userId) {
      const pendingSpin = await LuckySpinHistory.findOne({ userId, claimStatus: 'Pending', orderId: null });
      if (pendingSpin) {
        return res.json({ 
          success: true, 
          available: false, 
          message: 'You have a pending reward from your last spin. Please complete your checkout or claim your reward before spinning again.',
          cartTotal
        });
      }
    }

    // Find current active campaign
    const now = new Date();
    const activeCampaigns = await Campaign.find({
      status: 'Active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).lean();

    const activeCampaign = activeCampaigns.find(c => {
      const minVal = c.minOrderValue || 0;
      const maxVal = c.maxOrderValue;
      if (cartTotal < minVal) return false;
      if (maxVal !== null && maxVal !== undefined && cartTotal > maxVal) return false;
      return true;
    });

    if (!activeCampaign) {
      return res.json({ 
        success: true, 
        available: false, 
        message: `No active lucky charm campaign found for your cart value. (Cart Subtotal: ₹${cartTotal})`,
        cartTotal
      });
    }

    // Enforce campaign usage limits
    const spinCount = await LuckySpinHistory.countDocuments({ campaignId: activeCampaign._id });
    if (activeCampaign.campaignUsageLimit !== null && activeCampaign.campaignUsageLimit !== undefined) {
      if (spinCount >= activeCampaign.campaignUsageLimit) {
        return res.json({ 
          success: true, 
          available: false, 
          message: 'This campaign has reached its usage limit.',
          cartTotal
        });
      }
    }

    // Generate cart hash to verify session validity
    const cartHash = generateCartHash(cartItems);

    // Optimize: Reuse existing valid session if cart, campaign, user, and expiry match
    const oneHourAgo = new Date(Date.now() - 3600 * 1000);
    const existingSession = await LuckyWheelSession.findOne({
      userId,
      cartHash,
      campaignId: activeCampaign._id,
      isUsed: false,
      createdAt: { $gt: oneHourAgo }
    }).populate('wheelProducts');

    if (existingSession && existingSession.wheelProducts && existingSession.wheelProducts.length > 0) {
      const unifiedList = existingSession.wheelProducts
        .filter(p => p && p.luckyStock > 0 && p.status === 'Active')
        .map(p => ({
          _id: p._id,
          rewardName: p.name,
          rewardType: 'product',
          productId: p.id,
          couponId: null,
          luckyStock: p.luckyStock || 0,
          luckyPrice: 0,
          image: p.image,
          value: 0
        }));

      if (unifiedList.length > 0) {
        return res.json({ 
          success: true, 
          available: true, 
          sessionId: existingSession.sessionId, 
          rewards: unifiedList, 
          campaign: activeCampaign,
          reused: true,
          message: 'Valid session reused successfully.',
          cartTotal
        });
      }
    }

    // Find all candidate products
    const candidateProducts = await Product.find({
      includeInLuckyCharm: true,
      luckyStock: { $gt: 0 },
      price: { $lte: activeCampaign.rewardBudget },
      status: 'Active'
    });

    if (candidateProducts.length === 0) {
      return res.json({ 
        success: true, 
        available: false, 
        message: 'No eligible products are currently available in stock.',
        cartTotal
      });
    }

    // Randomly select the configured number of products
    const limit = activeCampaign.wheelProductCount || 8;
    const shuffled = [...candidateProducts].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, limit);

    // Create a new session with unique ID and campaign snapshot
    const sessionId = crypto.randomBytes(16).toString('hex');
    await LuckyWheelSession.create({
      sessionId,
      userId,
      cartHash,
      wheelProducts: selectedProducts.map(p => p._id),
      campaignId: activeCampaign._id,
      campaignSnapshot: {
        campaignName: activeCampaign.campaignName,
        rewardBudget: activeCampaign.rewardBudget,
        wheelProductCount: activeCampaign.wheelProductCount,
        minOrderValue: activeCampaign.minOrderValue,
        maxOrderValue: activeCampaign.maxOrderValue
      }
    });

    const unifiedList = selectedProducts.map(p => ({
      _id: p._id,
      rewardName: p.name,
      rewardType: 'product',
      productId: p.id,
      couponId: null,
      luckyStock: p.luckyStock || 0,
      luckyPrice: 0,
      image: p.image,
      value: 0
    }));

    res.json({ 
      success: true, 
      available: true, 
      sessionId, 
      rewards: unifiedList, 
      campaign: activeCampaign,
      reused: false,
      message: 'New session generated successfully.',
      cartTotal
    });
  } catch (err) {
    console.error('Check eligibility error:', err);
    res.status(500).json({ success: false, message: 'Failed to check eligibility.' });
  }
});

// POST /api/lucky-charms/spin - Spin the wheel and select a reward dynamically using session ID
router.post('/spin', async (req, res) => {
  const startTime = Date.now();
  try {
    const { sessionId } = req.body;
    const cartItems = await getCartItemsFromRequest(req);

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required.' });
    }

    // Find the session and verify it hasn't been used
    const wheelSession = await LuckyWheelSession.findOne({ sessionId, isUsed: false });
    if (!wheelSession) {
      return res.json({ success: false, message: 'Invalid, expired, or already used spin session.' });
    }

    // Revalidate cart hash to make sure cart didn't change
    const currentHash = generateCartHash(cartItems);
    if (currentHash !== wheelSession.cartHash) {
      return res.json({ success: false, message: 'Cart contents have changed. Please re-verify eligibility.' });
    }

    // Find the campaign and revalidate it is still active
    const activeCampaign = await Campaign.findById(wheelSession.campaignId);
    if (!activeCampaign || activeCampaign.status !== 'Active') {
      return res.json({ success: false, message: 'The campaign is no longer active.' });
    }

    const now = new Date();
    if (activeCampaign.startDate > now || activeCampaign.endDate < now) {
      return res.json({ success: false, message: 'The campaign has expired.' });
    }

    // Calculate cart total for eligibility revalidation
    const cartTotal = await calculateCartTotal(cartItems);
    if (cartTotal < activeCampaign.minOrderValue || (activeCampaign.maxOrderValue !== null && cartTotal > activeCampaign.maxOrderValue)) {
      return res.json({ success: false, message: 'Cart total does not satisfy campaign requirements.' });
    }

    // Revalidate usage limits
    const spinCount = await LuckySpinHistory.countDocuments({ campaignId: activeCampaign._id });
    if (activeCampaign.campaignUsageLimit !== null && activeCampaign.campaignUsageLimit !== undefined) {
      if (spinCount >= activeCampaign.campaignUsageLimit) {
        return res.json({ success: false, message: 'This campaign usage limit has been reached.' });
      }
    }

    // Fetch and revalidate candidates that are part of the session
    const candidateProducts = await Product.find({
      _id: { $in: wheelSession.wheelProducts },
      includeInLuckyCharm: true,
      luckyStock: { $gt: 0 },
      status: 'Active'
    });

    if (candidateProducts.length === 0) {
      return res.json({ success: true, won: false, message: 'None of the candidate products are available in stock.' });
    }

    // Select winner from the candidates
    const randomIndex = Math.floor(Math.random() * candidateProducts.length);
    const selectedProduct = candidateProducts[randomIndex];

    // Atomically decrement lucky stock
    const wonProduct = await Product.findOneAndUpdate(
      { _id: selectedProduct._id, luckyStock: { $gt: 0 } },
      { $inc: { luckyStock: -1 } },
      { new: true }
    );

    if (!wonProduct) {
      return res.json({ success: true, won: false, message: 'Selected product is out of stock. Try again!' });
    }

    // Mark session as used
    await LuckyWheelSession.findOneAndUpdate({ sessionId }, { isUsed: true });

    const userId = getUserIdFromRequest(req);
    let userName = 'Guest';
    if (userId) {
      const userObj = await User.findOne({ id: userId });
      if (userObj) {
        userName = userObj.name;
      }
    }

    // Create spin history record
    const spinHistoryRecord = await LuckySpinHistory.create({
      userId,
      user: userName,
      campaignId: activeCampaign._id,
      campaign: activeCampaign.campaignName,
      orderId: null,
      order: null,
      productId: wonProduct.id,
      wonProduct: wonProduct.name,
      spinTime: new Date(),
      claimStatus: 'Pending',
      sessionId: wheelSession.sessionId,
      cartTotal,
      rewardBudget: activeCampaign.rewardBudget,
      wonProductPrice: wonProduct.price,
      luckyStockBefore: wonProduct.luckyStock + 1,
      luckyStockAfter: wonProduct.luckyStock,
      spinDuration: Date.now() - startTime
    });

    res.json({
      success: true,
      won: true,
      reward: {
        id: wonProduct.id,
        rewardName: wonProduct.name,
        rewardType: 'product',
        productId: wonProduct.id,
        couponCode: null,
        rewardValue: 0,
        image: wonProduct.image
      },
      claimId: spinHistoryRecord._id,
      message: 'Spin completed successfully.'
    });
  } catch (err) {
    console.error('Spin error:', err);
    res.status(500).json({ success: false, message: 'Failed to process spin.' });
  }
});

// GET /api/lucky-charms/stats - Admin Dashboard statistics
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const totalSpins = await LuckySpinHistory.countDocuments();
    
    // Today's spins
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaysSpins = await LuckySpinHistory.countDocuments({ spinTime: { $gte: startOfToday } });

    // Claims status
    const rewardsGiven = await LuckySpinHistory.countDocuments({ claimStatus: 'Claimed' });

    // Active rewards count (active products with includeInLuckyCharm: true and stock > 0)
    const activeRewards = await Product.countDocuments({ includeInLuckyCharm: true, luckyStock: { $gt: 0 } });

    // Revenue generated by Lucky Charm orders
    const luckyOrders = await Order.find({ isLuckyCharmOrder: true });
    let revenueGenerated = 0;
    luckyOrders.forEach(o => {
      const val = parseFloat(String(o.amount).replace(/[₹,]/g, '').trim());
      if (!isNaN(val)) revenueGenerated += val;
    });

    // Conversion rate
    const conversionRate = totalSpins > 0 ? parseFloat(((rewardsGiven / totalSpins) * 100).toFixed(1)) : 0;

    // Top rewards won details (aggregations)
    const productSpins = await LuckySpinHistory.aggregate([
      { $match: { productId: { $ne: null } } },
      { $group: { _id: '$productId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topWonProducts = [];
    for (const ps of productSpins) {
      const prod = await Product.findOne({ id: ps._id });
      topWonProducts.push({
        name: prod ? prod.name : `Product #${ps._id}`,
        count: ps.count
      });
    }

    // Repeat players count
    const spinUserGroups = await LuckySpinHistory.aggregate([
      { $match: { userId: { $ne: null } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    const repeatPlayers = spinUserGroups.length;

    res.json({
      success: true,
      stats: {
        totalSpins,
        todaysSpins,
        rewardsGiven,
        activeRewards,
        revenueGenerated,
        conversionRate,
        repeatPlayers,
        topWonProducts,
        topWonCoupons: []
      }
    });
  } catch (err) {
    console.error('Fetch stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to compute dashboard stats.' });
  }
});

// ─── CAMPAIGN ROUTES (Admin) ────────────────────────────────────────────────
// GET /api/lucky-charms/campaigns - Fetch all campaigns
router.get('/campaigns', authenticate, requireAdmin, async (req, res) => {
  try {
    const campaigns = await Campaign.find().lean();
    res.json({ success: true, campaigns });
  } catch (err) {
    console.error('Fetch campaigns error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch campaigns.' });
  }
});

// POST /api/lucky-charms/campaigns - Create a new campaign
router.post('/campaigns', authenticate, requireAdmin, async (req, res) => {
  try {
    const { campaignName, minOrderValue, maxOrderValue, rewardBudget, wheelProductCount, campaignUsageLimit, startDate, endDate, status } = req.body;
    if (!campaignName || rewardBudget === undefined || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Campaign name, reward budget, start date, and end date are required.' });
    }

    const campaign = await Campaign.create({
      campaignName,
      name: campaignName, // support backward compatibility
      minOrderValue: parseFloat(minOrderValue) || 0,
      maxOrderValue: maxOrderValue !== undefined && maxOrderValue !== null ? parseFloat(maxOrderValue) : null,
      rewardBudget: parseFloat(rewardBudget) || 0,
      wheelProductCount: parseInt(wheelProductCount, 10) || 8,
      campaignUsageLimit: campaignUsageLimit !== undefined && campaignUsageLimit !== null ? parseInt(campaignUsageLimit, 10) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || 'Active'
    });

    res.status(201).json({ success: true, campaign });
  } catch (err) {
    console.error('Create campaign error:', err);
    res.status(500).json({ success: false, message: 'Failed to create campaign.' });
  }
});

// PUT /api/lucky-charms/campaigns/:id - Update an existing campaign
router.put('/campaigns/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { campaignName, minOrderValue, maxOrderValue, rewardBudget, wheelProductCount, campaignUsageLimit, startDate, endDate, status } = req.body;

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    const updated = await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          campaignName: campaignName || campaign.campaignName,
          name: campaignName || campaign.name, // support backward compatibility
          minOrderValue: minOrderValue !== undefined ? parseFloat(minOrderValue) : campaign.minOrderValue,
          maxOrderValue: maxOrderValue !== undefined ? (maxOrderValue !== null ? parseFloat(maxOrderValue) : null) : campaign.maxOrderValue,
          rewardBudget: rewardBudget !== undefined ? parseFloat(rewardBudget) : campaign.rewardBudget,
          wheelProductCount: wheelProductCount !== undefined ? parseInt(wheelProductCount, 10) : campaign.wheelProductCount,
          campaignUsageLimit: campaignUsageLimit !== undefined ? (campaignUsageLimit !== null ? parseInt(campaignUsageLimit, 10) : null) : campaign.campaignUsageLimit,
          startDate: startDate ? new Date(startDate) : campaign.startDate,
          endDate: endDate ? new Date(endDate) : campaign.endDate,
          status: status || campaign.status
        }
      },
      { new: true }
    ).lean();

    res.json({ success: true, campaign: updated });
  } catch (err) {
    console.error('Update campaign error:', err);
    res.status(500).json({ success: false, message: 'Failed to update campaign.' });
  }
});

// DELETE /api/lucky-charms/campaigns/:id - Delete a campaign
router.delete('/campaigns/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await Campaign.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }
    res.json({ success: true, message: 'Campaign deleted successfully.' });
  } catch (err) {
    console.error('Delete campaign error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete campaign.' });
  }
});

// ─── LUCKY SPIN HISTORY ROUTES ──────────────────────────────────────────────
// GET /api/lucky-charms/spin-history - Fetch all spin history records (Admin)
router.get('/spin-history', authenticate, requireAdmin, async (req, res) => {
  try {
    const spinHistory = await LuckySpinHistory.find().sort({ spinTime: -1 }).populate('campaignId').lean();
    res.json({ success: true, spinHistory });
  } catch (err) {
    console.error('Fetch spin history error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch spin history.' });
  }
});

// POST /api/lucky-charms/spin-history - Create a new spin history record
router.post('/spin-history', async (req, res) => {
  try {
    const { campaignId, campaign, orderId, order, productId, wonProduct, claimStatus } = req.body;
    
    // Attempt to authenticate optionally (decode userId and name from token if exists)
    const userId = getUserIdFromRequest(req);
    let userName = 'Guest';
    if (userId) {
      const userObj = await User.findOne({ id: userId });
      if (userObj) {
        userName = userObj.name;
      }
    }

    const spinHistoryRecord = await LuckySpinHistory.create({
      userId,
      user: userName,
      campaignId,
      campaign,
      orderId,
      order: order || orderId,
      productId,
      wonProduct,
      spinTime: new Date(),
      claimStatus: claimStatus || 'Pending'
    });

    res.status(201).json({ success: true, spinHistory: spinHistoryRecord });
  } catch (err) {
    console.error('Create spin history error:', err);
    res.status(500).json({ success: false, message: 'Failed to create spin history record.' });
  }
});

// PUT /api/lucky-charms/spin-history/:id - Update spin history record (Admin)
router.put('/spin-history/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { claimStatus, orderId, order } = req.body;
    
    const record = await LuckySpinHistory.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Spin history record not found.' });
    }

    const updated = await LuckySpinHistory.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          claimStatus: claimStatus || record.claimStatus,
          orderId: orderId || record.orderId,
          order: order || orderId || record.order
        }
      },
      { new: true }
    ).lean();

    res.json({ success: true, spinHistory: updated });
  } catch (err) {
    console.error('Update spin history error:', err);
    res.status(500).json({ success: false, message: 'Failed to update spin history.' });
  }
});

module.exports = router;
