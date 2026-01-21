const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');
const validationMiddleware = require('../middleware/validation.middleware');

// Validation rules
const createReviewValidation = [
  body('customerId').isUUID().withMessage('Valid customer ID is required'),
  body('restaurantId').isUUID().withMessage('Valid restaurant ID is required'),
  body('orderId').optional().isUUID().withMessage('Order ID must be a valid UUID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be less than 255 characters'),
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Content is required and must be less than 2000 characters'),
  body('orderValue').optional().isFloat({ min: 0 }).withMessage('Order value must be a positive number')
];

const updateStatusValidation = [
  param('id').isUUID().withMessage('Valid review ID is required'),
  body('status').isIn(['pending', 'published', 'flagged', 'hidden']).withMessage('Invalid status')
];

const addResponseValidation = [
  param('id').isUUID().withMessage('Valid review ID is required'),
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Response content is required and must be less than 1000 characters'),
  body('status').optional().isIn(['draft', 'published', 'hidden']).withMessage('Invalid response status')
];

const voteHelpfulValidation = [
  param('id').isUUID().withMessage('Valid review ID is required'),
  body('isHelpful').isBoolean().withMessage('isHelpful must be a boolean value')
];

const uuidParamValidation = [
  param('id').isUUID().withMessage('Valid ID is required')
];

const restaurantIdParamValidation = [
  param('restaurantId').isUUID().withMessage('Valid restaurant ID is required')
];

// Public routes (no authentication required)

// Get all reviews (with optional filters)
router.get('/', reviewController.getReviews);

// Get single review by ID
router.get('/:id', reviewController.getReviewById);

// Get reviews for a specific restaurant
router.get('/restaurant/:restaurantId', (req, res) => {
  req.query.restaurantId = req.params.restaurantId;
  reviewController.getReviews(req, res);
});

// Get review statistics for a restaurant
router.get('/restaurant/:restaurantId/stats', reviewController.getReviewStats);

// Get review insights for a restaurant
router.get('/restaurant/:restaurantId/insights', reviewController.getReviewInsights);

// Protected routes (authentication required)

// Create new review
router.post('/', reviewController.createReview);

// Vote helpful/not helpful on review
router.post('/:id/vote', reviewController.voteHelpful);

// Update review status (admin/restaurant owner only)
router.patch('/:id/status', reviewController.updateReviewStatus);

// Add response to review (restaurant staff only)
router.post('/:id/response', reviewController.addResponse);

// Delete review (soft delete)
router.delete('/:id', reviewController.deleteReview);

// Restaurant-specific routes (for restaurant owners/staff)

// Get reviews for current user's restaurant
router.get('/my-restaurant/reviews', reviewController.getMyRestaurantReviews);

// Get review stats for current user's restaurant
router.get('/my-restaurant/stats', reviewController.getMyRestaurantStats);

module.exports = router;