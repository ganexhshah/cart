const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateCustomer } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Customer management routes
router.get('/restaurant/:restaurantId', customerController.getCustomers);
router.get('/restaurant/:restaurantId/stats', customerController.getRestaurantCustomerStats);
router.post('/restaurant/:restaurantId', validateCustomer, customerController.addCustomer);

// Individual customer routes
router.get('/:customerId', customerController.getCustomerById);
router.put('/:customerId', customerController.updateCustomer);
router.delete('/:customerId', customerController.deleteCustomer);

// Customer orders and stats
router.get('/:customerId/orders', customerController.getCustomerOrders);
router.get('/:customerId/stats', customerController.getCustomerStats);

// Customer status and loyalty
router.patch('/:customerId/status', customerController.updateCustomerStatus);
router.post('/:customerId/loyalty-points', customerController.addLoyaltyPoints);

// Communication
router.post('/:customerId/send-email', customerController.sendEmail);

module.exports = router;