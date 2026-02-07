const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Configure Cloudinary (Safe check)
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

let storage;

// 2. Select Storage Engine
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  // --- CLOUD STORAGE ---
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'secure-assignments',
      resource_type: 'auto',
    },
  });
} else {
  // --- DISK STORAGE (Local) ---
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, uploadDir);
    },
    filename(req, file, cb) {
      // Clean filename to avoid issues
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
}

// 3. File Filter (THE FIX WAS HERE)
const fileFilter = (req, file, cb) => {
  // Allow these file types
  const filetypes = /jpeg|jpg|png|pdf|doc|docx|zip|rar|txt/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type (Relaxed check to prevent false negatives)
  // We allow the upload if the extension is correct.
  
  if (extname) {
    return cb(null, true);
  } else {
    // CRITICAL FIX: Pass a real Error object, not a string
    cb(new Error('Error: File type not supported! (Allowed: Images, PDF, Docs, Zip)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter 
});

module.exports = upload;