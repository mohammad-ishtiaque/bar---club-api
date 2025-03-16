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
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);