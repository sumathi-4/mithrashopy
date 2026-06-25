const express = require('express');
const jwt = require('jsonwebtoken');
const { LuckyReward, LuckySpin, LuckyRewardClaim, Product, Coupon, Order } = require('../db/database');
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

// Helper: Get product image dynamically
async function getProductImage(productId) {
  try {
    const prod = await Product.findOne({ id: productId });
    return prod ? prod.image : 'Accessories';
  } catch (e) {
    return 'Accessories';
  }
}

// GET /api/lucky-charms/my-claims - Fetch logged-in user's claims
router.get('/my-claims', authenticate, async (req, res) => {
  try {
    const claims = await LuckyRewardClaim.find({ userId: req.user.id }).sort({ claimedAt: -1 }).lean();
    const mapped = [];
    for (const c of claims) {
      let image = 'Coupon';
      if (c.rewardType === 'product') {
        image = await getProductImage(c.productId);
      }
      mapped.push({
        ...c,
        image
      });
    }
    res.json({ success: true, claims: mapped });
  } catch (err) {
    console.error('Fetch my-claims error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch claims.' });
  }
});

// GET /api/lucky-charms/active-rewards - Fetch active rewards for wheel creation
router.get('/active-rewards', async (req, res) => {
  try {
    const activeRewards = await LuckyReward.find({ status: 'Active', luckyStock: { $gt: 0 } }).lean();
    const activeProducts = await Product.find({ includeInLuckyCharm: true, luckyActive: true, luckyStock: { $gt: 0 } }).lean();

    const unifiedList = [];

    // Map LuckyReward collection items
    for (const r of activeRewards) {
      let image = 'Coupon';
      let value = r.luckyPrice || 0;

      if (r.rewardType === 'product') {
        image = await getProductImage(r.productId);
      } else if (r.rewardType === 'coupon') {
        const cp = await Coupon.findOne({ code: r.couponId });
        if (cp) value = parseFloat(String(cp.discount).replace(/[₹,%]/g, '')) || 0;
      }

      unifiedList.push({
        _id: r._id,
        rewardName: r.rewardName,
        rewardType: r.rewardType,
        productId: r.productId,
        couponId: r.couponId,
        chancePercentage: r.chancePercentage || 0,
        luckyStock: r.luckyStock || 0,
        luckyPrice: r.luckyPrice || 0,
        image,
        value,
        source: 'lucky_rewards'
      });
    }

    // Map direct product model items
    for (const p of activeProducts) {
      unifiedList.push({
        _id: p._id,
        rewardName: p.name,
        rewardType: 'product',
        productId: p.id,
        couponId: null,
        chancePercentage: p.luckyChancePercentage || 0,
        luckyStock: p.luckyStock || 0,
        luckyPrice: p.luckyPrice || p.price || 0,
        image: p.image,
        value: p.luckyPrice || 0,
        source: 'products'
      });
    }

    res.json({ success: true, rewards: unifiedList });
  } catch (err) {
    console.error('Fetch active rewards error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch rewards.' });
  }
});

// POST /api/lucky-charms/spin - Spin the wheel and select a reward dynamically
router.post('/spin', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);

    // Fetch active candidates
    const activeRewards = await LuckyReward.find({ status: 'Active', luckyStock: { $gt: 0 } });
    const activeProducts = await Product.find({ includeInLuckyCharm: true, luckyActive: true, luckyStock: { $gt: 0 } });

    const candidates = [];

    for (const r of activeRewards) {
      candidates.push({
        dbRef: r,
        rewardName: r.rewardName,
        rewardType: r.rewardType,
        productId: r.productId,
        couponId: r.couponId,
        chancePercentage: r.chancePercentage || 0,
        luckyPrice: r.luckyPrice || 0,
        source: 'lucky_rewards'
      });
    }

    for (const p of activeProducts) {
      candidates.push({
        dbRef: p,
        rewardName: p.name,
        rewardType: 'product',
        productId: p.id,
        couponId: null,
        chancePercentage: p.luckyChancePercentage || 0,
        luckyPrice: p.luckyPrice || p.price || 0,
        source: 'products'
      });
    }

    if (candidates.length === 0) {
      return res.json({ success: true, won: false, message: 'No rewards available at the moment. Try again later!' });
    }

    // Weighted random selection
    const totalChance = candidates.reduce((acc, c) => acc + c.chancePercentage, 0);
    if (totalChance <= 0) {
      return res.json({ success: true, won: false, message: 'Luck is recharging! Try again soon.' });
    }

    const rand = Math.random() * totalChance;
    let sum = 0;
    let selected = null;

    for (const c of candidates) {
      sum += c.chancePercentage;
      if (rand <= sum) {
        selected = c;
        break;
      }
    }

    if (!selected) {
      selected = candidates[candidates.length - 1];
    }

    // Decrement stock in database
    if (selected.source === 'lucky_rewards') {
      await LuckyReward.updateOne({ _id: selected.dbRef._id }, { $inc: { luckyStock: -1 } });
    } else {
      await Product.updateOne({ _id: selected.dbRef._id }, { $inc: { luckyStock: -1 } });
    }

    // Create spin record
    const spin = await LuckySpin.create({
      userId,
      rewardId: selected.source === 'lucky_rewards' ? selected.dbRef._id : null,
      productId: selected.rewardType === 'product' ? selected.productId : null,
      couponCode: selected.rewardType === 'coupon' ? selected.couponId : null,
      rewardType: selected.rewardType,
      spunAt: new Date()
    });

    // Create claim record
    let rewardValue = selected.luckyPrice;
    let image = 'Coupon';

    if (selected.rewardType === 'product') {
      image = await getProductImage(selected.productId);
    } else if (selected.rewardType === 'coupon') {
      const cp = await Coupon.findOne({ code: selected.couponId });
      if (cp) {
        rewardValue = parseFloat(String(cp.discount).replace(/[₹,%]/g, '')) || 0;
        image = 'Coupon';
      }
    }

    const claim = await LuckyRewardClaim.create({
      userId,
      rewardType: selected.rewardType,
      productId: selected.rewardType === 'product' ? selected.productId : null,
      couponCode: selected.rewardType === 'coupon' ? selected.couponId : null,
      rewardName: selected.rewardName,
      rewardValue,
      status: 'Pending',
      claimedAt: new Date()
    });

    res.json({
      success: true,
      won: true,
      reward: {
        id: selected.rewardType === 'product' ? selected.productId : selected.couponId,
        rewardName: selected.rewardName,
        rewardType: selected.rewardType,
        productId: selected.productId,
        couponCode: selected.couponId,
        rewardValue,
        image
      },
      claimId: claim._id
    });
  } catch (err) {
    console.error('Spin error:', err);
    res.status(500).json({ success: false, message: 'Failed to process spin.' });
  }
});

// GET /api/lucky-charms/stats - Admin Dashboard statistics
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const totalSpins = await LuckySpin.countDocuments();
    
    // Today's spins
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaysSpins = await LuckySpin.countDocuments({ spunAt: { $gte: startOfToday } });

    // Claims status
    const rewardsGiven = await LuckyRewardClaim.countDocuments({ status: 'Claimed' });

    // Active rewards count
    const activeRewardsCount = await LuckyReward.countDocuments({ status: 'Active', luckyStock: { $gt: 0 } });
    const activeProductsCount = await Product.countDocuments({ includeInLuckyCharm: true, luckyActive: true, luckyStock: { $gt: 0 } });
    const activeRewards = activeRewardsCount + activeProductsCount;

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
    const productSpins = await LuckySpin.aggregate([
      { $match: { rewardType: 'product', productId: { $ne: null } } },
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

    const couponSpins = await LuckySpin.aggregate([
      { $match: { rewardType: 'coupon', couponCode: { $ne: null } } },
      { $group: { _id: '$couponCode', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const topWonCoupons = couponSpins.map(cs => ({
      code: cs._id,
      count: cs.count
    }));

    // Repeat players count
    const spinUserGroups = await LuckySpin.aggregate([
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
        topWonCoupons
      }
    });
  } catch (err) {
    console.error('Fetch stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to compute dashboard stats.' });
  }
});

// GET /api/lucky-charms/rewards - List all rewards (Admin)
router.get('/rewards', authenticate, requireAdmin, async (req, res) => {
  try {
    const rewards = await LuckyReward.find().lean();
    res.json({ success: true, rewards });
  } catch (err) {
    console.error('Fetch rewards error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch rewards.' });
  }
});

// POST /api/lucky-charms/rewards - Add new reward (Admin)
router.post('/rewards', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rewardName, rewardType, productId, couponId, chancePercentage, luckyStock, luckyPrice, status, startDate, endDate } = req.body;
    if (!rewardName || !rewardType) {
      return res.status(400).json({ success: false, message: 'Reward name and type are required.' });
    }

    const reward = await LuckyReward.create({
      rewardName,
      rewardType,
      productId: rewardType === 'product' ? parseInt(productId, 10) : null,
      couponId: rewardType === 'coupon' ? couponId : null,
      chancePercentage: parseFloat(chancePercentage) || 0,
      luckyStock: parseInt(luckyStock, 10) || 0,
      luckyPrice: rewardType === 'product' ? parseFloat(luckyPrice) : 0,
      status: status || 'Active',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    });

    res.status(201).json({ success: true, reward });
  } catch (err) {
    console.error('Create reward error:', err);
    res.status(500).json({ success: false, message: 'Failed to create reward.' });
  }
});

// PUT /api/lucky-charms/rewards/:id - Update reward (Admin)
router.put('/rewards/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rewardName, rewardType, productId, couponId, chancePercentage, luckyStock, luckyPrice, status, startDate, endDate } = req.body;

    const reward = await LuckyReward.findById(req.params.id);
    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found.' });
    }

    const updated = await LuckyReward.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          rewardName: rewardName || reward.rewardName,
          rewardType: rewardType || reward.rewardType,
          productId: rewardType === 'product' ? parseInt(productId, 10) : reward.productId,
          couponId: rewardType === 'coupon' ? couponId : reward.couponId,
          chancePercentage: chancePercentage !== undefined ? parseFloat(chancePercentage) : reward.chancePercentage,
          luckyStock: luckyStock !== undefined ? parseInt(luckyStock, 10) : reward.luckyStock,
          luckyPrice: rewardType === 'product' ? parseFloat(luckyPrice) : reward.luckyPrice,
          status: status || reward.status,
          startDate: startDate ? new Date(startDate) : reward.startDate,
          endDate: endDate ? new Date(endDate) : reward.endDate
        }
      },
      { new: true }
    ).lean();

    res.json({ success: true, reward: updated });
  } catch (err) {
    console.error('Update reward error:', err);
    res.status(500).json({ success: false, message: 'Failed to update reward.' });
  }
});

// DELETE /api/lucky-charms/rewards/:id - Delete reward (Admin)
router.delete('/rewards/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await LuckyReward.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Reward not found.' });
    }
    res.json({ success: true, message: 'Reward deleted successfully.' });
  } catch (err) {
    console.error('Delete reward error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete reward.' });
  }
});

module.exports = router;
