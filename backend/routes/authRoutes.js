const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ email, role });
        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Invalid credentials or missing profile data." });
        }
        res.status(200).json({ success: true, token: "secure-user-session", name: user.name, role: user.role });
    } catch (err) {
        res.status(500).json({ message: "Internal server authentication fault", error: err.message });
    }
});

// Registration Route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Profile already exists." });

        const freshUser = new User({ name, email, password, role });
        await freshUser.save();
        res.status(201).json({ success: true, message: "Account setup deployed!" });
    } catch (err) {
        res.status(500).json({ message: "Registration Pipeline Fault", error: err.message });
    }
});

// Fetch Doctors for Patient Dashboard Route
router.get('/doctors', async (req, res) => {
    try {
        const doctorsData = await User.find({ role: 'doctor' });
        res.status(200).json(doctorsData);
    } catch (err) {
        res.status(500).json({ message: "Query failed inside cluster database", error: err.message });
    }
});

module.exports = router;