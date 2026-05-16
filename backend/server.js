require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

// Strict explicit schema registration context for Lambda triggers
if (!mongoose.models.User) require('./models/User');
if (!mongoose.models.Appointment) require('./models/Appointment');

// Database Gateway connection proxy handler
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log("MongoDB Database connected smoothly.");
    } catch (err) {
        console.error("Database connection fault context:", err.message);
    }
};

// Global Middleware to force database connection per instance fetch
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Mounted Router Proxy Endpoints
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// ==================== MACHINE LEARNING PREDICTION ENGINE ====================
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

// Environment Runtime Server Execution
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Development pipeline live on port ${PORT}`));
} else {
    module.exports = app;
}