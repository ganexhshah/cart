const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development - limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Increased limit for development - limit each IP to 20 login requests per windowMs
  message: {
    success: false,
    error: 'Too many login attempts, please try again later'
  },
  skipSuccessfulRequests: true,
});

const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // Increased limit for development - limit each IP to 50 orders per minute
  message: {
    success: false,
    error: 'Too many orders, please slow down'
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  orderLimiter
};
