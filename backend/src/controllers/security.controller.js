const securityService = require('../services/security.service');

class SecurityController {
  // Two-Factor Authentication
  async enable2FA(req, res, next) {
    try {
      const userId = req.user.userId;
      const userEmail = req.user.email;

      const result = await securityService.enable2FA(userId, userEmail);

      res.json({
        success: true,
        data: result,
        message: 'Scan the QR code with your authenticator app'
      });
    } catch (error) {
      next(error);
    }
  }

  async verify2FASetup(req, res, next) {
    try {
      const userId = req.user.userId;
      const { token } = req.body;

      if (!token) {
        const error = new Error('Verification code is required');
        error.statusCode = 400;
        throw error;
      }

      await securityService.verify2FASetup(userId, token);

      res.json({
        success: true,
        message: 'Two-factor authentication enabled successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async disable2FA(req, res, next) {
    try {
      const userId = req.user.userId;

      await securityService.disable2FA(userId);

      res.json({
        success: true,
        message: 'Two-factor authentication disabled successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async get2FAStatus(req, res, next) {
    try {
      const userId = req.user.userId;

      const status = await securityService.get2FAStatus(userId);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  }

  // Login History
  async getLoginHistory(req, res, next) {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit) || 20;

      const history = await securityService.getLoginHistory(userId, limit);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SecurityController();
