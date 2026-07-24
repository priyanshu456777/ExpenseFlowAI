const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const AppError = require('../utils/AppError');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
['avatars', 'groups', 'receipts'].forEach((sub) => ensureDir(path.join(UPLOAD_ROOT, sub)));

const storage = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(UPLOAD_ROOT, subfolder)),
    filename: (req, file, cb) => {
      const uniqueSuffix = crypto.randomBytes(16).toString('hex');
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${subfolder}-${uniqueSuffix}${ext}`);
    },
  });

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(AppError.badRequest('Only JPG, PNG, WEBP, or GIF images are allowed.', 'INVALID_FILE_TYPE'));
  }
  cb(null, true);
};

const receiptFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(AppError.badRequest('Only JPG, PNG, WEBP, or PDF files are allowed for receipts.', 'INVALID_FILE_TYPE'));
  }
  cb(null, true);
};

const maxSizeBytes = () => (Number(process.env.MAX_FILE_UPLOAD_MB) || 5) * 1024 * 1024;

const uploadAvatar = multer({
  storage: storage('avatars'),
  fileFilter: imageFileFilter,
  limits: { fileSize: maxSizeBytes() },
});

const uploadGroupImage = multer({
  storage: storage('groups'),
  fileFilter: imageFileFilter,
  limits: { fileSize: maxSizeBytes() },
});

const uploadReceipt = multer({
  storage: storage('receipts'),
  fileFilter: receiptFileFilter,
  limits: { fileSize: maxSizeBytes() },
});

module.exports = { uploadAvatar, uploadGroupImage, uploadReceipt };
