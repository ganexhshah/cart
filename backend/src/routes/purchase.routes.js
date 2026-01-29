const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Test routes without authentication (for development)
router.get('/test/suppliers', purchaseController.getSuppliers);
router.get('/test/orders', purchaseController.getPurchaseOrders);
router.get('/test/history', purchaseController.getPurchaseHistory);
router.get('/test/cost-tracking', purchaseController.getCostTracking);

// Apply authentication to all other routes
router.use(authenticate);

// Supplier routes
router.get('/suppliers', purchaseController.getSuppliers);
router.post('/suppliers', authorize('owner', 'manager'), purchaseController.createSupplier);
router.put('/suppliers/:id', authorize('owner', 'manager'), purchaseController.updateSupplier);

// Purchase order routes
router.get('/orders', purchaseController.getPurchaseOrders);
router.post('/orders', authorize('owner', 'manager'), purchaseController.createPurchaseOrder);
router.get('/orders/:id', purchaseController.getPurchaseOrderById);
router.put('/orders/:id/status', authorize('owner', 'manager'), purchaseController.updatePurchaseOrderStatus);
router.post('/orders/:id/receive', authorize('owner', 'manager'), purchaseController.receivePurchaseOrderItems);

// Purchase history and reports
router.get('/history', purchaseController.getPurchaseHistory);
router.get('/cost-tracking', purchaseController.getCostTracking);
router.post('/cost-tracking/update', authorize('owner', 'manager'), purchaseController.updateCostTracking);

module.exports = router;