require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

// Test database connection and show users
const checkDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📊 Getting all users...');
    const users = await User.find({}).select('-password');
    
    console.log(`👥 Total users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}`);
      console.log(`   📧 Email: ${user.email || 'Not provided'}`);
      console.log(`   🖼️ Profile Image: ${user.profileImage ? '✅ Has image' : '❌ No image'}`);
      console.log(`   🆔 ID: ${user._id}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

checkDatabase();
