const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { query } = require('express-validator');
const validationMiddleware = require('../middleware/validation.middleware');

// Validation rules
const timeframeValidation = [
  query('timeframe').optional().isIn(['7days', '30days', '90days', '1year']).withMessage('Invalid timeframe')
];

const dateValidation = [
  query('date').optional().isISO8601().withMessage('Invalid date format')
];

const limitValidation = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Public routes (for testing - in production these should be protected)

// Get overview statistics
router.get('/overview', timeframeValidation, analyticsController.getOverviewStats);

// Get revenue trends
router.get('/revenue', analyticsController.getRevenueTrends);

// Get top performing products
router.get('/products', limitValidation, timeframeValidation, analyticsController.getTopProducts);

// Get customer segments
router.get('/customers/segments', analyticsController.getCustomerSegments);

// Get customer insights
router.get('/customers/insights', analyticsController.getCustomerInsights);

// Get hourly order patterns
router.get('/hourly', dateValidation, analyticsController.getHourlyPatterns);

// Get restaurant performance comparison
router.get('/performance', timeframeValidation, analyticsController.getRestaurantPerformance);

// Get comprehensive dashboard data
router.get('/dashboard', timeframeValidation, analyticsController.getDashboardData);

// Export analytics report
router.get('/export', timeframeValidation, analyticsController.exportReport);

// Protected routes (uncomment when authentication is needed)
/*
// Get overview statistics
router.get('/overview', authMiddleware, timeframeValidation, validationMiddleware, analyticsController.getOverviewStats);

// Get revenue trends
router.get('/revenue', authMiddleware, validationMiddleware, analyticsController.getRevenueTrends);

// Get top performing products
router.get('/products', authMiddleware, limitValidation, timeframeValidation, validationMiddleware, analyticsController.getTopProducts);

// Get customer segments
router.get('/customers/segments', authMiddleware, validationMiddleware, analyticsController.getCustomerSegments);

// Get customer insights
router.get('/customers/insights', authMiddleware, validationMiddleware, analyticsController.getCustomerInsights);

// Get hourly order patterns
router.get('/hourly', authMiddleware, dateValidation, validationMiddleware, analyticsController.getHourlyPatterns);

// Get restaurant performance comparison
router.get('/performance', authMiddleware, timeframeValidation, validationMiddleware, analyticsController.getRestaurantPerformance);

// Get comprehensive dashboard data
router.get('/dashboard', authMiddleware, timeframeValidation, validationMiddleware, analyticsController.getDashboardData);

// Export analytics report
router.get('/export', authMiddleware, timeframeValidation, validationMiddleware, analyticsController.exportReport);
*/

module.exports = router;