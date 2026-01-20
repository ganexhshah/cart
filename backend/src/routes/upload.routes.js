const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/upload.middleware');

// Menu item image upload
router.post('/menu-item', 
  authenticate, 
  authorize('admin', 'owner'),
  uploadSingle,
  handleUploadError,
  uploadController.uploadMenuItemImage
);

// Restaurant logo upload
router.post('/restaurant/logo',
  authenticate,
  authorize('admin', 'owner'),
  uploadSingle,
  handleUploadError,
  uploadController.uploadRestaurantLogo
);

// Restaurant cover image upload
router.post('/restaurant/cover',
  authenticate,
  authorize('admin', 'owner'),
  uploadSingle,
  handleUploadError,
  uploadController.uploadRestaurantCover
);

// User avatar upload
router.post('/avatar',
  authenticate,
  uploadSingle,
  handleUploadError,
  uploadController.uploadUserAvatar
);

// Review images upload (multiple)
router.post('/review',
  authenticate,
  uploadMultiple,
  handleUploadError,
  uploadController.uploadReviewImages
);

// Delete image
router.delete('/image',
  authenticate,
  uploadController.deleteImage
);

module.exports = router;
