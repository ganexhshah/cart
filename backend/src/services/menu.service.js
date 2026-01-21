const db = require('../config/database');
const logger = require('../utils/logger');

class MenuService {
  // Get all menu categories
  async getCategories(restaurantId = null) {
    try {
      let query = `
        SELECT id, name, description, display_order, is_active, restaurant_id
        FROM menu_categories
        WHERE is_active = true
      `;
      const params = [];
      
      if (restaurantId) {
        query += ` AND restaurant_id = $1`;
        params.push(restaurantId);
      }
      
      query += ` ORDER BY display_order ASC, name ASC`;
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching menu categories:', error);
      throw error;
    }
  }

  // Get menu items with filters
  async getMenuItems(filters = {}) {
    try {
      let query = `
        SELECT 
          mi.id,
          mi.name,
          mi.description,
          mi.price,
          mi.image_url,
          mi.status,
          mi.preparation_time,
          mi.calories,
          mi.ingredients,
          mi.allergens,
          mi.is_vegetarian,
          mi.is_vegan,
          mi.is_gluten_free,
          mi.is_spicy,
          mi.is_featured,
          mi.display_order,
          mi.created_at,
          mi.updated_at,
          mc.name as category_name,
          mc.id as category_id,
          r.name as restaurant_name,
          r.id as restaurant_id,
          COALESCE(mis.total_orders, 0) as total_orders,
          COALESCE(mis.total_revenue, 0) as total_revenue,
          COALESCE(mis.average_rating, 0) as average_rating,
          COALESCE(mis.total_reviews, 0) as total_reviews,
          mis.last_ordered_at
        FROM menu_items mi
        LEFT JOIN menu_categories mc ON mi.category_id = mc.id
        LEFT JOIN restaurants r ON mi.restaurant_id = r.id
        LEFT JOIN menu_item_stats mis ON mi.id = mis.menu_item_id
        WHERE mi.is_active = true
      `;

      const params = [];
      let paramCount = 0;

      // Add filters
      if (filters.userId && filters.userRestaurantsOnly) {
        paramCount++;
        query += ` AND r.owner_id = $${paramCount}`;
        params.push(filters.userId);
      } else if (filters.restaurantId) {
        paramCount++;
        query += ` AND mi.restaurant_id = $${paramCount}`;
        params.push(filters.restaurantId);
      }

      if (filters.categoryId) {
        paramCount++;
        query += ` AND mi.category_id = $${paramCount}`;
        params.push(filters.categoryId);
      }

      if (filters.status) {
        paramCount++;
        query += ` AND mi.status = $${paramCount}`;
        params.push(filters.status);
      }

      if (filters.search) {
        paramCount++;
        query += ` AND (mi.name ILIKE $${paramCount} OR mi.description ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
      }

      if (filters.isVegetarian !== undefined) {
        paramCount++;
        query += ` AND mi.is_vegetarian = $${paramCount}`;
        params.push(filters.isVegetarian);
      }

      if (filters.isVegan !== undefined) {
        paramCount++;
        query += ` AND mi.is_vegan = $${paramCount}`;
        params.push(filters.isVegan);
      }

      if (filters.isGlutenFree !== undefined) {
        paramCount++;
        query += ` AND mi.is_gluten_free = $${paramCount}`;
        params.push(filters.isGlutenFree);
      }

      // Add ordering
      query += ` ORDER BY mi.display_order ASC, mi.name ASC`;

      // Add pagination
      if (filters.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }

      if (filters.offset) {
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        params.push(filters.offset);
      }

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching menu items:', error);
      throw error;
    }
  }

  // Get single menu item by ID
  async getMenuItemById(id) {
    try {
      const result = await db.query(
        `SELECT 
          mi.*,
          mc.name as category_name,
          r.name as restaurant_name,
          r.id as restaurant_id,
          COALESCE(mis.total_orders, 0) as total_orders,
          COALESCE(mis.total_revenue, 0) as total_revenue,
          COALESCE(mis.average_rating, 0) as average_rating,
          COALESCE(mis.total_reviews, 0) as total_reviews,
          mis.last_ordered_at
         FROM menu_items mi
         LEFT JOIN menu_categories mc ON mi.category_id = mc.id
         LEFT JOIN restaurants r ON mi.restaurant_id = r.id
         LEFT JOIN menu_item_stats mis ON mi.id = mis.menu_item_id
         WHERE mi.id = $1 AND mi.is_active = true`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching menu item:', error);
      throw error;
    }
  }

  // Create new menu item
  async createMenuItem(userId, itemData) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Verify user owns the restaurant
      const restaurantCheck = await client.query(
        'SELECT id FROM restaurants WHERE id = $1 AND owner_id = $2',
        [itemData.restaurantId, userId]
      );

      if (restaurantCheck.rows.length === 0) {
        throw new Error('Restaurant not found or access denied');
      }

      // Create menu item
      const result = await client.query(
        `INSERT INTO menu_items (
          restaurant_id, category_id, name, description, price, image_url,
          status, preparation_time, calories, ingredients, allergens,
          is_vegetarian, is_vegan, is_gluten_free, is_spicy, display_order, is_featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *`,
        [
          itemData.restaurantId,
          itemData.categoryId || null, // Keep as UUID string, don't convert
          itemData.name,
          itemData.description || '',
          itemData.price,
          itemData.imageUrl || null,
          itemData.status || 'available',
          itemData.preparationTime || 15,
          itemData.calories || null,
          JSON.stringify(itemData.ingredients || []),
          JSON.stringify(itemData.allergens || []),
          itemData.isVegetarian || false,
          itemData.isVegan || false,
          itemData.isGlutenFree || false,
          itemData.isSpicy || false,
          itemData.displayOrder || 0,
          itemData.isFeatured || false
        ]
      );

      // Initialize stats record
      await client.query(
        'INSERT INTO menu_item_stats (menu_item_id) VALUES ($1)',
        [result.rows[0].id]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating menu item:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update menu item
  async updateMenuItem(userId, itemId, itemData) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Verify user owns the restaurant that owns this menu item
      const ownershipCheck = await client.query(
        `SELECT mi.id FROM menu_items mi
         JOIN restaurants r ON mi.restaurant_id = r.id
         WHERE mi.id = $1 AND r.owner_id = $2 AND mi.is_active = true`,
        [itemId, userId]
      );

      if (ownershipCheck.rows.length === 0) {
        throw new Error('Menu item not found or access denied');
      }

      // Build update query dynamically
      const updateFields = [];
      const params = [itemId];
      let paramCount = 1;

      const allowedFields = {
        name: 'name',
        description: 'description',
        price: 'price',
        imageUrl: 'image_url',
        status: 'status',
        preparationTime: 'preparation_time',
        calories: 'calories',
        ingredients: 'ingredients',
        allergens: 'allergens',
        isVegetarian: 'is_vegetarian',
        isVegan: 'is_vegan',
        isGlutenFree: 'is_gluten_free',
        isSpicy: 'is_spicy',
        displayOrder: 'display_order',
        isFeatured: 'is_featured',
        categoryId: 'category_id'
      };

      Object.keys(itemData).forEach(key => {
        if (allowedFields[key] && itemData[key] !== undefined) {
          paramCount++;
          let value = itemData[key];
          
          // Handle JSON fields
          if (key === 'ingredients' || key === 'allergens') {
            value = JSON.stringify(value);
          }
          
          updateFields.push(`${allowedFields[key]} = $${paramCount}`);
          params.push(value);
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
        UPDATE menu_items 
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(query, params);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error updating menu item:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete menu item (soft delete)
  async deleteMenuItem(userId, itemId) {
    try {
      // Verify ownership and soft delete
      const result = await db.query(
        `UPDATE menu_items 
         SET is_active = false, updated_at = CURRENT_TIMESTAMP
         FROM restaurants r
         WHERE menu_items.id = $1 
         AND menu_items.restaurant_id = r.id 
         AND r.owner_id = $2
         AND menu_items.is_active = true
         RETURNING menu_items.id`,
        [itemId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Menu item not found or access denied');
      }

      return { success: true, message: 'Menu item deleted successfully' };
    } catch (error) {
      logger.error('Error deleting menu item:', error);
      throw error;
    }
  }

  // Get menu statistics for dashboard
  async getMenuStats(userId, restaurantId = null) {
    try {
      let restaurantFilter = '';
      const params = [userId];
      
      if (restaurantId) {
        restaurantFilter = 'AND r.id = $2';
        params.push(restaurantId);
      }

      const result = await db.query(
        `SELECT 
          COUNT(mi.id) as total_items,
          COUNT(CASE WHEN mi.status = 'available' THEN 1 END) as available_items,
          COUNT(CASE WHEN mi.status = 'out_of_stock' THEN 1 END) as out_of_stock_items,
          COUNT(CASE WHEN mi.status = 'discontinued' THEN 1 END) as discontinued_items,
          COALESCE(AVG(mis.average_rating), 0) as avg_rating,
          COALESCE(SUM(mis.total_orders), 0) as total_orders,
          COALESCE(AVG(mi.price), 0) as avg_price,
          COUNT(CASE WHEN mi.is_featured THEN 1 END) as featured_items
         FROM menu_items mi
         JOIN restaurants r ON mi.restaurant_id = r.id
         LEFT JOIN menu_item_stats mis ON mi.id = mis.menu_item_id
         WHERE r.owner_id = $1 AND mi.is_active = true ${restaurantFilter}`,
        params
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error fetching menu stats:', error);
      throw error;
    }
  }

  // Get popular menu items
  async getPopularItems(userId, limit = 10) {
    try {
      const result = await db.query(
        `SELECT 
          mi.id, mi.name, mi.price, mi.image_url,
          mc.name as category_name,
          r.name as restaurant_name,
          mis.total_orders, mis.average_rating, mis.total_revenue
         FROM menu_items mi
         JOIN restaurants r ON mi.restaurant_id = r.id
         LEFT JOIN menu_categories mc ON mi.category_id = mc.id
         LEFT JOIN menu_item_stats mis ON mi.id = mis.menu_item_id
         WHERE r.owner_id = $1 AND mi.is_active = true AND mi.status = 'available'
         ORDER BY mis.total_orders DESC NULLS LAST, mis.average_rating DESC NULLS LAST
         LIMIT $2`,
        [userId, limit]
      );

      return result.rows;
    } catch (error) {
      logger.error('Error fetching popular items:', error);
      throw error;
    }
  }

  // Update menu item status
  async updateItemStatus(userId, itemId, status) {
    try {
      const validStatuses = ['available', 'out_of_stock', 'discontinued'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const result = await db.query(
        `UPDATE menu_items 
         SET status = $3, updated_at = CURRENT_TIMESTAMP
         FROM restaurants r
         WHERE menu_items.id = $1 
         AND menu_items.restaurant_id = r.id 
         AND r.owner_id = $2
         AND menu_items.is_active = true
         RETURNING menu_items.*`,
        [itemId, userId, status]
      );

      if (result.rows.length === 0) {
        throw new Error('Menu item not found or access denied');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error updating item status:', error);
      throw error;
    }
  }
}

module.exports = new MenuService();