const purchaseService = require('../services/purchase.service');
const logger = require('../utils/logger');

class PurchaseController {
  // Get all suppliers
  async getSuppliers(req, res) {
    try {
      const { restaurantId } = req.user;
      const filters = {
        businessType: req.query.businessType,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : true,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };

      const result = await purchaseService.getSuppliers(restaurantId, filters);
      res.json(result);
    } catch (error) {
      logger.error('Error getting suppliers:', error);
      res.status(500).json({ success: false, message: 'Failed to get suppliers' });
    }
  }

  // Create supplier
  async createSupplier(req, res) {
    try {
      const { restaurantId } = req.user;
      const result = await purchaseService.createSupplier(restaurantId, req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Error creating supplier:', error);
      res.status(500).json({ success: false, message: 'Failed to create supplier' });
    }
  }

  // Update supplier
  async updateSupplier(req, res) {
    try {
      const { id } = req.params;
      const result = await purchaseService.updateSupplier(id, req.body);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.json(result);
    } catch (error) {
      logger.error('Error updating supplier:', error);
      res.status(500).json({ success: false, message: 'Failed to update supplier' });
    }
  }

  // Create purchase order
  async createPurchaseOrder(req, res) {
    try {
      const { restaurantId, id: userId } = req.user;
      const orderData = {
        ...req.body,
        restaurantId,
        createdBy: userId
      };

      const result = await purchaseService.createPurchaseOrder(orderData);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Error creating purchase order:', error);
      res.status(500).json({ success: false, message: 'Failed to create purchase order' });
    }
  }

  // Get purchase orders
  async getPurchaseOrders(req, res) {
    try {
      const { restaurantId } = req.user;
      const filters = {
        supplierId: req.query.supplierId,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await purchaseService.getPurchaseOrders(restaurantId, filters);
      res.json(result);
    } catch (error) {
      logger.error('Error getting purchase orders:', error);
      res.status(500).json({ success: false, message: 'Failed to get purchase orders' });
    }
  }

  // Get purchase order by ID
  async getPurchaseOrderById(req, res) {
    try {
      const { id } = req.params;
      const result = await purchaseService.getPurchaseOrderById(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.json(result);
    } catch (error) {
      logger.error('Error getting purchase order:', error);
      res.status(500).json({ success: false, message: 'Failed to get purchase order' });
    }
  }

  // Update purchase order status
  async updatePurchaseOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { id: userId } = req.user;

      const result = await purchaseService.updatePurchaseOrderStatus(id, status, userId);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.json(result);
    } catch (error) {
      logger.error('Error updating purchase order status:', error);
      res.status(500).json({ success: false, message: 'Failed to update purchase order status' });
    }
  }

  // Receive purchase order items
  async receivePurchaseOrderItems(req, res) {
    try {
      const { id } = req.params;
      const { receivedItems } = req.body;
      const { id: userId } = req.user;

      const result = await purchaseService.receivePurchaseOrderItems(id, receivedItems, userId);
      res.json(result);
    } catch (error) {
      logger.error('Error receiving purchase order items:', error);
      res.status(500).json({ success: false, message: 'Failed to receive purchase order items' });
    }
  }

  // Get purchase history
  async getPurchaseHistory(req, res) {
    try {
      const { restaurantId } = req.user;
      const filters = {
        supplierId: req.query.supplierId,
        materialId: req.query.materialId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };

      const result = await purchaseService.getPurchaseHistory(restaurantId, filters);
      res.json(result);
    } catch (error) {
      logger.error('Error getting purchase history:', error);
      res.status(500).json({ success: false, message: 'Failed to get purchase history' });
    }
  }

  // Get cost tracking
  async getCostTracking(req, res) {
    try {
      const { restaurantId } = req.user;
      const { materialId, days } = req.query;

      const result = await purchaseService.getCostTracking(
        restaurantId, 
        materialId, 
        parseInt(days) || 30
      );
      res.json(result);
    } catch (error) {
      logger.error('Error getting cost tracking:', error);
      res.status(500).json({ success: false, message: 'Failed to get cost tracking' });
    }
  }

  // Update cost tracking
  async updateCostTracking(req, res) {
    try {
      const { restaurantId } = req.user;
      const { date } = req.body;

      const result = await purchaseService.updateCostTracking(restaurantId, date);
      res.json(result);
    } catch (error) {
      logger.error('Error updating cost tracking:', error);
      res.status(500).json({ success: false, message: 'Failed to update cost tracking' });
    }
  }
}

module.exports = new PurchaseController();