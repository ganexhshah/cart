const tableService = require('../services/table.service');
const logger = require('../utils/logger');

class TableController {
  // Get tables with filters
  async getTables(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        type: req.query.type,
        location: req.query.location,
        search: req.query.search,
        restaurantId: req.query.restaurantId
      };

      // If no specific restaurant, get all user's tables
      let tables;
      if (!req.query.restaurantId) {
        tables = await tableService.getUserTables(req.user.id, filters);
      } else {
        tables = await tableService.getTables(req.query.restaurantId, filters);
      }

      res.json({
        success: true,
        data: tables
      });
    } catch (error) {
      logger.error('Error in getTables:', error);
      next(error);
    }
  }

  // Get single table
  async getTable(req, res, next) {
    try {
      const { id } = req.params;
      const table = await tableService.getTableById(id);
      
      if (!table) {
        return res.status(404).json({
          success: false,
          message: 'Table not found'
        });
      }

      res.json({
        success: true,
        data: table
      });
    } catch (error) {
      logger.error('Error in getTable:', error);
      next(error);
    }
  }

  // Create new table
  async createTable(req, res, next) {
    try {
      const {
        restaurantId,
        tableNumber,
        name,
        capacity,
        location,
        tableType,
        status,
        positionX,
        positionY,
        notes
      } = req.body;

      // Validation
      if (!restaurantId || !tableNumber || !name || !capacity) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant ID, table number, name, and capacity are required'
        });
      }

      if (capacity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Capacity must be greater than 0'
        });
      }

      const tableData = {
        restaurantId,
        tableNumber: tableNumber.trim(),
        tableName: name.trim(),
        capacity: parseInt(capacity),
        location: location?.trim(),
        type: tableType,
        status,
        qrCodeUrl: null
      };

      const table = await tableService.createTable(req.user.id, tableData);
      
      res.status(201).json({
        success: true,
        message: 'Table created successfully',
        data: table
      });
    } catch (error) {
      logger.error('Error in createTable:', error);
      if (error.message === 'Restaurant not found or access denied') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === 'Table number already exists for this restaurant') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // Update table
  async updateTable(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Convert string numbers to numbers
      ['capacity', 'positionX', 'positionY'].forEach(field => {
        if (updateData[field] !== undefined && updateData[field] !== '') {
          updateData[field] = parseInt(updateData[field]);
        }
      });

      const table = await tableService.updateTable(req.user.id, id, updateData);
      
      res.json({
        success: true,
        message: 'Table updated successfully',
        data: table
      });
    } catch (error) {
      logger.error('Error in updateTable:', error);
      if (error.message === 'Table not found or access denied') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === 'No valid fields to update') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // Delete table
  async deleteTable(req, res, next) {
    try {
      const { id } = req.params;
      const result = await tableService.deleteTable(req.user.id, id);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Error in deleteTable:', error);
      if (error.message === 'Table not found or access denied') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === 'Cannot delete table with active session') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // Get table statistics
  async getTableStats(req, res, next) {
    try {
      const { restaurantId } = req.query;
      const stats = await tableService.getTableStats(req.user.id, restaurantId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error in getTableStats:', error);
      next(error);
    }
  }

  // Update table status
  async updateTableStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const table = await tableService.updateTableStatus(req.user.id, id, status);
      
      res.json({
        success: true,
        message: 'Table status updated successfully',
        data: table
      });
    } catch (error) {
      logger.error('Error in updateTableStatus:', error);
      if (error.message === 'Invalid status') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === 'Table not found or access denied') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // Start table session
  async startTableSession(req, res, next) {
    try {
      const { id } = req.params;
      const { partySize, waiterId, notes } = req.body;

      if (!partySize || partySize <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid party size is required'
        });
      }

      const sessionData = {
        partySize: parseInt(partySize),
        waiterId,
        notes
      };

      const session = await tableService.startTableSession(req.user.id, id, sessionData);
      
      res.json({
        success: true,
        message: 'Table session started successfully',
        data: session
      });
    } catch (error) {
      logger.error('Error in startTableSession:', error);
      if (error.message === 'Table not found or access denied') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === 'Table is already occupied') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // End table session
  async endTableSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const session = await tableService.endTableSession(req.user.id, sessionId);
      
      res.json({
        success: true,
        message: 'Table session ended successfully',
        data: session
      });
    } catch (error) {
      logger.error('Error in endTableSession:', error);
      if (error.message === 'Session not found or access denied') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // Get table sessions
  async getTableSessions(req, res, next) {
    try {
      const filters = {
        tableId: req.query.tableId,
        status: req.query.status,
        date: req.query.date,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined
      };

      const sessions = await tableService.getTableSessions(req.user.id, filters);
      
      res.json({
        success: true,
        data: sessions
      });
    } catch (error) {
      logger.error('Error in getTableSessions:', error);
      next(error);
    }
  }

  // Generate QR code data for table
  async generateTableQR(req, res, next) {
    try {
      const { id } = req.params;
      const table = await tableService.getTableById(id);
      
      if (!table) {
        return res.status(404).json({
          success: false,
          message: 'Table not found'
        });
      }

      // Generate QR code data (URL that customers will scan)
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const qrData = {
        url: `${baseUrl}/menu?table=${table.id}&restaurant=${table.restaurant_id}`,
        tableId: table.id,
        tableName: table.name,
        tableNumber: table.table_number,
        restaurantId: table.restaurant_id,
        restaurantName: table.restaurant_name
      };

      res.json({
        success: true,
        data: qrData
      });
    } catch (error) {
      logger.error('Error in generateTableQR:', error);
      next(error);
    }
  }
}

module.exports = new TableController();