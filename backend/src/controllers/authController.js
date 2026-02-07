const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name, email, password, role, department
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Mock SSO Login with Access Code Check
// @route   POST /api/auth/sso-mock
// @access  Public
const mockSSOLogin = asyncHandler(async (req, res) => {
  const { role, accessCode } = req.body; // Expects 'student' or 'faculty' AND 'accessCode'
  
  // --- SECURITY CHECK ---
  // In a real app, this would be validated against a database hash or LDAP server.
  // For Mock SSO, we enforce specific codes to prevent role hopping.
  
  if (role === 'faculty' && accessCode !== 'admin123') {
    res.status(401);
    throw new Error('Invalid Faculty Access Code. (Try: admin123)');
  }

  if (role === 'student' && accessCode !== 'student123') {
    res.status(401);
    throw new Error('Invalid Student Access Code. (Try: student123)');
  }

  // Define default mock credentials
  const mockData = role === 'faculty' ? {
    name: "Dr. Sarah Professor",
    email: "faculty@university.edu",
    password: "password123", 
    department: "Computer Science",
    role: "faculty"
  } : {
    name: "Alex Student",
    email: "student@university.edu",
    password: "password123",
    department: "Computer Science",
    role: "student"
  };

  // Check if mock user exists, if not create them
  let user = await User.findOne({ email: mockData.email });

  if (!user) {
    user = await User.create(mockData);
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

module.exports = { authUser, registerUser, mockSSOLogin };