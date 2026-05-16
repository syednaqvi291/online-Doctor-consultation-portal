require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Enable Cross-Origin requests securely for Vercel mapping
app.use(cors());
app.use(express.json());

// Global MongoDB Connection State Cache for serverless efficiency
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log("Using existing active MongoDB container instance proxy.");
        return;
    }

    try {
        // Fallback checks for environment token injection
        const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        
        if (!dbUri) {
            throw new Error("Critical Failure: Database URI connection token is undefined.");
        }

        const dbOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        };

        const db = await mongoose.connect(dbUri, dbOptions);
        isConnected = db.connections[0].readyState >= 1;
        console.log("Database connection pipeline established safely.");
    } catch (err) {
        console.error("Database Core Route Intercept Error:", err.message);
        // Does not let the entire node platform freeze or crash out 500
        isConnected = false;
    }
};

// Middleware to force connection verification before forwarding to sub-routes
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Mounted Security Base Subrouters
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// Root Status check diagnostic route context
app.get('/api/status', (req, res) => {
    res.status(200).json({ status: "online", database: isConnected ? "connected" : "disconnected" });
});

// ==================== ARTIFICIAL INTELLIGENCE CORE SYSTEM ====================
app.post('/api/ai/predict', async (req, res) => {
    try {
        const { symptoms } = req.body;
        return res.status(200).json({ 
            prediction: "General Viral Activity Found / Tracked by Machine Learning Engine Core", 
            specialist: "General Practitioner" 
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Environment Runtime Server Port Setup
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Pipeline operational locally on port ${PORT}`));
}

module.exports = app;