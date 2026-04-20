const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment.js'); // Check model name

router.post('/book', async (req, res) => {
    try {
        const { patientName, doctorName, date, time } = req.body;
        const newApp = new Appointment({ patientName, doctorName, date, time });
        await newApp.save();
        res.status(201).json({ msg: "Appointment Booked Successfully!" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
});

module.exports = router;