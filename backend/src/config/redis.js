const redis = require('redis');

// Redis is optional - gracefully handle when not available
let client = null;
let isConnected = false;

// Only try to connect if REDIS_URL is properly configured
if (process.env.REDIS_URL && process.env.REDIS_URL !== 'redis://localhost:6379') {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL
    });

    client.on('error', () => {
      // Silently handle errors
      isConnected = false;
    });

    client.on('connect', () => {
      console.log('✓ Redis connected');
      isConnected = true;
    });

    client.connect().catch(() => {
      // Silently fail
      isConnected = false;
    });
  } catch (err) {
    // Silently handle initialization errors
    isConnected = false;
  }
}

// Export safe methods that work even if Redis is not available
module.exports = {
  get: async (key) => {
    if (!client || !isConnected) return null;
    try {
      return await client.get(key);
    } catch (err) {
      return null;
    }
  },
  
  set: async (key, value) => {
    if (!client || !isConnected) return;
    try {
      await client.set(key, value);
    } catch (err) {
      // Silently fail
    }
  },
  
  setEx: async (key, seconds, value) => {
    if (!client || !isConnected) return;
    try {
      await client.setEx(key, seconds, value);
    } catch (err) {
      // Silently fail
    }
  },
  
  del: async (key) => {
    if (!client || !isConnected) return;
    try {
      await client.del(key);
    } catch (err) {
      // Silently fail
    }
  }
};
