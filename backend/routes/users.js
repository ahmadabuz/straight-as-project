const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all users (with status included) - exclude passwords
router.get('/', (req, res) => {
  const { role } = req.query;
  let query = 'SELECT id, name, email, role, status, university, created_at FROM users';
  let params = [];
  
  if (role) {
    query += ' WHERE role = ?';
    params.push(role);
  }
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET single user by ID - exclude password
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT id, name, email, role, status, university, created_at FROM users WHERE id = ?';
  
  db.get(query, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(row);
  });
});

// POST new user (educator registration with password)
router.post('/', (req, res) => {
  const { name, email, password, role, university } = req.body;
  
  if (!name || !email || !password || !role) {
    res.status(400).json({ error: 'Name, email, password, and role are required' });
    return;
  }
  
  const status = role === 'admin' ? 'approved' : 'pending';
  const query = 'INSERT INTO users (name, email, password, role, status, university) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.run(query, [name, email, password, role, status, university || null], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        res.status(409).json({ error: 'Email already exists' });
      } else {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
      }
      return;
    }
    res.status(201).json({ 
      id: this.lastID, 
      name, 
      email, 
      role, 
      status: status, 
      university: university,
      message: status === 'pending' ? 'Registration pending admin approval' : 'Registration successful'
    });
  });
});

// GET user's uploaded materials (for educators)
router.get('/:id/materials', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT m.*, c.name as category_name, un.name as university_name 
    FROM materials m
    LEFT JOIN categories c ON m.category_id = c.id
    LEFT JOIN universities un ON m.university_id = un.id
    WHERE m.uploader_id = ?
  `;
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// UPDATE user status (approve/reject)
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.run('UPDATE users SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Status updated successfully' });
  });
});

module.exports = router;
