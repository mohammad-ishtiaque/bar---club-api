const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
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
    res.status(401).json({ message: 'No authorization token found' });
  }
};

// Middleware for admin only access
const isAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin rights required.' });
  }

  next();
};

// Middleware for vendor only access
const isVendor = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (req.user.role !== 'vendor') {
    return res.status(403).json({ message: 'Access denied. Vendor rights required.' });
  }

  next();
};

// Middleware for admin or vendor access
const isAdminOrVendor = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ message: 'Access denied. Admin or vendor rights required.' });
  }

  next();
};

module.exports = { protect, isAdmin, isVendor, isAdminOrVendor }; 