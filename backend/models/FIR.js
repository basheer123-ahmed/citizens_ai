const mongoose = require('mongoose');

const firSchema = new mongoose.Schema({
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true, unique: true },
  systemGeneratedId: { type: String, required: true, unique: true },
  documentType: { type: String, default: 'FIR' },
  status: { type: String, enum: ['Generated', 'Assigned', 'Closed'], default: 'Generated' },
  
  header: {
    departmentName: { type: String, default: 'Central Intelligence Police Department' },
    date: { type: Date, default: Date.now }
  },
  
  complainantDetails: {
    name: String,
    contactInfo: String
  },
  
  incidentDetails: {
    incidentType: String,
    dateAndTime: String,
    location: {
      address: String,
      latitude: Number,
      longitude: Number
    },
    description: String,
    suspectDetails: String,
    itemsLostOrDamaged: String,
  },

  aiSummary: String,
  priorityLevel: String,

  generatedAt: { type: Date, default: Date.now },
  assignedOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('FIR', firSchema);
