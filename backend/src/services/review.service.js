const pool = require('../config/database');
const logger = require('../utils/logger');

class ReviewService {
  // Get all reviews with filters and pagination
  async getReviews(filters = {}) {
    try {
      const {
        restaurantId,
        customerId,
        rating,
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        page = 1,
        limit = 20
      } = filters;

      let query = `
        SELECT 
          r.*,
          u.full_name as customer_name,
          u.email as customer_email,
          u.avatar_url as customer_avatar,
          u.is_verified as customer_verified,
          rest.name as restaurant_name,
          rest.slug as restaurant_slug,
          o.total as order_value
        FROM reviews r
        LEFT JOIN users u ON r.customer_id = u.id
        LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
        LEFT JOIN orders o ON r.order_id = o.id
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 0;

      if (restaurantId) {
        paramCount++;
        query += ` AND r.restaurant_id = $${paramCount}`;
        params.push(restaurantId);
      }

      if (customerId) {
        paramCount++;
        query += ` AND r.customer_id = $${paramCount}`;
        params.push(customerId);
      }

      if (rating) {
        paramCount++;
        query += ` AND r.rating = $${paramCount}`;
        params.push(rating);
      }

      if (search) {
        paramCount++;
        query += ` AND (r.comment ILIKE $${paramCount} OR u.full_name ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      query += ` ORDER BY r.${sortBy} ${sortOrder}`;

      const offset = (page - 1) * limit;
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);

      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(offset);

      const result = await pool.query(query, params);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM reviews r
        LEFT JOIN users u ON r.customer_id = u.id
        WHERE 1=1
      `;

      const countParams = [];
      let countParamCount = 0;

      if (restaurantId) {
        countParamCount++;
        countQuery += ` AND r.restaurant_id = $${countParamCount}`;
        countParams.push(restaurantId);
      }

      if (customerId) {
        countParamCount++;
        countQuery += ` AND r.customer_id = $${countParamCount}`;
        countParams.push(customerId);
      }

      if (rating) {
        countParamCount++;
        countQuery += ` AND r.rating = $${countParamCount}`;
        countParams.push(rating);
      }

      if (search) {
        countParamCount++;
        countQuery += ` AND (r.comment ILIKE $${countParamCount} OR u.full_name ILIKE $${countParamCount})`;
        countParams.push(`%${search}%`);
      }

      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      // Transform data to match expected format
      const transformedData = result.rows.map(row => ({
        ...row,
        title: `${row.rating} star review`, // Generate title from rating
        content: row.comment, // Map comment to content
        status: 'published', // Default status since we don't have this field
        helpful_count: row.helpful_count || 0
      }));

      return {
        success: true,
        data: transformedData,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting reviews:', error);
      throw error;
    }
  }

  // Get single review with responses
  async getReviewById(reviewId) {
    try {
      const reviewQuery = `
        SELECT 
          r.*,
          u.full_name as customer_name,
          u.email as customer_email,
          u.avatar_url as customer_avatar,
          u.is_verified as customer_verified,
          rest.name as restaurant_name,
          rest.slug as restaurant_slug,
          o.total as order_value
        FROM reviews r
        LEFT JOIN users u ON r.customer_id = u.id
        LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
        LEFT JOIN orders o ON r.order_id = o.id
        WHERE r.id = $1
      `;

      const reviewResult = await pool.query(reviewQuery, [reviewId]);
      
      if (reviewResult.rows.length === 0) {
        return { success: false, message: 'Review not found' };
      }

      const review = reviewResult.rows[0];

      // Get responses
      const responsesQuery = `
        SELECT 
          rr.*,
          u.full_name as author_name,
          u.role as author_role
        FROM review_responses rr
        LEFT JOIN users u ON rr.user_id = u.id
        WHERE rr.review_id = $1 AND rr.status = 'published'
        ORDER BY rr.created_at ASC
      `;

      const responsesResult = await pool.query(responsesQuery, [reviewId]);
      review.responses = responsesResult.rows;

      // Get helpful votes count
      const helpfulQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE is_helpful = true) as helpful_count,
          COUNT(*) FILTER (WHERE is_helpful = false) as not_helpful_count
        FROM review_helpful_votes
        WHERE review_id = $1
      `;

      const helpfulResult = await pool.query(helpfulQuery, [reviewId]);
      review.helpful_votes = helpfulResult.rows[0];

      return { success: true, data: review };
    } catch (error) {
      logger.error('Error getting review by ID:', error);
      throw error;
    }
  }

  // Create new review
  async createReview(reviewData) {
    try {
      const {
        customerId,
        restaurantId,
        orderId,
        rating,
        title, // We'll ignore this since the table doesn't have it
        content,
        orderValue // We'll ignore this since the table doesn't have it
      } = reviewData;

      const query = `
        INSERT INTO reviews (customer_id, restaurant_id, order_id, rating, comment)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const values = [customerId, restaurantId, orderId, rating, content];
      const result = await pool.query(query, values);

      // Transform the result to match expected format
      const transformedResult = {
        ...result.rows[0],
        title: `${result.rows[0].rating} star review`,
        content: result.rows[0].comment,
        status: 'published'
      };

      return { success: true, data: transformedResult };
    } catch (error) {
      logger.error('Error creating review:', error);
      throw error;
    }
  }

  // Update review status
  async updateReviewStatus(reviewId, status, userId) {
    try {
      const query = `
        UPDATE reviews 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [status, reviewId]);

      if (result.rows.length === 0) {
        return { success: false, message: 'Review not found' };
      }

      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Error updating review status:', error);
      throw error;
    }
  }

  // Add response to review
  async addResponse(responseData) {
    try {
      const {
        reviewId,
        restaurantId,
        userId,
        content,
        status = 'published'
      } = responseData;

      const query = `
        INSERT INTO review_responses (review_id, restaurant_id, user_id, content, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const values = [reviewId, restaurantId, userId, content, status];
      const result = await pool.query(query, values);

      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Error adding review response:', error);
      throw error;
    }
  }

  // Vote helpful/not helpful
  async voteHelpful(reviewId, userId, isHelpful) {
    try {
      const query = `
        INSERT INTO review_helpful_votes (review_id, user_id, is_helpful)
        VALUES ($1, $2, $3)
        ON CONFLICT (review_id, user_id) 
        DO UPDATE SET is_helpful = $3, created_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const result = await pool.query(query, [reviewId, userId, isHelpful]);

      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Error voting on review:', error);
      throw error;
    }
  }

  // Get review statistics
  async getReviewStats(restaurantId) {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating)::DECIMAL(3,2) as average_rating,
          0 as pending_reviews,
          COUNT(*) as published_reviews,
          0 as response_rate
        FROM reviews r
        WHERE r.restaurant_id = $1
      `;

      const result = await pool.query(statsQuery, [restaurantId]);
      const stats = result.rows[0];

      // Get rating distribution
      const distributionQuery = `
        SELECT 
          rating,
          COUNT(*) as count,
          COUNT(*)::DECIMAL / NULLIF((SELECT COUNT(*) FROM reviews WHERE restaurant_id = $1), 0) * 100 as percentage
        FROM reviews
        WHERE restaurant_id = $1
        GROUP BY rating
        ORDER BY rating DESC
      `;

      const distributionResult = await pool.query(distributionQuery, [restaurantId]);
      stats.rating_distribution = distributionResult.rows;

      return { success: true, data: stats };
    } catch (error) {
      logger.error('Error getting review stats:', error);
      throw error;
    }
  }

  // Get review insights and trends
  async getReviewInsights(restaurantId, timeframe = '30 days') {
    try {
      const insightsQuery = `
        SELECT 
          DATE_TRUNC('day', created_at) as date,
          COUNT(*) as review_count,
          AVG(rating)::DECIMAL(3,2) as avg_rating
        FROM reviews
        WHERE restaurant_id = $1 
          AND created_at >= CURRENT_DATE - INTERVAL '${timeframe}'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date DESC
      `;

      const result = await pool.query(insightsQuery, [restaurantId]);

      // Get most mentioned keywords (simple implementation)
      const keywordsQuery = `
        SELECT 
          word,
          COUNT(*) as frequency
        FROM (
          SELECT unnest(string_to_array(lower(content), ' ')) as word
          FROM reviews
          WHERE restaurant_id = $1 
            AND created_at >= CURRENT_DATE - INTERVAL '${timeframe}'
            AND length(unnest(string_to_array(lower(content), ' '))) > 3
        ) words
        WHERE word NOT IN ('the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'will', 'with', 'this', 'that', 'they', 'have', 'from', 'been', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'what', 'were', 'when', 'where', 'more', 'some', 'like', 'into', 'after', 'back', 'other', 'many', 'than', 'then', 'them', 'these', 'so', 'very', 'her', 'well', 'water')
        GROUP BY word
        ORDER BY frequency DESC
        LIMIT 10
      `;

      const keywordsResult = await pool.query(keywordsQuery, [restaurantId]);

      return {
        success: true,
        data: {
          trends: result.rows,
          keywords: keywordsResult.rows
        }
      };
    } catch (error) {
      logger.error('Error getting review insights:', error);
      throw error;
    }
  }

  // Delete review (soft delete by changing status)
  async deleteReview(reviewId) {
    try {
      const query = `
        UPDATE reviews 
        SET status = 'hidden', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(query, [reviewId]);

      if (result.rows.length === 0) {
        return { success: false, message: 'Review not found' };
      }

      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Error deleting review:', error);
      throw error;
    }
  }
}

module.exports = new ReviewService();