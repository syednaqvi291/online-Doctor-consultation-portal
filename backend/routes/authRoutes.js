const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER ROUTE
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).send('Email already registered');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();
        res.send({ message: "Account created successfully!" });
    } catch (err) {
        res.status(500).send('Error during registration');
    }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(400).send('User not found');

        // Role Check: Ensures user logs in with their correct role
        if (user.role !== role) {
            return res.status(403).send(`Access denied: Your account is a ${user.role} account.`);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Invalid password');

        const token = jwt.sign({ id: user._id, role: user.role }, 'care_secret_123');
        res.json({ token, role: user.role, name: user.name });
    } catch (err) {
        res.status(500).send('Login error');
    }
});

module.exports = router;