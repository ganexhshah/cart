const db = require('../config/database');

class KOTService {
  // Get all KOT orders with filtering
  async getKOTOrders(filters) {
    const { restaurantId, status, priority, tableId, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        ko.*,
        rt.table_number,
        rt.table_name,
        u1.full_name as created_by_name,
        u2.full_name as assigned_to_name,
        COUNT(koi.id) as total_items
      FROM kot_orders ko
      LEFT JOIN restaurant_tables rt ON ko.table_id = rt.id
      LEFT JOIN users u1 ON ko.created_by = u1.id
      LEFT JOIN users u2 ON ko.assigned_to = u2.id
      LEFT JOIN kot_order_items koi ON ko.id = koi.kot_order_id
      WHERE ko.restaurant_id = $1
    `;
    
    const params = [restaurantId];
    let paramCount = 2;
    
    if (status) {
      query += ` AND ko.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    if (priority) {
      query += ` AND ko.priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }
    
    if (tableId) {
      query += ` AND ko.table_id = $${paramCount}`;
      params.push(tableId);
      paramCount++;
    }
    
    query += `
      GROUP BY ko.id, rt.table_number, rt.table_name, u1.full_name, u2.full_name
      ORDER BY ko.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    return result.rows;
  }
  
  // Get KOT order by ID with items
  async getKOTOrderById(kotId, restaurantId) {
    const kotQuery = `
      SELECT 
        ko.*,
        rt.table_number,
        rt.table_name,
        u1.full_name as created_by_name,
        u2.full_name as assigned_to_name
      FROM kot_orders ko
      LEFT JOIN restaurant_tables rt ON ko.table_id = rt.id
      LEFT JOIN users u1 ON ko.created_by = u1.id
      LEFT JOIN users u2 ON ko.assigned_to = u2.id
      WHERE ko.id = $1 AND ko.restaurant_id = $2
    `;
    
    const itemsQuery = `
      SELECT 
        koi.*,
        ki.name as item_name,
        ki.preparation_time,
        ki.difficulty_level
      FROM kot_order_items koi
      JOIN kot_items ki ON koi.kot_item_id = ki.id
      WHERE koi.kot_order_id = $1
      ORDER BY koi.created_at
    `;
    
    const [kotResult, itemsResult] = await Promise.all([
      db.query(kotQuery, [kotId, restaurantId]),
      db.query(itemsQuery, [kotId])
    ]);
    
    if (kotResult.rows.length === 0) {
      const error = new Error('KOT order not found');
      error.statusCode = 404;
      throw error;
    }
    
    const kot = kotResult.rows[0];
    kot.items = itemsResult.rows;
    
    return kot;
  }
  
  // Create new KOT order
  async createKOTOrder(kotData) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      const { restaurantId, orderId, tableId, items, notes, priority = 'normal', createdBy } = kotData;
      
      // Generate KOT number
      const kotNumber = await this.generateKOTNumber(restaurantId, client);
      
      // Calculate estimated time
      const estimatedTime = items.reduce((total, item) => {
        return total + (item.preparation_time || 15) * item.quantity;
      }, 0);
      
      // Create KOT order
      const kotResult = await client.query(
        `INSERT INTO kot_orders (
          restaurant_id, order_id, table_id, kot_number, status, priority,
          total_items, estimated_time, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          restaurantId, orderId, tableId, kotNumber, 'pending', priority,
          items.length, estimatedTime, notes, createdBy
        ]
      );
      
      const kot = kotResult.rows[0];
      
      // Create KOT items
      for (const item of items) {
        await client.query(
          `INSERT INTO kot_order_items (
            kot_order_id, kot_item_id, quantity, special_requests
          ) VALUES ($1, $2, $3, $4)`,
          [kot.id, item.kot_item_id, item.quantity, item.special_requests]
        );
      }
      
      await client.query('COMMIT');
      
      return await this.getKOTOrderById(kot.id, restaurantId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Update KOT status
  async updateKOTStatus(kotId, restaurantId, status, userId) {
    const updateData = { status, updated_at: 'CURRENT_TIMESTAMP' };
    
    if (status === 'preparing') {
      updateData.assigned_to = userId;
    } else if (status === 'ready' || status === 'served') {
      updateData.completed_at = 'CURRENT_TIMESTAMP';
    }
    
    const fields = Object.keys(updateData).map((key, index) => 
      key === 'updated_at' || key === 'completed_at' 
        ? `${key} = ${updateData[key]}`
        : `${key} = $${index + 3}`
    );
    
    const values = Object.values(updateData).filter(val => 
      val !== 'CURRENT_TIMESTAMP'
    );
    
    const result = await db.query(
      `UPDATE kot_orders SET ${fields.join(', ')} 
       WHERE id = $1 AND restaurant_id = $2 
       RETURNING *`,
      [kotId, restaurantId, ...values]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('KOT order not found');
      error.statusCode = 404;
      throw error;
    }
    
    return result.rows[0];
  }
  
  // Update KOT priority
  async updateKOTPriority(kotId, restaurantId, priority) {
    const result = await db.query(
      `UPDATE kot_orders SET priority = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND restaurant_id = $3 
       RETURNING *`,
      [priority, kotId, restaurantId]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('KOT order not found');
      error.statusCode = 404;
      throw error;
    }
    
    return result.rows[0];
  }
  
  // Get KOT statistics
  async getKOTStats(restaurantId, dateRange = 'today') {
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
        COUNT(*) as total_kots,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_kots,
        COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_kots,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_kots,
        COUNT(CASE WHEN status = 'served' THEN 1 END) as served_kots,
        AVG(CASE WHEN actual_time IS NOT NULL THEN actual_time END) as avg_preparation_time,
        AVG(estimated_time) as avg_estimated_time
      FROM kot_orders 
      WHERE restaurant_id = $1 ${dateFilter}
    `;
    
    const result = await db.query(statsQuery, params);
    return result.rows[0];
  }
  
  // Generate unique KOT number
  async generateKOTNumber(restaurantId, client = db) {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `KOT${today}`;
    
    const result = await client.query(
      `SELECT kot_number FROM kot_orders 
       WHERE restaurant_id = $1 AND kot_number LIKE $2 
       ORDER BY kot_number DESC LIMIT 1`,
      [restaurantId, `${prefix}%`]
    );
    
    let sequence = 1;
    if (result.rows.length > 0) {
      const lastNumber = result.rows[0].kot_number;
      sequence = parseInt(lastNumber.slice(-3)) + 1;
    }
    
    return `${prefix}${sequence.toString().padStart(3, '0')}`;
  }
  
  // Get KOT items for a restaurant
  async getKOTItems(restaurantId) {
    const result = await db.query(
      `SELECT 
        ki.*,
        kc.name as category_name,
        mi.name as menu_item_name,
        mi.price
      FROM kot_items ki
      LEFT JOIN kot_categories kc ON ki.category_id = kc.id
      LEFT JOIN menu_items mi ON ki.menu_item_id = mi.id
      WHERE ki.restaurant_id = $1 AND ki.is_active = true
      ORDER BY kc.display_order, ki.name`,
      [restaurantId]
    );
    
    return result.rows;
  }
}

module.exports = new KOTService();