const db = require('../config/database');
const logger = require('../utils/logger');

class SubscriptionService {
  // Get all available subscription plans
  async getPlans() {
    try {
      const result = await db.query(
        `SELECT plan_id, name, description, price, interval, features, max_restaurants, is_active
         FROM subscription_plans
         WHERE is_active = true
         ORDER BY price ASC`
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  // Get user's current subscription
  async getUserSubscription(userId) {
    try {
      const result = await db.query(
        `SELECT us.*, sp.name as plan_name, sp.price, sp.interval, sp.features, sp.max_restaurants
         FROM user_subscriptions us
         JOIN subscription_plans sp ON us.plan_id = sp.plan_id
         WHERE us.user_id = $1`,
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching user subscription:', error);
      throw error;
    }
  }

  // Create or update user subscription
  async createOrUpdateSubscription(userId, planId) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Check if plan exists
      const planResult = await client.query(
        'SELECT * FROM subscription_plans WHERE plan_id = $1 AND is_active = true',
        [planId]
      );

      if (planResult.rows.length === 0) {
        throw new Error('Invalid subscription plan');
      }

      const plan = planResult.rows[0];
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1); // Add 1 month

      // Check if user already has a subscription
      const existingSubResult = await client.query(
        'SELECT * FROM user_subscriptions WHERE user_id = $1',
        [userId]
      );

      let subscription;
      if (existingSubResult.rows.length > 0) {
        // Update existing subscription
        const updateResult = await client.query(
          `UPDATE user_subscriptions 
           SET plan_id = $1, 
               status = 'active',
               current_period_start = $2,
               current_period_end = $3,
               cancel_at_period_end = false,
               cancelled_at = NULL,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $4
           RETURNING *`,
          [planId, now, periodEnd, userId]
        );
        subscription = updateResult.rows[0];
      } else {
        // Create new subscription
        const insertResult = await client.query(
          `INSERT INTO user_subscriptions 
           (user_id, plan_id, status, current_period_start, current_period_end)
           VALUES ($1, $2, 'active', $3, $4)
           RETURNING *`,
          [userId, planId, now, periodEnd]
        );
        subscription = insertResult.rows[0];
      }

      // Create billing record
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      await client.query(
        `INSERT INTO billing_history 
         (user_id, subscription_id, invoice_number, description, amount, status, payment_date)
         VALUES ($1, $2, $3, $4, $5, 'paid', CURRENT_TIMESTAMP)`,
        [
          userId,
          subscription.id,
          invoiceNumber,
          `${plan.name} Plan - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
          plan.price
        ]
      );

      await client.query('COMMIT');

      // Fetch complete subscription details
      return await this.getUserSubscription(userId);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating/updating subscription:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Cancel subscription
  async cancelSubscription(userId, immediate = false) {
    try {
      const query = immediate
        ? `UPDATE user_subscriptions 
           SET status = 'cancelled', 
               cancelled_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $1
           RETURNING *`
        : `UPDATE user_subscriptions 
           SET cancel_at_period_end = true,
               cancelled_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $1
           RETURNING *`;

      const result = await db.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  // Get billing history
  async getBillingHistory(userId, limit = 20) {
    try {
      const result = await db.query(
        `SELECT id, invoice_number, description, amount, currency, status, 
                payment_method, payment_date, due_date, created_at
         FROM billing_history
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching billing history:', error);
      throw error;
    }
  }

  // Get payment methods
  async getPaymentMethods(userId) {
    try {
      const result = await db.query(
        `SELECT id, type, last_four, brand, is_default, created_at
         FROM payment_methods
         WHERE user_id = $1
         ORDER BY is_default DESC, created_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  // Add payment method
  async addPaymentMethod(userId, paymentData) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // If this is set as default, unset other defaults
      if (paymentData.isDefault) {
        await client.query(
          'UPDATE payment_methods SET is_default = false WHERE user_id = $1',
          [userId]
        );
      }

      const result = await client.query(
        `INSERT INTO payment_methods (user_id, type, last_four, brand, is_default)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, paymentData.type, paymentData.lastFour, paymentData.brand, paymentData.isDefault || false]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error adding payment method:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete payment method
  async deletePaymentMethod(userId, paymentMethodId) {
    try {
      const result = await db.query(
        'DELETE FROM payment_methods WHERE id = $1 AND user_id = $2 RETURNING *',
        [paymentMethodId, userId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error deleting payment method:', error);
      throw error;
    }
  }

  // Check subscription limits
  async checkSubscriptionLimit(userId, resourceType) {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return { allowed: false, message: 'No active subscription' };
      }

      if (subscription.status !== 'active') {
        return { allowed: false, message: 'Subscription is not active' };
      }

      // Check restaurant limit
      if (resourceType === 'restaurant') {
        if (subscription.max_restaurants === null) {
          return { allowed: true }; // Unlimited
        }

        const countResult = await db.query(
          'SELECT COUNT(*) as count FROM restaurants WHERE owner_id = $1',
          [userId]
        );

        const currentCount = parseInt(countResult.rows[0].count);
        if (currentCount >= subscription.max_restaurants) {
          return { 
            allowed: false, 
            message: `Restaurant limit reached. Upgrade to add more restaurants.`,
            current: currentCount,
            limit: subscription.max_restaurants
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      logger.error('Error checking subscription limit:', error);
      throw error;
    }
  }
}

module.exports = new SubscriptionService();
