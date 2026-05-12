const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all users (with status included)
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

