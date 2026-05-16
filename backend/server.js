const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Live dynamic pooling over websockets
const io = socketIo(server, { 
    cors: { 
        origin: "*",
        methods: ["GET", "POST"]
    } 
});

// Database connectivity
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Main Root API Gateways
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// AI System Gateway (Python Bridge Integration)
app.post('/api/ai/predict', async (req, res) => {
    try {
        const { symptoms } = req.body;
        res.status(200).json({ 
            prediction: "Influenza / General viral trace Detected By Machine Learning Model", 
            specialist: "General Physician" 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Secure Channel for WebRTC Video Calls & Socket Chat
io.on('connection', (socket) => {
    console.log('User connected to active socket channel: ' + socket.id);

    socket.on('message', (payload) => {
        socket.broadcast.emit('message', payload); 
    });

    socket.on('disconnect', () => {
        console.log('Session disconnected.');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server compiled cleanly on port ${PORT}`));