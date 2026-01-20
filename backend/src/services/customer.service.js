const db = require('../config/database');
const bcrypt = require('bcryptjs');
const emailService = require('./email.service');

class CustomerService {
  // Get all customers for a restaurant
  async getCustomers(restaurantId, filters = {}) {
    let query = `
      SELECT 
        c.id,
        c.total_orders,
        c.total_spent,
        c.loyalty_points,
        c.dietary_preferences,
        c.allergies,
        c.created_at as join_date,
        u.id as user_id,
        u.full_name,
        u.email,
        u.phone,
        u.avatar_url,
        -- Calculate customer status based on activity
        CASE 
          WHEN c.total_spent > 5000 THEN 'vip'
          WHEN c.total_orders > 0 AND 
               EXISTS(SELECT 1 FROM orders o WHERE o.customer_id = u.id AND o.created_at > CURRENT_DATE - INTERVAL '30 days') 
               THEN 'active'
          ELSE 'inactive'
        END as status,
        -- Last order date
        (SELECT MAX(created_at) FROM orders WHERE customer_id = u.id) as last_order_date,
        -- Average rating given by customer
        (SELECT AVG(rating) FROM reviews WHERE customer_id = u.id) as avg_rating
      FROM customers c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.restaurant_id = $1
    `;
    
    const params = [restaurantId];
    let paramCount = 2;
    
    // Apply search filter
    if (filters.search) {
      query += ` AND (u.full_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR u.phone ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }
    
    // Apply status filter (calculated in subquery)
    if (filters.status) {
      query = `
        SELECT * FROM (${query}) filtered_customers
        WHERE status = $${paramCount}
      `;
      params.push(filters.status);
      paramCount++;
    }
    
    // Apply sorting
    const sortBy = filters.sortBy || 'join_date';
    const sortOrder = filters.sortOrder || 'DESC';
    
    if (filters.status) {
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
    } else {
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
    }
    
    const result = await db.query(query, params);
    return result.rows;
  }

  // Get customer by ID
  async getCustomerById(customerId) {
    const result = await db.query(`
      SELECT 
        c.*,
        u.full_name,
        u.email,
        u.phone,
        u.avatar_url,
        r.name as restaurant_name,
        -- Recent orders count
        (SELECT COUNT(*) FROM orders WHERE customer_id = u.id AND created_at > CURRENT_DATE - INTERVAL '30 days') as recent_orders
      FROM customers c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN restaurants r ON c.restaurant_id = r.id
      WHERE c.id = $1
    `, [customerId]);
    
    if (result.rows.length === 0) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Get favorite items separately to avoid nested aggregates
    const favoriteItemsResult = await db.query(`
      SELECT 
        oi.item_name,
        COUNT(*) as order_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.customer_id = (SELECT user_id FROM customers WHERE id = $1)
      GROUP BY oi.item_name
      ORDER BY COUNT(*) DESC
      LIMIT 5
    `, [customerId]);
    
    const customer = result.rows[0];
    customer.favorite_items = favoriteItemsResult.rows;
    
    return customer;
  }

  // Add new customer
  async addCustomer(customerData) {
    const {
      restaurantId,
      name,
      email,
      phone,
      location,
      dietaryPreferences = [],
      allergies = []
    } = customerData;

    // Start transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Check if user already exists
      let userResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      
      let userId;
      
      if (userResult.rows.length === 0) {
        // Create new user with default password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('customer123', salt);
        
        userResult = await client.query(`
          INSERT INTO users (email, password_hash, full_name, phone, role)
          VALUES ($1, $2, $3, $4, 'customer')
          RETURNING id
        `, [email, passwordHash, name, phone]);
        
        userId = userResult.rows[0].id;
      } else {
        userId = userResult.rows[0].id;
      }
      
      // Check if customer record already exists for this restaurant
      const existingCustomer = await client.query(
        'SELECT id FROM customers WHERE user_id = $1 AND restaurant_id = $2',
        [userId, restaurantId]
      );
      
      if (existingCustomer.rows.length > 0) {
        throw new Error('Customer already exists for this restaurant');
      }
      
      // Create customer record
      const customerResult = await client.query(`
        INSERT INTO customers (
          user_id, restaurant_id, total_orders, total_spent, 
          loyalty_points, dietary_preferences, allergies
        )
        VALUES ($1, $2, 0, 0.00, 0, $3, $4)
        RETURNING *
      `, [userId, restaurantId, dietaryPreferences, allergies]);
      
      await client.query('COMMIT');
      
      // Get complete customer data
      const completeCustomer = await this.getCustomerById(customerResult.rows[0].id);
      return completeCustomer;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update customer
  async updateCustomer(customerId, updateData) {
    const allowedFields = ['dietary_preferences', 'allergies', 'preferred_table_id'];
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });
    
    if (fields.length === 0 && !updateData.name && !updateData.email && !updateData.phone) {
      throw new Error('No valid fields to update');
    }
    
    // Update customer table if there are customer-specific fields
    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(customerId);
      
      const query = `
        UPDATE customers 
        SET ${fields.join(', ')} 
        WHERE id = $${paramCount}
        RETURNING *
      `;
      
      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        const error = new Error('Customer not found');
        error.statusCode = 404;
        throw error;
      }
    }
    
    // Update user data if provided
    if (updateData.name || updateData.email || updateData.phone) {
      const userFields = [];
      const userValues = [];
      let userParamCount = 1;
      
      if (updateData.name) {
        userFields.push(`full_name = $${userParamCount}`);
        userValues.push(updateData.name);
        userParamCount++;
      }
      
      if (updateData.email) {
        userFields.push(`email = $${userParamCount}`);
        userValues.push(updateData.email);
        userParamCount++;
      }
      
      if (updateData.phone) {
        userFields.push(`phone = $${userParamCount}`);
        userValues.push(updateData.phone);
        userParamCount++;
      }
      
      if (userFields.length > 0) {
        userFields.push('updated_at = CURRENT_TIMESTAMP');
        
        // Get user_id from customer
        const customerResult = await db.query('SELECT user_id FROM customers WHERE id = $1', [customerId]);
        if (customerResult.rows.length === 0) {
          throw new Error('Customer not found');
        }
        
        userValues.push(customerResult.rows[0].user_id);
        
        await db.query(`
          UPDATE users 
          SET ${userFields.join(', ')} 
          WHERE id = $${userParamCount}
        `, userValues);
      }
    }
    
    return await this.getCustomerById(customerId);
  }

  // Delete customer
  async deleteCustomer(customerId) {
    const result = await db.query(
      'DELETE FROM customers WHERE id = $1 RETURNING *',
      [customerId]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }
    
    return result.rows[0];
  }

  // Get customer orders
  async getCustomerOrders(customerId, options = {}) {
    const { limit = 10, offset = 0, status } = options;
    
    // Get user_id from customer
    const customerResult = await db.query('SELECT user_id FROM customers WHERE id = $1', [customerId]);
    if (customerResult.rows.length === 0) {
      throw new Error('Customer not found');
    }
    
    const userId = customerResult.rows[0].user_id;
    
    let query = `
      SELECT 
        o.*,
        r.name as restaurant_name,
        rt.table_number,
        -- Order items
        (
          SELECT json_agg(
            json_build_object(
              'item_name', oi.item_name,
              'quantity', oi.quantity,
              'item_price', oi.item_price,
              'special_instructions', oi.special_instructions
            )
          )
          FROM order_items oi
          WHERE oi.order_id = o.id
        ) as items
      FROM orders o
      LEFT JOIN restaurants r ON o.restaurant_id = r.id
      LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
      WHERE o.customer_id = $1
    `;
    
    const params = [userId];
    let paramCount = 2;
    
    if (status) {
      query += ` AND o.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    query += ` ORDER BY o.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    return result.rows;
  }

  // Get customer statistics
  async getCustomerStats(customerId) {
    // Get user_id from customer
    const customerResult = await db.query('SELECT user_id FROM customers WHERE id = $1', [customerId]);
    if (customerResult.rows.length === 0) {
      throw new Error('Customer not found');
    }
    
    const userId = customerResult.rows[0].user_id;
    
    const result = await db.query(`
      SELECT 
        COUNT(o.id) as total_orders,
        SUM(o.total) as total_spent,
        AVG(o.total) as avg_order_value,
        COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN o.created_at > CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as orders_last_30_days,
        MAX(o.created_at) as last_order_date,
        MIN(o.created_at) as first_order_date,
        -- Favorite order type
        (
          SELECT order_type 
          FROM orders 
          WHERE customer_id = $1 
          GROUP BY order_type 
          ORDER BY COUNT(*) DESC 
          LIMIT 1
        ) as favorite_order_type,
        -- Average rating given
        (SELECT AVG(rating) FROM reviews WHERE customer_id = $1) as avg_rating_given
      FROM orders o
      WHERE o.customer_id = $1
    `, [userId]);
    
    return result.rows[0];
  }

  // Update customer status
  async updateCustomerStatus(customerId, status) {
    // This is a virtual status based on business logic, not stored in DB
    // We'll update loyalty points or other fields based on status
    let updateData = {};
    
    switch (status) {
      case 'vip':
        updateData.loyalty_points = 1000; // Bonus points for VIP
        break;
      case 'active':
        // No specific update needed
        break;
      case 'inactive':
        // Could add a flag or note
        break;
    }
    
    if (Object.keys(updateData).length > 0) {
      await db.query(`
        UPDATE customers 
        SET ${Object.keys(updateData).map((key, i) => `${key} = $${i + 1}`).join(', ')}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $${Object.keys(updateData).length + 1}
      `, [...Object.values(updateData), customerId]);
    }
    
    return await this.getCustomerById(customerId);
  }

  // Add loyalty points
  async addLoyaltyPoints(customerId, points, reason) {
    const result = await db.query(`
      UPDATE customers 
      SET loyalty_points = loyalty_points + $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [points, customerId]);
    
    if (result.rows.length === 0) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Log the points transaction (you might want to create a separate table for this)
    // For now, we'll just return the updated customer
    
    return await this.getCustomerById(customerId);
  }

  // Get restaurant customer statistics
  async getRestaurantCustomerStats(restaurantId) {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN c.total_spent > 5000 THEN 1 END) as vip_customers,
        COUNT(CASE WHEN 
          c.total_orders > 0 AND 
          EXISTS(SELECT 1 FROM orders o WHERE o.customer_id = c.user_id AND o.created_at > CURRENT_DATE - INTERVAL '30 days')
          THEN 1 END) as active_customers,
        AVG(c.total_spent) as avg_customer_value,
        SUM(c.total_spent) as total_revenue,
        AVG(c.total_orders) as avg_orders_per_customer,
        COUNT(CASE WHEN c.created_at > CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_customers_this_month
      FROM customers c
      WHERE c.restaurant_id = $1
    `, [restaurantId]);
    
    return result.rows[0];
  }

  // Send email to customer
  async sendEmail(customerId, emailData) {
    const customer = await this.getCustomerById(customerId);
    
    if (!customer.email) {
      throw new Error('Customer email not found');
    }
    
    const { subject, message, type = 'marketing' } = emailData;
    
    // Use the email service to send the email
    await emailService.sendEmail({
      to: customer.email,
      subject,
      html: message,
      type
    });
    
    // Log the email (you might want to create a separate table for email logs)
    
    return { sent: true, email: customer.email };
  }
}

module.exports = new CustomerService();