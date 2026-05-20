const { pool } = require('../config/database');

// Get dashboard overview
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Today's tasks
    const [todayTasks] = await pool.execute(
      `SELECT * FROM tasks WHERE user_id = ? AND date = ? ORDER BY FIELD(priority, 'high', 'medium', 'low')`,
      [userId, today]
    );

    // Task stats
    const [taskStats] = await pool.execute(
      `SELECT 
        SUM(CASE WHEN date = ? AND status = 'pending' THEN 1 ELSE 0 END) as today_pending,
        SUM(CASE WHEN date = ? AND status = 'completed' THEN 1 ELSE 0 END) as today_completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as total_pending
       FROM tasks WHERE user_id = ?`,
      [today, today, userId]
    );

    // Pending clients
    const [pendingClients] = await pool.execute(
      `SELECT * FROM clients WHERE user_id = ? AND status != 'completed' ORDER BY deadline ASC LIMIT 5`,
      [userId]
    );

    // Client stats
    const [clientStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status != 'completed' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN payment_status = 'unpaid' THEN amount ELSE 0 END) as pending_amount
       FROM clients WHERE user_id = ?`,
      [userId]
    );

    // Ledger summary
    const [ledgerSummary] = await pool.execute(
      `SELECT 
        SUM(CASE WHEN type = 'credit' AND settled = 0 THEN amount ELSE 0 END) as total_lena,
        SUM(CASE WHEN type = 'debit' AND settled = 0 THEN amount ELSE 0 END) as total_dena
       FROM ledger WHERE user_id = ?`,
      [userId]
    );

    // Recent notes
    const [recentNotes] = await pool.execute(
      `SELECT id, title, category, color, is_locked, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 3`,
      [userId]
    );

    res.json({
      success: true,
      dashboard: {
        today_tasks: todayTasks,
        task_stats: taskStats[0],
        pending_clients: pendingClients,
        client_stats: clientStats[0],
        ledger_summary: ledgerSummary[0],
        recent_notes: recentNotes,
        date: today,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getDashboard };
