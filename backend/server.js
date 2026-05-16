const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// GEMINI AI SETUP
const genAI = new GoogleGenerativeAI("AIzaSyDbTTFVfRpGFvP0-pGMUokvssxKcDuuk");

app.post('/api/user/real-ai', async (req, res) => {
    try {
        const { prompt } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        res.json({ answer: result.response.text() });
    } catch (err) {
        res.status(500).json({ answer: "AI Error: Check key/Internet." });
    }
});

// SOS FEATURE
app.post('/api/user/sos', (req, res) => {
    res.json({ answer: "🚨 Emergency Alert Sent to Lucknow Medical Center!" });
});

// DOCTOR LISTING
app.get('/api/user/doctors', async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' });
        res.json(doctors);
    } catch (err) {
        res.status(500).send("Database Error");
    }
});

// ALL ROUTES - ISKO SIMPLE RAKHO TAAKI VERCEL CONFUSE NA HO
app.use('/api/user', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// MONGO CONNECTION - USING ENVIRONMENT VARIABLE (LOCAL WORKAROUND INCLUDED)
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careconnect';
mongoose.connect(mongoURI)
    .then(() => console.log('💻 MongoDB Connected'))
    .catch(err => console.log('❌ DB Error:', err));

// EXPORT FOR VERCEL (VERY IMPORTANT)
module.exports = app;

// LOCAL LISTEN (ONLY IF NOT RUNNING ON VERCEL)
if (process.env.NODE_ENV !== 'production') {
    app.listen(5000, () => {
        console.log("Server running locally on port 5000");
    });
}