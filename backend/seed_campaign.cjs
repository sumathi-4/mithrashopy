const mongoose = require('mongoose');
const { Campaign, Product } = require('./db/database');

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
    const luckyProds = await Product.find({ includeInLuckyCharm: true });
    console.log(`Found ${luckyProds.length} products already configured for Lucky Charm.`);

    if (luckyProds.length < 8) {
      const activeProds = await Product.find({ status: 'Active' }).limit(10);
      console.log(`Found ${activeProds.length} active products to update.`);
      for (const p of activeProds) {
        p.includeInLuckyCharm = true;
        p.luckyStock = 10;
        if (p.price > 1000) {
          p.price = 750;
        }
        await p.save();
      }
      console.log('✅ Updated products to include in Lucky Charm.');
    } else {
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
      console.log('✅ Updated existing lucky charm products.');
    }

    const finalLuckyProds = await Product.find({ includeInLuckyCharm: true, luckyStock: { $gt: 0 }, price: { $lte: 1000 }, status: 'Active' });
    console.log(`Total eligible products for the wheel: ${finalLuckyProds.length}`);

  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    mongoose.connection.close();
  }
}

mongoose.connection.once('open', seed);
