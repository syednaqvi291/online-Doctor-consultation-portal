const express = require('express');
const router = express.Router();
const User = require('../models/User');

// User Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ email, role });
        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Invalid credentials or missing role profile." });
        }
        res.status(200).json({ success: true, token: "mock-session-token", name: user.name, role: user.role });
    } catch (err) {
        res.status(500).json({ message: "Server login error", error: err.message });
    }
});

// User Registration Route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Account already listed." });

        const freshUser = new User({ name, email, password, role });
        await freshUser.save();
        res.status(201).json({ success: true, message: "Profile registered efficiently!" });
    } catch (err) {
        res.status(500).json({ message: "Server signup error", error: err.message });
    }
});

// Fetch Doctors list Route (Used by loadAvailableDoctors frontend function)
router.get('/doctors', async (req, res) => {
    try {
        const doctorsData = await User.find({ role: 'doctor' });
        res.status(200).json(doctorsData);
    } catch (err) {
        res.status(500).json({ message: "Query failed", error: err.message });
    }
});

module.exports = router;