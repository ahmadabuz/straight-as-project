const express = require('express');
const cors = require('cors');

// Import route handlers
const materialsRoutes = require('./routes/materials');
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const recommendationsRoutes = require('./routes/recommendations');
const adminRoutes = require('./routes/admin');
const universitiesRoutes = require('./routes/universities');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/materials', materialsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/universities', universitiesRoutes);



// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Straight A\'s backend is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Straight A\'s API',
    version: '1.0.0',
    endpoints: [
      'GET  /api/materials',
      'POST /api/materials',
      'GET  /api/materials/:id',
      'PUT  /api/materials/:id',
      'DELETE /api/materials/:id',
      'GET  /api/users',
      'GET  /api/categories',
      'GET  /api/recommendations/:userId',
      'GET  /api/admin/requests',
      'PUT  /api/admin/approve/:id',
      'PUT  /api/admin/reject/:id'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n Straight A's backend running on http://localhost:${PORT}`);
  console.log(` API available at http://localhost:${PORT}/api/materials`);
  console.log(` Health check: http://localhost:${PORT}/api/health\n`);
});
