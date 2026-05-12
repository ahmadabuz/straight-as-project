const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all categories (public)
router.get('/', (req, res) => {
  const query = `
    SELECT c.*, COUNT(m.id) as material_count 
    FROM categories c
    LEFT JOIN materials m ON c.id = m.category_id
    GROUP BY c.id
    ORDER BY c.name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get materials by category (public)
router.get('/:id/materials', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT m.*, u.name as uploader_name, un.name as university_name
    FROM materials m
    LEFT JOIN users u ON m.uploader_id = u.id
    LEFT JOIN universities un ON m.university_id = un.id
    WHERE m.category_id = ?
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

// ============ ADMIN ONLY: Category Management ============

// Add new category (admin only)
router.post('/admin/add', (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    res.status(400).json({ error: 'Category name is required' });
    return;
  }
  
  db.run('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description || ''], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        res.status(409).json({ error: 'Category already exists' });
      } else {
        res.status(500).json({ error: err.message });
      }
      return;
    }
    res.status(201).json({ id: this.lastID, name: name, description: description });
  });
});

// Delete category (admin only)
router.delete('/admin/:id', (req, res) => {
  const { id } = req.params;
  
  // First check if category has materials
  db.get('SELECT COUNT(*) as count FROM materials WHERE category_id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (row.count > 0) {
      res.status(400).json({ error: `Cannot delete category: ${row.count} materials use this category. Delete or reassign them first.` });
      return;
    }
    
    db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      res.json({ message: 'Category deleted successfully' });
    });
  });
});

// Update category (admin only)
router.put('/admin/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  if (!name) {
    res.status(400).json({ error: 'Category name is required' });
    return;
  }
  
  db.run('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description || '', id], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        res.status(409).json({ error: 'Category name already exists' });
      } else {
        res.status(500).json({ error: err.message });
      }
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    res.json({ message: 'Category updated successfully' });
  });
});

module.exports = router;
