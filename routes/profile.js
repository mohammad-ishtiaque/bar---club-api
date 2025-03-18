const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const { protect } = require('../utils/protect');


// Get user profile
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile information
// router.put('/', protect, async (req, res) => {
//   try {
//     const { fullname, age } = req.body;
//     const user = await User.findById(req.user._id);
    
//     if (!user) return res.status(404).json({ message: 'User not found' });
    
//     if (fullname) user.fullname = fullname;
//     if (age) user.age = age;
    
//     const updatedUser = await user.save();
    
//     res.json({
//       _id: updatedUser._id,
//       fullname: updatedUser.fullname,
//       email: updatedUser.email,
//       age: updatedUser.age,
//       role: updatedUser.role,
//       ageVerificationStatus: updatedUser.ageVerificationStatus
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// Change password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }
    
    // Get user with password
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete account
router.delete('/delete-account', protect, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }
    
    // Get user with password
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }
    
    // Delete user
    await User.findByIdAndDelete(req.user._id);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit feedback
router.post('/feedback', async (req, res) => {
  try {
    const { email, description } = req.body;
    
    // Validate inputs
    if (!email || !description) {
      return res.status(400).json({ message: 'Email and description are required' });
    }
    
    // Create new feedback
    const feedback = new Feedback({
      email,
      description
    });
    
    // Check if user is authenticated and add userId if they are
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        feedback.userId = decoded.userId;
      } catch (error) {
        // Token invalid, but we'll still accept the feedback without userId
        console.log('Invalid token, saving feedback without userId');
      }
    }
    
    await feedback.save();
    
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
