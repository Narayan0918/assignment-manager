const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth user & get token (Standard Login)
// @route   POST /api/auth/login
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

// @desc    Mock SSO Login (Dynamic Name Support)
// @route   POST /api/auth/sso-mock
// @access  Public
const mockSSOLogin = asyncHandler(async (req, res) => {
  const { role, accessCode, username } = req.body; 
  
  // 1. Security Check (Access Code)
  if (role === 'faculty' && accessCode !== 'admin123') {
    res.status(401);
    throw new Error('Invalid Faculty Access Code. (Try: admin123)');
  }

  if (role === 'student' && accessCode !== 'student123') {
    res.status(401);
    throw new Error('Invalid Student Access Code. (Try: student123)');
  }

  // 2. Determine User Identity
  let mockData;

  if (role === 'faculty') {
    // Faculty identity is usually static for this prototype
    mockData = {
      name: "Dr. Sarah Professor",
      email: "faculty@university.edu",
      role: "faculty",
      password: "password123",
      department: "Computer Science"
    };
  } else {
    // Student identity is DYNAMIC based on input
    if (!username) {
      res.status(400);
      throw new Error('Student Name is required for login.');
    }

    // Create a fake email based on the name (e.g., "John Doe" -> "john.doe@university.edu")
    const sanitizedEmail = username.toLowerCase().replace(/\s+/g, '.') + '@university.edu';
    
    mockData = {
      name: username, // Use the name typed in the UI
      email: sanitizedEmail,
      role: "student",
      password: "password123",
      department: "Computer Science"
    };
  }

  // 3. Find or Create User
  let user = await User.findOne({ email: mockData.email });

  if (!user) {
    // First time this specific student has logged in
    user = await User.create(mockData);
  } else {
    // If user exists, update their name just in case they fixed a typo
    user.name = mockData.name;
    await user.save();
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