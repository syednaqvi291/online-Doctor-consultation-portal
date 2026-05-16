const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Database Connection
connectDB();

// Middlewares
app.use(express.json());

// Main App Pipelines Routing Connections
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// AI System Gateway (Python Microservice Integration Bridge)
app.post('/api/ai/predict', async (req, res) => {
    try {
        const { symptoms } = req.body;
        // Your Python ML engine hooks here
        res.status(200).json({ prediction: "Influenza / General viral trace Detected", specialist: "General Physician" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Real-Time WebRTC Video Stream & Chat Networking Engine
io.on('connection', (socket) => {
    console.log('A secure socket stream active: ' + socket.id);

    socket.on('message', (payload) => {
        socket.broadcast.emit('message', payload); // Relays signals instantly
    });

    socket.on('disconnect', () => {
        console.log('Stream disconnected.');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Integrated System executing over port ${PORT}`));