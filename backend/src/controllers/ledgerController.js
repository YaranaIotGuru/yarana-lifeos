const { pool } = require('../config/database');

// Get all ledger entries
const getLedger = async (req, res) => {
  try {
    const { type, search, settled, from_date, to_date } = req.query;
    let query = 'SELECT * FROM ledger WHERE user_id = ?';
    const params = [req.user.id];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (search) {
      query += ' AND (name LIKE ? OR note LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (settled !== undefined) {
      query += ' AND settled = ?';
      params.push(settled === 'true' ? 1 : 0);
    }
    if (from_date) {
      query += ' AND date >= ?';
      params.push(from_date);
    }
    if (to_date) {
      query += ' AND date <= ?';
      params.push(to_date);
    }

    query += ' ORDER BY date DESC, created_at DESC';
    const [entries] = await pool.execute(query, params);
    res.json({ success: true, entries });
  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get ledger summary
const getLedgerSummary = async (req, res) => {
  try {
    const [summary] = await pool.execute(
      `SELECT 
        SUM(CASE WHEN type = 'credit' AND settled = 0 THEN amount ELSE 0 END) as total_lena,
        SUM(CASE WHEN type = 'debit' AND settled = 0 THEN amount ELSE 0 END) as total_dena,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credit,
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debit,
        COUNT(*) as total_entries,
        SUM(CASE WHEN settled = 0 THEN 1 ELSE 0 END) as pending_entries
       FROM ledger WHERE user_id = ?`,
      [req.user.id]
    );
    res.json({ success: true, summary: summary[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create ledger entry
const createEntry = async (req, res) => {
  try {
    const { name, amount, type, date, note, category } = req.body;

    if (!name || !amount || !type || !date) {
      return res.status(400).json({ success: false, message: 'Name, amount, type, and date are required.' });
    }

    if (!['credit', 'debit'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be credit or debit.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO ledger (user_id, name, amount, type, date, note, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, name, amount, type, date, note || null, category || 'general']
    );

    const [entries] = await pool.execute('SELECT * FROM ledger WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Entry added!', entry: entries[0] });
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update ledger entry
const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, type, date, note, category, settled } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM ledger WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    }

    await pool.execute(
      `UPDATE ledger SET 
        name = COALESCE(?, name),
        amount = COALESCE(?, amount),
        type = COALESCE(?, type),
        date = COALESCE(?, date),
        note = COALESCE(?, note),
        category = COALESCE(?, category),
        settled = COALESCE(?, settled)
       WHERE id = ? AND user_id = ?`,
      [name, amount, type, date, note, category, settled !== undefined ? settled : null, id, req.user.id]
    );

    const [updated] = await pool.execute('SELECT * FROM ledger WHERE id = ?', [id]);
    res.json({ success: true, message: 'Entry updated!', entry: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Mark as settled
const markSettled = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.execute(
      'SELECT id, settled FROM ledger WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    }

    const newSettled = !existing[0].settled;
    await pool.execute('UPDATE ledger SET settled = ? WHERE id = ?', [newSettled, id]);
    res.json({ success: true, message: newSettled ? 'Marked as settled!' : 'Marked as pending!', settled: newSettled });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete entry
const deleteEntry = async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM ledger WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    }
    res.json({ success: true, message: 'Entry deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getLedger, getLedgerSummary, createEntry, updateEntry, markSettled, deleteEntry };
