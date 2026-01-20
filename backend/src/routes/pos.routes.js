const express = require('express');
const posController = require('../controllers/pos.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { body, query, param } = require('express-validator');

const router = express.Router();

/**
 * @route   GET /api/pos/terminals
 * @desc    Get POS terminals
 * @access  Private (Admin, Owner)
 */
router.get('/terminals',
  authenticate,
  authorize('admin', 'owner'),
  [
    query('restaurantId').optional().isUUID().withMessage('Restaurant ID must be valid'),
    validate
  ],
  posController.getTerminals
);

/**
 * @route   POST /api/pos/terminals
 * @desc    Create POS terminal
 * @access  Private (Admin, Owner)
 */
router.post('/terminals',
  authenticate,
  authorize('admin', 'owner'),
  [
    body('terminalName').notEmpty().withMessage('Terminal name is required'),
    body('terminalCode').notEmpty().withMessage('Terminal code is required'),
    body('location').optional().isString(),
    body('restaurantId').optional().isUUID().withMessage('Restaurant ID must be valid'),
    validate
  ],
  posController.createTerminal
);

/**
 * @route   POST /api/pos/sessions
 * @desc    Start POS session
 * @access  Private (Waiter, Admin, Owner)
 */
router.post('/sessions',
  authenticate,
  authorize('waiter', 'admin', 'owner'),
  [
    body('terminalId').isUUID().withMessage('Terminal ID is required and must be valid'),
    body('openingCash').isDecimal().withMessage('Opening cash must be a valid amount'),
    validate
  ],
  posController.startSession
);

/**
 * @route   PATCH /api/pos/sessions/:sessionId/end
 * @desc    End POS session
 * @access  Private (Waiter, Admin, Owner)
 */
router.patch('/sessions/:sessionId/end',
  authenticate,
  authorize('waiter', 'admin', 'owner'),
  [
    param('sessionId').isUUID().withMessage('Session ID must be valid'),
    body('closingCash').isDecimal().withMessage('Closing cash must be a valid amount'),
    body('notes').optional().isString(),
    validate
  ],
  posController.endSession
);

/**
 * @route   POST /api/pos/transactions
 * @desc    Process transaction
 * @access  Private (Waiter, Admin, Owner)
 */
router.post('/transactions',
  authenticate,
  authorize('waiter', 'admin', 'owner'),
  [
    body('sessionId').optional().isUUID().withMessage('Session ID must be valid'),
    body('orderId').optional().isUUID().withMessage('Order ID must be valid'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    body('subtotal').isDecimal({ decimal_digits: '0,2' }).withMessage('Subtotal must be a valid amount'),
    body('taxAmount').optional().isDecimal({ decimal_digits: '0,2' }),
    body('discountAmount').optional().isDecimal({ decimal_digits: '0,2' }),
    body('tipAmount').optional().isDecimal({ decimal_digits: '0,2' }),
    body('amountPaid').isDecimal({ decimal_digits: '0,2' }).withMessage('Amount paid is required'),
    body('paymentReference').optional().isString(),
    validate
  ],
  posController.processTransaction
);

/**
 * @route   GET /api/pos/transactions
 * @desc    Get transactions
 * @access  Private (Admin, Owner)
 */
router.get('/transactions',
  authenticate,
  authorize('admin', 'owner'),
  [
    query('restaurantId').optional().isUUID().withMessage('Restaurant ID must be valid'),
    query('sessionId').optional().isUUID().withMessage('Session ID must be valid'),
    query('dateFrom').optional().isDate().withMessage('Date from must be valid date'),
    query('dateTo').optional().isDate().withMessage('Date to must be valid date'),
    query('paymentMethod').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  posController.getTransactions
);

/**
 * @route   GET /api/pos/stats
 * @desc    Get POS statistics
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
  posController.getPOSStats
);

/**
 * @route   GET /api/pos/payment-methods
 * @desc    Get payment methods
 * @access  Private (Waiter, Admin, Owner)
 */
router.get('/payment-methods',
  authenticate,
  authorize('waiter', 'admin', 'owner'),
  [
    query('restaurantId').optional().isUUID().withMessage('Restaurant ID must be valid'),
    validate
  ],
  posController.getPaymentMethods
);

/**
 * @route   POST /api/pos/payment-methods
 * @desc    Create payment method
 * @access  Private (Admin, Owner)
 */
router.post('/payment-methods',
  authenticate,
  authorize('admin', 'owner'),
  [
    body('methodName').notEmpty().withMessage('Method name is required'),
    body('methodType').isIn(['cash', 'card', 'digital']).withMessage('Method type must be cash, card, or digital'),
    body('processingFee').optional().isDecimal(),
    body('minAmount').optional().isDecimal(),
    body('maxAmount').optional().isDecimal(),
    validate
  ],
  posController.createPaymentMethod
);

/**
 * @route   GET /api/pos/discounts
 * @desc    Get available discounts
 * @access  Private (Waiter, Admin, Owner)
 */
router.get('/discounts',
  authenticate,
  authorize('waiter', 'admin', 'owner'),
  [
    query('restaurantId').optional().isUUID().withMessage('Restaurant ID must be valid'),
    validate
  ],
  posController.getDiscounts
);

/**
 * @route   POST /api/pos/discounts/:discountId/apply
 * @desc    Apply discount to order
 * @access  Private (Waiter, Admin, Owner)
 */
router.post('/discounts/:discountId/apply',
  authenticate,
  authorize('waiter', 'admin', 'owner'),
  [
    param('discountId').isUUID().withMessage('Discount ID must be valid'),
    body('orderAmount').isDecimal().withMessage('Order amount is required'),
    validate
  ],
  posController.applyDiscount
);

/**
 * @route   GET /api/pos/reports/daily
 * @desc    Generate daily report
 * @access  Private (Admin, Owner)
 */
router.get('/reports/daily',
  authenticate,
  authorize('admin', 'owner'),
  [
    query('restaurantId').optional().isUUID().withMessage('Restaurant ID must be valid'),
    query('date').optional().isDate().withMessage('Date must be valid'),
    validate
  ],
  posController.generateDailyReport
);

module.exports = router;