const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all pending educator requests
router.get('/requests', (req, res) => {
  const query = `
    SELECT id, name, email, university, created_at 
    FROM users 
    WHERE role = 'educator' AND status = 'pending'
    ORDER BY created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Approve an educator request
router.put('/approve/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('UPDATE users SET status = ? WHERE id = ?', ['approved', id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    db.get('SELECT id, name, email, role, status, university FROM users WHERE id = ?', [id], (err, user) => {
      if (err) {
        res.json({ message: 'Educator approved successfully' });
        return;
      }
      res.json({ message: 'Educator approved successfully', user: user });
    });
  });
});

// Reject an educator request
router.put('/reject/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('UPDATE users SET status = ? WHERE id = ?', ['rejected', id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ message: 'Educator rejected' });
  });
});

// Get all educators (for admin management)
router.get('/all-educators', (req, res) => {
  const query = `
    SELECT id, name, email, status, university, created_at 
    FROM users 
    WHERE role = 'educator'
    ORDER BY created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Make sure university field is included even if null
    const formattedRows = rows.map(row => ({
      ...row,
      university: row.university || 'Not specified'
    }));
    res.json(formattedRows);
  });
});

// DELETE any material by ID (admin only)
router.delete('/material/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM materials WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Material not found' });
      return;
    }
    res.json({ message: 'Material deleted successfully by admin' });
  });
});

// DELETE an educator (admin only)
router.delete('/educator/:id', (req, res) => {
  const { id } = req.params;
  
  // First delete all materials uploaded by this educator
  db.run('DELETE FROM materials WHERE uploader_id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Then delete the educator
    db.run('DELETE FROM users WHERE id = ? AND role = ?', [id, 'educator'], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Educator not found' });
        return;
      }
      res.json({ message: 'Educator and their materials deleted successfully' });
    });
  });
});

// Get all materials (for admin management) WITH UNIVERSITY NAME
router.get('/all-materials', (req, res) => {
  const query = `
    SELECT m.*, c.name as category_name, u.name as uploader_name, un.name as university_name 
    FROM materials m
    LEFT JOIN categories c ON m.category_id = c.id
    LEFT JOIN users u ON m.uploader_id = u.id
    LEFT JOIN universities un ON m.university_id = un.id
    ORDER BY m.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

module.exports = router;
