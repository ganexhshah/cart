const pool = require('../config/database');
const logger = require('../utils/logger');

class BillingService {
  // Generate bill from order
  async generateBill(orderData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        orderId,
        restaurantId,
        customerId,
        tableId,
        discountType,
        discountValue,
        taxRate,
        serviceCharge = 0,
        paymentMethod
      } = orderData;

      // Get order details
      const orderQuery = `
        SELECT o.*, oi.menu_item_id, oi.item_name, oi.item_price, oi.quantity,
               (oi.item_price * oi.quantity) as item_total
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = $1
      `;
      const orderResult = await client.query(orderQuery, [orderId]);
      
      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }

      const order = orderResult.rows[0];
      const orderItems = orderResult.rows;

      // Calculate bill amounts
      const subtotal = orderItems.reduce((sum, item) => sum + Number(item.item_total), 0);
      
      let discountAmount = 0;
      if (discountType === 'flat') {
        discountAmount = Number(discountValue) || 0;
      } else if (discountType === 'percentage') {
        discountAmount = (subtotal * (Number(discountValue) || 0)) / 100;
      }

      const taxableAmount = subtotal - discountAmount;
      const taxAmount = (taxableAmount * (Number(taxRate) || 0)) / 100;
      const totalAmount = taxableAmount + taxAmount + Number(serviceCharge);

      // Generate bill number
      const billNumber = await this.generateBillNumber(restaurantId);

      // Create bill
      const billQuery = `
        INSERT INTO bills (
          bill_number, restaurant_id, order_id, customer_id, table_id,
          subtotal, discount_type, discount_value, discount_amount,
          tax_rate, tax_amount, service_charge, total_amount,
          payment_method, payment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;

      const billValues = [
        billNumber, restaurantId, orderId, customerId, tableId,
        subtotal, discountType, discountValue, discountAmount,
        taxRate, taxAmount, serviceCharge, totalAmount,
        paymentMethod, 'pending'
      ];

      const billResult = await client.query(billQuery, billValues);
      const bill = billResult.rows[0];

      // Create bill items
      for (const item of orderItems) {
        if (item.menu_item_id) {
          await client.query(`
            INSERT INTO bill_items (bill_id, menu_item_id, item_name, item_price, quantity, total_price)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [bill.id, item.menu_item_id, item.item_name, item.item_price, item.quantity, item.item_total]);
        }
      }

      await client.query('COMMIT');

      return { success: true, data: bill };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error generating bill:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Generate unique bill number
  async generateBillNumber(restaurantId) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const prefix = `BILL-${year}${month}${day}`;
    
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM bills 
      WHERE restaurant_id = $1 
        AND bill_number LIKE $2
        AND DATE(created_at) = CURRENT_DATE
    `;
    
    const result = await pool.query(countQuery, [restaurantId, `${prefix}%`]);
    const count = parseInt(result.rows[0].count) + 1;
    
    return `${prefix}-${String(count).padStart(4, '0')}`;
  }

  // Get bills with filters
  async getBills(filters = {}) {
    try {
      const {
        restaurantId,
        customerId,
        paymentStatus,
        startDate,
        endDate,
        page = 1,
        limit = 20
      } = filters;

      let query = `
        SELECT b.*, 
               u.full_name as customer_name,
               u.phone as customer_phone,
               rt.table_number
        FROM bills b
        LEFT JOIN users u ON b.customer_id = u.id
        LEFT JOIN restaurant_tables rt ON b.table_id = rt.id
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 0;

      if (restaurantId) {
        paramCount++;
        query += ` AND b.restaurant_id = $${paramCount}`;
        params.push(restaurantId);
      }

      if (customerId) {
        paramCount++;
        query += ` AND b.customer_id = $${paramCount}`;
        params.push(customerId);
      }

      if (paymentStatus) {
        paramCount++;
        query += ` AND b.payment_status = $${paramCount}`;
        params.push(paymentStatus);
      }

      if (startDate) {
        paramCount++;
        query += ` AND DATE(b.created_at) >= $${paramCount}`;
        params.push(startDate);
      }

      if (endDate) {
        paramCount++;
        query += ` AND DATE(b.created_at) <= $${paramCount}`;
        params.push(endDate);
      }

      query += ` ORDER BY b.created_at DESC`;

      const offset = (page - 1) * limit;
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);

      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(offset);

      const result = await pool.query(query, params);

      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Error getting bills:', error);
      throw error;
    }
  }

  // Get bill by ID with items
  async getBillById(billId) {
    try {
      const billQuery = `
        SELECT b.*, 
               u.full_name as customer_name,
               u.phone as customer_phone,
               rt.table_number
        FROM bills b
        LEFT JOIN users u ON b.customer_id = u.id
        LEFT JOIN restaurant_tables rt ON b.table_id = rt.id
        WHERE b.id = $1
      `;

      const billResult = await pool.query(billQuery, [billId]);
      
      if (billResult.rows.length === 0) {
        return { success: false, message: 'Bill not found' };
      }

      const bill = billResult.rows[0];

      // Get bill items
      const itemsQuery = `
        SELECT * FROM bill_items WHERE bill_id = $1 ORDER BY created_at
      `;
      const itemsResult = await pool.query(itemsQuery, [billId]);
      bill.items = itemsResult.rows;

      // Get payment transactions
      const paymentsQuery = `
        SELECT * FROM payment_transactions WHERE bill_id = $1 ORDER BY created_at
      `;
      const paymentsResult = await pool.query(paymentsQuery, [billId]);
      bill.payments = paymentsResult.rows;

      return { success: true, data: bill };
    } catch (error) {
      logger.error('Error getting bill by ID:', error);
      throw error;
    }
  }

  // Process payment
  async processPayment(paymentData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        billId,
        amount,
        paymentMethod,
        gatewayName,
        gatewayTransactionId,
        gatewayResponse
      } = paymentData;

      // Get current bill
      const billResult = await client.query('SELECT * FROM bills WHERE id = $1', [billId]);
      if (billResult.rows.length === 0) {
        throw new Error('Bill not found');
      }

      const bill = billResult.rows[0];

      // Create payment transaction
      const transactionQuery = `
        INSERT INTO payment_transactions (
          bill_id, payment_method, amount, status,
          gateway_name, gateway_transaction_id, gateway_response
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const transactionResult = await client.query(transactionQuery, [
        billId, paymentMethod, amount, 'completed',
        gatewayName, gatewayTransactionId, gatewayResponse
      ]);

      // Calculate total paid amount
      const paidQuery = `
        SELECT COALESCE(SUM(amount), 0) as total_paid
        FROM payment_transactions
        WHERE bill_id = $1 AND status = 'completed'
      `;
      const paidResult = await client.query(paidQuery, [billId]);
      const totalPaid = Number(paidResult.rows[0].total_paid);

      // Update bill payment status
      let paymentStatus = 'pending';
      if (totalPaid >= Number(bill.total_amount)) {
        paymentStatus = 'paid';
      } else if (totalPaid > 0) {
        paymentStatus = 'partial';
      }

      await client.query(`
        UPDATE bills 
        SET payment_status = $1, paid_at = CASE WHEN $1 = 'paid' THEN CURRENT_TIMESTAMP ELSE paid_at END
        WHERE id = $2
      `, [paymentStatus, billId]);

      await client.query('COMMIT');

      return { success: true, data: transactionResult.rows[0] };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error processing payment:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Split bill
  async splitBill(billId, splitCount) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get original bill
      const billResult = await client.query('SELECT * FROM bills WHERE id = $1', [billId]);
      if (billResult.rows.length === 0) {
        throw new Error('Bill not found');
      }

      const originalBill = billResult.rows[0];
      const splitAmount = Number(originalBill.total_amount) / splitCount;

      // Update original bill
      await client.query(`
        UPDATE bills 
        SET is_split_bill = true, split_count = $1
        WHERE id = $2
      `, [splitCount, billId]);

      // Create split bills
      const splitBills = [];
      for (let i = 1; i < splitCount; i++) {
        const splitBillNumber = `${originalBill.bill_number}-SPLIT-${i + 1}`;
        
        const splitBillQuery = `
          INSERT INTO bills (
            bill_number, restaurant_id, order_id, customer_id, table_id,
            subtotal, discount_type, discount_value, discount_amount,
            tax_rate, tax_amount, service_charge, total_amount,
            payment_method, payment_status, is_split_bill, parent_bill_id, split_count
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          RETURNING *
        `;

        const splitBillResult = await client.query(splitBillQuery, [
          splitBillNumber, originalBill.restaurant_id, originalBill.order_id,
          originalBill.customer_id, originalBill.table_id,
          splitAmount, originalBill.discount_type, 0, 0,
          0, 0, 0, splitAmount,
          originalBill.payment_method, 'pending', true, billId, splitCount
        ]);

        splitBills.push(splitBillResult.rows[0]);
      }

      await client.query('COMMIT');

      return { success: true, data: { originalBill, splitBills } };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error splitting bill:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Mark bill as printed
  async markAsPrinted(billId) {
    try {
      await pool.query('UPDATE bills SET is_printed = true WHERE id = $1', [billId]);
      return { success: true };
    } catch (error) {
      logger.error('Error marking bill as printed:', error);
      throw error;
    }
  }

  // Mark bill as sent via WhatsApp
  async markAsSentWhatsApp(billId) {
    try {
      await pool.query('UPDATE bills SET is_sent_whatsapp = true WHERE id = $1', [billId]);
      return { success: true };
    } catch (error) {
      logger.error('Error marking bill as sent via WhatsApp:', error);
      throw error;
    }
  }

  // Get tax settings
  async getTaxSettings(restaurantId) {
    try {
      const result = await pool.query(`
        SELECT * FROM tax_settings 
        WHERE restaurant_id = $1 AND is_active = true
        ORDER BY created_at
      `, [restaurantId]);

      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Error getting tax settings:', error);
      throw error;
    }
  }

  // Update tax settings
  async updateTaxSettings(restaurantId, taxData) {
    try {
      const { taxName, taxRate } = taxData;

      const result = await pool.query(`
        INSERT INTO tax_settings (restaurant_id, tax_name, tax_rate)
        VALUES ($1, $2, $3)
        ON CONFLICT (restaurant_id) 
        DO UPDATE SET tax_name = $2, tax_rate = $3, updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [restaurantId, taxName, taxRate]);

      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Error updating tax settings:', error);
      throw error;
    }
  }
}

module.exports = new BillingService();