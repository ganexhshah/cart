const db = require('../config/database');
const { generateOrderNumber, generateKOTNumber, calculateTax, paginate } = require('../utils/helpers');

class OrderService {
  async createOrder(orderData) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const orderNumber = generateOrderNumber();
      const { restaurantId, customerId, tableId, items, orderType, specialInstructions, customerName, customerPhone } = orderData;
      
      // Get menu item prices
      const menuItemIds = items.map(item => item.menuItemId);
      const menuItems = await client.query(
        'SELECT id, name, price FROM menu_items WHERE id = ANY($1)',
        [menuItemIds]
      );
      
      const menuItemMap = {};
      menuItems.rows.forEach(item => {
        menuItemMap[item.id] = item;
      });
      
      // Calculate totals
      let subtotal = 0;
      const orderItems = items.map(item => {
        const menuItem = menuItemMap[item.menuItemId];
        if (!menuItem) {
          throw new Error(`Menu item ${item.menuItemId} not found`);
        }
        const itemTotal = menuItem.price * item.quantity;
        subtotal += itemTotal;
        return {
          menuItemId: item.menuItemId,
          name: menuItem.name,
          price: menuItem.price,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions
        };
      });
      
      const tax = calculateTax(subtotal);
      const total = subtotal + tax;
      
      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (
          order_number, restaurant_id, customer_id, table_id,
          order_type, subtotal, tax, total, status, special_instructions,
          customer_name, customer_phone
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [orderNumber, restaurantId, customerId, tableId, orderType, subtotal, tax, total, 'pending', specialInstructions, customerName, customerPhone]
      );
      
      const order = orderResult.rows[0];
      
      // Create order items
      for (const item of orderItems) {
        await client.query(
          `INSERT INTO order_items (
            order_id, menu_item_id, item_name, item_price, quantity, special_instructions
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [order.id, item.menuItemId, item.name, item.price, item.quantity, item.specialInstructions]
        );
      }
      
      // Create KOT
      const kotNumber = generateKOTNumber(orderNumber);
      await client.query(
        `INSERT INTO kot (kot_number, order_id, restaurant_id, table_id, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [kotNumber, order.id, restaurantId, tableId, 'pending']
      );
      
      // Update table status if dine-in
      if (tableId && orderType === 'dine-in') {
        await client.query(
          `UPDATE restaurant_tables SET status = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2`,
          ['occupied', tableId]
        );
      }
      
      await client.query('COMMIT');
      
      // Fetch complete order with items
      const completeOrder = await this.getOrderById(order.id);
      return completeOrder;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  async getOrders(filters) {
    const { restaurantId, customerId, status, orderType, page = 1, limit = 20 } = filters;
    const { limit: queryLimit, offset } = paginate(page, limit);
    
    let query = `
      SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'name', oi.item_name,
            'price', oi.item_price,
            'quantity', oi.quantity,
            'status', oi.status,
            'specialInstructions', oi.special_instructions
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (restaurantId) {
      query += ` AND o.restaurant_id = $${paramCount}`;
      params.push(restaurantId);
      paramCount++;
    }
    
    if (customerId) {
      query += ` AND o.customer_id = $${paramCount}`;
      params.push(customerId);
      paramCount++;
    }
    
    if (status) {
      query += ` AND o.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    if (orderType) {
      query += ` AND o.order_type = $${paramCount}`;
      params.push(orderType);
      paramCount++;
    }
    
    query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(queryLimit, offset);
    
    const result = await db.query(query, params);
    return result.rows;
  }
  
  async getOrderById(orderId) {
    const result = await db.query(
      `SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'menuItemId', oi.menu_item_id,
            'name', oi.item_name,
            'price', oi.item_price,
            'quantity', oi.quantity,
            'status', oi.status,
            'specialInstructions', oi.special_instructions
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id`,
      [orderId]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    
    return result.rows[0];
  }
  
  async updateOrderStatus(orderId, status) {
    const result = await db.query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [status, orderId]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    
    // If order is completed, update table status
    if (status === 'completed') {
      await db.query(
        `UPDATE restaurant_tables SET status = 'available', updated_at = CURRENT_TIMESTAMP
         WHERE id = (SELECT table_id FROM orders WHERE id = $1)`,
        [orderId]
      );
    }
    
    return result.rows[0];
  }
  
  async cancelOrder(orderId) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update order status
      await client.query(
        `UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [orderId]
      );
      
      // Update KOT status
      await client.query(
        `UPDATE kot SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
         WHERE order_id = $1`,
        [orderId]
      );
      
      // Update table status
      await client.query(
        `UPDATE restaurant_tables SET status = 'available', updated_at = CURRENT_TIMESTAMP
         WHERE id = (SELECT table_id FROM orders WHERE id = $1)`,
        [orderId]
      );
      
      await client.query('COMMIT');
      
      return { message: 'Order cancelled successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new OrderService();
