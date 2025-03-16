const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { sendResetCode } = require('../utils/sendEmail');

// Configure multer for memory storage instead of disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).fields([
  { name: 'verificationImage', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]);

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { fullname, email, password, confirmPassword, age, role } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate role if provided
    if (role && !['admin', 'vendor', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin, vendor, or user' });
    }

    const user = new User({ 
      fullname, 
      email, 
      password, 
      age,
      role: role || 'user' // If role is not provided, defaults to 'user'
    });
    await user.save();

    // Generate token for immediate login
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await PasswordReset.create({ email, code });

    await sendResetCode(email, code);
    res.json({ message: 'Reset code sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const resetEntry = await PasswordReset.findOne({ email, code });
    if (!resetEntry) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    const user = await User.findOne({ email });
    user.password = newPassword;
    await user.save();

    await PasswordReset.deleteMany({ email });
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Delete any existing codes for this email
    await PasswordReset.deleteMany({ email });

    // Generate new 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await PasswordReset.create({ email, code });

    await sendResetCode(email, code);
    res.json({ message: 'New reset code sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload Age Verification Image
router.post('/upload-age-verification', (req, res) => {
  upload(req, res, async function(err) {
    try {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      } else if (err) {
        console.error('Unknown error:', err);
        return res.status(500).json({ message: 'Unknown error occurred during upload' });
      }

      console.log('Files received:', req.files);
      
      // Get the uploaded file from any of the allowed field names
      const file = req.files?.verificationImage?.[0] || req.files?.image?.[0] || req.files?.file?.[0];
      
      if (!file) {
        return res.status(400).json({ message: 'Please upload a verification document' });
      }

      // Get user ID from JWT token
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // Convert image buffer to base64
      const base64Image = file.buffer.toString('base64');

      // Update user with verification image
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if verification is already approved
      if (user.ageVerificationStatus === 'approved') {
        return res.status(400).json({ message: 'Age already verified' });
      }

      user.ageVerificationImage = base64Image;
      user.ageVerificationStatus = 'pending';
      user.verificationDate = new Date();
      user.verificationComment = null; // Reset any previous comments
      await user.save();

      res.json({ 
        message: 'Age verification document uploaded successfully',
        status: 'pending',
        submissionDate: user.verificationDate
      });
    } catch (error) {
      console.error('Upload error:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      res.status(500).json({ message: error.message });
    }
  });
});

// Get Verification Status
router.get('/verification-status', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      status: user.ageVerificationStatus,
      comment: user.verificationComment,
      submissionDate: user.verificationDate
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;