const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Get all subscription plans
router.get('/plans', subscriptionController.getPlans);

// Get current user subscription
router.get('/current', subscriptionController.getCurrentSubscription);

// Update subscription
router.post('/subscribe', subscriptionController.updateSubscription);

// Cancel subscription
router.post('/cancel', subscriptionController.cancelSubscription);

// Payment methods
router.get('/payment-methods', subscriptionController.getPaymentMethods);
router.post('/payment-methods', subscriptionController.addPaymentMethod);
router.delete('/payment-methods/:id', subscriptionController.deletePaymentMethod);

// Check subscription limits
router.get('/check-limit/:resourceType', subscriptionController.checkLimit);

module.exports = router;
