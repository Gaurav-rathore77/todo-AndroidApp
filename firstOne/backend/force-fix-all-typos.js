require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

// Fix all profile image typos in database
const fixAllTypos = async () => {
  try {
    console.log('🔧 Fixing all profile image typos...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with profiless typo
    const usersWithTypo = await User.find({ 
      profileImage: { $regex: 'profiless' }
    });

    console.log(`📊 Found ${usersWithTypo.length} users with 'profiless' typo:`);

    for (const user of usersWithTypo) {
      console.log(`\n👤 Fixing: ${user.username}`);
      console.log(`   ❌ Old: ${user.profileImage}`);
      
      const fixedUrl = user.profileImage.replace('profiless', 'profiles');
      console.log(`   ✅ New: ${fixedUrl}`);
      
      await User.findByIdAndUpdate(user._id, { profileImage: fixedUrl });
    }

    console.log(`\n✅ Fixed ${usersWithTypo.length} users!`);

    // Verify fixes
    const remainingTypos = await User.find({ 
      profileImage: { $regex: 'profiless' }
    });

    if (remainingTypos.length === 0) {
      console.log('🎉 All typos fixed successfully!');
    } else {
      console.log(`❌ Still ${remainingTypos.length} users with typos remain`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

fixAllTypos();
