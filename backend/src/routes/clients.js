const express = require('express');
const router = express.Router();
const { getClients, getClient, createClient, updateClient, deleteClient, getClientStats } = require('../controllers/clientController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, getClients);
router.get('/stats', authMiddleware, getClientStats);
router.get('/:id', authMiddleware, getClient);
router.post('/', authMiddleware, createClient);
router.put('/:id', authMiddleware, updateClient);
router.delete('/:id', authMiddleware, deleteClient);

module.exports = router;
