const mongoose = require('mongoose');

const submissionSchema = mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true }, // Cloudinary URL
    fileHash: { type: String, required: true }, // SHA-256 Hash for integrity
    grade: { type: String },
    feedback: { type: String },
  },
  { timestamps: true }
);

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;