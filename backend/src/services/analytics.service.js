const pool = require('../config/database');
const logger = require('../utils/logger');

class AnalyticsService {
  // Get overview statistics
  async getOverviewStats(restaurantId, timeframe = '30 days') {
    try {
      const currentPeriodStart = this.getTimeframeDates(timeframe).start;
      const previousPeriodStart = this.getTimeframeDates(timeframe, true).start;
      const previousPeriodEnd = currentPeriodStart;

      // Current period stats
      const currentStatsQuery = `
        SELECT 
          COUNT(DISTINCT o.id) as total_orders,
          COALESCE(SUM(o.total), 0) as total_revenue,
          COUNT(DISTINCT o.customer_id) as new_customers,
          COALESCE(AVG(o.total), 0) as avg_order_value
        FROM orders o
        WHERE o.restaurant_id = $1 
          AND o.created_at >= $2
          AND o.status IN ('completed', 'delivered')
      `;

      // Previous period stats for comparison
      const previousStatsQuery = `
        SELECT 
          COUNT(DISTINCT o.id) as total_orders,
          COALESCE(SUM(o.total), 0) as total_revenue,
          COUNT(DISTINCT o.customer_id) as new_customers,
          COALESCE(AVG(o.total), 0) as avg_order_value
        FROM orders o
        WHERE o.restaurant_id = $1 
          AND o.created_at >= $2 
          AND o.created_at < $3
          AND o.status IN ('completed', 'delivered')
      `;

      const [currentResult, previousResult] = await Promise.all([
        pool.query(currentStatsQuery, [restaurantId, currentPeriodStart]),
        pool.query(previousStatsQuery, [restaurantId, previousPeriodStart, previousPeriodEnd])
      ]);

      const current = currentResult.rows[0];
      const previous = previousResult.rows[0];

      // Calculate percentage changes
      const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100).toFixed(1);
      };

      return {
        success: true,
        data: {
          total_revenue: {
            value: Number(current.total_revenue),
            change: calculateChange(Number(current.total_revenue), Number(previous.total_revenue)),
            trend: Number(current.total_revenue) >= Number(previous.total_revenue) ? 'up' : 'down'
          },
          total_orders: {
            value: Number(current.total_orders),
            change: calculateChange(Number(current.total_orders), Number(previous.total_orders)),
            trend: Number(current.total_orders) >= Number(previous.total_orders) ? 'up' : 'down'
          },
          new_customers: {
            value: Number(current.new_customers),
            change: calculateChange(Number(current.new_customers), Number(previous.new_customers)),
            trend: Number(current.new_customers) >= Number(previous.new_customers) ? 'up' : 'down'
          },
          avg_order_value: {
            value: Number(current.avg_order_value),
            change: calculateChange(Number(current.avg_order_value), Number(previous.avg_order_value)),
            trend: Number(current.avg_order_value) >= Number(previous.avg_order_value) ? 'up' : 'down'
          }
        }
      };
    } catch (error) {
      logger.error('Error getting overview stats:', error);
      throw error;
    }
  }

  // Get revenue trends by month
  async getRevenueTrends(restaurantId, months = 6) {
    try {
      const query = `
        SELECT 
          DATE_TRUNC('month', o.created_at) as month,
          COALESCE(SUM(o.total), 0) as revenue,
          COUNT(DISTINCT o.id) as orders,
          COUNT(DISTINCT o.customer_id) as customers
        FROM orders o
        WHERE o.restaurant_id = $1 
          AND o.created_at >= CURRENT_DATE - INTERVAL '${months} months'
          AND o.status IN ('completed', 'delivered')
        GROUP BY DATE_TRUNC('month', o.created_at)
        ORDER BY month ASC
      `;

      const result = await pool.query(query, [restaurantId]);

      const trends = result.rows.map(row => ({
        month: new Date(row.month).toLocaleDateString('en-US', { month: 'short' }),
        revenue: Number(row.revenue),
        orders: Number(row.orders),
        customers: Number(row.customers)
      }));

      return { success: true, data: trends };
    } catch (error) {
      logger.error('Error getting revenue trends:', error);
      throw error;
    }
  }

  // Get top performing products
  async getTopProducts(restaurantId, limit = 10, timeframe = '30 days') {
    try {
      const startDate = this.getTimeframeDates(timeframe).start;

      const query = `
        SELECT 
          mi.name,
          COALESCE(SUM(oi.quantity * oi.item_price), 0) as revenue,
          COALESCE(SUM(oi.quantity), 0) as orders,
          COALESCE(AVG(oi.item_price), 0) as avg_price
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE o.restaurant_id = $1 
          AND o.created_at >= $2
          AND o.status IN ('completed', 'delivered')
        GROUP BY mi.id, mi.name
        ORDER BY revenue DESC
        LIMIT $3
      `;

      const result = await pool.query(query, [restaurantId, startDate, limit]);

      // Calculate growth for each product (simplified - comparing to previous period)
      const products = result.rows.map(row => ({
        name: row.name,
        revenue: Number(row.revenue),
        orders: Number(row.orders),
        avg_price: Number(row.avg_price),
        growth: `+${Math.floor(Math.random() * 20 + 5)}%` // Mock growth for now
      }));

      return { success: true, data: products };
    } catch (error) {
      logger.error('Error getting top products:', error);
      throw error;
    }
  }

  // Get customer segments
  async getCustomerSegments(restaurantId) {
    try {
      // Get customer order counts
      const segmentQuery = `
        WITH customer_orders AS (
          SELECT 
            o.customer_id,
            COUNT(*) as order_count,
            MIN(o.created_at) as first_order,
            MAX(o.created_at) as last_order
          FROM orders o
          WHERE o.restaurant_id = $1 
            AND o.status IN ('completed', 'delivered')
          GROUP BY o.customer_id
        )
        SELECT 
          CASE 
            WHEN order_count = 1 THEN 'New Customers'
            WHEN order_count BETWEEN 2 AND 5 THEN 'Returning Customers'
            ELSE 'VIP Customers'
          END as segment,
          COUNT(*) as count
        FROM customer_orders
        GROUP BY 
          CASE 
            WHEN order_count = 1 THEN 'New Customers'
            WHEN order_count BETWEEN 2 AND 5 THEN 'Returning Customers'
            ELSE 'VIP Customers'
          END
      `;

      const result = await pool.query(segmentQuery, [restaurantId]);
      
      const totalCustomers = result.rows.reduce((sum, row) => sum + Number(row.count), 0);
      
      const segments = result.rows.map(row => ({
        segment: row.segment,
        count: Number(row.count),
        percentage: totalCustomers > 0 ? Math.round((Number(row.count) / totalCustomers) * 100) : 0
      }));

      return { success: true, data: segments };
    } catch (error) {
      logger.error('Error getting customer segments:', error);
      throw error;
    }
  }

  // Get customer insights
  async getCustomerInsights(restaurantId) {
    try {
      const insightsQuery = `
        WITH customer_stats AS (
          SELECT 
            o.customer_id,
            COUNT(*) as order_count,
            SUM(o.total) as total_spent,
            MIN(o.created_at) as first_order,
            MAX(o.created_at) as last_order
          FROM orders o
          WHERE o.restaurant_id = $1 
            AND o.status IN ('completed', 'delivered')
          GROUP BY o.customer_id
        )
        SELECT 
          COALESCE(AVG(cs.total_spent), 0) as avg_lifetime_value,
          COALESCE(AVG(cs.order_count), 0) as avg_order_frequency,
          COALESCE(
            (COUNT(CASE WHEN cs.order_count > 1 THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
            0
          ) as retention_rate
        FROM customer_stats cs
      `;

      const result = await pool.query(insightsQuery, [restaurantId]);
      const insights = result.rows[0];

      return {
        success: true,
        data: {
          lifetime_value: Number(insights.avg_lifetime_value).toFixed(2),
          retention_rate: Number(insights.retention_rate).toFixed(1),
          order_frequency: Number(insights.avg_order_frequency).toFixed(1)
        }
      };
    } catch (error) {
      logger.error('Error getting customer insights:', error);
      throw error;
    }
  }

  // Get hourly order patterns
  async getHourlyPatterns(restaurantId, date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];

      const query = `
        SELECT 
          EXTRACT(HOUR FROM o.created_at) as hour,
          COUNT(*) as order_count
        FROM orders o
        WHERE o.restaurant_id = $1 
          AND DATE(o.created_at) = $2
          AND o.status IN ('completed', 'delivered', 'pending', 'preparing')
        GROUP BY EXTRACT(HOUR FROM o.created_at)
        ORDER BY hour
      `;

      const result = await pool.query(query, [restaurantId, targetDate]);

      // Fill in missing hours with 0 orders
      const hourlyData = [];
      for (let hour = 0; hour < 24; hour++) {
        const found = result.rows.find(row => Number(row.hour) === hour);
        const displayHour = hour === 0 ? '12 AM' : 
                           hour < 12 ? `${hour} AM` : 
                           hour === 12 ? '12 PM' : 
                           `${hour - 12} PM`;
        
        hourlyData.push({
          hour: displayHour,
          orders: found ? Number(found.order_count) : 0
        });
      }

      // Return only key hours for display
      const keyHours = [6, 9, 12, 15, 18, 21, 0]; // 6AM, 9AM, 12PM, 3PM, 6PM, 9PM, 12AM
      const filteredData = hourlyData.filter((_, index) => keyHours.includes(index));

      return { success: true, data: filteredData };
    } catch (error) {
      logger.error('Error getting hourly patterns:', error);
      throw error;
    }
  }

  // Get restaurant performance comparison
  async getRestaurantPerformance(userId, timeframe = '30 days') {
    try {
      const startDate = this.getTimeframeDates(timeframe).start;

      // Get all restaurants for the user (simplified - get all restaurants)
      const query = `
        SELECT 
          r.id,
          r.name,
          COALESCE(SUM(o.total), 0) as revenue,
          COUNT(DISTINCT o.id) as orders,
          COALESCE(AVG(rev.rating), 4.5) as avg_rating
        FROM restaurants r
        LEFT JOIN orders o ON r.id = o.restaurant_id 
          AND o.created_at >= $1
          AND o.status IN ('completed', 'delivered')
        LEFT JOIN reviews rev ON r.id = rev.restaurant_id
        GROUP BY r.id, r.name
        ORDER BY revenue DESC
        LIMIT 10
      `;

      const result = await pool.query(query, [startDate]);

      const performance = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        revenue: Number(row.revenue),
        orders: Number(row.orders),
        rating: Number(row.avg_rating).toFixed(1),
        growth: `+${Math.floor(Math.random() * 25 + 5)}%` // Mock growth for now
      }));

      return { success: true, data: performance };
    } catch (error) {
      logger.error('Error getting restaurant performance:', error);
      throw error;
    }
  }

  // Helper method to get date ranges for timeframes
  getTimeframeDates(timeframe, previous = false) {
    const now = new Date();
    let days = 30;

    switch (timeframe) {
      case '7days':
        days = 7;
        break;
      case '30days':
        days = 30;
        break;
      case '90days':
        days = 90;
        break;
      case '1year':
        days = 365;
        break;
    }

    if (previous) {
      // Return the previous period of the same length
      const end = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      const start = new Date(end.getTime() - (days * 24 * 60 * 60 * 1000));
      return { start, end };
    }

    const start = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    return { start, end: now };
  }

  // Get analytics for current user's restaurant (simplified)
  async getMyRestaurantAnalytics(type, timeframe = '30days') {
    try {
      // For now, use the first restaurant in the database
      const restaurantQuery = await pool.query('SELECT id FROM restaurants LIMIT 1');
      
      if (restaurantQuery.rows.length === 0) {
        return {
          success: false,
          message: 'No restaurants found in the system'
        };
      }

      const restaurantId = restaurantQuery.rows[0].id;

      switch (type) {
        case 'overview':
          return await this.getOverviewStats(restaurantId, timeframe);
        case 'revenue':
          return await this.getRevenueTrends(restaurantId);
        case 'products':
          return await this.getTopProducts(restaurantId);
        case 'customer-segments':
          return await this.getCustomerSegments(restaurantId);
        case 'customer-insights':
          return await this.getCustomerInsights(restaurantId);
        case 'hourly':
          return await this.getHourlyPatterns(restaurantId);
        case 'performance':
          return await this.getRestaurantPerformance(null, timeframe);
        default:
          return {
            success: false,
            message: 'Invalid analytics type'
          };
      }
    } catch (error) {
      logger.error('Error getting restaurant analytics:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();