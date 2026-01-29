const menuService = require('../services/menu.service');
const logger = require('../utils/logger');

class MenuController {
  // Get all menu categories
  async getCategories(req, res, next) {
    try {
      const { restaurantId } = req.query;
      const categories = await menuService.getCategories(restaurantId);
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      logger.error('Error in getCategories:', error);
      next(error);
    }
  }

  // Get menu items with filters
  async getMenuItems(req, res, next) {
    try {
      const filters = {
        restaurantId: req.query.restaurantId,
        categoryId: req.query.categoryId,
        status: req.query.status,
        search: req.query.search,
        isVegetarian: req.query.isVegetarian === 'true' ? true : req.query.isVegetarian === 'false' ? false : undefined,
        isVegan: req.query.isVegan === 'true' ? true : req.query.isVegan === 'false' ? false : undefined,
        isGlutenFree: req.query.isGlutenFree === 'true' ? true : req.query.isGlutenFree === 'false' ? false : undefined,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined
      };

      // If no restaurantId provided, get items from user's restaurants
      if (!filters.restaurantId && req.user) {
        // This will be handled in the service by joining with restaurants table
        filters.userId = req.user.id;
      }

      const items = await menuService.getMenuItems(filters);
      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      logger.error('Error in getMenuItems:', error);
      next(error);
    }
  }

  // Get single menu item
  async getMenuItem(req, res, next) {
    try {
      const { id } = req.params;
      const item = await menuService.getMenuItemById(id);
      
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      logger.error('Error in getMenuItem:', error);
      next(error);
    }
  }

  // Create new menu item
  async createMenuItem(req, res, next) {
    try {
      const {
        restaurantId,
        categoryId,
        name,
        description,
        price,
        imageUrl,
        status,
        preparationTime,
        calories,
        ingredients,
        allergens,
        isVegetarian,
        isVegan,
        isGlutenFree,
        isSpicy,
        displayOrder,
        isFeatured
      } = req.body;

      // Validation
      if (!restaurantId || !name || !price) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant ID, name, and price are required'
        });
      }

      if (price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be greater than 0'
        });
      }

      const itemData = {
        restaurantId,
        categoryId,
        name: name.trim(),
        description: description?.trim(),
        price: parseFloat(price),
        imageUrl,
        status,
        preparationTime: preparationTime ? parseInt(preparationTime) : undefined,
        calories: calories ? parseInt(calories) : undefined,
        ingredients: Array.isArray(ingredients) ? ingredients : [],
        allergens: Array.isArray(allergens) ? allergens : [],
        isVegetarian: Boolean(isVegetarian),
        isVegan: Boolean(isVegan),
        isGlutenFree: Boolean(isGlutenFree),
        isSpicy: Boolean(isSpicy),
        displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
        isFeatured: Boolean(isFeatured)
      };

      const item = await menuService.createMenuItem(req.user.id, itemData);
      
      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: item
      });
    } catch (error) {
      logger.error('Error in createMenuItem:', error);
      if (error.message === 'Restaurant not found or access denied') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // Bulk import menu items
  async bulkImportMenuItems(req, res, next) {
    try {
      const { items, restaurantId } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Items array is required and must not be empty'
        });
      }

      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant ID is required'
        });
      }

      const result = await menuService.bulkImportMenuItems(req.user.id, restaurantId, items);
      
      res.status(201).json({
        success: true,
        message: `Bulk import completed: ${result.created} items created, ${result.errors.length} errors`,
        data: result
      });
    } catch (error) {
      logger.error('Error in bulkImportMenuItems:', error);
      if (error.message === 'Restaurant not found or access denied') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // Get sample template
  async getSampleTemplate(req, res, next) {
    try {
      const { format } = req.query;
      
      const sampleData = [
        {
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
          price: 12.99,
          category: 'Pizza',
          preparationTime: 15,
          calories: 280,
          ingredients: ['Tomato sauce', 'Mozzarella cheese', 'Fresh basil', 'Olive oil'],
          allergens: ['Gluten', 'Dairy'],
          isVegetarian: true,
          isVegan: false,
          isGlutenFree: false,
          imageUrl: 'https://example.com/pizza.jpg'
        },
        {
          name: 'Caesar Salad',
          description: 'Fresh romaine lettuce with caesar dressing and croutons',
          price: 8.99,
          category: 'Salads',
          preparationTime: 10,
          calories: 150,
          ingredients: ['Romaine lettuce', 'Caesar dressing', 'Croutons', 'Parmesan cheese'],
          allergens: ['Gluten', 'Dairy'],
          isVegetarian: true,
          isVegan: false,
          isGlutenFree: false,
          imageUrl: ''
        }
      ];

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="menu_items_template.json"');
        res.json(sampleData);
      } else {
        // Return as JSON for frontend to process into Excel
        res.json({
          success: true,
          data: sampleData
        });
      }
    } catch (error) {
      logger.error('Error in getSampleTemplate:', error);
      next(error);
    }
  }

  // Update menu item
  async updateMenuItem(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Convert string booleans to actual booleans
      ['isVegetarian', 'isVegan', 'isGlutenFree', 'isSpicy', 'isFeatured'].forEach(field => {
        if (updateData[field] !== undefined) {
          updateData[field] = Boolean(updateData[field]);
        }
      });

      // Convert string numbers to numbers
      ['price', 'preparationTime', 'calories', 'displayOrder'].forEach(field => {
        if (updateData[field] !== undefined && updateData[field] !== '') {
          updateData[field] = parseFloat(updateData[field]);
        }
      });

      const item = await menuService.updateMenuItem(req.user.id, id, updateData);
      
      res.json({
        success: true,
        message: 'Menu item updated successfully',
        data: item
      });
    } catch (error) {
      logger.error('Error in updateMenuItem:', error);
      if (error.message === 'Menu item not found or access denied') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === 'No valid fields to update') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // Delete menu item
  async deleteMenuItem(req, res, next) {
    try {
      const { id } = req.params;
      const result = await menuService.deleteMenuItem(req.user.id, id);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Error in deleteMenuItem:', error);
      if (error.message === 'Menu item not found or access denied') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // Get menu statistics
  async getMenuStats(req, res, next) {
    try {
      const { restaurantId } = req.query;
      const stats = await menuService.getMenuStats(req.user.id, restaurantId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error in getMenuStats:', error);
      next(error);
    }
  }

  // Get popular menu items
  async getPopularItems(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const items = await menuService.getPopularItems(req.user.id, limit);
      
      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      logger.error('Error in getPopularItems:', error);
      next(error);
    }
  }

  // Update menu item status
  async updateItemStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const item = await menuService.updateItemStatus(req.user.id, id, status);
      
      res.json({
        success: true,
        message: 'Menu item status updated successfully',
        data: item
      });
    } catch (error) {
      logger.error('Error in updateItemStatus:', error);
      if (error.message === 'Invalid status') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === 'Menu item not found or access denied') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // Get user's menu items (for authenticated users)
  async getUserMenuItems(req, res, next) {
    try {
      const filters = {
        userId: req.user.id,
        categoryId: req.query.categoryId,
        status: req.query.status,
        search: req.query.search,
        restaurantId: req.query.restaurantId,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined
      };

      // Modify the service call to filter by user's restaurants
      const items = await menuService.getMenuItems({
        ...filters,
        userRestaurantsOnly: true
      });
      
      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      logger.error('Error in getUserMenuItems:', error);
      next(error);
    }
  }
}

module.exports = new MenuController();