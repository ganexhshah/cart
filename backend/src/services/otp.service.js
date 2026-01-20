const db = require('../config/database');
const emailService = require('./email.service');

class OTPService {
  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via email
  async sendOTP(email, phone, purpose = 'login') {
    try {
      // Generate OTP
      const otpCode = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      console.log('Sending OTP:', otpCode, 'to:', email, 'expires:', expiresAt);

      // Save OTP session
      await db.query(
        `INSERT INTO otp_sessions (email, phone, otp_code, purpose, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [email, phone, otpCode, purpose, expiresAt]
      );

      // Send OTP via email
      await emailService.sendOTPEmail(email, otpCode, purpose);

      console.log('OTP sent successfully to:', email);

      return {
        success: true,
        message: 'OTP sent successfully',
        expiresIn: 600 // seconds
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(email, otpCode) {
    try {
      console.log('Verifying OTP for:', email, 'Code:', otpCode);
      
      // Find valid OTP session
      const result = await db.query(
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

      console.log('OTP sessions found:', result.rows.length);

      if (result.rows.length === 0) {
        // Check if OTP exists but expired or already used
        const anyOTP = await db.query(
          `SELECT * FROM otp_sessions 
           WHERE email = $1 AND otp_code = $2 
           ORDER BY created_at DESC LIMIT 1`,
          [email, otpCode]
        );

        if (anyOTP.rows.length > 0) {
          const session = anyOTP.rows[0];
          console.log('OTP found but invalid:', {
            isVerified: session.is_verified,
            expired: new Date(session.expires_at) < new Date(),
            attempts: session.attempts
          });
        } else {
          console.log('No OTP found for this email and code');
        }

        // Increment attempts for any matching session
        await db.query(
          `UPDATE otp_sessions 
           SET attempts = attempts + 1 
           WHERE email = $1 AND otp_code = $2`,
          [email, otpCode]
        );

        const error = new Error('Invalid or expired OTP');
        error.statusCode = 401;
        throw error;
      }

      const session = result.rows[0];
      console.log('Valid OTP session found:', session.id);

      // Mark OTP as verified
      await db.query(
        `UPDATE otp_sessions 
         SET is_verified = true, verified_at = NOW() 
         WHERE id = $1`,
        [session.id]
      );

      return {
        success: true,
        sessionId: session.id,
        purpose: session.purpose
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }

  // Clean up expired OTP sessions (run periodically)
  async cleanupExpiredOTPs() {
    try {
      await db.query(
        `DELETE FROM otp_sessions WHERE expires_at < NOW() - INTERVAL '1 day'`
      );
    } catch (error) {
      console.error('Cleanup OTP error:', error);
    }
  }
}

module.exports = new OTPService();
