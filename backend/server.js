require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

// Global Instance cache state for serverless containers
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    try {
        // Direct hardcoded string fallback tracking to handle missing Vercel Env Tokens safely
        const dbUri = process.env.MONGO_URI || "mongodb+srv://kumailnaqvi292:kumailnaqvi292@cluster0.6ae00.mongodb.net/careconnect?retryWrites=true&w=majority";
        
        const db = await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        
        isConnected = db.connections[0].readyState >= 1;
        console.log("Database connection pipeline established safely.");
    } catch (err) {
        console.error("Database Core Route Intercept Error:", err.message);
        isConnected = false;
    }
};

// Injection middleware to verify link persistence on every serverless function hit
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Explicit modular path routing to avoid module resolution break downs on Vercel
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// Diagnostic System Endpoint
app.get('/api/status', (req, res) => {
    res.status(200).json({ status: "online", database: isConnected ? "connected" : "disconnected" });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Pipeline operational locally on port ${PORT}`));
}

module.exports = app;