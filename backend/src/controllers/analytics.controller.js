const analyticsService = require('../services/analytics.service');
const logger = require('../utils/logger');

class AnalyticsController {
  // Get overview statistics
  async getOverviewStats(req, res) {
    try {
      const { timeframe = '30days' } = req.query;
      
      const result = await analyticsService.getMyRestaurantAnalytics('overview', timeframe);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in getOverviewStats controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch overview statistics',
        error: error.message
      });
    }
  }

  // Get revenue trends
  async getRevenueTrends(req, res) {
    try {
      const { months = 6 } = req.query;
      
      const result = await analyticsService.getMyRestaurantAnalytics('revenue', months);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in getRevenueTrends controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch revenue trends',
        error: error.message
      });
    }
  }

  // Get top performing products
  async getTopProducts(req, res) {
    try {
      const { limit = 10, timeframe = '30days' } = req.query;
      
      const result = await analyticsService.getMyRestaurantAnalytics('products', timeframe);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in getTopProducts controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch top products',
        error: error.message
      });
    }
  }

  // Get customer segments
  async getCustomerSegments(req, res) {
    try {
      const result = await analyticsService.getMyRestaurantAnalytics('customer-segments');

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in getCustomerSegments controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer segments',
        error: error.message
      });
    }
  }

  // Get customer insights
  async getCustomerInsights(req, res) {
    try {
      const result = await analyticsService.getMyRestaurantAnalytics('customer-insights');

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in getCustomerInsights controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer insights',
        error: error.message
      });
    }
  }

  // Get hourly order patterns
  async getHourlyPatterns(req, res) {
    try {
      const { date } = req.query;
      
      const result = await analyticsService.getMyRestaurantAnalytics('hourly', date);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in getHourlyPatterns controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch hourly patterns',
        error: error.message
      });
    }
  }

  // Get restaurant performance comparison
  async getRestaurantPerformance(req, res) {
    try {
      const { timeframe = '30days' } = req.query;
      
      const result = await analyticsService.getMyRestaurantAnalytics('performance', timeframe);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in getRestaurantPerformance controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch restaurant performance',
        error: error.message
      });
    }
  }

  // Get comprehensive analytics dashboard data
  async getDashboardData(req, res) {
    try {
      const { timeframe = '30days' } = req.query;

      // Fetch all analytics data in parallel
      const [
        overviewStats,
        revenueTrends,
        topProducts,
        customerSegments,
        customerInsights,
        hourlyPatterns,
        restaurantPerformance
      ] = await Promise.all([
        analyticsService.getMyRestaurantAnalytics('overview', timeframe),
        analyticsService.getMyRestaurantAnalytics('revenue'),
        analyticsService.getMyRestaurantAnalytics('products', timeframe),
        analyticsService.getMyRestaurantAnalytics('customer-segments'),
        analyticsService.getMyRestaurantAnalytics('customer-insights'),
        analyticsService.getMyRestaurantAnalytics('hourly'),
        analyticsService.getMyRestaurantAnalytics('performance', timeframe)
      ]);

      res.json({
        success: true,
        data: {
          overview: overviewStats.success ? overviewStats.data : null,
          revenue: revenueTrends.success ? revenueTrends.data : [],
          products: topProducts.success ? topProducts.data : [],
          customerSegments: customerSegments.success ? customerSegments.data : [],
          customerInsights: customerInsights.success ? customerInsights.data : null,
          hourlyPatterns: hourlyPatterns.success ? hourlyPatterns.data : [],
          restaurantPerformance: restaurantPerformance.success ? restaurantPerformance.data : []
        }
      });
    } catch (error) {
      logger.error('Error in getDashboardData controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data',
        error: error.message
      });
    }
  }

  // Export analytics report
  async exportReport(req, res) {
    try {
      const { timeframe = '30days', format = 'json' } = req.query;

      // Get comprehensive data
      const dashboardData = await this.getDashboardData(req, res);
      
      if (format === 'csv') {
        // TODO: Implement CSV export
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=analytics-report.csv');
        res.send('CSV export not implemented yet');
      } else {
        // Return JSON format
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=analytics-report.json');
        return dashboardData;
      }
    } catch (error) {
      logger.error('Error in exportReport controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export report',
        error: error.message
      });
    }
  }
}

module.exports = new AnalyticsController();