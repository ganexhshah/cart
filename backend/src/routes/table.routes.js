const express = require('express');
const router = express.Router();
const tableController = require('../controllers/table.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Table management
router.get('/', tableController.getTables);
router.get('/stats', tableController.getTableStats);
router.get('/:id', tableController.getTable);
router.post('/', tableController.createTable);
router.put('/:id', tableController.updateTable);
router.delete('/:id', tableController.deleteTable);
router.patch('/:id/status', tableController.updateTableStatus);

// QR Code generation
router.get('/:id/qr', tableController.generateTableQR);

// Table sessions
router.get('/sessions/list', tableController.getTableSessions);
router.post('/:id/sessions', tableController.startTableSession);
router.patch('/sessions/:sessionId/end', tableController.endTableSession);

module.exports = router;