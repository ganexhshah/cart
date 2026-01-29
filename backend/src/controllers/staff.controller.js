const staffService = require('../services/staff.service');

class StaffController {
  // Get all staff members for a restaurant
  async getStaff(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { role, status, shift } = req.query;
      
      const staff = await staffService.getStaff(restaurantId, { role, status, shift });
      
      res.json({
        success: true,
        data: staff
      });
    } catch (error) {
      next(error);
    }
  }

  // Get staff member by ID
  async getStaffById(req, res, next) {
    try {
      const { staffId } = req.params;
      
      const staff = await staffService.getStaffById(staffId);
      
      res.json({
        success: true,
        data: staff
      });
    } catch (error) {
      next(error);
    }
  }

  // Add new staff member
  async addStaff(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const staffData = { ...req.body, restaurantId };
      
      console.log('Adding staff with data:', JSON.stringify(staffData, null, 2));
      console.log('Restaurant ID:', restaurantId);
      
      // Validate required fields
      if (!staffData.name || !staffData.email || !staffData.role) {
        console.log('Missing required fields:', {
          name: !!staffData.name,
          email: !!staffData.email,
          role: !!staffData.role
        });
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: name, email, and role are required'
        });
      }
      
      const staff = await staffService.addStaff(staffData);
      
      console.log('Staff added successfully:', staff.id);
      
      res.status(201).json({
        success: true,
        data: staff,
        message: 'Staff member added successfully'
      });
    } catch (error) {
      console.error('Error adding staff:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to add staff member'
      });
    }
  }

  // Update staff member
  async updateStaff(req, res, next) {
    try {
      const { staffId } = req.params;
      
      const staff = await staffService.updateStaff(staffId, req.body);
      
      res.json({
        success: true,
        data: staff,
        message: 'Staff member updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete staff member
  async deleteStaff(req, res, next) {
    try {
      const { staffId } = req.params;
      
      await staffService.deleteStaff(staffId);
      
      res.json({
        success: true,
        message: 'Staff member removed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get staff attendance
  async getAttendance(req, res, next) {
    try {
      const { staffId } = req.params;
      const { startDate, endDate } = req.query;
      
      const attendance = await staffService.getAttendance(staffId, startDate, endDate);
      
      res.json({
        success: true,
        data: attendance
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark attendance
  async markAttendance(req, res, next) {
    try {
      const { staffId } = req.params;
      const { status, clockIn, clockOut, leaveType, notes } = req.body;
      
      const attendance = await staffService.markAttendance(staffId, {
        status,
        clockIn,
        clockOut,
        leaveType,
        notes
      });
      
      res.json({
        success: true,
        data: attendance,
        message: 'Attendance marked successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Clock in/out
  async clockInOut(req, res, next) {
    try {
      const { staffId } = req.params;
      const { action } = req.body; // 'clock-in' or 'clock-out'
      
      const result = await staffService.clockInOut(staffId, action);
      
      res.json({
        success: true,
        data: result,
        message: `Successfully ${action.replace('-', 'ed ')}`
      });
    } catch (error) {
      next(error);
    }
  }

  // Get staff performance
  async getPerformance(req, res, next) {
    try {
      const { staffId } = req.params;
      const { period } = req.query; // 'week', 'month', 'year'
      
      const performance = await staffService.getPerformance(staffId, period);
      
      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      next(error);
    }
  }

  // Get staff statistics
  async getStats(req, res, next) {
    try {
      const { restaurantId } = req.params;
      
      const stats = await staffService.getStats(restaurantId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Get payroll data
  async getPayroll(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { month, year } = req.query;
      
      const payroll = await staffService.getPayroll(restaurantId, month, year);
      
      res.json({
        success: true,
        data: payroll
      });
    } catch (error) {
      next(error);
    }
  }

  // Change staff password
  async changePassword(req, res, next) {
    try {
      const { staffId } = req.params;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 6 characters long'
        });
      }
      
      const result = await staffService.changePassword(staffId, currentPassword, newPassword);
      
      res.json({
        success: true,
        data: result,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Test email functionality
  async testEmail(req, res, next) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      const result = await staffService.testEmail(email);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // Resend welcome email
  async resendWelcomeEmail(req, res, next) {
    try {
      const { staffId } = req.params;
      
      await staffService.resendWelcomeEmail(staffId);
      
      res.json({
        success: true,
        message: 'Welcome email sent successfully with new login credentials'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StaffController();