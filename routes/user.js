const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const { createUploadMiddleware, fileToBase64 } = require('../utils/uploadConfig');

// Middleware to verify JWT
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'No token found' });
  }
};

// Create upload middleware for avatar with 1MB limit
const uploadAvatar = createUploadMiddleware('avatar', 1);

// 1. Edit Profile
router.put('/edit-profile', protect, (req, res) => {
  uploadAvatar(req, res, async function(err) {
    try {
      if (err instanceof multer.MulterError) {
        console.log('Multer error:', err);
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      } else if (err) {
        console.log('Unknown upload error:', err);
        return res.status(500).json({ message: 'Unknown error occurred during upload' });
      }

      // Log file information for debugging
      console.log('File received:', req.file);

      const { fullname, email, contactNo, location } = req.body;
      const userId = req.user._id;

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
          return res.status(400).json({ message: 'Email is already in use' });
        }
      }

      // Find user and prepare update data
      const updateData = {};
      if (fullname) updateData.fullname = fullname;
      if (email) updateData.email = email;
      if (contactNo) updateData.contactNo = contactNo;
      if (location) updateData.address = location;

      // If avatar was uploaded, add it to update data
      if (req.file) {
        console.log('Converting file to base64');
        updateData.avatar = fileToBase64(req.file);
      }

      console.log('Update data prepared:', Object.keys(updateData));

      // Update user profile
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          fullname: updatedUser.fullname,
          email: updatedUser.email,
          contactNo: updatedUser.contactNo,
          location: updatedUser.address,
          role: updatedUser.role,
          avatar: updatedUser.avatar ? true : false // Indicate if avatar exists
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  });
});

// 2a. Delete Account
router.delete('/delete-account', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2b. Change Password
router.put('/change-password', protect, async (req, res) => {
  try {
    // Fetch user with password included
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { currentPassword, newPassword, confirmPassword } = req.body;
    

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// 3. Logout
router.post('/logout', protect, async (req, res) => {
  try {
    // Implement token invalidation logic if needed
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
 
// 4. Feedback
router.post('/feedback', protect, async (req, res) => {
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

// 5. Get User Profile
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;