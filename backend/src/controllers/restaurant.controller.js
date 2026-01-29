const restaurantService = require('../services/restaurant.service');
const db = require('../config/database');

class RestaurantController {
  // Get restaurant by slug (public route)
  async getRestaurantBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const restaurant = await restaurantService.getRestaurantBySlug(slug);
      
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      res.json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      next(error);
    }
  }

  async createRestaurant(req, res, next) {
    try {
      const restaurantData = {
        ...req.body,
        ownerId: req.user.userId
      };
      
      const restaurant = await restaurantService.createRestaurant(restaurantData);
      
      // Update user's primary_restaurant_id
      await db.query(
        'UPDATE users SET primary_restaurant_id = $1 WHERE id = $2',
        [restaurant.id, req.user.userId]
      );
      
      res.status(201).json({
        success: true,
        data: restaurant,
        message: 'Restaurant created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getRestaurants(req, res, next) {
    try {
      const filters = {
        ownerId: req.user.userId, // Filter by current user's restaurants only
        city: req.query.city,
        isActive: req.query.isActive,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };
      
      const restaurants = await restaurantService.getRestaurants(filters);
      
      res.json({
        success: true,
        data: restaurants
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getRestaurantById(req, res, next) {
    try {
      const restaurant = await restaurantService.getRestaurantById(req.params.id);
      
      // Check if user owns this restaurant
      if (restaurant.owner_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only view your own restaurants.'
        });
      }
      
      res.json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateRestaurant(req, res, next) {
    try {
      // First check if user owns this restaurant
      const existingRestaurant = await restaurantService.getRestaurantById(req.params.id);
      if (existingRestaurant.owner_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only update your own restaurants.'
        });
      }
      
      const restaurant = await restaurantService.updateRestaurant(req.params.id, req.body);
      
      res.json({
        success: true,
        data: restaurant,
        message: 'Restaurant updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async deleteRestaurant(req, res, next) {
    try {
      // First check if user owns this restaurant
      const existingRestaurant = await restaurantService.getRestaurantById(req.params.id);
      if (existingRestaurant.owner_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only delete your own restaurants.'
        });
      }
      
      await restaurantService.deleteRestaurant(req.params.id);
      
      res.json({
        success: true,
        message: 'Restaurant deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getRestaurantMenu(req, res, next) {
    try {
      const menu = await restaurantService.getRestaurantMenu(req.params.id);
      
      res.json({
        success: true,
        data: menu
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RestaurantController();
