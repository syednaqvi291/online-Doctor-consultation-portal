const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Open Cluster Connection
connectDB();

// Body Parser Middleware
app.use(express.json());

// Routes Bindings
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// ==================== FEATURE 5: AI BOT ROUTE LINK ====================
app.post('/api/ai/predict', async (req, res) => {
    try {
        const { symptoms } = req.body;
        // Your Python integration algorithms bridge seamlessly here
        res.status(200).json({ 
            prediction: "Influenza / General viral trace Detected", 
            specialist: "General Physician" 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== FEATURE 6: WEBRTC VIDEO CALLS & SOCKET CHAT ====================
io.on('connection', (socket) => {
    console.log('Secure channel initialized over socket stream: ' + socket.id);

    // Synchronizes messaging and active signaling between Doctor and Patient
    socket.on('message', (payload) => {
        socket.broadcast.emit('message', payload); 
    });

    socket.on('disconnect', () => {
        console.log('Stream session killed.');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Integrated Medical Platform running on channel port ${PORT}`));