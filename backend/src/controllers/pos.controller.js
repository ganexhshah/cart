const posService = require('../services/pos.service');

class POSController {
  // Get POS terminals
  async getTerminals(req, res, next) {
    try {
      const restaurantId = req.query.restaurantId || req.user.primaryRestaurantId;
      
      const terminals = await posService.getTerminals(restaurantId);
      
      res.json({
        success: true,
        data: terminals
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Create POS terminal
  async createTerminal(req, res, next) {
    try {
      const terminalData = {
        ...req.body,
        restaurantId: req.body.restaurantId || req.user.primaryRestaurantId
      };
      
      const terminal = await posService.createTerminal(terminalData);
      
      res.status(201).json({
        success: true,
        data: terminal,
        message: 'POS terminal created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Start POS session
  async startSession(req, res, next) {
    try {
      const sessionData = {
        ...req.body,
        userId: req.user.userId
      };
      
      const session = await posService.startSession(sessionData);
      
      res.status(201).json({
        success: true,
        data: session,
        message: 'POS session started successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  // End POS session
  async endSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const closingData = req.body;
      
      const session = await posService.endSession(sessionId, closingData);
      
      res.json({
        success: true,
        data: session,
        message: 'POS session ended successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Process transaction
  async processTransaction(req, res, next) {
    try {
      const transactionData = {
        ...req.body,
        restaurantId: req.body.restaurantId || req.user.primaryRestaurantId,
        processedBy: req.user.userId
      };
      
      const transaction = await posService.processTransaction(transactionData);
      
      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Transaction processed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get transactions
  async getTransactions(req, res, next) {
    try {
      const filters = {
        restaurantId: req.query.restaurantId || req.user.primaryRestaurantId,
        sessionId: req.query.sessionId,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        paymentMethod: req.query.paymentMethod,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };
      
      const transactions = await posService.getTransactions(filters);
      
      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get POS statistics
  async getPOSStats(req, res, next) {
    try {
      const restaurantId = req.query.restaurantId || req.user.primaryRestaurantId;
      const dateRange = req.query.dateRange || 'today';
      
      const stats = await posService.getPOSStats(restaurantId, dateRange);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get payment methods
  async getPaymentMethods(req, res, next) {
    try {
      const restaurantId = req.query.restaurantId || req.user.primaryRestaurantId;
      
      const methods = await posService.getPaymentMethods(restaurantId);
      
      res.json({
        success: true,
        data: methods
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Create payment method
  async createPaymentMethod(req, res, next) {
    try {
      const methodData = {
        ...req.body,
        restaurantId: req.body.restaurantId || req.user.primaryRestaurantId
      };
      
      const method = await posService.createPaymentMethod(methodData);
      
      res.status(201).json({
        success: true,
        data: method,
        message: 'Payment method created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get discounts
  async getDiscounts(req, res, next) {
    try {
      const restaurantId = req.query.restaurantId || req.user.primaryRestaurantId;
      
      const discounts = await posService.getDiscounts(restaurantId);
      
      res.json({
        success: true,
        data: discounts
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Apply discount
  async applyDiscount(req, res, next) {
    try {
      const { discountId } = req.params;
      const { orderAmount } = req.body;
      
      const result = await posService.applyDiscount(discountId, orderAmount);
      
      res.json({
        success: true,
        data: result,
        message: 'Discount applied successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Generate daily report
  async generateDailyReport(req, res, next) {
    try {
      const restaurantId = req.query.restaurantId || req.user.primaryRestaurantId;
      const reportDate = req.query.date || new Date().toISOString().slice(0, 10);
      
      const report = await posService.generateDailyReport(restaurantId, reportDate);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new POSController();