const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mithirashoppy').then(async function() {
  const db = mongoose.connection.db;

  // Reset all spin sessions so users can spin again
  const r = await db.collection('luckyWheelSessions').updateMany({}, { $set: { isUsed: false } });
  console.log('Reset sessions isUsed=false:', r.modifiedCount);

  // Also reset luckyStock to 10 for all lucky products
  const r2 = await db.collection('products').updateMany(
    { includeInLuckyCharm: true },
    { $set: { luckyStock: 10 } }
  );
  console.log('Reset luckyStock to 10:', r2.modifiedCount);

  const sessions = await db.collection('luckyWheelSessions').find({}).toArray();
  console.log('Total sessions:', sessions.length);
  sessions.forEach(function(s) {
    console.log('  session:', s.sessionId.substring(0, 12) + '...', 'used:', s.isUsed);
  });

  await mongoose.connection.close();
  console.log('Done.');
});
