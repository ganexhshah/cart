const purchaseService = require('../services/purchase.service');
const logger = require('../utils/logger');
const db = require('../config/database');

class PurchaseController {
  // Get all suppliers
  async getSuppliers(req, res) {
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
        const mockSuppliers = [
          {
            id: "1",
            name: "Fresh Dairy Co.",
            contactPerson: "Ram Sharma",
            email: "ram@freshdairy.com",
            phone: "9841234567",
            address: "Kathmandu, Nepal",
            businessType: "wholesaler",
            paymentTerms: "credit_30",
            rating: 4.5,
            isActive: true,
            totalOrders: 15,
            avgOrderValue: 25000,
            createdAt: new Date().toISOString()
          },
          {
            id: "2",
            name: "Mountain Coffee Suppliers",
            contactPerson: "Sita Gurung",
            email: "sita@mountaincoffee.com",
            phone: "9851234567",
            address: "Pokhara, Nepal",
            businessType: "distributor",
            paymentTerms: "credit_15",
            rating: 4.8,
            isActive: true,
            totalOrders: 8,
            avgOrderValue: 45000,
            createdAt: new Date().toISOString()
          },
          {
            id: "3",
            name: "Organic Vegetables Ltd",
            contactPerson: "Hari Thapa",
            email: "hari@organicveggies.com",
            phone: "9861234567",
            address: "Lalitpur, Nepal",
            businessType: "farmer",
            paymentTerms: "cash",
            rating: 4.2,
            isActive: true,
            totalOrders: 22,
            avgOrderValue: 12000,
            createdAt: new Date().toISOString()
          }
        ];
        
        return res.json({
          success: true,
          data: mockSuppliers,
          message: 'Demo data - authentication not configured'
        });
      }

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
        const mockOrders = [
          {
            id: "1",
            poNumber: "PO-202501-0001",
            supplierName: "Fresh Dairy Co.",
            orderDate: new Date().toISOString(),
            expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: "confirmed",
            subtotal: 25000,
            taxAmount: 3250,
            totalAmount: 28250,
            itemCount: 3,
            createdBy: "demo-user",
            createdByName: "Demo User",
            createdAt: new Date().toISOString()
          },
          {
            id: "2",
            poNumber: "PO-202501-0002",
            supplierName: "Mountain Coffee Suppliers",
            orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            expectedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: "sent",
            subtotal: 45000,
            taxAmount: 5850,
            totalAmount: 50850,
            itemCount: 2,
            createdBy: "demo-user",
            createdByName: "Demo User",
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "3",
            poNumber: "PO-202501-0003",
            supplierName: "Organic Vegetables Ltd",
            orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            expectedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: "received",
            subtotal: 12000,
            taxAmount: 1560,
            totalAmount: 13560,
            itemCount: 5,
            createdBy: "demo-user",
            createdByName: "Demo User",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        return res.json({
          success: true,
          data: mockOrders,
          message: 'Demo data - authentication not configured'
        });
      }

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
        const mockHistory = [
          {
            id: "1",
            poNumber: "PO-202501-0001",
            orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            totalAmount: 28250,
            status: "received",
            supplierName: "Fresh Dairy Co.",
            itemName: "Fresh Milk",
            materialName: "Milk",
            quantityOrdered: 50,
            quantityReceived: 50,
            unitPrice: 50,
            totalPrice: 2500,
            unit: "liter"
          },
          {
            id: "2",
            poNumber: "PO-202501-0002",
            orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            totalAmount: 50850,
            status: "received",
            supplierName: "Mountain Coffee Suppliers",
            itemName: "Premium Coffee Beans",
            materialName: "Coffee Beans",
            quantityOrdered: 25,
            quantityReceived: 25,
            unitPrice: 1800,
            totalPrice: 45000,
            unit: "kg"
          },
          {
            id: "3",
            poNumber: "PO-202501-0003",
            orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            totalAmount: 13560,
            status: "received",
            supplierName: "Organic Vegetables Ltd",
            itemName: "Organic Tomatoes",
            materialName: "Tomatoes",
            quantityOrdered: 20,
            quantityReceived: 18,
            unitPrice: 150,
            totalPrice: 3000,
            unit: "kg"
          }
        ];
        
        return res.json({
          success: true,
          data: mockHistory,
          message: 'Demo data - authentication not configured'
        });
      }

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
        const mockCostData = [
          {
            id: "1",
            materialName: "Milk",
            unit: "liter",
            trackingDate: new Date().toISOString().split('T')[0],
            averageCost: 50.00,
            lastPurchaseCost: 52.00
          },
          {
            id: "2",
            materialName: "Coffee Beans",
            unit: "kg",
            trackingDate: new Date().toISOString().split('T')[0],
            averageCost: 1800.00,
            lastPurchaseCost: 1750.00
          },
          {
            id: "3",
            materialName: "Sugar",
            unit: "kg",
            trackingDate: new Date().toISOString().split('T')[0],
            averageCost: 80.00,
            lastPurchaseCost: 85.00
          }
        ];
        
        return res.json({
          success: true,
          data: mockCostData,
          message: 'Demo data - authentication not configured'
        });
      }

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