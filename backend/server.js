require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// LIVE VERCEL RE-ROUTE FOR DATABASE ✅
const dbUri = process.env.MONGO_URI || "mongodb+srv://careconnect_user:SecurePass123@cluster0.rekxv8z.mongodb.net/careconnect?retryWrites=true&w=majority";

// --- Schemas ---
const userSchemaStructure = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Patient', 'Doctor'], default: 'Patient' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchemaStructure);

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    patientName: { type: String, default: 'Anonymous Patient' },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorName: { type: String },
    dateTime: { type: String, required: true }, // Unified Date & Time field
    symptoms: { type: String, default: 'General Checkup' },
    status: { type: String, default: 'Scheduled' }
}, { timestamps: true });

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

mongoose.connect(dbUri)
    .then(() => console.log("🟢 MONGO DB CLOUD ATLAS CONNECTED"))
    .catch((err) => console.log("🔴 MONGO CONNECTION ERROR:", err.message));


// ==========================================
//        🚨 FIXED API MAP ROUTERS 🚨
// ==========================================

// 1. Fetch Doctors (Matches Frontend: /api/users/doctors)
app.get('/api/users/doctors', async (req, res) => {
    try {
        const doctors = await User.find({ role: 'Doctor' }, 'fullName _id');
        return res.status(200).json(doctors); 
    } catch (e) { 
        return res.status(500).json({ message: e.message }); 
    }
});

// 2. Fetch Appointments Queue (Matches Frontend: /api/appointments)
app.get('/api/appointments', async (req, res) => {
    try {
        const list = await Appointment.find({}).sort({ createdAt: -1 });
        return res.status(200).json(list); 
    } catch (e) { 
        return res.status(500).json({ message: e.message }); 
    }
});

// 3. Book Appointment (Matches Frontend POST: /api/appointments)
app.post('/api/appointments', async (req, res) => {
    try {
        const { doctorId, dateTime, symptoms } = req.body;
        
        const doctor = await User.findById(doctorId);
        const doctorName = doctor ? doctor.fullName : "Specialist";

        const newAppointment = await Appointment.create({
            doctorId,
            doctorName,
            dateTime,
            symptoms: symptoms || 'General Consultation'
        });
        
        return res.status(201).json({ success: true, appointment: newAppointment });
    } catch (e) { 
        return res.status(500).json({ message: e.message }); 
    }
});

// 4. Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        if (!fullName || !email || !password) return res.status(400).json({ message: "All inputs are mandatory" });

        const normalizedEmail = email.toLowerCase().trim();
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) return res.status(400).json({ message: "Profile already verified" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({ fullName, email: normalizedEmail, password: hashedPassword, role });
        return res.status(201).json({ success: true });
    } catch (e) { return res.status(500).json({ message: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) return res.status(400).json({ message: "Invalid Profile Matrix" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Profile Matrix" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'careconnect_secret_token_key', { expiresIn: '1d' });
        return res.status(200).json({ success: true, token, user: { id: user._id, fullName: user.fullName, role: user.role } });
    } catch (e) { return res.status(500).json({ message: e.message }); }
});

// VERCEL COMPLIANT EXPORT & LISTEN
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 SYSTEM TERMINAL PORT ONLINE: ${PORT}`));