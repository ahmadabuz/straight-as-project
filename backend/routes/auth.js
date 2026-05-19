const express = require('express');
const router = express.Router();
const db = require('../db');

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Simple password comparison (no encryption for local use)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
});

module.exports = router;
