const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all notes
const getNotes = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT id, title, content, category, is_locked, color, tags, created_at, updated_at FROM notes WHERE user_id = ?';
    const params = [req.user.id];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY updated_at DESC';
    const [notes] = await pool.execute(query, params);

    // Don't send content for locked notes
    const processedNotes = notes.map(note => ({
      ...note,
      content: note.is_locked ? null : note.content,
    }));

    res.json({ success: true, notes: processedNotes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get single note (unlock if locked)
const getNote = async (req, res) => {
  try {
    const { unlock_password } = req.query;
    const [notes] = await pool.execute(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (notes.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    const note = notes[0];
    if (note.is_locked) {
      if (!unlock_password) {
        return res.status(403).json({ success: false, message: 'This note is locked. Provide password.', locked: true });
      }
      const isMatch = await bcrypt.compare(unlock_password, note.lock_password);
      if (!isMatch) {
        return res.status(403).json({ success: false, message: 'Incorrect password.', locked: true });
      }
    }

    const { lock_password, ...noteData } = note;
    res.json({ success: true, note: noteData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create note
const createNote = async (req, res) => {
  try {
    const { title, content, category, is_locked, lock_password, color, tags } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }

    let hashedPassword = null;
    if (is_locked && lock_password) {
      hashedPassword = await bcrypt.hash(lock_password, 10);
    }

    const [result] = await pool.execute(
      'INSERT INTO notes (user_id, title, content, category, is_locked, lock_password, color, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, title, content || null, category || 'personal', is_locked ? 1 : 0, hashedPassword, color || '#6366f1', tags || null]
    );

    res.status(201).json({ success: true, message: 'Note created!', id: result.insertId });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update note
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, is_locked, lock_password, color, tags } = req.body;

    const [existing] = await pool.execute(
      'SELECT id, is_locked, lock_password FROM notes WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    let hashedPassword = existing[0].lock_password;
    if (is_locked && lock_password) {
      hashedPassword = await bcrypt.hash(lock_password, 10);
    } else if (!is_locked) {
      hashedPassword = null;
    }

    await pool.execute(
      `UPDATE notes SET 
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        category = COALESCE(?, category),
        is_locked = ?,
        lock_password = ?,
        color = COALESCE(?, color),
        tags = COALESCE(?, tags)
       WHERE id = ? AND user_id = ?`,
      [title, content, category, is_locked ? 1 : 0, hashedPassword, color, tags, id, req.user.id]
    );

    res.json({ success: true, message: 'Note updated!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete note
const deleteNote = async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }
    res.json({ success: true, message: 'Note deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote };
