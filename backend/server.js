require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

// DATABASE MONGO_URI DIRECT PRODUCTION BYPASS STRING
const dbUri = process.env.MONGO_URI || "mongodb+srv://kumailnaqvi292:kumailnaqvi292@cluster0.6ae00.mongodb.net/careconnect?retryWrites=true&w=majority";

// Core Mongo Schema Setup inline to guarantee serverless structural alignment
const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Patient', 'Doctor'], default: 'Patient' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        isConnected = db.connections[0].readyState >= 1;
        console.log("Database connection pipeline synchronized.");
    } catch (err) {
        console.error("Database Connection Fault:", err.message);
        isConnected = false;
    }
};

// Inline Request Interceptor to check live pipeline status
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// ==================== INLINE AUTHENTICATION ENGINES ====================

// Registration Route Target Engine
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email: email.toLowerCase(),
            password: hashedPassword,
            role
        });

        return res.status(201).json({
            success: true,
            message: "Registration completed successfully",
            user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        console.error("Internal Registration Failure:", error);
        return res.status(500).json({ message: "Internal Server Pipeline Exception Error", details: error.message });
    }
});

// Login Route Target Engine
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'careconnect_secret_token_key', { expiresIn: '1d' });

        return res.status(200).json({
            success: true,
            token,
            user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Internal Login Failure:", error);
        return res.status(500).json({ message: "Internal Server Pipeline Exception Error" });
    }
});

// Fallback dummy structure for modular appointment endpoints to keep routing clean
app.get('/api/appointments', (req, res) => {
    res.status(200).json({ success: true, appointments: [] });
});

app.get('/api/status', (req, res) => {
    res.status(200).json({ status: "online", database: isConnected ? "connected" : "disconnected" });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Local development cluster online on port ${PORT}`));
}

module.exports = app;