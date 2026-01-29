const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validateOrder, validateUUID } = require('../middleware/validation.middleware');
const { orderLimiter } = require('../middleware/rateLimit.middleware');

// Public routes (no authentication required)
router.post('/guest', orderLimiter, validateOrder, orderController.createGuestOrder);
router.get('/guest/:id', validateUUID, orderController.getGuestOrder);

// Protected routes
router.post('/', authenticate, orderLimiter, validateOrder, orderController.createOrder);
router.get('/', authenticate, orderController.getOrders);
router.get('/:id', authenticate, validateUUID, orderController.getOrderById);
router.patch('/:id/status', authenticate, authorize('waiter', 'admin', 'owner'), validateUUID, orderController.updateOrderStatus);
router.delete('/:id', authenticate, validateUUID, orderController.cancelOrder);

module.exports = router;
