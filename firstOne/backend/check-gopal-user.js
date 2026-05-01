require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

// Check gopal user data
const checkGopalUser = async () => {
  try {
    console.log('🔍 Checking gopal user data...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const gopal = await User.findOne({ username: 'gopal' }).select('-password');
    
    if (gopal) {
      console.log('👤 Gopal user found:');
      console.log(`   🆔 ID: ${gopal._id}`);
      console.log(`   📧 Email: ${gopal.email}`);
      console.log(`   🖼️ Profile Image: ${gopal.profileImage}`);
      console.log(`   📏 Length: ${gopal.profileImage?.length}`);
      
      // Check if URL has typo
      if (gopal.profileImage && gopal.profileImage.includes('profiless')) {
        console.log('❌ Found typo in URL: "profiless" instead of "profiles"');
        
        // Fix the URL
        const fixedUrl = gopal.profileImage.replace('profiless', 'profiles');
        console.log('🔧 Fixed URL:', fixedUrl);
        
        // Update in database
        await User.findByIdAndUpdate(gopal._id, { profileImage: fixedUrl });
        console.log('✅ Database updated with correct URL');
      } else {
        console.log('✅ URL looks correct');
      }
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

checkGopalUser();
