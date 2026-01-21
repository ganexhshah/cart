const db = require('../config/database');
const redis = require('../config/redis');
const { paginate } = require('../utils/helpers');

class RestaurantService {
  // Get restaurant by slug (public method)
  async getRestaurantBySlug(slug) {
    const result = await db.query(
      'SELECT * FROM restaurants WHERE slug = $1 AND is_active = true',
      [slug]
    );
    return result.rows[0] || null;
  }

  async createRestaurant(restaurantData) {
    const {
      ownerId, name, description, logoUrl, address, city, state, zipCode, country,
      phone, email, openingTime, closingTime
    } = restaurantData;
    
    // Generate slug from restaurant name
    const slug = this.generateSlug(name);
    
    const result = await db.query(
      `INSERT INTO restaurants (
        owner_id, name, slug, description, logo_url, address, city, state, zip_code, country,
        phone, email, opening_time, closing_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [ownerId, name, slug, description, logoUrl, address, city, state, zipCode, country, phone, email, openingTime, closingTime]
    );
    
    return result.rows[0];
  }

  // Generate URL-friendly slug from restaurant name
  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
  }
  
  async getRestaurants(filters) {
    const { ownerId, city, isActive, page = 1, limit = 20 } = filters;
    const { limit: queryLimit, offset } = paginate(page, limit);
    
    let query = 'SELECT * FROM restaurants WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    // Always filter by owner_id if provided (for user's own restaurants)
    if (ownerId) {
      query += ` AND owner_id = $${paramCount}`;
      params.push(ownerId);
      paramCount++;
    }
    
    if (city) {
      query += ` AND city ILIKE $${paramCount}`;
      params.push(`%${city}%`);
      paramCount++;
    }
    
    if (isActive !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      params.push(isActive === 'true');
      paramCount++;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(queryLimit, offset);
    
    const result = await db.query(query, params);
    return result.rows;
  }
  
  async getRestaurantById(restaurantId) {
    // Try cache first
    const cacheKey = `restaurant:${restaurantId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const result = await db.query(
      'SELECT * FROM restaurants WHERE id = $1',
      [restaurantId]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      throw error;
    }
    
    const restaurant = result.rows[0];
    
    // Cache for 1 hour
    await redis.setEx(cacheKey, 3600, JSON.stringify(restaurant));
    
    return restaurant;
  }
  
  async updateRestaurant(restaurantId, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(restaurantId);
    
    const query = `UPDATE restaurants SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Clear cache
    await redis.del(`restaurant:${restaurantId}`);
    await redis.del(`menu:${restaurantId}`);
    
    return result.rows[0];
  }
  
  async deleteRestaurant(restaurantId) {
    const result = await db.query(
      'DELETE FROM restaurants WHERE id = $1 RETURNING id',
      [restaurantId]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Clear cache
    await redis.del(`restaurant:${restaurantId}`);
    await redis.del(`menu:${restaurantId}`);
  }
  
  async getRestaurantMenu(restaurantId) {
    // Try cache first
    const cacheKey = `menu:${restaurantId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const result = await db.query(
      `SELECT 
        c.id as category_id,
        c.name as category_name,
        c.description as category_description,
        c.display_order,
        json_agg(
          json_build_object(
            'id', m.id,
            'name', m.name,
            'description', m.description,
            'price', m.price,
            'originalPrice', m.original_price,
            'imageUrl', m.image_url,
            'isVegetarian', m.is_vegetarian,
            'isVegan', m.is_vegan,
            'isGlutenFree', m.is_gluten_free,
            'isSpicy', m.is_spicy,
            'spiceLevel', m.spice_level,
            'isAvailable', m.is_available,
            'isPopular', m.is_popular,
            'rating', m.rating,
            'tags', m.tags
          ) ORDER BY m.name
        ) as items
      FROM menu_categories c
      LEFT JOIN menu_items m ON c.id = m.category_id AND m.is_available = true
      WHERE c.restaurant_id = $1 AND c.is_active = true
      GROUP BY c.id, c.name, c.description, c.display_order
      ORDER BY c.display_order, c.name`,
      [restaurantId]
    );
    
    const menu = result.rows;
    
    // Cache for 1 hour
    await redis.setEx(cacheKey, 3600, JSON.stringify(menu));
    
    return menu;
  }
}

module.exports = new RestaurantService();
