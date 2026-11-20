const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Initialize database connection test
require('./config/db');

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow requests from frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for debugging and transparency
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Store Rating Management System API is healthy and running.',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ownerRoutes = require('./routes/ownerRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/owner', ownerRoutes);

// Serve frontend static build if dist exists
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // 404 Route Handler for API when dist is not built
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API Route not found: ${req.method} ${req.originalUrl}`
    });
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled application error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Store Rating Management System Backend Server `);
  console.log(` Running on: http://localhost:${PORT} `);
  console.log(` Frontend URL: http://localhost:${PORT} `);
  console.log(` API Endpoint: http://localhost:${PORT}/api `);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'} `);
  console.log(`====================================================`);
});
