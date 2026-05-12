const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all universities (public)
router.get('/', (req, res) => {
  const query = `
    SELECT u.*, COUNT(m.id) as material_count 
    FROM universities u
    LEFT JOIN materials m ON u.id = m.university_id
    GROUP BY u.id
    ORDER BY u.name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get materials by university (public)
router.get('/:id/materials', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT m.*, c.name as category_name, u.name as uploader_name, un.name as university_name
    FROM materials m
    LEFT JOIN categories c ON m.category_id = c.id
    LEFT JOIN users u ON m.uploader_id = u.id
    LEFT JOIN universities un ON m.university_id = un.id
    WHERE m.university_id = ?
    ORDER BY m.created_at DESC
  `;
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// ============ ADMIN ONLY: University Management ============

// Add new university (admin only)
router.post('/admin/add', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    res.status(400).json({ error: 'University name is required' });
    return;
  }
  
  db.run('INSERT INTO universities (name) VALUES (?)', [name], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        res.status(409).json({ error: 'University already exists' });
      } else {
        res.status(500).json({ error: err.message });
      }
      return;
    }
    res.status(201).json({ id: this.lastID, name: name });
  });
});

// Delete university (admin only)
router.delete('/admin/:id', (req, res) => {
  const { id } = req.params;
  
  // First check if university has materials
  db.get('SELECT COUNT(*) as count FROM materials WHERE university_id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (row.count > 0) {
      res.status(400).json({ error: `Cannot delete university: ${row.count} materials are associated with it. Delete or reassign them first.` });
      return;
    }
    
    db.run('DELETE FROM universities WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'University not found' });
        return;
      }
      res.json({ message: 'University deleted successfully' });
    });
  });
});

// Update university (admin only)
router.put('/admin/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name) {
    res.status(400).json({ error: 'University name is required' });
    return;
  }
  
  db.run('UPDATE universities SET name = ? WHERE id = ?', [name, id], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        res.status(409).json({ error: 'University name already exists' });
      } else {
        res.status(500).json({ error: err.message });
      }
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'University not found' });
      return;
    }
    res.json({ message: 'University updated successfully' });
  });
});

module.exports = router;
