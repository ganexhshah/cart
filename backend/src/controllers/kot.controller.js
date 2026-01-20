const kotService = require('../services/kot.service');

class KOTController {
  // Get all KOT orders
  async getKOTOrders(req, res, next) {
    try {
      const filters = {
        restaurantId: req.query.restaurantId || req.user.primaryRestaurantId,
        status: req.query.status,
        priority: req.query.priority,
        tableId: req.query.tableId,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };
      
      // Ensure user can only access their restaurant's KOTs
      if (req.user.role === 'owner' && !filters.restaurantId) {
        return res.status(400).json({
          success: false,
          error: 'Restaurant ID is required'
        });
      }
      
      const kots = await kotService.getKOTOrders(filters);
      
      res.json({
        success: true,
        data: kots
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get KOT order by ID
  async getKOTOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const restaurantId = req.query.restaurantId || req.user.primaryRestaurantId;
      
      const kot = await kotService.getKOTOrderById(id, restaurantId);
      
      res.json({
        success: true,
        data: kot
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Create new KOT order
  async createKOTOrder(req, res, next) {
    try {
      const kotData = {
        ...req.body,
        restaurantId: req.body.restaurantId || req.user.primaryRestaurantId,
        createdBy: req.user.userId
      };
      
      const kot = await kotService.createKOTOrder(kotData);
      
      res.status(201).json({
        success: true,
        data: kot,
        message: 'KOT order created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Update KOT status
  async updateKOTStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const restaurantId = req.body.restaurantId || req.user.primaryRestaurantId;
      
      const kot = await kotService.updateKOTStatus(id, restaurantId, status, req.user.userId);
      
      res.json({
        success: true,
        data: kot,
        message: 'KOT status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Update KOT priority
  async updateKOTPriority(req, res, next) {
    try {
      const { id } = req.params;
      const { priority } = req.body;
      const restaurantId = req.body.restaurantId || req.user.primaryRestaurantId;
      
      const kot = await kotService.updateKOTPriority(id, restaurantId, priority);
      
      res.json({
        success: true,
        data: kot,
        message: 'KOT priority updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get KOT statistics
  async getKOTStats(req, res, next) {
    try {
      const restaurantId = req.query.restaurantId || req.user.primaryRestaurantId;
      const dateRange = req.query.dateRange || 'today';
      
      const stats = await kotService.getKOTStats(restaurantId, dateRange);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get KOT items
  async getKOTItems(req, res, next) {
    try {
      const restaurantId = req.query.restaurantId || req.user.primaryRestaurantId;
      
      const items = await kotService.getKOTItems(restaurantId);
      
      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new KOTController();