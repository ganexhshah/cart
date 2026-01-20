const orderService = require('../services/order.service');
const emailService = require('../services/email.service');
const db = require('../config/database');

class OrderController {
  async createOrder(req, res, next) {
    try {
      const orderData = {
        ...req.body,
        customerId: req.user?.userId
      };
      
      const order = await orderService.createOrder(orderData);
      
      // Emit socket event for real-time updates
      const io = req.app.get('io');
      if (io) {
        io.to(`restaurant:${order.restaurant_id}`).emit('order:new', order);
        io.to(`kitchen:${order.restaurant_id}`).emit('kot:new', order);
      }
      
      // Send order confirmation email (don't wait)
      if (req.user) {
        const userResult = await db.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
        if (userResult.rows.length > 0) {
          emailService.sendOrderConfirmation(order, userResult.rows[0]).catch(err =>
            console.error('Failed to send order confirmation:', err)
          );
        }
      }
      
      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getOrders(req, res, next) {
    try {
      const filters = {
        restaurantId: req.query.restaurantId,
        customerId: req.user.role === 'customer' ? req.user.userId : req.query.customerId,
        status: req.query.status,
        orderType: req.query.orderType,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };
      
      const orders = await orderService.getOrders(filters);
      
      res.json({
        success: true,
        data: orders,
        pagination: {
          page: filters.page,
          limit: filters.limit
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      
      // Check authorization
      if (req.user.role === 'customer' && order.customer_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateOrderStatus(req, res, next) {
    try {
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(req.params.id, status);
      
      // Emit socket event
      const io = req.app.get('io');
      if (io) {
        io.to(`customer:${order.customer_id}`).emit('order:update', order);
        if (order.waiter_id) {
          io.to(`waiter:${order.waiter_id}`).emit('order:update', order);
        }
      }
      
      // Send status update email (don't wait)
      if (order.customer_id) {
        const userResult = await db.query('SELECT * FROM users WHERE id = $1', [order.customer_id]);
        if (userResult.rows.length > 0) {
          emailService.sendOrderStatusUpdate(order, userResult.rows[0], status).catch(err =>
            console.error('Failed to send status update email:', err)
          );
        }
      }
      
      res.json({
        success: true,
        data: order,
        message: 'Order status updated'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async cancelOrder(req, res, next) {
    try {
      const result = await orderService.cancelOrder(req.params.id);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
