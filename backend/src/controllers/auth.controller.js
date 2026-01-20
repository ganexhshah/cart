const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
const db = require('../config/database');

class AuthController {
  // Send OTP
  async sendOTP(req, res, next) {
    try {
      const { email, phone } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      const result = await authService.sendOTP(email, phone, 'login');
      
      res.json({
        success: true,
        data: result,
        message: 'OTP sent successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify OTP and Login/Register
  async verifyOTP(req, res, next) {
    try {
      const { email, otpCode, userData } = req.body;
      
      if (!email || !otpCode) {
        return res.status(400).json({
          success: false,
          error: 'Email and OTP are required'
        });
      }

      const result = await authService.verifyOTPAndAuth(email, otpCode, userData);
      
      // Check if it's a new user that needs registration
      if (result.requiresRegistration) {
        return res.status(200).json({
          success: true,
          data: {
            isNewUser: true,
            requiresRegistration: true,
            email: result.email
          },
          message: 'Please complete your registration'
        });
      }

      // Send welcome email for new users (don't wait)
      if (result.isNewUser) {
        emailService.sendWelcomeEmail(result.user).catch(err => 
          console.error('Failed to send welcome email:', err)
        );
      }
      
      res.json({
        success: true,
        data: result,
        message: result.isNewUser ? 'Account created successfully' : 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  }

  // Legacy password-based registration
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      
      // Send welcome email (don't wait for it)
      emailService.sendWelcomeEmail(user).catch(err => 
        console.error('Failed to send welcome email:', err)
      );
      
      res.status(201).json({
        success: true,
        data: user,
        message: 'User registered successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Legacy password-based login
  async login(req, res, next) {
    try {
      const { email, password, staffId } = req.body;
      const result = await authService.login(email, password, staffId);
      
      res.json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getMe(req, res, next) {
    try {
      const userId = req.user.userId;
      const result = await db.query(
        `SELECT id, email, full_name, phone, role, avatar_url, is_verified, created_at 
         FROM users WHERE id = $1`,
        [userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
  
  async logout(req, res, next) {
    try {
      // In a production app, you might want to blacklist the token
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }

  // Force refresh user token with updated role from database
  async forceRefresh(req, res, next) {
    try {
      const userId = req.user.userId;
      
      // Get fresh user data from database
      const result = await db.query(
        `SELECT id, email, full_name, phone, role, avatar_url, is_verified, primary_restaurant_id, created_at 
         FROM users WHERE id = $1`,
        [userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      const user = result.rows[0];
      
      // Generate new token with fresh role data
      const authService = require('../services/auth.service');
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        restaurantId: user.primary_restaurant_id
      };
      
      const accessToken = authService.generateAccessToken(tokenPayload);
      const refreshToken = authService.generateRefreshToken(tokenPayload);
      
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            phone: user.phone,
            role: user.role,
            avatarUrl: user.avatar_url,
            primaryRestaurantId: user.primary_restaurant_id,
            isVerified: user.is_verified
          },
          accessToken,
          refreshToken
        },
        message: 'Token refreshed with updated role'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
