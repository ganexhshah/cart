const pool = require('../config/database');
const logger = require('../utils/logger');

class PurchaseService {
  // Get all suppliers
  async getSuppliers(restaurantId, filters = {}) {
    try {
      const { businessType, isActive = true, page = 1, limit = 50 } = filters;

      let query = `
        SELECT s.*,
               COUNT(po.id) as total_orders,
               AVG(po.total_amount) as avg_order_value
        FROM suppliers s
        LEFT JOIN purchase_orders po ON s.id = po.supplier_id
        WHERE s.restaurant_id = $1
      `;

      const params = [restaurantId];
      let paramCount = 1;

      if (isActive !== undefined) {
        paramCount++;
        query += ` AND s.is_active = $${paramCount}`;
        params.push(isActive);
      }

      if (businessType) {
        paramCount++;
        query += ` AND s.business_type = $${paramCount}`;
        params.push(businessType);
      }

      query += ` GROUP BY s.id ORDER BY s.name`;

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
      logger.error('Error getting suppliers:', error);
      throw error;
    }
  }

  // Create supplier
  async createSupplier(restaurantId, supplierData) {
    try {
      const {
        name,
        contactPerson,
        email,
        phone,
        address,
        businessType,
        taxNumber,
        paymentTerms
      } = supplierData;

      const query = `
        INSERT INTO suppliers (
          restaurant_id, name, contact_person, email, phone, address,
          business_type, tax_number, payment_terms
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const values = [
        restaurantId, name, contactPerson, email, phone, address,
        businessType, taxNumber, paymentTerms
      ];

      const result = await pool.query(query, values);

      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Error creating supplier:', error);
      throw error;
    }
  }

  // Update supplier
  async updateSupplier(supplierId, supplierData) {
    try {
      const {
        name,
        contactPerson,
        email,
        phone,
        address,
        businessType,
        taxNumber,
        paymentTerms,
        isActive,
        rating
      } = supplierData;

      const query = `
        UPDATE suppliers 
        SET name = $1, contact_person = $2, email = $3, phone = $4, address = $5,
            business_type = $6, tax_number = $7, payment_terms = $8,
            is_active = $9, rating = $10, updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *
      `;

      const values = [
        name, contactPerson, email, phone, address,
        businessType, taxNumber, paymentTerms, isActive, rating,
        supplierId
      ];

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return { success: false, message: 'Supplier not found' };
      }

      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Error updating supplier:', error);
      throw error;
    }
  }

  // Create purchase order
  async createPurchaseOrder(orderData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        restaurantId,
        supplierId,
        expectedDeliveryDate,
        items,
        notes,
        termsConditions,
        createdBy
      } = orderData;

      // Generate PO number
      const poNumber = await this.generatePONumber(restaurantId);

      // Calculate totals
      let subtotal = 0;
      items.forEach(item => {
        subtotal += Number(item.quantity) * Number(item.unitPrice);
      });

      const taxAmount = subtotal * 0.13; // 13% VAT
      const totalAmount = subtotal + taxAmount;

      // Create purchase order
      const poQuery = `
        INSERT INTO purchase_orders (
          po_number, restaurant_id, supplier_id, expected_delivery_date,
          subtotal, tax_amount, total_amount, notes, terms_conditions, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const poValues = [
        poNumber, restaurantId, supplierId, expectedDeliveryDate,
        subtotal, taxAmount, totalAmount, notes, termsConditions, createdBy
      ];

      const poResult = await client.query(poQuery, poValues);
      const purchaseOrder = poResult.rows[0];

      // Create purchase order items
      for (const item of items) {
        const itemQuery = `
          INSERT INTO purchase_order_items (
            purchase_order_id, raw_material_id, item_name, unit,
            quantity_ordered, unit_price, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        const itemValues = [
          purchaseOrder.id, item.rawMaterialId, item.itemName, item.unit,
          item.quantity, item.unitPrice, Number(item.quantity) * Number(item.unitPrice)
        ];

        await client.query(itemQuery, itemValues);
      }

      await client.query('COMMIT');

      return { success: true, data: purchaseOrder };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating purchase order:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Generate PO number
  async generatePONumber(restaurantId) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const prefix = `PO-${year}${month}`;
    
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM purchase_orders 
      WHERE restaurant_id = $1 
        AND po_number LIKE $2
        AND EXTRACT(YEAR FROM created_at) = $3
        AND EXTRACT(MONTH FROM created_at) = $4
    `;
    
    const result = await pool.query(countQuery, [restaurantId, `${prefix}%`, year, today.getMonth() + 1]);
    const count = parseInt(result.rows[0].count) + 1;
    
    return `${prefix}-${String(count).padStart(4, '0')}`;
  }

  // Get purchase orders
  async getPurchaseOrders(restaurantId, filters = {}) {
    try {
      const { supplierId, status, startDate, endDate, page = 1, limit = 20 } = filters;

      let query = `
        SELECT po.*, s.name as supplier_name, s.contact_person,
               COUNT(poi.id) as item_count
        FROM purchase_orders po
        LEFT JOIN suppliers s ON po.supplier_id = s.id
        LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
        WHERE po.restaurant_id = $1
      `;

      const params = [restaurantId];
      let paramCount = 1;

      if (supplierId) {
        paramCount++;
        query += ` AND po.supplier_id = $${paramCount}`;
        params.push(supplierId);
      }

      if (status) {
        paramCount++;
        query += ` AND po.status = $${paramCount}`;
        params.push(status);
      }

      if (startDate) {
        paramCount++;
        query += ` AND DATE(po.order_date) >= $${paramCount}`;
        params.push(startDate);
      }

      if (endDate) {
        paramCount++;
        query += ` AND DATE(po.order_date) <= $${paramCount}`;
        params.push(endDate);
      }

      query += ` GROUP BY po.id, s.name, s.contact_person ORDER BY po.created_at DESC`;

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
      logger.error('Error getting purchase orders:', error);
      throw error;
    }
  }

  // Get purchase order by ID
  async getPurchaseOrderById(poId) {
    try {
      const poQuery = `
        SELECT po.*, s.name as supplier_name, s.contact_person, s.phone, s.email,
               u1.full_name as created_by_name,
               u2.full_name as approved_by_name,
               u3.full_name as received_by_name
        FROM purchase_orders po
        LEFT JOIN suppliers s ON po.supplier_id = s.id
        LEFT JOIN users u1 ON po.created_by = u1.id
        LEFT JOIN users u2 ON po.approved_by = u2.id
        LEFT JOIN users u3 ON po.received_by = u3.id
        WHERE po.id = $1
      `;

      const poResult = await pool.query(poQuery, [poId]);
      
      if (poResult.rows.length === 0) {
        return { success: false, message: 'Purchase order not found' };
      }

      const purchaseOrder = poResult.rows[0];

      // Get purchase order items
      const itemsQuery = `
        SELECT poi.*, rm.name as material_name
        FROM purchase_order_items poi
        LEFT JOIN raw_materials rm ON poi.raw_material_id = rm.id
        WHERE poi.purchase_order_id = $1
        ORDER BY poi.created_at
      `;

      const itemsResult = await pool.query(itemsQuery, [poId]);
      purchaseOrder.items = itemsResult.rows;

      return { success: true, data: purchaseOrder };
    } catch (error) {
      logger.error('Error getting purchase order by ID:', error);
      throw error;
    }
  }

  // Update purchase order status
  async updatePurchaseOrderStatus(poId, status, userId) {
    try {
      let updateFields = 'status = $1, updated_at = CURRENT_TIMESTAMP';
      const params = [status, poId];
      let paramCount = 2;

      if (status === 'confirmed' && userId) {
        paramCount++;
        updateFields += `, approved_by = $${paramCount}, approved_at = CURRENT_TIMESTAMP`;
        params.splice(2, 0, userId);
      } else if (status === 'received' && userId) {
        paramCount++;
        updateFields += `, received_by = $${paramCount}, received_at = CURRENT_TIMESTAMP, actual_delivery_date = CURRENT_DATE`;
        params.splice(2, 0, userId);
      }

      const query = `
        UPDATE purchase_orders 
        SET ${updateFields}
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        return { success: false, message: 'Purchase order not found' };
      }

      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Error updating purchase order status:', error);
      throw error;
    }
  }

  // Receive purchase order items
  async receivePurchaseOrderItems(poId, receivedItems, receivedBy) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update received quantities
      for (const item of receivedItems) {
        await client.query(`
          UPDATE purchase_order_items 
          SET quantity_received = $1, quality_status = $2, quality_notes = $3
          WHERE id = $4
        `, [item.quantityReceived, item.qualityStatus, item.qualityNotes, item.id]);

        // If quality approved, update inventory
        if (item.qualityStatus === 'approved' && item.quantityReceived > 0) {
          // Record stock transaction
          const inventoryService = require('./inventory.service');
          await inventoryService.recordStockTransaction({
            restaurantId: item.restaurantId,
            rawMaterialId: item.rawMaterialId,
            transactionType: 'in',
            quantity: item.quantityReceived,
            unitCost: item.unitPrice,
            referenceType: 'purchase',
            referenceId: poId,
            notes: `Received from PO: ${item.poNumber}`,
            createdBy: receivedBy
          });
        }
      }

      // Check if all items are received
      const itemsQuery = `
        SELECT COUNT(*) as total_items,
               COUNT(*) FILTER (WHERE quantity_received >= quantity_ordered) as received_items
        FROM purchase_order_items
        WHERE purchase_order_id = $1
      `;

      const itemsResult = await client.query(itemsQuery, [poId]);
      const { total_items, received_items } = itemsResult.rows[0];

      let newStatus = 'partial_received';
      if (Number(received_items) === Number(total_items)) {
        newStatus = 'received';
      }

      // Update PO status
      await client.query(`
        UPDATE purchase_orders 
        SET status = $1, received_by = $2, received_at = CURRENT_TIMESTAMP,
            actual_delivery_date = CURRENT_DATE
        WHERE id = $3
      `, [newStatus, receivedBy, poId]);

      await client.query('COMMIT');

      return { success: true, message: 'Items received successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error receiving purchase order items:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get purchase history/reports
  async getPurchaseHistory(restaurantId, filters = {}) {
    try {
      const { supplierId, materialId, startDate, endDate, page = 1, limit = 50 } = filters;

      let query = `
        SELECT po.po_number, po.order_date, po.total_amount, po.status,
               s.name as supplier_name,
               poi.item_name, poi.quantity_ordered, poi.quantity_received,
               poi.unit_price, poi.total_price,
               rm.name as material_name, rm.unit
        FROM purchase_orders po
        LEFT JOIN suppliers s ON po.supplier_id = s.id
        LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
        LEFT JOIN raw_materials rm ON poi.raw_material_id = rm.id
        WHERE po.restaurant_id = $1
      `;

      const params = [restaurantId];
      let paramCount = 1;

      if (supplierId) {
        paramCount++;
        query += ` AND po.supplier_id = $${paramCount}`;
        params.push(supplierId);
      }

      if (materialId) {
        paramCount++;
        query += ` AND poi.raw_material_id = $${paramCount}`;
        params.push(materialId);
      }

      if (startDate) {
        paramCount++;
        query += ` AND DATE(po.order_date) >= $${paramCount}`;
        params.push(startDate);
      }

      if (endDate) {
        paramCount++;
        query += ` AND DATE(po.order_date) <= $${paramCount}`;
        params.push(endDate);
      }

      query += ` ORDER BY po.order_date DESC, po.po_number`;

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
      logger.error('Error getting purchase history:', error);
      throw error;
    }
  }

  // Get cost tracking data
  async getCostTracking(restaurantId, materialId, days = 30) {
    try {
      const query = `
        SELECT ct.*, rm.name as material_name, rm.unit
        FROM cost_tracking ct
        LEFT JOIN raw_materials rm ON ct.raw_material_id = rm.id
        WHERE ct.restaurant_id = $1 
          AND ($2::uuid IS NULL OR ct.raw_material_id = $2)
          AND ct.tracking_date >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY ct.tracking_date DESC, rm.name
      `;

      const result = await pool.query(query, [restaurantId, materialId]);

      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Error getting cost tracking:', error);
      throw error;
    }
  }

  // Update cost tracking
  async updateCostTracking(restaurantId, date = new Date().toISOString().split('T')[0]) {
    try {
      const query = `
        INSERT INTO cost_tracking (
          restaurant_id, raw_material_id, tracking_date,
          average_cost, last_purchase_cost
        )
        SELECT 
          rm.restaurant_id,
          rm.id,
          $2::date,
          rm.cost_per_unit,
          COALESCE(latest_purchase.unit_price, rm.cost_per_unit)
        FROM raw_materials rm
        LEFT JOIN (
          SELECT DISTINCT ON (poi.raw_material_id) 
                 poi.raw_material_id, poi.unit_price
          FROM purchase_order_items poi
          JOIN purchase_orders po ON poi.purchase_order_id = po.id
          WHERE po.restaurant_id = $1 AND po.status IN ('received', 'partial_received')
          ORDER BY poi.raw_material_id, po.order_date DESC
        ) latest_purchase ON rm.id = latest_purchase.raw_material_id
        WHERE rm.restaurant_id = $1
        ON CONFLICT (restaurant_id, raw_material_id, tracking_date)
        DO UPDATE SET
          average_cost = EXCLUDED.average_cost,
          last_purchase_cost = EXCLUDED.last_purchase_cost
      `;

      await pool.query(query, [restaurantId, date]);

      return { success: true };
    } catch (error) {
      logger.error('Error updating cost tracking:', error);
      throw error;
    }
  }
}

module.exports = new PurchaseService();