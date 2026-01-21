const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth.middleware');
const { validateRestaurant, validateUUID } = require('../middleware/validation.middleware');

// Public routes
router.get('/slug/:slug', restaurantController.getRestaurantBySlug);

// Protected routes
router.post('/', authenticate, authorize('owner', 'admin'), validateRestaurant, restaurantController.createRestaurant);
router.get('/', authenticate, authorize('owner', 'admin'), restaurantController.getRestaurants);
router.get('/:id', authenticate, authorize('owner', 'admin'), validateUUID, restaurantController.getRestaurantById);
router.get('/:id/menu', optionalAuth, validateUUID, restaurantController.getRestaurantMenu);
router.put('/:id', authenticate, authorize('owner', 'admin'), validateUUID, validateRestaurant, restaurantController.updateRestaurant);
router.delete('/:id', authenticate, authorize('owner', 'admin'), validateUUID, restaurantController.deleteRestaurant);

module.exports = router;
