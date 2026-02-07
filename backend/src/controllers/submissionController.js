const asyncHandler = require('express-async-handler');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const path = require('path');
const fs = require('fs');

// @desc    Submit an assignment (With Duplicate Check)
// @route   POST /api/submissions
// @access  Private (Student)
const submitAssignment = asyncHandler(async (req, res) => {
  // Debug Logs
  console.log("📥 Upload Request Received");
  console.log("📋 Body Data:", req.body); 
  
  const { assignmentId, fileHash } = req.body;

  // 1. Validation Checks
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded.');
  }

  if (!assignmentId) {
    res.status(400);
    throw new Error('Missing Assignment ID.');
  }

  // --- NEW FEATURE: PREVENT DUPLICATE SUBMISSIONS ---
  const existingSubmission = await Submission.findOne({
    studentId: req.user._id,        // Check current student
    assignmentId: assignmentId      // Check current assignment
  });

  if (existingSubmission) {
    // Delete the file that Multer just uploaded since we are rejecting the request
    // This keeps your server clean
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path); 
    }

    res.status(400);
    throw new Error('You have already submitted this assignment. Multiple submissions are not allowed.');
  }
  // ---------------------------------------------------

  // 2. Create Submission
  const submission = await Submission.create({
    assignmentId,
    studentId: req.user._id,
    fileName: req.file.originalname,
    fileUrl: req.file.path, // Cloudinary URL or Local Path
    fileHash: fileHash || 'pending',
  });

  console.log("✅ Submission Saved:", submission._id);
  res.status(201).json(submission);
});

// @desc    Get all submissions
// @route   GET /api/submissions
// @access  Private (Faculty)
const getSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({})
    .populate('studentId', 'name email')
    .populate('assignmentId', 'title')
    .sort({ createdAt: -1 });
  res.json(submissions);
});

// @desc    Download a submission file
// @route   GET /api/submissions/:id/download
// @access  Private (Faculty)
const downloadSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  // Handle Cloudinary Download (Redirect) vs Local Download (Stream)
  if (submission.fileUrl.startsWith('http')) {
     res.redirect(submission.fileUrl);
  } else {
    if (fs.existsSync(submission.fileUrl)) {
      res.download(submission.fileUrl, submission.fileName);
    } else {
      res.status(404);
      throw new Error('File not found on server');
    }
  }
});

module.exports = { submitAssignment, getSubmissions, downloadSubmission };