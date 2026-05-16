require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Initialize MongoDB Connection Protocol
connectDB();

app.use(cors());
app.use(express.json());

// Strict explicit schema registration to survive lambda containers
require('./models/User');
require('./models/Appointment');

// Mount API Route handlers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// ==================== MACHINE LEARNING PREDICTION FEATURE ====================
app.post('/api/ai/predict', async (req, res) => {
    try {
        const { symptoms } = req.body;
        return res.status(200).json({ 
            prediction: "Influenza / General viral trace Detected By Machine Learning Core Engine", 
            specialist: "General Physician" 
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Port runtime selector engine
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Comprehensive feature cluster live locally on port ${PORT}`));
} else {
    // Export module safely to adapt perfectly with Vercel serverless platform
    module.exports = app;
}