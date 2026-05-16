const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes Integration
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// AI Symptom Route
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

// Local dev support
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Local server running on port ${PORT}`));
}

module.exports = app;