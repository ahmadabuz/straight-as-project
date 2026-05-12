const express = require('express');
const router = express.Router();

router.get('/:userId', (req, res) => {
  const query = `
    SELECT m.*, c.name as category_name, u.name as uploader_name, r.reason
    FROM recommendations r
    JOIN materials m ON r.material_id = m.id
    LEFT JOIN categories c ON m.category_id = c.id
    LEFT JOIN users u ON m.uploader_id = u.id
    WHERE r.active = 1
    ORDER BY 
      CASE r.reason
        WHEN 'educator_pick' THEN 1
        WHEN 'trending' THEN 2
        WHEN 'new' THEN 3
        ELSE 4
      END
    LIMIT 5
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { material_id, reason } = req.body;
  
  if (!material_id || !reason) {
    res.status(400).json({ error: 'material_id and reason are required' });
    return;
  }
  
  const query = 'INSERT INTO recommendations (material_id, reason) VALUES (?, ?)';
  
  db.run(query, [material_id, reason], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, message: 'Recommendation added' });
  });
});

module.exports = router;
