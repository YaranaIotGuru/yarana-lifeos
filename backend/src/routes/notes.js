const express = require('express');
const router = express.Router();
const { getNotes, getNote, createNote, updateNote, deleteNote } = require('../controllers/noteController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, getNotes);
router.get('/:id', authMiddleware, getNote);
router.post('/', authMiddleware, createNote);
router.put('/:id', authMiddleware, updateNote);
router.delete('/:id', authMiddleware, deleteNote);

module.exports = router;
