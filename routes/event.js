const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, isAdminOrVendor } = require('../utils/protect');
const multer = require('multer');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 3 // Maximum 3 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create new event
router.post('/add-new-events', protect, isAdminOrVendor, upload.array('images', 3), async (req, res) => {
  try {
    const { eventName, bar, location, coverCharge, description, mapReference } = req.body;
    
    // Convert uploaded files to base64
    const images = req.files ? req.files.map(file => ({
      data: file.buffer.toString('base64'),
      contentType: file.mimetype
    })) : [];

    const newEvent = new Event({
      eventName,
      bar,
      location,
      coverCharge,
      description,
      images,
      mapReference
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add other routes (GET, PUT, DELETE) as needed

module.exports = router;