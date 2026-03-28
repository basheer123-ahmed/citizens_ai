const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, phone, password, role, dob, rank } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate a random ID if officer
    let officerId = undefined;
    if (role.toUpperCase() === 'OFFICER') {
      officerId = `OFF-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role.toUpperCase(),
      officerId,
      dob,
      rank: role.toUpperCase() === 'OFFICER' ? rank : null
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        officerId: user.officerId,
        rank: user.rank,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const calculateAge = (dob) => {
  if (!dob) return 0;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
      const fullUser = await User.findById(user._id).populate('departmentId');
      res.json({
        _id: fullUser._id,
        name: fullUser.name,
        email: fullUser.email,
        role: fullUser.role,
        department: fullUser.departmentId?.name,
        departmentId: fullUser.departmentId?._id,
        officerId: fullUser.officerId,
        rank: fullUser.rank,
        age: calculateAge(fullUser.dob),
        token: generateToken(fullUser._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const fullUser = await User.findById(user._id).populate('departmentId');
    res.json({
      _id: fullUser._id,
      name: fullUser.name,
      email: fullUser.email,
      role: fullUser.role,
      department: fullUser.departmentId?.name,
      departmentId: fullUser.departmentId?._id,
      rank: fullUser.rank,
      age: calculateAge(fullUser.dob)
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = { registerUser, authUser, getUserProfile };
