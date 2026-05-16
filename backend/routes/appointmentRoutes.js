const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

router.post('/book', async (req, res) => {
    try {
        const { doctorId, patientId, date, time } = req.body;
        const freshLog = new Appointment({
            doctor: doctorId,
            patient: patientId,
            date,
            time
        });
        await freshLog.save();
        res.status(201).json({ success: true, message: "Appointment entry compiled inside Atlas database", data: freshLog });
    } catch (err) {
        res.status(500).json({ success: false, message: "Database push failed", error: err.message });
    }
});

module.exports = router;