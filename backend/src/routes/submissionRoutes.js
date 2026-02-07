const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { submitAssignment, getSubmissions, downloadSubmission } = require('../controllers/submissionController');
const upload = require('../middleware/uploadMiddleware');

// Route: /api/submissions
// upload.single('file') processes the incoming file
router.post('/', protect, authorize('student'), upload.single('file'), submitAssignment);

router.get('/', protect, authorize('faculty'), getSubmissions);

// New Download Route
router.get('/:id/download', protect, authorize('faculty'), downloadSubmission);

module.exports = router;