const express = require('express');
const router = express.Router();
const { getLedger, getLedgerSummary, createEntry, updateEntry, markSettled, deleteEntry } = require('../controllers/ledgerController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, getLedger);
router.get('/summary', authMiddleware, getLedgerSummary);
router.post('/', authMiddleware, createEntry);
router.put('/:id', authMiddleware, updateEntry);
router.patch('/:id/settle', authMiddleware, markSettled);
router.delete('/:id', authMiddleware, deleteEntry);

module.exports = router;
