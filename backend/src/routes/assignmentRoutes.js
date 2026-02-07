const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAssignments, createAssignment, deleteAssignment } = require('../controllers/assignmentController');

// All routes are protected (must be logged in)
router.get('/', protect, getAssignments);

// Only Faculty can Create or Delete
router.post('/', protect, authorize('faculty'), createAssignment);
router.delete('/:id', protect, authorize('faculty'), deleteAssignment);

module.exports = router;