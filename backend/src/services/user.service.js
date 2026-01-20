const db = require('../config/database');
const bcrypt = require('bcryptjs');

class UserService {
  async getUserById(userId) {
    const result = await db.query(
      `SELECT id, email, full_name, phone, role, avatar_url, is_verified, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    
    return result.rows[0];
  }
  
  async updateUser(userId, updateData) {
    const allowedFields = ['full_name', 'phone', 'avatar_url'];
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    Object.keys(updateData).forEach(key => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(snakeKey) && updateData[key] !== undefined) {
        fields.push(`${snakeKey} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);
    
    const query = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, email, full_name, phone, role, avatar_url, is_verified, created_at, updated_at
    `;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    
    return result.rows[0];
  }
  
  async changePassword(userId, currentPassword, newPassword) {
    // Get user with password hash
    const userResult = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    
    const user = userResult.rows[0];
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 400;
      throw error;
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );
  }
  
  async updateNotificationPreferences(userId, preferences) {
    // Check if preferences exist
    const checkResult = await db.query(
      'SELECT id FROM notification_preferences WHERE user_id = $1',
      [userId]
    );
    
    let result;
    
    if (checkResult.rows.length === 0) {
      // Insert new preferences
      result = await db.query(
        `INSERT INTO notification_preferences 
         (user_id, email_orders, email_marketing, push_notifications, sms_alerts)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          userId,
          preferences.emailOrders ?? true,
          preferences.emailMarketing ?? false,
          preferences.pushNotifications ?? true,
          preferences.smsAlerts ?? true
        ]
      );
    } else {
      // Update existing preferences
      const fields = [];
      const values = [];
      let paramCount = 1;
      
      const fieldMap = {
        emailOrders: 'email_orders',
        emailMarketing: 'email_marketing',
        pushNotifications: 'push_notifications',
        smsAlerts: 'sms_alerts'
      };
      
      Object.keys(preferences).forEach(key => {
        if (fieldMap[key] !== undefined) {
          fields.push(`${fieldMap[key]} = $${paramCount}`);
          values.push(preferences[key]);
          paramCount++;
        }
      });
      
      if (fields.length === 0) {
        throw new Error('No valid preferences to update');
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(userId);
      
      result = await db.query(
        `UPDATE notification_preferences 
         SET ${fields.join(', ')} 
         WHERE user_id = $${paramCount}
         RETURNING *`,
        values
      );
    }
    
    return result.rows[0];
  }
  
  async getNotificationPreferences(userId) {
    const result = await db.query(
      'SELECT * FROM notification_preferences WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      // Return default preferences
      return {
        email_orders: true,
        email_marketing: false,
        push_notifications: true,
        sms_alerts: true
      };
    }
    
    return result.rows[0];
  }

  async getAccountStats(userId) {
    // Get user creation date
    const userResult = await db.query(
      'SELECT created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    // Get total restaurants count
    const restaurantsResult = await db.query(
      'SELECT COUNT(*) as count FROM restaurants WHERE owner_id = $1',
      [userId]
    );

    // Get total orders count
    const ordersResult = await db.query(
      `SELECT COUNT(*) as count FROM orders o
       INNER JOIN restaurants r ON o.restaurant_id = r.id
       WHERE r.owner_id = $1`,
      [userId]
    );

    return {
      memberSince: userResult.rows[0].created_at,
      totalRestaurants: parseInt(restaurantsResult.rows[0].count),
      totalOrders: parseInt(ordersResult.rows[0].count),
      accountStatus: 'active'
    };
  }

  async getUserSettings(userId) {
    const result = await db.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Return default settings
      return {
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        currency: 'INR',
        autoSave: true,
        compactMode: false,
        showTips: true,
        analyticsTracking: true,
        marketingEmails: false,
        systemNotifications: true
      };
    }

    return result.rows[0];
  }

  async updateUserSettings(userId, settings) {
    // Check if settings exist
    const checkResult = await db.query(
      'SELECT id FROM user_settings WHERE user_id = $1',
      [userId]
    );

    let result;

    if (checkResult.rows.length === 0) {
      // Insert new settings
      result = await db.query(
        `INSERT INTO user_settings 
         (user_id, language, timezone, date_format, currency, auto_save, compact_mode, 
          show_tips, analytics_tracking, marketing_emails, system_notifications)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          userId,
          settings.language || 'en',
          settings.timezone || 'America/New_York',
          settings.dateFormat || 'MM/DD/YYYY',
          settings.currency || 'INR',
          settings.autoSave !== undefined ? settings.autoSave : true,
          settings.compactMode !== undefined ? settings.compactMode : false,
          settings.showTips !== undefined ? settings.showTips : true,
          settings.analyticsTracking !== undefined ? settings.analyticsTracking : true,
          settings.marketingEmails !== undefined ? settings.marketingEmails : false,
          settings.systemNotifications !== undefined ? settings.systemNotifications : true
        ]
      );
    } else {
      // Update existing settings
      const fields = [];
      const values = [];
      let paramCount = 1;

      const fieldMap = {
        language: 'language',
        timezone: 'timezone',
        dateFormat: 'date_format',
        currency: 'currency',
        autoSave: 'auto_save',
        compactMode: 'compact_mode',
        showTips: 'show_tips',
        analyticsTracking: 'analytics_tracking',
        marketingEmails: 'marketing_emails',
        systemNotifications: 'system_notifications'
      };

      Object.keys(settings).forEach(key => {
        if (fieldMap[key] !== undefined) {
          fields.push(`${fieldMap[key]} = $${paramCount}`);
          values.push(settings[key]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        throw new Error('No valid settings to update');
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(userId);

      result = await db.query(
        `UPDATE user_settings 
         SET ${fields.join(', ')} 
         WHERE user_id = $${paramCount}
         RETURNING *`,
        values
      );
    }

    return result.rows[0];
  }
}

module.exports = new UserService();
