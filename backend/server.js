require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

// Main Dynamic URI Line
const dbUri = "mongodb+srv://kumailnaqvi292:kumailnaqvi292@cluster0.6ae00.mongodb.net/careconnect?retryWrites=true&w=majority&appName=Cluster0";

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Patient', 'Doctor'], default: 'Patient' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

let isConnected = false;

const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }
    try {
        mongoose.set('strictQuery', true);
        const db = await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // Increased to allow dynamic whitelist propagation
            socketTimeoutMS: 45000
        });
        isConnected = db.connections[0].readyState === 1;
        console.log("Database bridge established successfully.");
    } catch (err) {
        console.error("Database Connection Fault:", err.message);
        isConnected = false;
        throw err;
    }
};

// Error Shielding Pipeline Middleware
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (dbErr) {
        return res.status(500).json({ 
            message: "Database access restricted or IP not whitelisted.", 
            details: dbErr.message 
        });
    }
});

// Registration API
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
        return res.status(500).json({ message: "Internal Server Pipeline Exception Error", details: error.message });
    }
});

// Login API
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
        return res.status(500).json({ message: "Internal Server Pipeline Exception Error" });
    }
});

module.exports = app;