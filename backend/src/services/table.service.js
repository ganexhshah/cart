const db = require('../config/database');
const logger = require('../utils/logger');

class TableService {
  // Get all tables for a restaurant
  async getTables(restaurantId, filters = {}) {
    try {
      let query = `
        SELECT 
          rt.*,
          r.name as restaurant_name,
          COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('pending', 'confirmed', 'preparing')) as active_orders
        FROM restaurant_tables rt
        LEFT JOIN restaurants r ON rt.restaurant_id = r.id
        LEFT JOIN orders o ON rt.id = o.table_id AND o.status IN ('pending', 'confirmed', 'preparing', 'ready')
        WHERE rt.restaurant_id = $1
      `;

      const params = [restaurantId];
      let paramCount = 1;

      // Add filters
      if (filters.status) {
        paramCount++;
        query += ` AND rt.status = $${paramCount}`;
        params.push(filters.status);
      }

      if (filters.type) {
        paramCount++;
        query += ` AND rt.type = $${paramCount}`;
        params.push(filters.type);
      }

      if (filters.location) {
        paramCount++;
        query += ` AND rt.location = $${paramCount}`;
        params.push(filters.location);
      }

      if (filters.search) {
        paramCount++;
        query += ` AND (rt.table_number ILIKE $${paramCount} OR rt.table_name ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
      }

      query += ` GROUP BY rt.id, r.name ORDER BY rt.table_number ASC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching tables:', error);
      throw error;
    }
  }

  // Get single table by ID
  async getTableById(tableId) {
    try {
      const result = await db.query(
        `SELECT 
          rt.*,
          r.name as restaurant_name,
          r.owner_id,
          COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('pending', 'confirmed', 'preparing')) as active_orders
         FROM restaurant_tables rt
         LEFT JOIN restaurants r ON rt.restaurant_id = r.id
         LEFT JOIN orders o ON rt.id = o.table_id AND o.status IN ('pending', 'confirmed', 'preparing', 'ready')
         WHERE rt.id = $1
         GROUP BY rt.id, r.name, r.owner_id`,
        [tableId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching table:', error);
      throw error;
    }
  }

  // Create new table
  async createTable(userId, tableData) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Verify user owns the restaurant
      const restaurantCheck = await client.query(
        'SELECT id FROM restaurants WHERE id = $1 AND owner_id = $2',
        [tableData.restaurantId, userId]
      );

      if (restaurantCheck.rows.length === 0) {
        throw new Error('Restaurant not found or access denied');
      }

      // Check if table number already exists
      const existingTable = await client.query(
        'SELECT id FROM restaurant_tables WHERE restaurant_id = $1 AND table_number = $2',
        [tableData.restaurantId, tableData.tableNumber]
      );

      if (existingTable.rows.length > 0) {
        throw new Error('Table number already exists');
      }

      // Create table
      const result = await client.query(
        `INSERT INTO restaurant_tables (
          restaurant_id, table_number, table_name, capacity, location, type, status, qr_code_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          tableData.restaurantId,
          tableData.tableNumber,
          tableData.tableName || null,
          tableData.capacity,
          tableData.location || null,
          tableData.type || 'indoor',
          tableData.status || 'available',
          tableData.qrCodeUrl || null
        ]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating table:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update table
  async updateTable(userId, tableId, tableData) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Verify user owns the restaurant that owns this table
      const ownershipCheck = await client.query(
        `SELECT rt.id FROM restaurant_tables rt
         JOIN restaurants r ON rt.restaurant_id = r.id
         WHERE rt.id = $1 AND r.owner_id = $2`,
        [tableId, userId]
      );

      if (ownershipCheck.rows.length === 0) {
        throw new Error('Table not found or access denied');
      }

      // Build update query dynamically
      const updateFields = [];
      const params = [tableId];
      let paramCount = 1;

      const allowedFields = {
        tableNumber: 'table_number',
        tableName: 'table_name',
        capacity: 'capacity',
        location: 'location',
        type: 'type',
        status: 'status',
        qrCodeUrl: 'qr_code_url'
      };

      Object.keys(tableData).forEach(key => {
        if (allowedFields[key] && tableData[key] !== undefined) {
          paramCount++;
          updateFields.push(`${allowedFields[key]} = $${paramCount}`);
          params.push(tableData[key]);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Add updated_at
      paramCount++;
      updateFields.push(`updated_at = $${paramCount}`);
      params.push(new Date());

      const query = `
        UPDATE restaurant_tables 
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(query, params);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error updating table:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete table
  async deleteTable(userId, tableId) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Check if table has active orders
      const activeOrders = await client.query(
        `SELECT COUNT(*) as count FROM orders 
         WHERE table_id = $1 AND status IN ('pending', 'confirmed', 'preparing', 'ready')`,
        [tableId]
      );

      if (parseInt(activeOrders.rows[0].count) > 0) {
        throw new Error('Cannot delete table with active orders');
      }

      // Delete table
      const result = await client.query(
        `DELETE FROM restaurant_tables rt
         USING restaurants r
         WHERE rt.id = $1 
         AND rt.restaurant_id = r.id 
         AND r.owner_id = $2
         RETURNING rt.id`,
        [tableId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Table not found or access denied');
      }

      await client.query('COMMIT');
      return { success: true, message: 'Table deleted successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error deleting table:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update table status
  async updateTableStatus(userId, tableId, status) {
    try {
      const validStatuses = ['available', 'occupied', 'reserved', 'maintenance'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const result = await db.query(
        `UPDATE restaurant_tables rt
         SET status = $3, updated_at = CURRENT_TIMESTAMP
         FROM restaurants r
         WHERE rt.id = $1 
         AND rt.restaurant_id = r.id 
         AND r.owner_id = $2
         RETURNING rt.*`,
        [tableId, userId, status]
      );

      if (result.rows.length === 0) {
        throw new Error('Table not found or access denied');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error updating table status:', error);
      throw error;
    }
  }

  // Get table statistics
  async getTableStats(userId, restaurantId = null) {
    try {
      let restaurantFilter = '';
      const params = [userId];
      
      if (restaurantId) {
        restaurantFilter = 'AND r.id = $2';
        params.push(restaurantId);
      }

      const result = await db.query(
        `SELECT 
          COUNT(rt.id) as total_tables,
          COUNT(CASE WHEN rt.status = 'available' THEN 1 END) as available_tables,
          COUNT(CASE WHEN rt.status = 'occupied' THEN 1 END) as occupied_tables,
          COUNT(CASE WHEN rt.status = 'reserved' THEN 1 END) as reserved_tables,
          COUNT(CASE WHEN rt.status = 'maintenance' THEN 1 END) as maintenance_tables,
          COALESCE(SUM(rt.capacity), 0) as total_capacity,
          COALESCE(AVG(rt.capacity), 0) as avg_capacity
         FROM restaurant_tables rt
         JOIN restaurants r ON rt.restaurant_id = r.id
         WHERE r.owner_id = $1 ${restaurantFilter}`,
        params
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error fetching table stats:', error);
      throw error;
    }
  }

  // Get tables by restaurant (for user's restaurants)
  async getUserTables(userId, filters = {}) {
    try {
      let query = `
        SELECT 
          rt.*,
          r.name as restaurant_name,
          COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('pending', 'confirmed', 'preparing')) as active_orders
        FROM restaurant_tables rt
        JOIN restaurants r ON rt.restaurant_id = r.id
        LEFT JOIN orders o ON rt.id = o.table_id AND o.status IN ('pending', 'confirmed', 'preparing', 'ready')
        WHERE r.owner_id = $1
      `;

      const params = [userId];
      let paramCount = 1;

      // Add filters
      if (filters.restaurantId) {
        paramCount++;
        query += ` AND rt.restaurant_id = $${paramCount}`;
        params.push(filters.restaurantId);
      }

      if (filters.status) {
        paramCount++;
        query += ` AND rt.status = $${paramCount}`;
        params.push(filters.status);
      }

      if (filters.type) {
        paramCount++;
        query += ` AND rt.type = $${paramCount}`;
        params.push(filters.type);
      }

      if (filters.search) {
        paramCount++;
        query += ` AND (rt.table_number ILIKE $${paramCount} OR rt.table_name ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
      }

      query += ` GROUP BY rt.id, r.name ORDER BY r.name ASC, rt.table_number ASC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching user tables:', error);
      throw error;
    }
  }

  // Get available tables for a restaurant
  async getAvailableTables(restaurantId) {
    try {
      const result = await db.query(
        `SELECT * FROM restaurant_tables 
         WHERE restaurant_id = $1 AND status = 'available'
         ORDER BY table_number ASC`,
        [restaurantId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching available tables:', error);
      throw error;
    }
  }

  // Get table with current order details
  async getTableWithOrders(tableId) {
    try {
      const result = await db.query(
        `SELECT 
          rt.*,
          r.name as restaurant_name,
          json_agg(
            json_build_object(
              'id', o.id,
              'order_number', o.order_number,
              'status', o.status,
              'total', o.total,
              'created_at', o.created_at
            )
          ) FILTER (WHERE o.id IS NOT NULL) as orders
         FROM restaurant_tables rt
         LEFT JOIN restaurants r ON rt.restaurant_id = r.id
         LEFT JOIN orders o ON rt.id = o.table_id AND o.status IN ('pending', 'confirmed', 'preparing', 'ready')
         WHERE rt.id = $1
         GROUP BY rt.id, r.name`,
        [tableId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching table with orders:', error);
      throw error;
    }
  }
}

module.exports = new TableService();
