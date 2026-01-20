const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

function initializeSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST']
    }
  });
  
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.userId} (${socket.user.role})`);
    
    // Join user-specific room
    socket.join(`user:${socket.user.userId}`);
    
    // Join role-specific room
    socket.join(`${socket.user.role}:${socket.user.userId}`);
    
    // Handle restaurant room joining
    socket.on('join:restaurant', (restaurantId) => {
      socket.join(`restaurant:${restaurantId}`);
      socket.join(`kitchen:${restaurantId}`);
      logger.info(`User ${socket.user.userId} joined restaurant ${restaurantId}`);
    });
    
    // Handle table room joining
    socket.on('join:table', (tableId) => {
      socket.join(`table:${tableId}`);
      logger.info(`User ${socket.user.userId} joined table ${tableId}`);
    });
    
    // Order events
    socket.on('order:created', (data) => {
      io.to(`restaurant:${data.restaurantId}`).emit('order:new', data);
      io.to(`kitchen:${data.restaurantId}`).emit('kot:new', data);
      logger.info(`Order created: ${data.orderId}`);
    });
    
    socket.on('order:status-updated', (data) => {
      if (data.customerId) {
        io.to(`user:${data.customerId}`).emit('order:update', data);
      }
      if (data.waiterId) {
        io.to(`user:${data.waiterId}`).emit('order:update', data);
      }
      io.to(`restaurant:${data.restaurantId}`).emit('order:update', data);
      logger.info(`Order status updated: ${data.orderId} -> ${data.status}`);
    });
    
    // KOT events
    socket.on('kot:status-updated', (data) => {
      io.to(`restaurant:${data.restaurantId}`).emit('kot:update', data);
      io.to(`kitchen:${data.restaurantId}`).emit('kot:update', data);
      logger.info(`KOT status updated: ${data.kotId} -> ${data.status}`);
    });
    
    // Table events
    socket.on('table:status-changed', (data) => {
      io.to(`restaurant:${data.restaurantId}`).emit('table:update', data);
      io.to(`table:${data.tableId}`).emit('table:update', data);
      logger.info(`Table status changed: ${data.tableId} -> ${data.status}`);
    });
    
    // Notification events
    socket.on('notification:send', (data) => {
      io.to(`user:${data.userId}`).emit('notification:new', data);
      logger.info(`Notification sent to user: ${data.userId}`);
    });
    
    // Staff events
    socket.on('staff:clock-in', (data) => {
      io.to(`restaurant:${data.restaurantId}`).emit('staff:attendance', data);
      logger.info(`Staff clocked in: ${data.staffId}`);
    });
    
    socket.on('staff:clock-out', (data) => {
      io.to(`restaurant:${data.restaurantId}`).emit('staff:attendance', data);
      logger.info(`Staff clocked out: ${data.staffId}`);
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.userId}`);
    });
  });
  
  return io;
}

module.exports = initializeSocket;
