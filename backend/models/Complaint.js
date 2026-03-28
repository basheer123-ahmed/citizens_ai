const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  remarks: {
    type: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    unique: true,
    required: true
  },
  citizenUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  description: {
    type: String,
    required: true
  },
  originalDescription: {
    type: String
  },
  detectedLanguage: {
    type: String
  },
  translatedText: {
    type: String
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  complaintType: {
    type: String,
    enum: ['REGULAR', 'AI_FIR'],
    default: 'REGULAR'
  },
  voiceTranscript: {
    type: String
  },
  chatHistory: [{
    role: { type: String, enum: ['user', 'assistant'] },
    text: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  firData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  address: {
    type: String
  },
  evidenceUrls: [{
    type: String
  }],
  status: {
    type: String,
    default: 'Submitted'
  },
  assignedDepartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  assignedOfficerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionEvidenceUrl: {
    type: String
  },
  remarks: [{
    officer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    createdAt: { type: Date, default: Date.now }
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String
  },
  statusHistory: [statusHistorySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Normal indexes for lat/lng
complaintSchema.index({ latitude: 1, longitude: 1 });

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
