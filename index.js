require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const connectDB = require('./db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json());
app.use(express.static('public'));

const port = process.env.PORT || 4000;

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Liveness probe
app.get('/health/live', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Readiness probe
app.get('/health/ready', (req, res) => {
    if (mongoose.connection.readyState === 1) {
        return res.status(200).json({ status: 'ready' });
    }

    return res.status(503).json({ status: 'not ready' });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Start application only after MongoDB connection succeeds
const startServer = async () => {
    try {
        await connectDB();

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.error('Failed to start application:', err);
        process.exit(1);
    }
};

startServer();