const inventoryService = require('../services/inventory.service');
const logger = require('../utils/logger');
const db = require('../config/database');

class InventoryController {
  // Get all raw materials
  async getRawMaterials(req, res) {
    try {
      // Get restaurantId from user - check both JWT and database
      let restaurantId = req.user?.restaurantId;
      
      // If not in JWT, fetch from database
      if (!restaurantId && req.user?.userId) {
        const userResult = await db.query(
          'SELECT primary_restaurant_id FROM users WHERE id = $1',
          [req.user.userId]
        );
        restaurantId = userResult.rows[0]?.primary_restaurant_id;
      }
      
      if (!restaurantId) {
        // Return mock data if no restaurant ID
        const mockMaterials = [
          {
            id: "1",
            name: "Milk",
            category: "dairy",
            unit: "liter",
            currentStock: 15.5,
            minimumStock: 20,
            maximumStock: 100,
            reorderLevel: 25,
            costPerUnit: 50.00,
            isLowStock: true,
            createdAt: new Date().toISOString()
          },
          {
            id: "2",
            name: "Coffee Beans",
            category: "beverages",
            unit: "kg",
            currentStock: 8.2,
            minimumStock: 5,
            maximumStock: 20,
            reorderLevel: 8,
            costPerUnit: 800.00,
            isLowStock: false,
            createdAt: new Date().toISOString()
          },
          {
            id: "3",
            name: "Sugar",
            category: "sweeteners",
            unit: "kg",
            currentStock: 0,
            minimumStock: 10,
            maximumStock: 50,
            reorderLevel: 15,
            costPerUnit: 80.00,
            isLowStock: true,
            createdAt: new Date().toISOString()
          },
          {
            id: "4",
            name: "Rice",
            category: "grains",
            unit: "kg",
            currentStock: 45.0,
            minimumStock: 20,
            maximumStock: 100,
            reorderLevel: 30,
            costPerUnit: 120.00,
            isLowStock: false,
            createdAt: new Date().toISOString()
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
      // Get restaurantId from user - check both JWT and database
      let restaurantId = req.user?.restaurantId;
      
      // If not in JWT, fetch from database
      if (!restaurantId && req.user?.userId) {
        const userResult = await db.query(
          'SELECT primary_restaurant_id FROM users WHERE id = $1',
          [req.user.userId]
        );
        restaurantId = userResult.rows[0]?.primary_restaurant_id;
      }
      
      if (!restaurantId) {
        // Return mock success response
        const mockTransaction = {
          id: `txn-${Date.now()}`,
          materialName: "Mock Material",
          transactionType: req.body.transactionType || "in",
          quantity: req.body.quantity || 0,
          unitCost: req.body.unitCost || 0,
          totalCost: (req.body.quantity || 0) * (req.body.unitCost || 0),
          stockBefore: 10,
          stockAfter: 10 + (req.body.quantity || 0),
          createdAt: new Date().toISOString(),
          createdByName: "Demo User",
          notes: req.body.notes || ""
        };
        
        return res.json({
          success: true,
          data: mockTransaction,
          message: 'Stock transaction recorded successfully (demo mode)'
        });
      }

      const transactionData = {
        ...req.body,
        restaurantId,
        createdBy: req.user.id
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
      // Get restaurantId from user - check both JWT and database
      let restaurantId = req.user?.restaurantId;
      
      // If not in JWT, fetch from database
      if (!restaurantId && req.user?.userId) {
        const userResult = await db.query(
          'SELECT primary_restaurant_id FROM users WHERE id = $1',
          [req.user.userId]
        );
        restaurantId = userResult.rows[0]?.primary_restaurant_id;
      }
      
      if (!restaurantId) {
        // Return mock data if no restaurant ID
        const mockTransactions = [
          {
            id: "1",
            materialName: "Coffee Beans",
            transactionType: "in",
            quantity: 5.0,
            unitCost: 800.00,
            totalCost: 4000.00,
            stockBefore: 3.2,
            stockAfter: 8.2,
            createdAt: new Date().toISOString(),
            createdByName: "John Doe",
            notes: "Weekly stock replenishment"
          },
          {
            id: "2",
            materialName: "Milk",
            transactionType: "out",
            quantity: 4.5,
            unitCost: 50.00,
            totalCost: 225.00,
            stockBefore: 20.0,
            stockAfter: 15.5,
            createdAt: new Date().toISOString(),
            createdByName: "Jane Smith",
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
      // Get restaurantId from user - check both JWT and database
      let restaurantId = req.user?.restaurantId;
      
      // If not in JWT, fetch from database
      if (!restaurantId && req.user?.userId) {
        const userResult = await db.query(
          'SELECT primary_restaurant_id FROM users WHERE id = $1',
          [req.user.userId]
        );
        restaurantId = userResult.rows[0]?.primary_restaurant_id;
      }
      
      if (!restaurantId) {
        // Return mock data if no restaurant ID
        const mockAlerts = [
          {
            id: "1",
            materialName: "Sugar",
            alertType: "out_of_stock",
            currentStock: 0,
            minimumStock: 10,
            message: "Sugar is out of stock",
            createdAt: new Date().toISOString(),
            isResolved: false
          },
          {
            id: "2",
            materialName: "Milk",
            alertType: "low_stock",
            currentStock: 15.5,
            minimumStock: 20,
            message: "Milk is running low (15.5 liters remaining)",
            createdAt: new Date().toISOString(),
            isResolved: false
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
      const userId = req.user?.id;

      if (!userId) {
        // Return mock success response
        return res.json({
          success: true,
          data: {
            id: id,
            isResolved: true,
            resolvedAt: new Date().toISOString(),
            resolvedBy: "Demo User"
          },
          message: 'Alert resolved successfully (demo mode)'
        });
      }

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
      // Get restaurantId from user - check both JWT and database
      let restaurantId = req.user?.restaurantId;
      
      // If not in JWT, fetch from database
      if (!restaurantId && req.user?.userId) {
        const userResult = await db.query(
          'SELECT primary_restaurant_id FROM users WHERE id = $1',
          [req.user.userId]
        );
        restaurantId = userResult.rows[0]?.primary_restaurant_id;
      }
      
      if (!restaurantId) {
        // Return mock data if no restaurant ID
        const mockSummary = {
          totalMaterials: 24,
          lowStockCount: 5,
          outOfStockCount: 2,
          totalInventoryValue: 45230.50,
          pendingAlerts: 7
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