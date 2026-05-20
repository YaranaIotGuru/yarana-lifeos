const { pool } = require('../config/database');

// Get all tasks (with optional date filter)
const getTasks = async (req, res) => {
  try {
    const { date, status, priority, search } = req.query;
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [req.user.id];

    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY date ASC, FIELD(priority, "high", "medium", "low"), created_at DESC';

    const [tasks] = await pool.execute(query, params);
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get today's tasks
const getTodayTasks = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [tasks] = await pool.execute(
      'SELECT * FROM tasks WHERE user_id = ? AND date = ? ORDER BY FIELD(priority, "high", "medium", "low")',
      [req.user.id, today]
    );
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create task
const createTask = async (req, res) => {
  try {
    const { title, description, date, priority, reminder_time } = req.body;

    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Title and date are required.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO tasks (user_id, title, description, date, priority, reminder_time) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title, description || null, date, priority || 'medium', reminder_time || null]
    );

    // Create reminder if reminder_time is set
    if (reminder_time) {
      await pool.execute(
        'INSERT INTO reminders (user_id, task_id, title, message, remind_at) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, result.insertId, title, description || 'Task reminder', reminder_time]
      );
    }

    const [tasks] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Task created!', task: tasks[0] });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, priority, status, reminder_time } = req.body;

    const [tasks] = await pool.execute(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await pool.execute(
      `UPDATE tasks SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        date = COALESCE(?, date),
        priority = COALESCE(?, priority),
        status = COALESCE(?, status),
        reminder_time = COALESCE(?, reminder_time)
       WHERE id = ? AND user_id = ?`,
      [title, description, date, priority, status, reminder_time, id, req.user.id]
    );

    const [updated] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json({ success: true, message: 'Task updated!', task: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Toggle task status
const toggleTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const [tasks] = await pool.execute(
      'SELECT id, status FROM tasks WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const newStatus = tasks[0].status === 'pending' ? 'completed' : 'pending';
    await pool.execute('UPDATE tasks SET status = ? WHERE id = ?', [newStatus, id]);
    res.json({ success: true, message: `Task marked as ${newStatus}!`, status: newStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.json({ success: true, message: 'Task deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get task stats
const getTaskStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN date = ? AND status = 'pending' THEN 1 ELSE 0 END) as today_pending
       FROM tasks WHERE user_id = ?`,
      [today, req.user.id]
    );
    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getTasks, getTodayTasks, createTask, updateTask, toggleTaskStatus, deleteTask, getTaskStats };
