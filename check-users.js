require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get all users
    const allUsers = await User.find({});
    console.log(`Total users: ${allUsers.length}`);
    
    // Get users with pending verification and image
    const pendingUsers = await User.find({ 
      ageVerificationStatus: 'pending',
      ageVerificationImage: { $ne: null }
    });
    console.log(`Pending users with image: ${pendingUsers.length}`);
    
    // Get all pending users regardless of image
    const allPending = await User.find({ ageVerificationStatus: 'pending' });
    console.log(`All pending users: ${allPending.length}`);
    
    // Get users with images
    const usersWithImages = await User.find({ ageVerificationImage: { $ne: null } });
    console.log(`Users with images: ${usersWithImages.length}`);
    
    // Print details of all users
    console.log('\nUser details:');
    allUsers.forEach(user => {
      console.log(`- ${user.email}: role=${user.role}, status=${user.ageVerificationStatus}, hasImage=${user.ageVerificationImage !== null}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkUsers(); 