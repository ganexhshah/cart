require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const session = require('express-session');
const passport = require('./config/passport');
const http = require('http');
const authRoutes = require('./routes/auth.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const orderRoutes = require('./routes/order.routes');
const uploadRoutes = require('./routes/upload.routes');
const userRoutes = require('./routes/user.routes');
const securityRoutes = require('./routes/security.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const menuRoutes = require('./routes/menu.routes');
const tableRoutes = require('./routes/table.routes');
const staffRoutes = require('./routes/staff.routes');
const customerRoutes = require('./routes/customer.routes');
const kotRoutes = require('./routes/kot.routes');
const posRoutes = require('./routes/pos.routes');
const reviewRoutes = require('./routes/review.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const purchaseRoutes = require('./routes/purchase.routes');

const { errorHandler, notFound } = require('./middleware/error.middleware');
const { generalLimiter } = require('./middleware/rateLimit.middleware');
const initializeSocket = require('./websocket/socket');
const logger = require('./utils/logger');
const app = express();
const server = http.createServer(app);
// Initialize WebSocket
const io = initializeSocket(server);
app.set('io', io);
// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// General middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Rate limiting - disabled for development
// app.use('/api/', generalLimiter);
// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
// API Routes
app.use('/api/auth', authRoutes);

// Direct Google OAuth routes (not under /api prefix to match Google Cloud Console config)
app.get('/auth/google', (req, res, next) => {
  const authController = require('./controllers/auth.controller');
  authController.googleAuth(req, res, next);
});

app.get('/auth/google/callback', (req, res, next) => {
  const authController = require('./controllers/auth.controller');
  authController.googleCallback(req, res, next);
});

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/kot', kotRoutes);

// Test routes (only in development)
if (process.env.NODE_ENV !== 'production') {
  const testRoutes = require('./routes/test.routes');
  app.use('/api/test', testRoutes);
}
app.use('/api/pos', posRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchases', purchaseRoutes);

// 404 handler
app.use(notFound);
// Error handling
app.use(errorHandler);
// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
module.exports = app;
