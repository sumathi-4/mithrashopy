const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../db/database');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithirashoppy';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'mathi@gmail.com';
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User ${email} not found.`);
      return;
    }

    const hashed = bcrypt.hashSync('Password123!', 12);
    user.password = hashed;
    await user.save();
    console.log(`Reset user ${email} password to 'Password123!' successfully!`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log('DB Connection closed');
  }
}

run();
