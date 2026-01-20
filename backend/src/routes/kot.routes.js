const express = require('express');
const kotController = require('../controllers/kot.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { body, query, param } = require('express-validator');

const router = express.Router();

/**
 * @route   GET /api/kot
 * @desc    Get all KOT orders with filtering
 * @access  Private (Waiter, Admin, Owner)
 */
router.get('/', 
  authenticate, 
  authorize('waiter', 'admin', 'owner'),
  [
    query('restaurantId').optional().isUUID().withMessage('Restaurant ID must be a valid UUID'),
    query('status').optional().isIn(['pending', 'preparing', 'ready', 'served', 'cancelled']),
    query('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
    query('tableId').optional().isUUID().withMessage('Table ID must be a valid UUID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate
  ],
  kotController.getKOTOrders
);

/**
 * @route   GET /api/kot/stats
 * @desc    Get KOT statistics
 * @access  Private (Admin, Owner)
 */
router.get('/stats',
  authenticate,
  authorize('admin', 'owner'),
  [
    query('restaurantId').optional().isUUID().withMessage('Restaurant ID must be valid'),
    query('dateRange').optional().isIn(['today', 'week', 'month']),
    validate
  ],
  kotController.getKOTStats
);

/**
 * @route   GET /api/kot/items
 * @desc    Get KOT items for a restaurant
 * @access  Private (Waiter, Admin, Owner)
 */
router.get('/items',
  authenticate,
  authorize('waiter', 'admin', 'owner'),
  [
    query('restaurantId').optional().isUUID().withMessage('Restaurant ID must be valid'),
    validate
  ],
  kotController.getKOTItems
);

/**
 * @route   GET /api/kot/:id
 * @desc    Get KOT order by ID
 * @access  Private (Waiter, Admin, Owner)
 */
router.get('/:id',
  authenticate,
  authorize('waiter', 'admin', 'owner'),
  [
    param('id').isUUID().withMessage('KOT ID must be a valid UUID'),
    query('restaurantId').optional().isUUID().withMessage('Restaurant ID must be valid'),
    validate
  ],
  kotController.getKOTOrderById
);

/**
 * @route   POST /api/kot
 * @desc    Create new KOT order
 * @access  Private (Waiter, Admin, Owner)
 */
router.post('/',
  authenticate,
  authorize('waiter', 'admin', 'owner'),
  [
    body('orderId').optional().isUUID().withMessage('Order ID must be a valid UUID'),
    body('tableId').optional().isUUID().withMessage('Table ID must be a valid UUID'),
    body('items').isArray({ min: 1 }).withMessage('Items array is required with at least one item'),
    body('items.*.kot_item_id').isUUID().withMessage('Each item must have a valid KOT item ID'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
    body('notes').optional().isString().isLength({ max: 1000 }),
    validate
  ],
  kotController.createKOTOrder
);

/**
 * @route   PATCH /api/kot/:id/status
 * @desc    Update KOT status
 * @access  Private (Waiter, Admin, Owner)
 */
router.patch('/:id/status',
  authenticate,
  authorize('waiter', 'admin', 'owner'),
  [
    param('id').isUUID().withMessage('KOT ID must be a valid UUID'),
    body('status')
      .isIn(['pending', 'preparing', 'ready', 'served', 'cancelled'])
      .withMessage('Status must be one of: pending, preparing, ready, served, cancelled'),
    body('restaurantId').optional().isUUID().withMessage('Restaurant ID must be valid'),
    validate
  ],
  kotController.updateKOTStatus
);

/**
 * @route   PATCH /api/kot/:id/priority
 * @desc    Update KOT priority
 * @access  Private (Admin, Owner)
 */
router.patch('/:id/priority',
  authenticate,
  authorize('admin', 'owner'),
  [
    param('id').isUUID().withMessage('KOT ID must be a valid UUID'),
    body('priority')
      .isIn(['low', 'normal', 'high', 'urgent'])
      .withMessage('Priority must be one of: low, normal, high, urgent'),
    body('restaurantId').optional().isUUID().withMessage('Restaurant ID must be valid'),
    validate
  ],
  kotController.updateKOTPriority
);

module.exports = router;