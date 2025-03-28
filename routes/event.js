const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, isAdmin, isVendor, isAdminOrVendor } = require('../utils/protect');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload with disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/events';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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

// Public route - Get all approved events (accessible by all users)
router.get('/events', protect, async (req, res) => {
  try {
    const events = await Event.find({ status: 'approved' })
      .select('eventName bar location coverCharge description images mapReference')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new event (admin/vendor only)
router.post('/add-new-events', protect, isAdminOrVendor, upload.array('images', 3), async (req, res) => {
  try {
    const { eventName, bar, location, coverCharge, description, mapReference } = req.body;
    
    // Store file paths instead of base64
    const images = req.files ? req.files.map(file => ({
      path: file.path,
      filename: file.filename
    })) : [];

    const newEvent = new Event({
      eventName,
      bar,
      location,
      coverCharge,
      description,
      images,
      mapReference,
      createdBy: req.user._id,
      status: req.user.role === 'admin' ? 'approved' : 'pending' // Auto-approve if admin creates
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    // Clean up uploaded files if event creation fails
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, err => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// Get all events (admin only - includes pending and rejected events)
router.get('/admin/all-events', protect, isAdmin, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'fullname email role')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get vendor's own events (vendor only)
router.get('/vendor/my-events', protect, isVendor, async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event status (admin only)
router.patch('/admin/event-status/:eventId', protect, isAdmin, async (req, res) => {
  try {
    const { status, comment } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      { 
        status,
        statusComment: comment,
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update event (owner or admin only)
router.put('/events/:eventId', isVendor , async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is admin or the event creator
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const { eventName, bar, location, coverCharge, description, mapReference } = req.body;
    
    event.eventName = eventName || event.eventName;
    event.bar = bar || event.bar;
    event.location = location || event.location;
    event.coverCharge = coverCharge || event.coverCharge;
    event.description = description || event.description;
    event.mapReference = mapReference || event.mapReference;
    
    // If vendor updates, set status back to pending
    if (req.user.role === 'vendor') {
      event.status = 'pending';
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete event (admin only)
router.delete('/admin/events/:eventId', protect, isAdminOrVendor, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Delete associated image files
    if (event.images && event.images.length > 0) {
      event.images.forEach(image => {
        fs.unlink(image.path, err => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }

    await Event.findByIdAndDelete(req.params.eventId);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 