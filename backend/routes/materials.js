const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { category, university } = req.query;
  let query = `
    SELECT m.*, c.name as category_name, u.name as uploader_name, un.name as university_name 
    FROM materials m
    LEFT JOIN categories c ON m.category_id = c.id
    LEFT JOIN users u ON m.uploader_id = u.id
    LEFT JOIN universities un ON m.university_id = un.id
  `;
  let params = [];
  let conditions = [];
  
  if (category) {
    conditions.push('c.name = ?');
    params.push(category);
  }
  
  if (university) {
    conditions.push('un.name = ?');
    params.push(university);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY m.created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT m.*, c.name as category_name, u.name as uploader_name, un.name as university_name 
    FROM materials m
    LEFT JOIN categories c ON m.category_id = c.id
    LEFT JOIN users u ON m.uploader_id = u.id
    LEFT JOIN universities un ON m.university_id = un.id
    WHERE m.id = ?
  `;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Material not found' });
      return;
    }
    db.run('UPDATE materials SET views = views + 1 WHERE id = ?', [id]);
    res.json(row);
  });
});

router.post('/', (req, res) => {
  const { title, description, type, url, category_id, university_id, uploader_id, course_code } = req.body;
  
  if (!title || !uploader_id) {
    res.status(400).json({ error: 'Title and uploader_id are required' });
    return;
  }
  
  const query = `
    INSERT INTO materials (title, description, type, url, category_id, university_id, uploader_id, course_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [title, description, type, url, category_id, university_id, uploader_id, course_code || null], function(err) {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, message: 'Material created successfully' });
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, type, url, category_id, university_id, course_code } = req.body;
  
  const query = `
    UPDATE materials 
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        type = COALESCE(?, type),
        url = COALESCE(?, url),
        category_id = COALESCE(?, category_id),
        university_id = COALESCE(?, university_id),
        course_code = COALESCE(?, course_code)
    WHERE id = ?
  `;
  
  db.run(query, [title, description, type, url, category_id, university_id, course_code, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Material not found' });
      return;
    }
    res.json({ message: 'Material updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
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
    res.json({ message: 'Material deleted successfully' });
  });
});

module.exports = router;
