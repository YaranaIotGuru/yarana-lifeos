const { pool } = require('../config/database');

// Get all clients
const getClients = async (req, res) => {
  try {
    const { status, payment_status, search } = req.query;
    let query = 'SELECT * FROM clients WHERE user_id = ?';
    const params = [req.user.id];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (payment_status) {
      query += ' AND payment_status = ?';
      params.push(payment_status);
    }
    if (search) {
      query += ' AND (name LIKE ? OR work_description LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const [clients] = await pool.execute(query, params);
    res.json({ success: true, clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get single client
const getClient = async (req, res) => {
  try {
    const [clients] = await pool.execute(
      'SELECT * FROM clients WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (clients.length === 0) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }
    res.json({ success: true, client: clients[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create client
const createClient = async (req, res) => {
  try {
    const { name, mobile, email, work_description, deadline, status, payment_status, amount, notes } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Client name is required.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO clients (user_id, name, mobile, email, work_description, deadline, status, payment_status, amount, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, mobile || null, email || null, work_description || null,
       deadline || null, status || 'pending', payment_status || 'unpaid', amount || 0, notes || null]
    );

    const [clients] = await pool.execute('SELECT * FROM clients WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Client added!', client: clients[0] });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update client
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, email, work_description, deadline, status, payment_status, amount, amount_paid, notes } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM clients WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    await pool.execute(
      `UPDATE clients SET 
        name = COALESCE(?, name),
        mobile = COALESCE(?, mobile),
        email = COALESCE(?, email),
        work_description = COALESCE(?, work_description),
        deadline = COALESCE(?, deadline),
        status = COALESCE(?, status),
        payment_status = COALESCE(?, payment_status),
        amount = COALESCE(?, amount),
        amount_paid = COALESCE(?, amount_paid),
        notes = COALESCE(?, notes)
       WHERE id = ? AND user_id = ?`,
      [name, mobile, email, work_description, deadline, status, payment_status, amount, amount_paid, notes, id, req.user.id]
    );

    const [updated] = await pool.execute('SELECT * FROM clients WHERE id = ?', [id]);
    res.json({ success: true, message: 'Client updated!', client: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete client
const deleteClient = async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM clients WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }
    res.json({ success: true, message: 'Client deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get client stats
const getClientStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_count,
        SUM(CASE WHEN payment_status = 'unpaid' THEN amount ELSE 0 END) as total_unpaid,
        SUM(amount) as total_value
       FROM clients WHERE user_id = ?`,
      [req.user.id]
    );
    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getClients, getClient, createClient, updateClient, deleteClient, getClientStats };
