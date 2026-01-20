const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const otpService = require('./otp.service');
const securityService = require('./security.service');

class AuthService {
  // Send OTP for login/register
  async sendOTP(email, phone, purpose = 'login') {
    return otpService.sendOTP(email, phone, purpose);
  }

  // Verify OTP and login/register
  async verifyOTPAndAuth(email, otpCode, userData = null) {
    // Check if user exists first
    const existing = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const isNewUser = existing.rows.length === 0;

    // If new user and no userData provided, return early without verifying OTP
    if (isNewUser && !userData) {
      // Just verify OTP is valid without marking as used
      const otpCheck = await db.query(
        `SELECT * FROM otp_sessions 
         WHERE email = $1 
         AND otp_code = $2 
         AND is_verified = false 
         AND expires_at > NOW()
         AND attempts < 5
         ORDER BY created_at DESC 
         LIMIT 1`,
        [email, otpCode]
      );

      if (otpCheck.rows.length === 0) {
        const error = new Error('Invalid or expired OTP');
        error.statusCode = 401;
        throw error;
      }

      return {
        isNewUser: true,
        requiresRegistration: true,
        email: email
      };
    }

    // Now verify OTP properly (will mark as verified)
    const otpResult = await otpService.verifyOTP(email, otpCode);
    
    if (!otpResult.success) {
      const error = new Error('Invalid OTP');
      error.statusCode = 401;
      throw error;
    }

    let user;

    if (isNewUser) {
      // New user - create account
      const { fullName, phone, role = 'owner', restaurantName } = userData;
      
      // Create user
      const result = await db.query(
        `INSERT INTO users (email, full_name, phone, role, is_verified, otp_verified)
         VALUES ($1, $2, $3, $4, true, true)
         RETURNING *`,
        [email, fullName, phone, role]
      );
      
      user = result.rows[0];

      // If restaurant owner, create restaurant
      if (role === 'owner' && restaurantName) {
        const restaurantResult = await db.query(
          `INSERT INTO restaurants (owner_id, name, address, is_active)
           VALUES ($1, $2, $3, true)
           RETURNING id`,
          [user.id, restaurantName, 'To be updated']
        );

        const newRestaurantId = restaurantResult.rows[0].id;

        // Link restaurant to user in DB
        await db.query(
          'UPDATE users SET primary_restaurant_id = $1 WHERE id = $2',
          [newRestaurantId, user.id]
        );

        // Add restaurantId to user object for token generation
        user.restaurantId = newRestaurantId;
      }
    } else {
      // Existing user - login
      user = existing.rows[0];
      
      // Add restaurantId for token generation
      user.restaurantId = user.primary_restaurant_id;
      
      // Update last login
      await db.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );
    }

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId || user.primary_restaurant_id
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    return {
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
      refreshToken,
      isNewUser
    };
  }

  // Legacy password-based methods (keep for backward compatibility)
  async register(userData) {
    const { email, password, fullName, phone, role = 'customer' } = userData;
    
    // Check if user exists
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existing.rows.length > 0) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      throw error;
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await db.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, phone, role, created_at`,
      [email, passwordHash, fullName, phone, role]
    );
    
    return result.rows[0];
  }
  
  async login(email, password, staffId = null) {
    // Get user
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }
    
    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    let finalRole = user.role;
    let restaurantId = user.primary_restaurant_id;

    // If staffId is provided, fetch staff role and restaurant
    if (staffId) {
      const staffResult = await db.query(
        'SELECT role, restaurant_id FROM staff WHERE id = $1 AND user_id = $2',
        [staffId, user.id]
      );

      if (staffResult.rows.length > 0) {
        finalRole = staffResult.rows[0].role;
        restaurantId = staffResult.rows[0].restaurant_id;
      }
    }

    // Generate tokens with the final role
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: finalRole,
      restaurantId: restaurantId
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatar_url
      },
      accessToken,
      refreshToken
    };
  }
  
  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user.id, // Keep userId for backward compatibility in payload
        id: user.id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
  }
  
  generateRefreshToken(user) {
    return jwt.sign(
      { userId: user.id, id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );
  }
  
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [decoded.userId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      const user = result.rows[0];
      const newAccessToken = this.generateAccessToken(user);
      
      return { accessToken: newAccessToken };
    } catch (error) {
      const err = new Error('Invalid refresh token');
      err.statusCode = 401;
      throw err;
    }
  }
}

module.exports = new AuthService();
