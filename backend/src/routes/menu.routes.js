const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes (no authentication required)
router.get('/categories', menuController.getCategories);
router.get('/items', menuController.getMenuItems);
router.get('/items/:id', menuController.getMenuItem);

// Protected routes (authentication required)
router.use(authenticate);

// User's menu management
router.get('/my-items', menuController.getUserMenuItems);
router.post('/items', menuController.createMenuItem);
router.post('/bulk-import', menuController.bulkImportMenuItems);
router.get('/sample-template', menuController.getSampleTemplate);
router.put('/items/:id', menuController.updateMenuItem);
router.delete('/items/:id', menuController.deleteMenuItem);
router.patch('/items/:id/status', menuController.updateItemStatus);

// Statistics and analytics
router.get('/stats', menuController.getMenuStats);
router.get('/popular', menuController.getPopularItems);

module.exports = router;