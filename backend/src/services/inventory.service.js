const pool = require('../config/database');
const logger = require('../utils/logger');

class InventoryService {
  // Get all raw materials
  async getRawMaterials(restaurantId, filters = {}) {
    try {
      const { category, lowStock, page = 1, limit = 50 } = filters;

      let query = `
        SELECT rm.*,
               CASE 
                 WHEN rm.current_stock <= rm.minimum_stock THEN true
                 ELSE false
               END as is_low_stock
        FROM raw_materials rm
        WHERE rm.restaurant_id = $1 AND rm.is_active = true
      `;

      const params = [restaurantId];
      let paramCount = 1;

      if (category) {
        paramCount++;
        query += ` AND rm.category = $${paramCount}`;
        params.push(category);
      }

      if (lowStock === 'true') {
        query += ` AND rm.current_stock <= rm.minimum_stock`;
      }

      query += ` ORDER BY rm.name`;

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
      logger.error('Error getting raw materials:', error);
      throw error;
    }
  }

  // Create raw material
  async createRawMaterial(restaurantId, materialData) {
    try {
      const {
        name,
        description,
        category,
        unit,
        minimumStock,
        maximumStock,
        reorderLevel,
        costPerUnit
      } = materialData;

      const query = `
        INSERT INTO raw_materials (
          restaurant_id, name, description, category, unit,
          minimum_stock, maximum_stock, reorder_level, cost_per_unit
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const values = [
        restaurantId, name, description, category, unit,
        minimumStock, maximumStock, reorderLevel, costPerUnit
      ];

      const result = await pool.query(query, values);

      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Error creating raw material:', error);
      throw error;
    }
  }

  // Update raw material
  async updateRawMaterial(materialId, materialData) {
    try {
      const {
        name,
        description,
        category,
        unit,
        minimumStock,
        maximumStock,
        reorderLevel,
        costPerUnit
      } = materialData;

      const query = `
        UPDATE raw_materials 
        SET name = $1, description = $2, category = $3, unit = $4,
            minimum_stock = $5, maximum_stock = $6, reorder_level = $7,
            cost_per_unit = $8, updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *
      `;

      const values = [
        name, description, category, unit,
        minimumStock, maximumStock, reorderLevel, costPerUnit,
        materialId
      ];

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return { success: false, message: 'Raw material not found' };
      }

      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Error updating raw material:', error);
      throw error;
    }
  }

  // Record stock transaction
  async recordStockTransaction(transactionData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        restaurantId,
        rawMaterialId,
        transactionType,
        quantity,
        unitCost,
        referenceType,
        referenceId,
        notes,
        createdBy
      } = transactionData;

      // Get current stock
      const materialResult = await client.query(
        'SELECT current_stock, cost_per_unit FROM raw_materials WHERE id = $1',
        [rawMaterialId]
      );

      if (materialResult.rows.length === 0) {
        throw new Error('Raw material not found');
      }

      const currentStock = Number(materialResult.rows[0].current_stock);
      const currentCostPerUnit = Number(materialResult.rows[0].cost_per_unit);

      // Calculate new stock level
      let newStock = currentStock;
      if (transactionType === 'in') {
        newStock += Number(quantity);
      } else if (transactionType === 'out' || transactionType === 'waste') {
        newStock -= Number(quantity);
      } else if (transactionType === 'adjustment') {
        newStock = Number(quantity); // Direct adjustment to specific quantity
      }

      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }

      const totalCost = Number(quantity) * (Number(unitCost) || currentCostPerUnit);

      // Record transaction
      const transactionQuery = `
        INSERT INTO stock_transactions (
          restaurant_id, raw_material_id, transaction_type, quantity,
          unit_cost, total_cost, stock_before, stock_after,
          reference_type, reference_id, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const transactionValues = [
        restaurantId, rawMaterialId, transactionType, quantity,
        unitCost || currentCostPerUnit, totalCost, currentStock, newStock,
        referenceType, referenceId, notes, createdBy
      ];

      const transactionResult = await client.query(transactionQuery, transactionValues);

      // Update material stock and cost
      let newCostPerUnit = currentCostPerUnit;
      if (transactionType === 'in' && unitCost) {
        // Calculate weighted average cost
        const totalValue = (currentStock * currentCostPerUnit) + (Number(quantity) * Number(unitCost));
        newCostPerUnit = newStock > 0 ? totalValue / newStock : Number(unitCost);
      }

      await client.query(`
        UPDATE raw_materials 
        SET current_stock = $1, cost_per_unit = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [newStock, newCostPerUnit, rawMaterialId]);

      // Check for low stock alerts
      await this.checkLowStockAlert(client, rawMaterialId, restaurantId, newStock);

      await client.query('COMMIT');

      return { success: true, data: transactionResult.rows[0] };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error recording stock transaction:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Check and create low stock alert
  async checkLowStockAlert(client, rawMaterialId, restaurantId, currentStock) {
    try {
      const materialResult = await client.query(`
        SELECT name, minimum_stock, reorder_level 
        FROM raw_materials 
        WHERE id = $1
      `, [rawMaterialId]);

      if (materialResult.rows.length === 0) return;

      const material = materialResult.rows[0];
      const minimumStock = Number(material.minimum_stock);
      const reorderLevel = Number(material.reorder_level);

      let alertType = null;
      let message = null;

      if (currentStock <= 0) {
        alertType = 'out_of_stock';
        message = `${material.name} is out of stock`;
      } else if (currentStock <= minimumStock) {
        alertType = 'low_stock';
        message = `${material.name} is running low (${currentStock} remaining)`;
      }

      if (alertType) {
        // Check if alert already exists and is not resolved
        const existingAlert = await client.query(`
          SELECT id FROM stock_alerts 
          WHERE raw_material_id = $1 AND alert_type = $2 AND is_resolved = false
        `, [rawMaterialId, alertType]);

        if (existingAlert.rows.length === 0) {
          await client.query(`
            INSERT INTO stock_alerts (
              restaurant_id, raw_material_id, alert_type, 
              current_stock, minimum_stock, message
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `, [restaurantId, rawMaterialId, alertType, currentStock, minimumStock, message]);
        }
      }
    } catch (error) {
      logger.error('Error checking low stock alert:', error);
    }
  }

  // Get stock transactions
  async getStockTransactions(restaurantId, filters = {}) {
    try {
      const { rawMaterialId, transactionType, startDate, endDate, page = 1, limit = 50 } = filters;

      let query = `
        SELECT st.*, rm.name as material_name, rm.unit,
               u.full_name as created_by_name
        FROM stock_transactions st
        LEFT JOIN raw_materials rm ON st.raw_material_id = rm.id
        LEFT JOIN users u ON st.created_by = u.id
        WHERE st.restaurant_id = $1
      `;

      const params = [restaurantId];
      let paramCount = 1;

      if (rawMaterialId) {
        paramCount++;
        query += ` AND st.raw_material_id = $${paramCount}`;
        params.push(rawMaterialId);
      }

      if (transactionType) {
        paramCount++;
        query += ` AND st.transaction_type = $${paramCount}`;
        params.push(transactionType);
      }

      if (startDate) {
        paramCount++;
        query += ` AND DATE(st.created_at) >= $${paramCount}`;
        params.push(startDate);
      }

      if (endDate) {
        paramCount++;
        query += ` AND DATE(st.created_at) <= $${paramCount}`;
        params.push(endDate);
      }

      query += ` ORDER BY st.created_at DESC`;

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
      logger.error('Error getting stock transactions:', error);
      throw error;
    }
  }

  // Get stock alerts
  async getStockAlerts(restaurantId, resolved = false) {
    try {
      const query = `
        SELECT sa.*, rm.name as material_name, rm.unit, rm.current_stock
        FROM stock_alerts sa
        LEFT JOIN raw_materials rm ON sa.raw_material_id = rm.id
        WHERE sa.restaurant_id = $1 AND sa.is_resolved = $2
        ORDER BY sa.created_at DESC
      `;

      const result = await pool.query(query, [restaurantId, resolved]);

      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Error getting stock alerts:', error);
      throw error;
    }
  }

  // Resolve stock alert
  async resolveStockAlert(alertId, resolvedBy) {
    try {
      const result = await pool.query(`
        UPDATE stock_alerts 
        SET is_resolved = true, resolved_at = CURRENT_TIMESTAMP, resolved_by = $1
        WHERE id = $2
        RETURNING *
      `, [resolvedBy, alertId]);

      if (result.rows.length === 0) {
        return { success: false, message: 'Alert not found' };
      }

      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Error resolving stock alert:', error);
      throw error;
    }
  }

  // Get daily usage report
  async getDailyUsage(restaurantId, date) {
    try {
      const query = `
        SELECT du.*, rm.name as material_name, rm.unit
        FROM daily_usage du
        LEFT JOIN raw_materials rm ON du.raw_material_id = rm.id
        WHERE du.restaurant_id = $1 AND du.usage_date = $2
        ORDER BY rm.name
      `;

      const result = await pool.query(query, [restaurantId, date]);

      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Error getting daily usage:', error);
      throw error;
    }
  }

  // Update daily usage
  async updateDailyUsage(restaurantId, date) {
    try {
      const query = `
        INSERT INTO daily_usage (
          restaurant_id, raw_material_id, usage_date,
          opening_stock, stock_in, stock_out, closing_stock,
          total_usage, cost_per_unit, total_cost
        )
        SELECT 
          rm.restaurant_id,
          rm.id,
          $2::date,
          COALESCE(prev_usage.closing_stock, 0) as opening_stock,
          COALESCE(stock_in.quantity, 0) as stock_in,
          COALESCE(stock_out.quantity, 0) as stock_out,
          rm.current_stock as closing_stock,
          COALESCE(stock_out.quantity, 0) as total_usage,
          rm.cost_per_unit,
          COALESCE(stock_out.quantity, 0) * rm.cost_per_unit as total_cost
        FROM raw_materials rm
        LEFT JOIN daily_usage prev_usage ON rm.id = prev_usage.raw_material_id 
          AND prev_usage.usage_date = $2::date - INTERVAL '1 day'
        LEFT JOIN (
          SELECT raw_material_id, SUM(quantity) as quantity
          FROM stock_transactions
          WHERE restaurant_id = $1 AND DATE(created_at) = $2::date 
            AND transaction_type = 'in'
          GROUP BY raw_material_id
        ) stock_in ON rm.id = stock_in.raw_material_id
        LEFT JOIN (
          SELECT raw_material_id, SUM(quantity) as quantity
          FROM stock_transactions
          WHERE restaurant_id = $1 AND DATE(created_at) = $2::date 
            AND transaction_type IN ('out', 'waste')
          GROUP BY raw_material_id
        ) stock_out ON rm.id = stock_out.raw_material_id
        WHERE rm.restaurant_id = $1
        ON CONFLICT (restaurant_id, raw_material_id, usage_date)
        DO UPDATE SET
          stock_in = EXCLUDED.stock_in,
          stock_out = EXCLUDED.stock_out,
          closing_stock = EXCLUDED.closing_stock,
          total_usage = EXCLUDED.total_usage,
          total_cost = EXCLUDED.total_cost,
          updated_at = CURRENT_TIMESTAMP
      `;

      await pool.query(query, [restaurantId, date]);

      return { success: true };
    } catch (error) {
      logger.error('Error updating daily usage:', error);
      throw error;
    }
  }

  // Get inventory dashboard stats
  async getInventoryStats(restaurantId) {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_materials,
          COUNT(*) FILTER (WHERE current_stock <= minimum_stock) as low_stock_count,
          COUNT(*) FILTER (WHERE current_stock <= 0) as out_of_stock_count,
          SUM(current_stock * cost_per_unit) as total_inventory_value
        FROM raw_materials
        WHERE restaurant_id = $1 AND is_active = true
      `;

      const alertsQuery = `
        SELECT COUNT(*) as pending_alerts
        FROM stock_alerts
        WHERE restaurant_id = $1 AND is_resolved = false
      `;

      const [statsResult, alertsResult] = await Promise.all([
        pool.query(statsQuery, [restaurantId]),
        pool.query(alertsQuery, [restaurantId])
      ]);

      const stats = {
        ...statsResult.rows[0],
        pending_alerts: Number(alertsResult.rows[0].pending_alerts)
      };

      return { success: true, data: stats };
    } catch (error) {
      logger.error('Error getting inventory stats:', error);
      throw error;
    }
  }
}

module.exports = new InventoryService();