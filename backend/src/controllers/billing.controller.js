const billingService = require('../services/billing.service');
const logger = require('../utils/logger');

class BillingController {
  // Generate bill from order
  async generateBill(req, res) {
    try {
      const result = await billingService.generateBill(req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Error in generateBill controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate bill',
        error: error.message
      });
    }
  }

  // Get all bills with filters
  async getBills(req, res) {
    try {
      // Handle case where user might not be authenticated or doesn't have restaurantId
      const restaurantId = req.user?.restaurantId;
      
      if (!restaurantId) {
        // Return mock data if no restaurant ID (for demo purposes)
        const mockData = [
          {
            id: '1',
            bill_number: 'BILL-20250121-0001',
            customer_name: 'John Doe',
            customer_phone: '+977-9841234567',
            table_number: 'T-05',
            subtotal: 1250.00,
            discount_amount: 125.00,
            tax_amount: 146.25,
            total_amount: 1271.25,
            payment_status: 'pending',
            payment_method: 'cash',
            created_at: new Date().toISOString(),
            items: [
              { id: '1', item_name: 'Chicken Momo', quantity: 2, unit_price: 250, total_price: 500 },
              { id: '2', item_name: 'Buff Chowmein', quantity: 1, unit_price: 350, total_price: 350 },
              { id: '3', item_name: 'Coke', quantity: 2, unit_price: 200, total_price: 400 }
            ]
          },
          {
            id: '2',
            bill_number: 'BILL-20250121-0002',
            customer_name: 'Jane Smith',
            customer_phone: '+977-9851234567',
            table_number: 'T-12',
            subtotal: 850.00,
            discount_amount: 0,
            tax_amount: 110.50,
            total_amount: 960.50,
            payment_status: 'paid',
            payment_method: 'card',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            items: [
              { id: '4', item_name: 'Dal Bhat', quantity: 1, unit_price: 450, total_price: 450 },
              { id: '5', item_name: 'Chicken Curry', quantity: 1, unit_price: 400, total_price: 400 }
            ]
          }
        ];
        
        return res.json({
          success: true,
          data: mockData,
          message: 'Demo data - authentication not configured'
        });
      }

      const filters = {
        restaurantId,
        customerId: req.query.customerId,
        paymentStatus: req.query.paymentStatus,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await billingService.getBills(filters);
      res.json(result);
    } catch (error) {
      logger.error('Error in getBills controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bills',
        error: error.message
      });
    }
  }

  // Get bill by ID
  async getBillById(req, res) {
    try {
      const { id } = req.params;
      const result = await billingService.getBillById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in getBillById controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bill',
        error: error.message
      });
    }
  }

  // Process payment
  async processPayment(req, res) {
    try {
      const { id } = req.params;
      const paymentData = { ...req.body, billId: id };

      const result = await billingService.processPayment(paymentData);
      res.json(result);
    } catch (error) {
      logger.error('Error in processPayment controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process payment',
        error: error.message
      });
    }
  }

  // Split bill
  async splitBill(req, res) {
    try {
      const { id } = req.params;
      const { splitCount } = req.body;

      if (!splitCount || splitCount < 2) {
        return res.status(400).json({
          success: false,
          message: 'Split count must be at least 2'
        });
      }

      const result = await billingService.splitBill(id, splitCount);
      res.json(result);
    } catch (error) {
      logger.error('Error in splitBill controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to split bill',
        error: error.message
      });
    }
  }

  // Mark bill as printed
  async markAsPrinted(req, res) {
    try {
      const { id } = req.params;
      const result = await billingService.markAsPrinted(id);
      res.json(result);
    } catch (error) {
      logger.error('Error in markAsPrinted controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark bill as printed',
        error: error.message
      });
    }
  }

  // Mark bill as sent via WhatsApp
  async markAsSentWhatsApp(req, res) {
    try {
      const { id } = req.params;
      const result = await billingService.markAsSentWhatsApp(id);
      res.json(result);
    } catch (error) {
      logger.error('Error in markAsSentWhatsApp controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark bill as sent via WhatsApp',
        error: error.message
      });
    }
  }

  // Get tax settings
  async getTaxSettings(req, res) {
    try {
      const restaurantId = req.user?.restaurantId;
      
      if (!restaurantId) {
        // Return default settings if no restaurant ID
        return res.json({
          success: true,
          data: {
            taxRate: 13,
            serviceChargeRate: 10,
            defaultDiscountType: 'percentage',
            maxDiscountPercentage: 20,
            maxDiscountAmount: 1000
          },
          message: 'Demo data - authentication not configured'
        });
      }

      const result = await billingService.getTaxSettings(restaurantId);
      res.json(result);
    } catch (error) {
      logger.error('Error in getTaxSettings controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tax settings',
        error: error.message
      });
    }
  }

  // Update tax settings
  async updateTaxSettings(req, res) {
    try {
      const { restaurantId } = req.user;
      const result = await billingService.updateTaxSettings(restaurantId, req.body);
      res.json(result);
    } catch (error) {
      logger.error('Error in updateTaxSettings controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update tax settings',
        error: error.message
      });
    }
  }

  // Get payment summary
  async getPaymentSummary(req, res) {
    try {
      const restaurantId = req.user?.restaurantId;
      
      if (!restaurantId) {
        // Return mock data if no restaurant ID
        return res.json({
          success: true,
          data: {
            byPaymentMethod: [
              { payment_method: 'cash', transaction_count: 5, total_amount: 2500.00, average_amount: 500.00 },
              { payment_method: 'card', transaction_count: 3, total_amount: 1800.00, average_amount: 600.00 }
            ],
            summary: {
              total_transactions: 8,
              total_revenue: 4300.00,
              average_transaction: 537.50
            }
          },
          message: 'Demo data - authentication not configured'
        });
      }

      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        paymentMethod: req.query.paymentMethod
      };
      const result = await billingService.getPaymentSummary(restaurantId, filters);
      res.json(result);
    } catch (error) {
      logger.error('Error getting payment summary:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get payment summary',
        error: error.message 
      });
    }
  }

  // Get daily sales report
  async getDailySalesReport(req, res) {
    try {
      const restaurantId = req.user?.restaurantId;
      
      if (!restaurantId) {
        // Return mock data if no restaurant ID
        const date = req.query.date || new Date().toISOString().split('T')[0];
        return res.json({
          success: true,
          data: {
            summary: {
              date,
              total_bills: 0,
              paid_bills: 0,
              pending_bills: 0,
              total_sales: 0,
              paid_amount: 0,
              total_tax: 0,
              total_discount: 0,
              average_bill_amount: 0
            },
            hourlyBreakdown: [],
            paymentMethodBreakdown: []
          },
          message: 'Demo data - authentication not configured'
        });
      }

      const date = req.query.date || new Date().toISOString().split('T')[0];
      const result = await billingService.getDailySalesReport(restaurantId, date);
      res.json(result);
    } catch (error) {
      logger.error('Error getting daily sales report:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get daily sales report',
        error: error.message 
      });
    }
  }
}

module.exports = new BillingController();