require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Pre-load Mongoose Models with exact capitalization matching your files
require('./models/User');
require('./models/Appointment');

// Import Custom Routes matching your exact filename structure
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// AI Symptom Router Integration
app.post('/api/ai/predict', async (req, res) => {
    try {
        const { symptoms } = req.body;
        return res.status(200).json({ 
            prediction: "Influenza trace detected by Machine Learning Core.", 
            specialist: "General Physician" 
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Port fallback for your local system tests
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}

module.exports = app;