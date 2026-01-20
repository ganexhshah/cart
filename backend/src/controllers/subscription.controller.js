const subscriptionService = require('../services/subscription.service');
const logger = require('../utils/logger');

class SubscriptionController {
  // Get all subscription plans
  async getPlans(req, res, next) {
    try {
      const plans = await subscriptionService.getPlans();
      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      logger.error('Error in getPlans:', error);
      next(error);
    }
  }

  // Get user's current subscription
  async getCurrentSubscription(req, res, next) {
    try {
      const subscription = await subscriptionService.getUserSubscription(req.user.id);
      res.json({
        success: true,
        data: subscription
      });
    } catch (error) {
      logger.error('Error in getCurrentSubscription:', error);
      next(error);
    }
  }

  // Create or update subscription
  async updateSubscription(req, res, next) {
    try {
      const { planId } = req.body;

      if (!planId) {
        return res.status(400).json({
          success: false,
          message: 'Plan ID is required'
        });
      }

      const subscription = await subscriptionService.createOrUpdateSubscription(
        req.user.id,
        planId
      );

      res.json({
        success: true,
        message: 'Subscription updated successfully',
        data: subscription
      });
    } catch (error) {
      logger.error('Error in updateSubscription:', error);
      if (error.message === 'Invalid subscription plan') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // Cancel subscription
  async cancelSubscription(req, res, next) {
    try {
      const { immediate } = req.body;
      
      const subscription = await subscriptionService.cancelSubscription(
        req.user.id,
        immediate || false
      );

      res.json({
        success: true,
        message: immediate 
          ? 'Subscription cancelled immediately' 
          : 'Subscription will be cancelled at the end of the billing period',
        data: subscription
      });
    } catch (error) {
      logger.error('Error in cancelSubscription:', error);
      next(error);
    }
  }

  // Get billing history
  async getBillingHistory(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const history = await subscriptionService.getBillingHistory(req.user.id, limit);
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Error in getBillingHistory:', error);
      next(error);
    }
  }

  // Get payment methods
  async getPaymentMethods(req, res, next) {
    try {
      const methods = await subscriptionService.getPaymentMethods(req.user.id);
      res.json({
        success: true,
        data: methods
      });
    } catch (error) {
      logger.error('Error in getPaymentMethods:', error);
      next(error);
    }
  }

  // Add payment method
  async addPaymentMethod(req, res, next) {
    try {
      const { type, lastFour, brand, isDefault } = req.body;

      if (!type || !lastFour) {
        return res.status(400).json({
          success: false,
          message: 'Payment method type and last four digits are required'
        });
      }

      const method = await subscriptionService.addPaymentMethod(req.user.id, {
        type,
        lastFour,
        brand,
        isDefault
      });

      res.json({
        success: true,
        message: 'Payment method added successfully',
        data: method
      });
    } catch (error) {
      logger.error('Error in addPaymentMethod:', error);
      next(error);
    }
  }

  // Delete payment method
  async deletePaymentMethod(req, res, next) {
    try {
      const { id } = req.params;
      
      const method = await subscriptionService.deletePaymentMethod(req.user.id, id);
      
      if (!method) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found'
        });
      }

      res.json({
        success: true,
        message: 'Payment method deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deletePaymentMethod:', error);
      next(error);
    }
  }

  // Check subscription limits
  async checkLimit(req, res, next) {
    try {
      const { resourceType } = req.params;
      const result = await subscriptionService.checkSubscriptionLimit(req.user.id, resourceType);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in checkLimit:', error);
      next(error);
    }
  }
}

module.exports = new SubscriptionController();
