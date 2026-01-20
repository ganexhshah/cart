const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/avatar', userController.updateAvatar);

// Password routes
router.post('/change-password', userController.changePassword);

// Notification preferences
router.get('/notification-preferences', userController.getNotificationPreferences);
router.put('/notification-preferences', userController.updateNotificationPreferences);

// Account stats
router.get('/account-stats', userController.getAccountStats);

// User settings
router.get('/settings', userController.getSettings);
router.put('/settings', userController.updateSettings);

module.exports = router;
