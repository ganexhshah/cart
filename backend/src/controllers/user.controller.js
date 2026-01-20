const userService = require('../services/user.service');

class UserController {
  async getProfile(req, res, next) {
    try {
      const user = await userService.getUserById(req.user.userId);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateUser(req.user.userId, req.body);
      
      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateAvatar(req, res, next) {
    try {
      const { avatarUrl } = req.body;
      
      const user = await userService.updateUser(req.user.userId, { avatarUrl });
      
      res.json({
        success: true,
        data: user,
        message: 'Avatar updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      await userService.changePassword(req.user.userId, currentPassword, newPassword);
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateNotificationPreferences(req, res, next) {
    try {
      const preferences = await userService.updateNotificationPreferences(
        req.user.userId,
        req.body
      );
      
      res.json({
        success: true,
        data: preferences,
        message: 'Notification preferences updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getNotificationPreferences(req, res, next) {
    try {
      const preferences = await userService.getNotificationPreferences(req.user.userId);
      
      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      next(error);
    }
  }

  async getAccountStats(req, res, next) {
    try {
      const stats = await userService.getAccountStats(req.user.userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getSettings(req, res, next) {
    try {
      const settings = await userService.getUserSettings(req.user.userId);
      
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const settings = await userService.updateUserSettings(req.user.userId, req.body);
      
      res.json({
        success: true,
        data: settings,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
