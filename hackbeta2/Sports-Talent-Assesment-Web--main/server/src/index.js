const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { getDb } = require('./database/db');
const authRoutes = require('./routes/auth');
const playerRoutes = require('./routes/players');
const statisticsRoutes = require('./routes/statistics');
const physicalRoutes = require('./routes/physical');
const assessmentRoutes = require('./routes/assessments');
const reportRoutes = require('./routes/reports');
const coachRoutes = require('./routes/coach');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'StarQ AI Talent Assessment Server',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/physical', physicalRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/coach', coachRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Initialize database and start server
async function startServer() {
    try {
        await getDb();
        console.log('📦 Database initialized and ready.');

        app.listen(PORT, () => {
            console.log(`🚀 StarQ Backend Server running at http://localhost:${PORT}`);
            console.log(`📊 API Health Endpoint: http://localhost:${PORT}/api/health`);
        });
    } catch (err) {
        console.error('Failed to initialize server:', err);
        process.exit(1);
    }
}

startServer();
