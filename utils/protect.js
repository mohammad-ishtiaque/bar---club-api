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

const isAdminOrVendor = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ message: 'Access denied. Admin or vendor rights required.' });
  }

  next();
};

module.exports = { protect, isAdminOrVendor };