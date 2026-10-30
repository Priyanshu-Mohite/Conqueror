const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'CampusVault API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Serve static client build if available (Render / Production)
const path = require('path');
const fs = require('fs');
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server and connect DB
async function startServer() {
  try {
    await connectDB();

    // Auto-seed if database is empty
    const { User } = require('./models');
    const { seedDatabase } = require('./seed/seedData');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[CampusVault Server] Empty database detected. Auto-seeding pristine judge demo dataset...');
      await seedDatabase();
    }

    const server = app.listen(PORT, () => {
      console.log(`[CampusVault Server] Listening on http://localhost:${PORT}`);
      console.log(`[CampusVault Server] Health Check: http://localhost:${PORT}/api/health`);
    });
    return server;
  } catch (error) {
    console.error('[CampusVault Server] Startup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
