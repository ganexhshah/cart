const transporter = require('../config/email');
const logger = require('../utils/logger');

class EmailService {
  async sendEmail({ to, subject, html, text }) {
    try {
      console.log('Attempting to send email to:', to);
      console.log('Email subject:', subject);
      
      const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to,
        subject,
        html,
        text
      };

      console.log('Mail options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully: ${info.messageId}`);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Email sending failed:', error);
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Restaurant Management System!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.fullName}!</h2>
            <p>Thank you for registering with us. Your account has been successfully created.</p>
            <p>You can now:</p>
            <ul>
              <li>Browse restaurant menus</li>
              <li>Place orders online</li>
              <li>Track your orders in real-time</li>
              <li>Leave reviews and ratings</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/auth/login" class="button">Login to Your Account</a>
            <p>If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Restaurant Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to Restaurant Management System',
      html,
      text: `Welcome ${user.fullName}! Your account has been successfully created.`
    });
  }

  async sendOrderConfirmation(order, user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .order-item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-size: 18px; font-weight: bold; margin-top: 15px; }
          .button { display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Thank you for your order, ${user.fullName}!</h2>
            <p>Your order has been confirmed and is being prepared.</p>
            
            <div class="order-details">
              <h3>Order #${order.order_number}</h3>
              <p><strong>Order Type:</strong> ${order.order_type}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              
              <h4>Items:</h4>
              ${order.items.map(item => `
                <div class="order-item">
                  <strong>${item.name}</strong> x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}
                </div>
              `).join('')}
              
              <div class="total">
                <p>Subtotal: $${order.subtotal}</p>
                <p>Tax: $${order.tax}</p>
                <p>Total: $${order.total}</p>
              </div>
            </div>
            
            <a href="${process.env.FRONTEND_URL}/order/${order.id}" class="button">Track Your Order</a>
            
            <p>You will receive updates as your order progresses.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Restaurant Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `Order Confirmation - ${order.order_number}`,
      html,
      text: `Your order ${order.order_number} has been confirmed. Total: $${order.total}`
    });
  }

  async sendOrderStatusUpdate(order, user, newStatus) {
    const statusMessages = {
      confirmed: 'Your order has been confirmed',
      preparing: 'Your order is being prepared',
      ready: 'Your order is ready for pickup/delivery',
      served: 'Your order has been served',
      completed: 'Your order has been completed'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status-badge { display: inline-block; padding: 8px 16px; background: #3B82F6; color: white; border-radius: 20px; margin: 10px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Status Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.fullName}!</h2>
            <p>${statusMessages[newStatus] || 'Your order status has been updated'}</p>
            
            <div class="status-badge">${newStatus.toUpperCase()}</div>
            
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            
            <a href="${process.env.FRONTEND_URL}/order/${order.id}" class="button">View Order Details</a>
          </div>
          <div class="footer">
            <p>&copy; 2025 Restaurant Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `Order Update - ${order.order_number}`,
      html,
      text: `Order ${order.order_number} status: ${newStatus}`
    });
  }

  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.fullName}!</h2>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <div class="warning">
              <p><strong>Security Notice:</strong></p>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Restaurant Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html,
      text: `Reset your password: ${resetUrl}`
    });
  }

  async sendStaffWelcome(staff, user, restaurant) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .info-box { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to the Team!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.fullName}!</h2>
            <p>You have been added as a staff member at <strong>${restaurant.name}</strong>.</p>
            
            <div class="info-box">
              <h3>Your Details:</h3>
              <p><strong>Staff Number:</strong> ${staff.staff_number}</p>
              <p><strong>Role:</strong> ${staff.role}</p>
              <p><strong>Shift:</strong> ${staff.shift}</p>
              <p><strong>Join Date:</strong> ${new Date(staff.join_date).toLocaleDateString()}</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL}/waiter" class="button">Access Staff Portal</a>
            
            <p>Please contact your manager if you have any questions.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Restaurant Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `Welcome to ${restaurant.name}`,
      html,
      text: `You have been added as ${staff.role} at ${restaurant.name}`
    });
  }

  async sendStaffWelcomeEmail(staffData) {
    const { email, name, password, staffNumber, role, restaurant, restaurantAddress, restaurantPhone } = staffData;
    
    console.log('Attempting to send staff welcome email to:', email);
    console.log('Staff data:', { name, staffNumber, role, restaurant });
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .info-box { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; border: 1px solid #e5e7eb; }
          .credentials-box { background: #FEF3C7; padding: 20px; margin: 20px 0; border-radius: 5px; border: 1px solid #F59E0B; }
          .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to the Team!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>You have been added as a staff member at <strong>${restaurant}</strong>. We're excited to have you join our team!</p>
            
            <div class="info-box">
              <h3>Restaurant Information:</h3>
              <p><strong>Restaurant:</strong> ${restaurant}</p>
              <p><strong>Address:</strong> ${restaurantAddress}</p>
              <p><strong>Phone:</strong> ${restaurantPhone}</p>
            </div>

            <div class="info-box">
              <h3>Your Staff Details:</h3>
              <p><strong>Staff Number:</strong> ${staffNumber}</p>
              <p><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
              <p><strong>Email:</strong> ${email}</p>
            </div>
            
            <div class="credentials-box">
              <h3>🔐 Your Login Credentials</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</code></p>
              <p style="margin-top: 15px; font-size: 14px; color: #92400E;">
                <strong>Important:</strong> Please change this password after your first login for security.
              </p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/waiter/login" class="button">Login to Staff Portal</a>
            </div>
            
            <div class="warning">
              <p><strong>Security Guidelines:</strong></p>
              <ul>
                <li>Keep your login credentials secure</li>
                <li>Change your password after first login</li>
                <li>Never share your credentials with others</li>
                <li>Contact your manager if you have any issues</li>
              </ul>
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact your manager or the restaurant directly.</p>
            
            <p>Welcome aboard!</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 ${restaurant}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const result = await this.sendEmail({
        to: email,
        subject: `Welcome to ${restaurant} - Your Staff Account Details`,
        html,
        text: `Welcome to ${restaurant}! Your staff account has been created. Email: ${email}, Temporary Password: ${password}. Please login at ${process.env.FRONTEND_URL}/waiter/login and change your password.`
      });
      
      console.log('Staff welcome email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending staff welcome email:', error);
      throw error;
    }
  }
  async sendOTPEmail(email, otpCode, purpose = 'login') {
    const purposeText = {
      login: 'Login',
      register: 'Registration',
      verify: 'Verification'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; text-align: center; }
          .otp-box { background: white; padding: 30px; margin: 30px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .otp-code { font-size: 48px; font-weight: bold; color: #4F46E5; letter-spacing: 10px; margin: 20px 0; }
          .warning { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; text-align: left; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your One-Time Password</h1>
          </div>
          <div class="content">
            <h2>${purposeText[purpose] || 'Authentication'} OTP</h2>
            <p>Use this code to complete your ${(purposeText[purpose] || 'authentication').toLowerCase()}:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otpCode}</div>
              <p style="color: #666; margin: 0;">Valid for 10 minutes</p>
            </div>
            
            <div class="warning">
              <p><strong>Security Notice:</strong></p>
              <ul style="margin: 10px 0;">
                <li>Never share this OTP with anyone</li>
                <li>This code expires in 10 minutes</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 Restaurant Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Your OTP for ${purposeText[purpose] || 'Authentication'} - ${otpCode}`,
      html,
      text: `Your OTP is: ${otpCode}. Valid for 10 minutes.`
    });
  }
}

module.exports = new EmailService();
