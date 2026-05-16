require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    try {
        // Direct fallback connection token string tracking
        const dbUri = process.env.MONGO_URI || "mongodb+srv://kumailnaqvi292:kumailnaqvi292@cluster0.6ae00.mongodb.net/careconnect?retryWrites=true&w=majority";
        
        const db = await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        
        isConnected = db.connections[0].readyState >= 1;
        console.log("Database connection live smoothly.");
    } catch (err) {
        console.error("Critical Connection Pipeline Fault:", err.message);
        isConnected = false;
    }
};

// Middleware to ensure DB connection per function execution call
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Explicit base routing endpoints
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// System Diagnostics Status Check
app.get('/api/status', (req, res) => {
    res.status(200).json({ status: "online", database: isConnected ? "connected" : "disconnected" });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Local engine hosting on port ${PORT}`));
}

module.exports = app;