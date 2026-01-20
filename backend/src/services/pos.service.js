const db = require('../config/database');

class POSService {
  // Get POS terminals
  async getTerminals(restaurantId) {
    const result = await db.query(
      `SELECT * FROM pos_terminals 
       WHERE restaurant_id = $1 AND is_active = true
       ORDER BY terminal_name`,
      [restaurantId]
    );
    
    return result.rows;
  }
  
  // Create POS terminal
  async createTerminal(terminalData) {
    const { restaurantId, terminalName, terminalCode, location } = terminalData;
    
    const result = await db.query(
      `INSERT INTO pos_terminals (restaurant_id, terminal_name, terminal_code, location)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [restaurantId, terminalName, terminalCode, location]
    );
    
    return result.rows[0];
  }
  
  // Start POS session
  async startSession(sessionData) {
    const { terminalId, userId, openingCash } = sessionData;
    
    // Check if there's an active session
    const activeSession = await db.query(
      `SELECT id FROM pos_sessions 
       WHERE terminal_id = $1 AND status = 'active'`,
      [terminalId]
    );
    
    if (activeSession.rows.length > 0) {
      const error = new Error('Terminal already has an active session');
      error.statusCode = 400;
      throw error;
    }
    
    const result = await db.query(
      `INSERT INTO pos_sessions (terminal_id, user_id, opening_cash)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [terminalId, userId, openingCash]
    );
    
    return result.rows[0];
  }
  
  // End POS session
  async endSession(sessionId, closingData) {
    const { closingCash, notes } = closingData;
    
    // Get session stats
    const statsResult = await db.query(
      `SELECT 
         COUNT(*) as total_transactions,
         COALESCE(SUM(total_amount), 0) as total_sales
       FROM pos_transactions 
       WHERE session_id = $1 AND status = 'completed'`,
      [sessionId]
    );
    
    const stats = statsResult.rows[0];
    
    const result = await db.query(
      `UPDATE pos_sessions 
       SET session_end = CURRENT_TIMESTAMP, 
           closing_cash = $1, 
           total_sales = $2,
           total_transactions = $3,
           status = 'closed',
           notes = $4
       WHERE id = $5
       RETURNING *`,
      [closingCash, stats.total_sales, stats.total_transactions, notes, sessionId]
    );
    
    return result.rows[0];
  }
  
  // Process transaction
  async processTransaction(transactionData) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      const {
        restaurantId, sessionId, orderId, paymentMethod, subtotal,
        taxAmount = 0, discountAmount = 0, tipAmount = 0,
        amountPaid, paymentReference, processedBy
      } = transactionData;
      
      const totalAmount = subtotal + taxAmount - discountAmount + tipAmount;
      const changeAmount = amountPaid - totalAmount;
      
      // Generate transaction number
      const transactionNumber = await this.generateTransactionNumber(restaurantId, client);
      
      // Create transaction
      const result = await client.query(
        `INSERT INTO pos_transactions (
          restaurant_id, session_id, order_id, transaction_number,
          payment_method, subtotal, tax_amount, discount_amount, tip_amount,
          total_amount, amount_paid, change_amount, payment_reference, processed_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          restaurantId, sessionId, orderId, transactionNumber,
          paymentMethod, subtotal, taxAmount, discountAmount, tipAmount,
          totalAmount, amountPaid, changeAmount, paymentReference, processedBy
        ]
      );
      
      await client.query('COMMIT');
      
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Get transactions
  async getTransactions(filters) {
    const { restaurantId, sessionId, dateFrom, dateTo, paymentMethod, page = 1, limit = 50 } = filters;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        pt.*,
        ps.terminal_id,
        pos_t.terminal_name,
        u.full_name as processed_by_name
      FROM pos_transactions pt
      LEFT JOIN pos_sessions ps ON pt.session_id = ps.id
      LEFT JOIN pos_terminals pos_t ON ps.terminal_id = pos_t.id
      LEFT JOIN users u ON pt.processed_by = u.id
      WHERE pt.restaurant_id = $1
    `;
    
    const params = [restaurantId];
    let paramCount = 2;
    
    if (sessionId) {
      query += ` AND pt.session_id = $${paramCount}`;
      params.push(sessionId);
      paramCount++;
    }
    
    if (dateFrom) {
      query += ` AND DATE(pt.created_at) >= $${paramCount}`;
      params.push(dateFrom);
      paramCount++;
    }
    
    if (dateTo) {
      query += ` AND DATE(pt.created_at) <= $${paramCount}`;
      params.push(dateTo);
      paramCount++;
    }
    
    if (paymentMethod) {
      query += ` AND pt.payment_method = $${paramCount}`;
      params.push(paymentMethod);
      paramCount++;
    }
    
    query += `
      ORDER BY pt.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    return result.rows;
  }
  
  // Get POS statistics
  async getPOSStats(restaurantId, dateRange = 'today') {
    let dateFilter = '';
    const params = [restaurantId];
    
    switch (dateRange) {
      case 'today':
        dateFilter = "AND DATE(created_at) = CURRENT_DATE";
        break;
      case 'week':
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '30 days'";
        break;
    }
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(total_amount), 0) as total_sales,
        COALESCE(AVG(total_amount), 0) as average_transaction,
        COUNT(DISTINCT session_id) as active_sessions,
        SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END) as cash_sales,
        SUM(CASE WHEN payment_method = 'card' THEN total_amount ELSE 0 END) as card_sales,
        SUM(CASE WHEN payment_method = 'upi' THEN total_amount ELSE 0 END) as upi_sales
      FROM pos_transactions 
      WHERE restaurant_id = $1 AND status = 'completed' ${dateFilter}
    `;
    
    const result = await db.query(statsQuery, params);
    return result.rows[0];
  }
  
  // Get payment methods
  async getPaymentMethods(restaurantId) {
    const result = await db.query(
      `SELECT * FROM pos_payment_methods 
       WHERE restaurant_id = $1 AND is_active = true
       ORDER BY method_name`,
      [restaurantId]
    );
    
    return result.rows;
  }
  
  // Create payment method
  async createPaymentMethod(methodData) {
    const { restaurantId, methodName, methodType, processingFee, minAmount, maxAmount } = methodData;
    
    const result = await db.query(
      `INSERT INTO pos_payment_methods 
       (restaurant_id, method_name, method_type, processing_fee, min_amount, max_amount)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [restaurantId, methodName, methodType, processingFee, minAmount, maxAmount]
    );
    
    return result.rows[0];
  }
  
  // Get discounts
  async getDiscounts(restaurantId) {
    const result = await db.query(
      `SELECT * FROM pos_discounts 
       WHERE restaurant_id = $1 AND is_active = true
       AND (start_date IS NULL OR start_date <= CURRENT_DATE)
       AND (end_date IS NULL OR end_date >= CURRENT_DATE)
       ORDER BY discount_name`,
      [restaurantId]
    );
    
    return result.rows;
  }
  
  // Apply discount
  async applyDiscount(discountId, orderAmount) {
    const result = await db.query(
      `SELECT * FROM pos_discounts 
       WHERE id = $1 AND is_active = true
       AND (usage_limit IS NULL OR usage_count < usage_limit)
       AND min_order_amount <= $2`,
      [discountId, orderAmount]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('Discount not applicable');
      error.statusCode = 400;
      throw error;
    }
    
    const discount = result.rows[0];
    let discountAmount = 0;
    
    if (discount.discount_type === 'percentage') {
      discountAmount = (orderAmount * discount.discount_value) / 100;
      if (discount.max_discount_amount && discountAmount > discount.max_discount_amount) {
        discountAmount = discount.max_discount_amount;
      }
    } else if (discount.discount_type === 'fixed') {
      discountAmount = discount.discount_value;
    }
    
    // Update usage count
    await db.query(
      `UPDATE pos_discounts SET usage_count = usage_count + 1 WHERE id = $1`,
      [discountId]
    );
    
    return { discount, discountAmount };
  }
  
  // Generate unique transaction number
  async generateTransactionNumber(restaurantId, client = db) {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `TXN${today}`;
    
    const result = await client.query(
      `SELECT transaction_number FROM pos_transactions 
       WHERE restaurant_id = $1 AND transaction_number LIKE $2 
       ORDER BY transaction_number DESC LIMIT 1`,
      [restaurantId, `${prefix}%`]
    );
    
    let sequence = 1;
    if (result.rows.length > 0) {
      const lastNumber = result.rows[0].transaction_number;
      sequence = parseInt(lastNumber.slice(-4)) + 1;
    }
    
    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }
  
  // Generate daily report
  async generateDailyReport(restaurantId, reportDate) {
    const reportQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(total_amount), 0) as total_sales,
        COALESCE(AVG(total_amount), 0) as average_order_value,
        COUNT(DISTINCT order_id) as total_orders,
        json_object_agg(
          payment_method, 
          json_build_object('count', payment_count, 'amount', payment_total)
        ) as payment_methods
      FROM (
        SELECT 
          payment_method,
          COUNT(*) as payment_count,
          SUM(total_amount) as payment_total,
          total_amount
        FROM pos_transactions 
        WHERE restaurant_id = $1 
        AND DATE(created_at) = $2 
        AND status = 'completed'
        GROUP BY payment_method, total_amount
      ) payment_stats
    `;
    
    const result = await db.query(reportQuery, [restaurantId, reportDate]);
    return result.rows[0];
  }
}

module.exports = new POSService();