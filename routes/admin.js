const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
// const checkUsers = require('../check-users'); // Import the checkUsers function

// Admin middleware - checks if user is an admin
const adminProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized as admin' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized' });
    }
  } else {
    res.status(401).json({ message: 'No token found' });
  }
};

// Get all users with pending verification
router.get('/pending-verifications', adminProtect, async (req, res) => {
  try {
    const pendingUsers = await User.find({ 
      ageVerificationStatus: 'pending',
      ageVerificationImage: { $ne: null }
    }).select('-password');
    
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (with optional filtering)
router.get('/users', adminProtect, async (req, res) => {
  try {
    const { status, role } = req.query;
    const filter = {};
    
    if (status) {
      filter.ageVerificationStatus = status;
    }
    
    if (role) {
      filter.role = role;
    }
    
    const users = await User.find(filter).select('-password -ageVerificationImage');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user verification details by ID
router.get('/user-verification/:userId', adminProtect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      age: user.age,
      role: user.role,
      ageVerificationImage: user.ageVerificationImage,
      ageVerificationStatus: user.ageVerificationStatus,
      verificationComment: user.verificationComment,
      verificationDate: user.verificationDate,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve or reject user verification
router.put('/verify-user/:userId', adminProtect, async (req, res) => {
  try {
    const { status, comment } = req.body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved or rejected' });
    }
    
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.ageVerificationStatus = status;
    user.verificationComment = comment || null;
    
    await user.save();
    
    res.json({ 
      message: `User verification ${status}`,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        ageVerificationStatus: user.ageVerificationStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// // GET /api/admin/verification-stats - Get user verification statistics
// router.get('/verification-stats', adminProtect, async (req, res) => {
//   try {
//     // Get all users
//     const allUsers = await User.find({});
    
//     // Get users with pending verification and image
//     const pendingUsers = await User.find({ 
//       ageVerificationStatus: 'pending',
//       ageVerificationImage: { $ne: null }
//     });
    
//     // Get all pending users regardless of image
//     const allPending = await User.find({ ageVerificationStatus: 'pending' });
    
//     // Get users with images
//     const usersWithImages = await User.find({ ageVerificationImage: { $ne: null } });
    
//     // Prepare detailed user info
//     const userDetails = allUsers.map(user => ({
//       id: user._id,
//       email: user.email,
//       role: user.role,
//       status: user.ageVerificationStatus,
//       hasImage: user.ageVerificationImage !== null
//     }));
    
//     res.json({
//       stats: {
//         totalUsers: allUsers.length,
//         pendingUsersWithImage: pendingUsers.length,
//         allPendingUsers: allPending.length,
//         usersWithImages: usersWithImages.length
//       },
//       userDetails
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // GET /api/admin/user-stats - Get user statistics (using check-users.js)
// router.get('/user-stats', adminProtect, async (req, res) => {
//   try {
//     // This directly uses the check-users.js file
//     const stats = await checkUsers();
//     res.json(stats);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

module.exports = router; 