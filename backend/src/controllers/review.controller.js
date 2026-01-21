const reviewService = require('../services/review.service');
const logger = require('../utils/logger');
const pool = require('../config/database');

class ReviewController {
  // Get all reviews with filters
  async getReviews(req, res) {
    try {
      const {
        restaurantId,
        customerId,
        status,
        rating,
        search,
        sortBy,
        sortOrder,
        page,
        limit
      } = req.query;

      const filters = {
        restaurantId,
        customerId,
        status,
        rating: rating ? parseInt(rating) : undefined,
        search,
        sortBy,
        sortOrder,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20
      };

      const result = await reviewService.getReviews(filters);

      res.json(result);
    } catch (error) {
      logger.error('Error in getReviews controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews',
        error: error.message
      });
    }
  }

  // Get single review by ID
  async getReviewById(req, res) {
    try {
      const { id } = req.params;

      const result = await reviewService.getReviewById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in getReviewById controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch review',
        error: error.message
      });
    }
  }

  // Create new review
  async createReview(req, res) {
    try {
      const {
        customerId,
        restaurantId,
        orderId,
        rating,
        title,
        content,
        orderValue
      } = req.body;

      // Validation
      if (!customerId || !restaurantId || !rating || !title || !content) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: customerId, restaurantId, rating, title, content'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      const reviewData = {
        customerId,
        restaurantId,
        orderId,
        rating: parseInt(rating),
        title: title.trim(),
        content: content.trim(),
        orderValue: orderValue ? parseFloat(orderValue) : null
      };

      const result = await reviewService.createReview(reviewData);

      res.status(201).json(result);
    } catch (error) {
      logger.error('Error in createReview controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create review',
        error: error.message
      });
    }
  }

  // Update review status
  async updateReviewStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      const validStatuses = ['pending', 'published', 'flagged', 'hidden'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
      }

      const result = await reviewService.updateReviewStatus(id, status, userId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in updateReviewStatus controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update review status',
        error: error.message
      });
    }
  }

  // Add response to review
  async addResponse(req, res) {
    try {
      const { id } = req.params; // review ID
      const { content, status = 'published' } = req.body;
      const userId = req.user.id;
      const restaurantId = req.user.restaurant_id; // Assuming user has restaurant association

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Response content is required'
        });
      }

      const responseData = {
        reviewId: id,
        restaurantId,
        userId,
        content: content.trim(),
        status
      };

      const result = await reviewService.addResponse(responseData);

      res.status(201).json(result);
    } catch (error) {
      logger.error('Error in addResponse controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add response',
        error: error.message
      });
    }
  }

  // Vote helpful/not helpful on review
  async voteHelpful(req, res) {
    try {
      const { id } = req.params; // review ID
      const { isHelpful } = req.body;
      const userId = req.user.id;

      if (typeof isHelpful !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isHelpful must be a boolean value'
        });
      }

      const result = await reviewService.voteHelpful(id, userId, isHelpful);

      res.json(result);
    } catch (error) {
      logger.error('Error in voteHelpful controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to vote on review',
        error: error.message
      });
    }
  }

  // Get review statistics
  async getReviewStats(req, res) {
    try {
      const { restaurantId } = req.params;

      const result = await reviewService.getReviewStats(restaurantId);

      res.json(result);
    } catch (error) {
      logger.error('Error in getReviewStats controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch review statistics',
        error: error.message
      });
    }
  }

  // Get review insights and trends
  async getReviewInsights(req, res) {
    try {
      const { restaurantId } = req.params;
      const { timeframe = '30 days' } = req.query;

      const result = await reviewService.getReviewInsights(restaurantId, timeframe);

      res.json(result);
    } catch (error) {
      logger.error('Error in getReviewInsights controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch review insights',
        error: error.message
      });
    }
  }

  // Delete review (soft delete)
  async deleteReview(req, res) {
    try {
      const { id } = req.params;

      const result = await reviewService.deleteReview(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in deleteReview controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete review',
        error: error.message
      });
    }
  }

  // Get reviews for current user's restaurant
  async getMyRestaurantReviews(req, res) {
    try {
      // For now, let's use the first restaurant in the database
      // In a real app, this would come from the authenticated user
      const restaurantQuery = await pool.query('SELECT id FROM restaurants LIMIT 1');
      
      if (restaurantQuery.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No restaurants found in the system'
        });
      }

      const restaurantId = restaurantQuery.rows[0].id;

      const {
        rating,
        search,
        sortBy,
        sortOrder,
        page,
        limit
      } = req.query;

      const filters = {
        restaurantId,
        rating: rating ? parseInt(rating) : undefined,
        search,
        sortBy,
        sortOrder,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20
      };

      const result = await reviewService.getReviews(filters);

      res.json(result);
    } catch (error) {
      logger.error('Error in getMyRestaurantReviews controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch restaurant reviews',
        error: error.message
      });
    }
  }

  // Get review stats for current user's restaurant
  async getMyRestaurantStats(req, res) {
    try {
      // For now, let's use the first restaurant in the database
      const restaurantQuery = await pool.query('SELECT id FROM restaurants LIMIT 1');
      
      if (restaurantQuery.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No restaurants found in the system'
        });
      }

      const restaurantId = restaurantQuery.rows[0].id;
      const result = await reviewService.getReviewStats(restaurantId);

      res.json(result);
    } catch (error) {
      logger.error('Error in getMyRestaurantStats controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch restaurant review statistics',
        error: error.message
      });
    }
  }
}

module.exports = new ReviewController();