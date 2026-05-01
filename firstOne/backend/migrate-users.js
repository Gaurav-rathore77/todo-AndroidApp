require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

// Migration script to add missing fields to existing users
const migrateUsers = async () => {
  try {
    console.log('🔄 Starting user migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/firstOne');
    console.log('✅ Connected to MongoDB');

    // Find all users that don't have email field or have null email
    const usersToUpdate = await User.find({
      $or: [
        { email: { $exists: false } },
        { email: null }
      ]
    });

    console.log(`📊 Found ${usersToUpdate.length} users to update`);

    // Update each user
    for (const user of usersToUpdate) {
      await User.updateOne(
        { _id: user._id },
        { 
          $set: { 
            email: user.email || null,
            profileImage: user.profileImage || null
          }
        }
      );
      console.log(`✅ Updated user: ${user.username}`);
    }

    // Also check for users without profileImage field
    const usersWithoutProfileImage = await User.find({
      $or: [
        { profileImage: { $exists: false } },
        { profileImage: null }
      ]
    });

    console.log(`📊 Found ${usersWithoutProfileImage.length} users without profile image`);

    for (const user of usersWithoutProfileImage) {
      await User.updateOne(
        { _id: user._id },
        { 
          $set: { 
            profileImage: null
          }
        }
      );
      console.log(`✅ Added profileImage field to user: ${user.username}`);
    }

    console.log('🎉 Migration completed successfully!');
    
    // Show final user count
    const totalUsers = await User.countDocuments();
    console.log(`📈 Total users in database: ${totalUsers}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run migration
migrateUsers();
