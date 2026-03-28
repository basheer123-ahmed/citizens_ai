const mongoose = require('mongoose');

const generalFeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  factors: [String],
  remarks: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const GeneralFeedback = mongoose.model('GeneralFeedback', generalFeedbackSchema);
module.exports = GeneralFeedback;
