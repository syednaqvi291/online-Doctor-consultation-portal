require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Multi-fallback linkage strategy for complete alignment
const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb+srv://kumailnaqvi291:kumailnaqvi291@cluster0.6ae00.mongodb.net/careconnect?retryWrites=true&w=majority";

const userSchemaStructure = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Patient', 'Doctor'], default: 'Patient' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchemaStructure);

let isConnected = false;
const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        isConnected = true;
        return;
    }
    try {
        await mongoose.connect(dbUri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000
        });
        isConnected = true;
        console.log("Database authorized successfully.");
    } catch (err) {
        console.error("Database Connection Error:", err.message);
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
            details: dbErr.message 
        });
    }
});

app.get('/api/status', (req, res) => {
    res.status(200).json({ status: "online", dbConnected: isConnected });
});

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
            role: role || 'Patient'
        });
        return res.status(201).json({ success: true, message: "Registration successful" });
    } catch (error) {
        return res.status(500).json({ message: "Registration Fault", details: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        return res.status(200).json({ success: true, token, user: { id: user._id, fullName: user.fullName, email: user.email } });
    } catch (error) {
        return res.status(500).json({ message: "Login Exception Internal", details: error.message });
    }
});

module.exports = app;