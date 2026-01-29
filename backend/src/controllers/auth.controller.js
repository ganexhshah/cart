const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
const db = require('../config/database');
const passport = require('../config/passport');
const bcrypt = require('bcrypt');

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

  // Waiter login with staff authentication
  async waiterLogin(req, res, next) {
    try {
      const { email, password, staffId } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Get user
      const userResult = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      const user = userResult.rows[0];

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Get staff information
      let staffQuery = `
        SELECT s.*, r.name as restaurant_name, r.address as restaurant_address,
               r.phone as restaurant_phone, r.slug as restaurant_slug
        FROM staff s
        LEFT JOIN restaurants r ON s.restaurant_id = r.id
        WHERE s.user_id = $1 AND s.status = 'active'
      `;
      let staffParams = [user.id];

      // If staffId is provided, filter by it
      if (staffId) {
        staffQuery += ' AND s.id = $2';
        staffParams.push(staffId);
      }

      const staffResult = await db.query(staffQuery, staffParams);

      if (staffResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'No active staff record found'
        });
      }

      // If multiple staff records and no staffId provided, return error
      if (staffResult.rows.length > 1 && !staffId) {
        return res.status(400).json({
          success: false,
          error: 'Multiple restaurants found. Please provide staff ID.',
          data: {
            staffOptions: staffResult.rows.map(staff => ({
              staffId: staff.id,
              restaurantName: staff.restaurant_name,
              role: staff.role
            }))
          }
        });
      }

      const staff = staffResult.rows[0];

      // Generate tokens with staff role and restaurant
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: staff.role,
        restaurantId: staff.restaurant_id,
        staffId: staff.id
      };

      const accessToken = authService.generateAccessToken(tokenPayload);
      const refreshToken = authService.generateRefreshToken(tokenPayload);

      // Update last login
      await db.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            phone: user.phone,
            role: staff.role,
            avatarUrl: user.avatar_url,
            staffId: staff.id,
            staffNumber: staff.staff_number
          },
          restaurant: {
            id: staff.restaurant_id,
            name: staff.restaurant_name,
            address: staff.restaurant_address,
            phone: staff.restaurant_phone,
            slug: staff.restaurant_slug
          },
          accessToken,
          refreshToken
        },
        message: 'Waiter login successful'
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

  // Google OAuth routes
  async googleAuth(req, res, next) {
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  }

  async googleCallback(req, res, next) {
    passport.authenticate('google', { session: false }, async (err, user) => {
      if (err) {
        console.error('Google OAuth error:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=oauth_error`);
      }

      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=oauth_failed`);
      }

      try {
        // Generate JWT tokens
        const tokenPayload = {
          id: user.id,
          email: user.email,
          role: user.role,
          restaurantId: user.primary_restaurant_id
        };

        const accessToken = authService.generateAccessToken(tokenPayload);
        const refreshToken = authService.generateRefreshToken(tokenPayload);

        // Check if user needs onboarding (new user without restaurant)
        const needsOnboarding = user.role === 'customer' && !user.primary_restaurant_id;

        // Redirect to frontend with tokens
        const redirectUrl = needsOnboarding 
          ? `${process.env.FRONTEND_URL}/onboarding?token=${accessToken}&refresh=${refreshToken}`
          : user.role === 'owner' 
            ? `${process.env.FRONTEND_URL}/dashboard?token=${accessToken}&refresh=${refreshToken}`
            : user.role === 'waiter'
              ? `${process.env.FRONTEND_URL}/waiter?token=${accessToken}&refresh=${refreshToken}`
              : `${process.env.FRONTEND_URL}/menu?token=${accessToken}&refresh=${refreshToken}`;

        res.redirect(redirectUrl);
      } catch (error) {
        console.error('Token generation error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=token_error`);
      }
    })(req, res, next);
  }
}

module.exports = new AuthController();
