const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateStaff, validateAttendance } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Staff management routes
router.get('/restaurant/:restaurantId', staffController.getStaff);
router.get('/restaurant/:restaurantId/stats', staffController.getStats);
router.get('/restaurant/:restaurantId/payroll', staffController.getPayroll);
router.post('/restaurant/:restaurantId', staffController.addStaff);

// Individual staff routes
router.get('/:staffId', staffController.getStaffById);
router.put('/:staffId', staffController.updateStaff);
router.delete('/:staffId', staffController.deleteStaff);

// Attendance routes
router.get('/:staffId/attendance', staffController.getAttendance);
router.post('/:staffId/attendance', validateAttendance, staffController.markAttendance);
router.post('/:staffId/clock', staffController.clockInOut);

// Performance routes
router.get('/:staffId/performance', staffController.getPerformance);

// Password management
router.post('/:staffId/change-password', staffController.changePassword);

// Test email (development only)
if (process.env.NODE_ENV !== 'production') {
  router.post('/test-email', staffController.testEmail);
}

// Resend welcome email
router.post('/:staffId/resend-email', staffController.resendWelcomeEmail);

module.exports = router;