const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Auth validations
const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().notEmpty(),
  body('role').optional().isIn(['customer', 'waiter', 'admin', 'owner']),
  validate
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate
];

// Restaurant validations
const validateRestaurant = [
  body('name').trim().notEmpty(),
  body('address').trim().notEmpty(),
  body('phone').optional().isMobilePhone(),
  body('email').optional().isEmail(),
  validate
];

// Menu validations
const validateMenuItem = [
  body('name').trim().notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('categoryId').optional().isUUID(),
  body('isVegetarian').optional().isBoolean(),
  validate
];

// Order validations
const validateOrder = [
  body('restaurantId').isUUID(),
  body('items').isArray({ min: 1 }),
  body('items.*.menuItemId').isUUID(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('orderType').isIn(['dine-in', 'takeaway', 'delivery']),
  validate
];

// Staff validations
const validateStaff = [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone(),
  body('role').isIn(['waiter', 'chef', 'manager', 'cleaner', 'cashier']),
  body('shift').isIn(['morning', 'evening', 'night', 'full-time']),
  body('salary').isFloat({ min: 0 }),
  validate
];

const validateAttendance = [
  body('status').isIn(['present', 'absent', 'leave', 'half-day']),
  body('clockIn').optional().isISO8601(),
  body('clockOut').optional().isISO8601(),
  body('leaveType').optional().isIn(['sick', 'casual', 'paid', 'unpaid']),
  validate
];

// Customer validations
const validateCustomer = [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone(),
  body('location').optional().trim(),
  body('dietaryPreferences').optional().isArray(),
  body('allergies').optional().isArray(),
  validate
];

// Table validations
const validateTable = [
  body('tableNumber').trim().notEmpty(),
  body('capacity').isInt({ min: 1 }),
  body('type').optional().isIn(['indoor', 'outdoor', 'private']),
  validate
];

// UUID param validation
const validateUUID = [
  param('id').isUUID(),
  validate
];

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateRestaurant,
  validateMenuItem,
  validateOrder,
  validateStaff,
  validateAttendance,
  validateCustomer,
  validateTable,
  validateUUID
};
