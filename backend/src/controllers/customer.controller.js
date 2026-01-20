const customerService = require('../services/customer.service');

class CustomerController {
  // Get all customers for a restaurant
  async getCustomers(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { status, search, sortBy, sortOrder } = req.query;
      
      const customers = await customerService.getCustomers(restaurantId, {
        status,
        search,
        sortBy,
        sortOrder
      });
      
      res.json({
        success: true,
        data: customers
      });
    } catch (error) {
      next(error);
    }
  }

  // Get customer by ID
  async getCustomerById(req, res, next) {
    try {
      const { customerId } = req.params;
      
      const customer = await customerService.getCustomerById(customerId);
      
      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  // Add new customer
  async addCustomer(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const customerData = { ...req.body, restaurantId };
      
      const customer = await customerService.addCustomer(customerData);
      
      res.status(201).json({
        success: true,
        data: customer,
        message: 'Customer added successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Update customer
  async updateCustomer(req, res, next) {
    try {
      const { customerId } = req.params;
      
      const customer = await customerService.updateCustomer(customerId, req.body);
      
      res.json({
        success: true,
        data: customer,
        message: 'Customer updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete customer
  async deleteCustomer(req, res, next) {
    try {
      const { customerId } = req.params;
      
      await customerService.deleteCustomer(customerId);
      
      res.json({
        success: true,
        message: 'Customer removed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get customer orders
  async getCustomerOrders(req, res, next) {
    try {
      const { customerId } = req.params;
      const { limit, offset, status } = req.query;
      
      const orders = await customerService.getCustomerOrders(customerId, {
        limit: parseInt(limit) || 10,
        offset: parseInt(offset) || 0,
        status
      });
      
      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  // Get customer statistics
  async getCustomerStats(req, res, next) {
    try {
      const { customerId } = req.params;
      
      const stats = await customerService.getCustomerStats(customerId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Update customer status (active, vip, inactive)
  async updateCustomerStatus(req, res, next) {
    try {
      const { customerId } = req.params;
      const { status } = req.body;
      
      const customer = await customerService.updateCustomerStatus(customerId, status);
      
      res.json({
        success: true,
        data: customer,
        message: `Customer status updated to ${status}`
      });
    } catch (error) {
      next(error);
    }
  }

  // Add loyalty points
  async addLoyaltyPoints(req, res, next) {
    try {
      const { customerId } = req.params;
      const { points, reason } = req.body;
      
      const customer = await customerService.addLoyaltyPoints(customerId, points, reason);
      
      res.json({
        success: true,
        data: customer,
        message: `${points} loyalty points added`
      });
    } catch (error) {
      next(error);
    }
  }

  // Get restaurant customer statistics
  async getRestaurantCustomerStats(req, res, next) {
    try {
      const { restaurantId } = req.params;
      
      const stats = await customerService.getRestaurantCustomerStats(restaurantId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Send email to customer
  async sendEmail(req, res, next) {
    try {
      const { customerId } = req.params;
      const { subject, message, type } = req.body;
      
      await customerService.sendEmail(customerId, { subject, message, type });
      
      res.json({
        success: true,
        message: 'Email sent successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();