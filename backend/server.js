require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors({ origin: '*' })); // Enforce open cross-origin access
app.use(express.json());

// Fallback logic to ensure it catches both key names perfectly
const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb+srv://kumailnaqvi291:kumailnaqvi291@cluster0.6ae00.mongodb.net/careconnect?retryWrites=true&w=majority";

let isConnected = false;
const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        isConnected = true;
        return;
    }
    try {
        await mongoose.connect(dbUri, {
            serverSelectionTimeoutMS: 10000
        });
        isConnected = true;
        console.log("Database authorized successfully.");
    } catch (err) {
        console.error("Database Connection Fault:", err.message);
        isConnected = false;
        throw err;
    }
};

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (dbErr) {
        return res.status(500).json({ 
            message: "Database access restricted or authentication failed.", 
            error: dbErr.message 
        });
    }
});

// Dynamic Base Validation Route
app.get('/api/status', (req, res) => {
    res.status(200).json({ status: "online", database: isConnected ? "connected" : "disconnected" });
});

// Registration Endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role
        });

        return res.status(201).json({
            success: true,
            message: "Registration completed successfully",
            user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        return res.status(500).json({ message: "Registration Pipeline Fault", details: error.message });
    }
});

// Login Endpoint (Updated to throw the real database error instead of standard 500)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        
        // Mongoose User compilation fallback
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
            fullName: String,
            email: { type: String, unique: true },
            password: String,
            role: String
        }));

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'careconnect_secret_token_key', 
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            success: true,
            token,
            user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
        });
    } catch (error) {
        // Explode the exact error message on screen so we see exactly why it fails
        return res.status(500).json({ message: "Login Internal Exception", details: error.message });
    }
});

module.exports = app;