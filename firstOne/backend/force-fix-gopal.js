require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

// Force fix gopal user with correct URL
const forceFixGopal = async () => {
  try {
    console.log('🔧 Force fixing gopal user...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const gopal = await User.findOne({ username: 'gopal' });
    
    if (gopal) {
      console.log('👤 Gopal user found');
      console.log('🖼️ Current profile image:', gopal.profileImage);
      
      // Force update with correct URL
      const correctUrl = 'https://ik.imagekit.io/hvyv0mo68/profiles/profile-69f4477aaf24c4e55a008305_X7Z9Akrsg.jpg';
      
      await User.findByIdAndUpdate(gopal._id, { profileImage: correctUrl });
      console.log('✅ Force updated with correct URL:', correctUrl);
      
      // Verify the update
      const updatedGopal = await User.findById(gopal._id);
      console.log('🖼️ Updated profile image:', updatedGopal.profileImage);
      
    } else {
      console.log('❌ Gopal user not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

forceFixGopal();
