const inventoryService = require('../services/inventory.service');
const logger = require('../utils/logger');

class InventoryController {
  // Get all raw materials
  async getRawMaterials(req, res) {
    try {
      const restaurantId = req.user?.restaurantId;
      
      if (!restaurantId) {
        // Return mock data if no restaurant ID
        const mockMaterials = [
          {
            id: "1",
            name: "Milk",
            category: "dairy",
            unit: "liter",
            current_stock: 15.5,
            minimum_stock: 20,
            maximum_stock: 100,
            reorder_level: 25,
            cost_per_unit: 50.00,
            is_low_stock: true,
            created_at: new Date().toISOString()
          },
          {
            id: "2",
            name: "Coffee Beans",
            category: "beverages",
            unit: "kg",
            current_stock: 8.2,
            minimum_stock: 5,
            maximum_stock: 20,
            reorder_level: 8,
            cost_per_unit: 800.00,
            is_low_stock: false,
            created_at: new Date().toISOString()
          },
          {
            id: "3",
            name: "Sugar",
            category: "sweeteners",
            unit: "kg",
            current_stock: 0,
            minimum_stock: 10,
            maximum_stock: 50,
            reorder_level: 15,
            cost_per_unit: 80.00,
            is_low_stock: true,
            created_at: new Date().toISOString()
          },
          {
            id: "4",
            name: "Rice",
            category: "grains",
            unit: "kg",
            current_stock: 45.0,
            minimum_stock: 20,
            maximum_stock: 100,
            reorder_level: 30,
            cost_per_unit: 120.00,
            is_low_stock: false,
            created_at: new Date().toISOString()
          }
        ];
        
        return res.json({
          success: true,
          data: mockMaterials,
          message: 'Demo data - authentication not configured'
        });
      }

      const filters = {
        category: req.query.category,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : true,
        lowStock: req.query.lowStock === 'true',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };

      const result = await inventoryService.getRawMaterials(restaurantId, filters);
      res.json(result);
    } catch (error) {
      logger.error('Error getting raw materials:', error);
      res.status(500).json({ success: false, message: 'Failed to get raw materials' });
    }
  }

  // Get raw material by ID
  async getRawMaterialById(req, res) {
    try {
      const { id } = req.params;
      const result = await inventoryService.getRawMaterialById(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.json(result);
    } catch (error) {
      logger.error('Error getting raw material:', error);
      res.status(500).json({ success: false, message: 'Failed to get raw material' });
    }
  }

  // Create raw material
  async createRawMaterial(req, res) {
    try {
      const { restaurantId } = req.user;
      const result = await inventoryService.createRawMaterial(restaurantId, req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Error creating raw material:', error);
      res.status(500).json({ success: false, message: 'Failed to create raw material' });
    }
  }

  // Update raw material
  async updateRawMaterial(req, res) {
    try {
      const { id } = req.params;
      const result = await inventoryService.updateRawMaterial(id, req.body);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error updating raw material:', error);
      res.status(500).json({ success: false, message: 'Failed to update raw material' });
    }
  }

  // Delete raw material
  async deleteRawMaterial(req, res) {
    try {
      const { id } = req.params;
      const result = await inventoryService.deleteRawMaterial(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error deleting raw material:', error);
      res.status(500).json({ success: false, message: 'Failed to delete raw material' });
    }
  }

  // Record stock transaction
  async recordStockTransaction(req, res) {
    try {
      const { restaurantId, id: userId } = req.user;
      const transactionData = {
        ...req.body,
        restaurantId,
        createdBy: userId
      };

      const result = await inventoryService.recordStockTransaction(transactionData);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Error recording stock transaction:', error);
      res.status(500).json({ success: false, message: 'Failed to record stock transaction' });
    }
  }

  // Get stock transactions
  async getStockTransactions(req, res) {
    try {
      const restaurantId = req.user?.restaurantId;
      
      if (!restaurantId) {
        // Return mock data if no restaurant ID
        const mockTransactions = [
          {
            id: "1",
            material_name: "Coffee Beans",
            transaction_type: "in",
            quantity: 5.0,
            unit_cost: 800.00,
            total_cost: 4000.00,
            stock_before: 3.2,
            stock_after: 8.2,
            created_at: new Date().toISOString(),
            created_by_name: "John Doe",
            notes: "Weekly stock replenishment"
          },
          {
            id: "2",
            material_name: "Milk",
            transaction_type: "out",
            quantity: 4.5,
            unit_cost: 50.00,
            total_cost: 225.00,
            stock_before: 20.0,
            stock_after: 15.5,
            created_at: new Date().toISOString(),
            created_by_name: "Jane Smith",
            notes: "Used for morning coffee preparation"
          }
        ];
        
        return res.json({
          success: true,
          data: mockTransactions,
          message: 'Demo data - authentication not configured'
        });
      }

      const filters = {
        materialId: req.query.materialId,
        transactionType: req.query.transactionType,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };

      const result = await inventoryService.getStockTransactions(restaurantId, filters);
      res.json(result);
    } catch (error) {
      logger.error('Error getting stock transactions:', error);
      res.status(500).json({ success: false, message: 'Failed to get stock transactions' });
    }
  }

  // Get stock alerts
  async getStockAlerts(req, res) {
    try {
      const restaurantId = req.user?.restaurantId;
      
      if (!restaurantId) {
        // Return mock data if no restaurant ID
        const mockAlerts = [
          {
            id: "1",
            material_name: "Sugar",
            alert_type: "out_of_stock",
            current_stock: 0,
            minimum_stock: 10,
            message: "Sugar is out of stock",
            created_at: new Date().toISOString(),
            is_resolved: false
          },
          {
            id: "2",
            material_name: "Milk",
            alert_type: "low_stock",
            current_stock: 15.5,
            minimum_stock: 20,
            message: "Milk is running low (15.5 liters remaining)",
            created_at: new Date().toISOString(),
            is_resolved: false
          }
        ];
        
        return res.json({
          success: true,
          data: mockAlerts,
          message: 'Demo data - authentication not configured'
        });
      }

      const filters = {
        alertType: req.query.alertType,
        isResolved: req.query.isResolved === 'true',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };

      const result = await inventoryService.getStockAlerts(restaurantId, filters);
      res.json(result);
    } catch (error) {
      logger.error('Error getting stock alerts:', error);
      res.status(500).json({ success: false, message: 'Failed to get stock alerts' });
    }
  }

  // Resolve stock alert
  async resolveStockAlert(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;

      const result = await inventoryService.resolveStockAlert(id, userId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error resolving stock alert:', error);
      res.status(500).json({ success: false, message: 'Failed to resolve stock alert' });
    }
  }

  // Get usage tracking
  async getUsageTracking(req, res) {
    try {
      const { restaurantId } = req.user;
      const filters = {
        materialId: req.query.materialId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };

      const result = await inventoryService.getUsageTracking(restaurantId, filters);
      res.json(result);
    } catch (error) {
      logger.error('Error getting usage tracking:', error);
      res.status(500).json({ success: false, message: 'Failed to get usage tracking' });
    }
  }

  // Record daily usage
  async recordDailyUsage(req, res) {
    try {
      const { restaurantId, id: userId } = req.user;
      const { usageData } = req.body;

      const result = await inventoryService.recordDailyUsage(restaurantId, usageData, userId);
      res.json(result);
    } catch (error) {
      logger.error('Error recording daily usage:', error);
      res.status(500).json({ success: false, message: 'Failed to record daily usage' });
    }
  }

  // Get inventory summary
  async getInventorySummary(req, res) {
    try {
      const restaurantId = req.user?.restaurantId;
      
      if (!restaurantId) {
        // Return mock data if no restaurant ID
        const mockSummary = {
          total_materials: 24,
          low_stock_count: 5,
          out_of_stock_count: 2,
          total_inventory_value: 45230.50,
          pending_alerts: 7
        };
        
        return res.json({
          success: true,
          data: mockSummary,
          message: 'Demo data - authentication not configured'
        });
      }

      const result = await inventoryService.getInventorySummary(restaurantId);
      res.json(result);
    } catch (error) {
      logger.error('Error getting inventory summary:', error);
      res.status(500).json({ success: false, message: 'Failed to get inventory summary' });
    }
  }

  // Get low stock items
  async getLowStockItems(req, res) {
    try {
      const { restaurantId } = req.user;
      const result = await inventoryService.getLowStockItems(restaurantId);
      res.json(result);
    } catch (error) {
      logger.error('Error getting low stock items:', error);
      res.status(500).json({ success: false, message: 'Failed to get low stock items' });
    }
  }

  // Get inventory valuation
  async getInventoryValuation(req, res) {
    try {
      const { restaurantId } = req.user;
      const filters = {
        category: req.query.category,
        date: req.query.date
      };

      const result = await inventoryService.getInventoryValuation(restaurantId, filters);
      res.json(result);
    } catch (error) {
      logger.error('Error getting inventory valuation:', error);
      res.status(500).json({ success: false, message: 'Failed to get inventory valuation' });
    }
  }

  // Generate stock report
  async generateStockReport(req, res) {
    try {
      const { restaurantId } = req.user;
      const params = {
        reportType: req.query.reportType,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        materialId: req.query.materialId,
        category: req.query.category
      };

      const result = await inventoryService.generateStockReport(restaurantId, params);
      res.json(result);
    } catch (error) {
      logger.error('Error generating stock report:', error);
      res.status(500).json({ success: false, message: 'Failed to generate stock report' });
    }
  }
}

module.exports = new InventoryController();