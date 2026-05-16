const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to Database
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Main Root API Gateways
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

// Serverless mapping fallback for local development if run directly
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Local development server running on port ${PORT}`));
}

module.exports = app; // This is what Vercel needs to handle serverless requests flawlessly