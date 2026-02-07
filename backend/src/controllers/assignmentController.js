const asyncHandler = require('express-async-handler');
const Assignment = require('../models/Assignment');

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private (Student & Faculty)
const getAssignments = asyncHandler(async (req, res) => {
  // Sort by newest first
  const assignments = await Assignment.find({}).sort({ createdAt: -1 });
  res.json(assignments);
});

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private (Faculty only)
const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, dueDate } = req.body;

  if (!title || !dueDate) {
    res.status(400);
    throw new Error('Please add a title and due date');
  }

  const assignment = await Assignment.create({
    title,
    description: description || '',
    dueDate,
    createdBy: req.user._id,
    status: 'open'
  });

  res.status(201).json(assignment);
});

// @desc    Delete an assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Faculty only)
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  await assignment.deleteOne();
  res.json({ id: req.params.id, message: 'Assignment removed' });
});

module.exports = { getAssignments, createAssignment, deleteAssignment };