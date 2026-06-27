const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithirashoppy';

async function fixLuckyStock() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const col = db.collection('products');

  // Fix any product where luckyStock is not a proper number
  const fixResult = await col.updateMany(
    { luckyStock: { $not: { $type: 'number' } } },
    { $set: { luckyStock: 10, includeInLuckyCharm: true, status: 'Active' } }
  );
  console.log('Fixed non-number luckyStock docs:', fixResult.modifiedCount);

  // Ensure all includeInLuckyCharm products have luckyStock >= 10
  const setResult = await col.updateMany(
    { includeInLuckyCharm: true, status: 'Active' },
    { $set: { luckyStock: 10 } }
  );
  console.log('Set luckyStock=10 on all lucky products:', setResult.modifiedCount);

  // Show final state
  const allLucky = await col.find({ includeInLuckyCharm: true }).toArray();
  console.log('\nFinal lucky products:');
  allLucky.forEach(function(p) {
    console.log('  - ' + p.name + ': price=' + p.price + ', luckyStock=' + p.luckyStock + ', status=' + p.status);
  });

  console.log('\nTotal eligible for wheel:', allLucky.filter(function(p){ return p.luckyStock > 0 && p.status === 'Active'; }).length);

  await mongoose.connection.close();
  console.log('Done. Connection closed.');
}

fixLuckyStock().catch(function(err) {
  console.error('Error:', err.message);
  process.exit(1);
});
