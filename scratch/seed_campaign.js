const mongoose = require('mongoose');
const { Campaign, Product } = require('../backend/db/database');

async function seed() {
  try {
    // 1. Create campaign
    await Campaign.deleteMany({});
    const campaign = await Campaign.create({
      campaignName: 'Mega Shopping Lucky Charm',
      minOrderValue: 500,
      maxOrderValue: 10000,
      rewardBudget: 1000,
      wheelProductCount: 8,
      startDate: new Date(Date.now() - 24 * 3600 * 1000), // yesterday
      endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000), // 30 days later
      status: 'Active'
    });
    console.log('✅ Campaign created:', campaign);

    // 2. Make sure we have products for lucky charm
    // Let's check how many products have includeInLuckyCharm: true
    const luckyProds = await Product.find({ includeInLuckyCharm: true });
    console.log(`Found ${luckyProds.length} products already configured for Lucky Charm.`);

    if (luckyProds.length < 8) {
      // If we don't have enough, let's take some active products and mark them as included
      const activeProds = await Product.find({ status: 'Active' }).limit(10);
      console.log(`Found ${activeProds.length} active products to update.`);
      for (const p of activeProds) {
        p.includeInLuckyCharm = true;
        p.luckyStock = 10;
        // Make sure price is within reward budget
        if (p.price > 1000) {
          p.price = 750; // Set to something within budget for testing
        }
        await p.save();
      }
      console.log('✅ Updated products to include in Lucky Charm.');
    } else {
      // Ensure all of them have luckyStock > 0 and price <= 1000
      for (const p of luckyProds) {
        let changed = false;
        if (!p.luckyStock || p.luckyStock <= 0) {
          p.luckyStock = 10;
          changed = true;
        }
        if (p.price > 1000) {
          p.price = 750;
          changed = true;
        }
        if (p.status !== 'Active') {
          p.status = 'Active';
          changed = true;
        }
        if (changed) {
          await p.save();
        }
      }
      console.log('✅ Updated existing lucky charm products to have stock, active status, and valid prices.');
    }

    const finalLuckyProds = await Product.find({ includeInLuckyCharm: true, luckyStock: { $gt: 0 }, price: { $lte: 1000 }, status: 'Active' });
    console.log(`Total eligible products for the wheel: ${finalLuckyProds.length}`);

  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    mongoose.connection.close();
  }
}

// Wait for connection to open
mongoose.connection.once('open', seed);
