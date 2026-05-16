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
        // AGAR VERCEL .ENV READ NAHI KAR PA RAHA, TOH YEH DIRECT STRING PE BACKUP KAREGA
        const dbUri = process.env.MONGO_URI || "mongodb+srv://kumailnaqvi292:kumailnaqvi292@cluster0.6ae00.mongodb.net/careconnect?retryWrites=true&w=majority";
        
        console.log("Attempting database sync with endpoint pattern...");
        
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

// Force connection verification dynamic check
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Inline explicit routing inside production environment lambda functions
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

app.get('/api/status', (req, res) => {
    res.status(200).json({ status: "online", database: isConnected ? "connected" : "disconnected" });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Local dev container online on port ${PORT}`));
}

module.exports = app;