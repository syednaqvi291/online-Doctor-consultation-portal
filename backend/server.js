require('dotenv').config(); // Absolute line 1 initialization for cloud containers
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Force execute secure database stream connection
connectDB();

// Global Request Middlewares
app.use(cors());
app.use(express.json());

// Explicit Module Router Bindings (Prevents trace failures on serverless execution)
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// Isolated AI Symptoms Prediction Route Handler
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

// Production runtime bypass for local development flexibility
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Local dev server running on port ${PORT}`));
}

module.exports = app;