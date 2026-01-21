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
      const { restaurantId } = req.user;
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
      const { restaurantId } = req.user;
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
      const { restaurantId } = req.user;
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        paymentMethod: req.query.paymentMethod
      };
      const result = await billingService.getPaymentSummary(restaurantId, filters);
      res.json(result);
    } catch (error) {
      logger.error('Error getting payment summary:', error);
      res.status(500).json({ success: false, message: 'Failed to get payment summary' });
    }
  }

  // Get daily sales report
  async getDailySalesReport(req, res) {
    try {
      const { restaurantId } = req.user;
      const date = req.query.date || new Date().toISOString().split('T')[0];
      const result = await billingService.getDailySalesReport(restaurantId, date);
      res.json(result);
    } catch (error) {
      logger.error('Error getting daily sales report:', error);
      res.status(500).json({ success: false, message: 'Failed to get daily sales report' });
    }
  }
}

module.exports = new BillingController();