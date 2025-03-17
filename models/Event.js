const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true
  },
  bar: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  coverCharge: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    data: {
      type: String,  // Base64 string
      required: true
    },
    contentType: {
      type: String,
      required: true
    }
  }],
  mapReference: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  statusComment: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema); 