const express = require('express');
const router = express.Router();
const { getTasks, getTodayTasks, createTask, updateTask, toggleTaskStatus, deleteTask, getTaskStats } = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, getTasks);
router.get('/today', authMiddleware, getTodayTasks);
router.get('/stats', authMiddleware, getTaskStats);
router.post('/', authMiddleware, createTask);
router.put('/:id', authMiddleware, updateTask);
router.patch('/:id/toggle', authMiddleware, toggleTaskStatus);
router.delete('/:id', authMiddleware, deleteTask);

module.exports = router;
