const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const requestRoutes = require('./routes/requests');
const adminRoutes = require('./routes/admin');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '/')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'ProjectBuddy API',
        privacyPolicy: 'Zero-Knowledge Idea Protection & Anonymous Student Telemetry Enabled',
        timestamp: new Date().toISOString()
    });
});

// Serve frontend for any non-API route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong on the server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 ProjectBuddy Server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🛡️ Admin API available at http://localhost:${PORT}/api/admin`);
    console.log(`🌐 Frontend accessible at http://localhost:${PORT}\n`);
});
