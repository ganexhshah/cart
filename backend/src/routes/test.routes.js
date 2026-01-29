const express = require('express');
const router = express.Router();
const emailService = require('../services/email.service');

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Test staff welcome email
    await emailService.sendStaffWelcomeEmail({
      email,
      name: 'Test User',
      password: 'TestPass123',
      staffNumber: 'S001',
      role: 'waiter',
      restaurant: 'Test Restaurant',
      restaurantAddress: '123 Test Street',
      restaurantPhone: '+1234567890'
    });

    res.json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;