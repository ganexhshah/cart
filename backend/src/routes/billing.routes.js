const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Apply authentication to all routes
router.use(authenticate);

// Bill routes
router.get('/bills', billingController.getBills);
router.get('/bills/:id', billingController.getBillById);
router.post('/bills/generate/:orderId', authorize('owner', 'manager', 'staff'), billingController.generateBill);
router.post('/bills/:id/payment', authorize('owner', 'manager', 'staff'), billingController.processPayment);
router.post('/bills/:id/split', authorize('owner', 'manager', 'staff'), billingController.splitBill);
router.post('/bills/:id/print', billingController.markAsPrinted);
router.post('/bills/:id/whatsapp', billingController.markAsSentWhatsApp);

// Settings routes
router.get('/settings', billingController.getTaxSettings);
router.put('/settings', authorize('owner', 'manager'), billingController.updateTaxSettings);

// Reports routes
router.get('/payments/summary', billingController.getPaymentSummary);
router.get('/reports/daily', billingController.getDailySalesReport);

module.exports = router;