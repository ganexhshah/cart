const db = require('../config/database');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const UAParser = require('ua-parser-js');

class SecurityService {
  // Two-Factor Authentication
  async enable2FA(userId, userEmail) {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Restaurant App (${userEmail})`,
      length: 32
    });

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(10);

    // Store in database
    const result = await db.query(
      `INSERT INTO two_factor_auth (user_id, secret, is_enabled, backup_codes)
       VALUES ($1, $2, false, $3)
       ON CONFLICT (user_id) 
       DO UPDATE SET secret = $2, backup_codes = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, secret.base32, backupCodes]
    );

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: backupCodes
    };
  }

  async verify2FASetup(userId, token) {
    // Get secret from database
    const result = await db.query(
      'SELECT secret FROM two_factor_auth WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      const error = new Error('2FA not set up');
      error.statusCode = 400;
      throw error;
    }

    const secret = result.rows[0].secret;

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      const error = new Error('Invalid verification code');
      error.statusCode = 400;
      throw error;
    }

    // Enable 2FA
    await db.query(
      'UPDATE two_factor_auth SET is_enabled = true, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1',
      [userId]
    );

    return { success: true };
  }

  async disable2FA(userId) {
    await db.query(
      'UPDATE two_factor_auth SET is_enabled = false, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1',
      [userId]
    );

    return { success: true };
  }

  async verify2FAToken(userId, token) {
    const result = await db.query(
      'SELECT secret, backup_codes FROM two_factor_auth WHERE user_id = $1 AND is_enabled = true',
      [userId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const { secret, backup_codes } = result.rows[0];

    // Try to verify with TOTP
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (verified) {
      return true;
    }

    // Try backup codes
    if (backup_codes && backup_codes.includes(token)) {
      // Remove used backup code
      const updatedCodes = backup_codes.filter(code => code !== token);
      await db.query(
        'UPDATE two_factor_auth SET backup_codes = $1 WHERE user_id = $2',
        [updatedCodes, userId]
      );
      return true;
    }

    return false;
  }

  async get2FAStatus(userId) {
    const result = await db.query(
      'SELECT is_enabled FROM two_factor_auth WHERE user_id = $1',
      [userId]
    );

    return {
      enabled: result.rows.length > 0 ? result.rows[0].is_enabled : false
    };
  }

  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Login History
  async logLogin(userId, req, status, failureReason = null) {
    const parser = new UAParser(req.headers['user-agent']);
    const result = parser.getResult();

    const ipAddress = req.ip || req.connection.remoteAddress;
    const device = result.device.type || 'desktop';
    const browser = `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim();
    const os = `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim();

    await db.query(
      `INSERT INTO login_history 
       (user_id, ip_address, user_agent, device, browser, os, status, failure_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, ipAddress, req.headers['user-agent'], device, browser, os, status, failureReason]
    );
  }

  async getLoginHistory(userId, limit = 20) {
    const result = await db.query(
      `SELECT id, ip_address, device, browser, os, location, status, failure_reason, created_at
       FROM login_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  async getRecentFailedLogins(userId, hours = 24) {
    const result = await db.query(
      `SELECT COUNT(*) as count
       FROM login_history
       WHERE user_id = $1 
       AND status = 'failed'
       AND created_at > NOW() - INTERVAL '${hours} hours'`,
      [userId]
    );

    return parseInt(result.rows[0].count);
  }
}

module.exports = new SecurityService();
