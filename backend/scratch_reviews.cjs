const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithirashoppy';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const Review = mongoose.connection.model('Review', new mongoose.Schema({}, { strict: false }), 'reviews');
    const reviews = await Review.find().lean();
    console.log('REVIEWS IN DB:', JSON.stringify(reviews, null, 2));
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });
