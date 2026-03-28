const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['CITIZEN', 'OFFICER', 'ADMIN'],
    default: 'CITIZEN'
  },
  rank: {
    type: String,
    enum: [
      'DGP', 'ADGP', 'IG', 'DIG', 'SP', 'ASP', 'DSP', 
      'Inspector', 'Sub-Inspector (SI)', 'Assistant Sub-Inspector (ASI)', 
      'Head Constable', 'Constable'
    ],
    default: null
  },
  active_cases_count: {
    type: Number,
    default: 0
  },
  availability_status: {
    type: String,
    enum: ['Available', 'Busy', 'Offline'],
    default: 'Available'
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  officerId: {
    type: String,
    sparse: true,
    unique: true
  },
  dob: {
    type: Date,
    required: [true, 'Please provide your date of birth']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
