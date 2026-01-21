const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Test routes without authentication (for development)
router.get('/test/materials', inventoryController.getRawMaterials);
router.get('/test/transactions', inventoryController.getStockTransactions);
router.get('/test/alerts', inventoryController.getStockAlerts);
router.get('/test/summary', inventoryController.getInventorySummary);

// Apply authentication to all other routes
router.use(authenticate);

// Raw materials routes
router.get('/materials', inventoryController.getRawMaterials);
router.get('/materials/:id', inventoryController.getRawMaterialById);
router.post('/materials', authorize('owner', 'manager'), inventoryController.createRawMaterial);
router.put('/materials/:id', authorize('owner', 'manager'), inventoryController.updateRawMaterial);
router.delete('/materials/:id', authorize('owner', 'manager'), inventoryController.deleteRawMaterial);

// Stock transactions routes
router.get('/transactions', inventoryController.getStockTransactions);
router.post('/transactions', authorize('owner', 'manager', 'staff'), inventoryController.recordStockTransaction);

// Stock alerts routes
router.get('/alerts', inventoryController.getStockAlerts);
router.put('/alerts/:id/resolve', authorize('owner', 'manager'), inventoryController.resolveStockAlert);

// Usage tracking routes
router.get('/usage', inventoryController.getUsageTracking);
router.post('/usage/daily', authorize('owner', 'manager', 'staff'), inventoryController.recordDailyUsage);

// Summary and reports
router.get('/summary', inventoryController.getInventorySummary);
router.get('/low-stock', inventoryController.getLowStockItems);
router.get('/valuation', inventoryController.getInventoryValuation);
router.get('/reports', inventoryController.generateStockReport);

module.exports = router;