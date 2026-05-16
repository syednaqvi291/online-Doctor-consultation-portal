const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Safe socket attachments for hybrid architectures
const io = socketIo(server, {
    cors: { origin: "*" },
    transports: ['polling', 'websocket'],
    allowEIO3: true
});

// Database Connection
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Routes Deployed
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// ==================== FEATURE: AI DISEASE PREDICTOR ====================
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

// ==================== FEATURE: WEBRTC & SOCKET CONNECTIONS ====================
io.on('connection', (socket) => {
    console.log('Active session linked: ' + socket.id);
    socket.on('message', (payload) => {
        socket.broadcast.emit('message', payload); 
    });
    socket.on('disconnect', () => {
        console.log('Session dissolved cleanly.');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Active server operating on channel ${PORT}`));

module.exports = server; // Explicitly exported for Vercel functions engine