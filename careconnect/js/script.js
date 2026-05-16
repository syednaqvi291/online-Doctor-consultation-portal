/**
 * ============================================================================
 * Online Doctor Consultation Portal - Core JavaScript
 * ============================================================================
 * Handles UI interactions, role toggles, and client-side form validation.*/
 // Backend URL matching your server.js
// ============================================================
// Universal Base Route for API Integration
const API_URL = "/api";
const socket = io(); // Automatically hooks into your live Vercel/Render pipeline

// Global parameters for WebRTC Video Calling
let localStream;
let remoteStream;
let peerConnection;
const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

socket.on('connect', () => {
    console.log('Connected to secure real-time communication server.');
});

// WebRTC Signaling Engine for Live Video Calls
socket.on('message', async (message) => {
    try {
        if (message.type === 'offer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(message));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('message', answer);
        } else if (message.type === 'answer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(message));
        } else if (message.type === 'candidate') {
            await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
    } catch (err) {
        console.error("WebRTC System Trace Error:", err);
    }
});

// ==================== FEATURE 1 & 2: LOGIN & REGISTER ====================
async function loginUser(event) {
    if(event) event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;

    try {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password, role });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userName', res.data.name);
        localStorage.setItem('userRole', res.data.role);

        if (res.data.role === 'admin') window.location.href = 'admin-dashboard.html';
        else if (res.data.role === 'doctor') window.location.href = 'doctor-dashboard.html';
        else window.location.href = 'patient-dashboard.html';
    } catch (err) {
        alert(err.response?.data?.message || "Server error: Check backend connectivity.");
    }
}

async function registerUser(event) {
    if(event) event.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;

    try {
        const res = await axios.post(`${API_URL}/auth/register`, { name, email, password, role });
        alert(res.data.message || "Registration Successful!");
        location.reload();
    } catch (err) {
        alert(err.response?.data?.message || "Registration failed.");
    }
}

// ==================== FEATURE 3: DOCTOR FETCH & DISCOVERY ====================
function loadAvailableDoctors() {
    fetch(`${API_URL}/auth/doctors`)
        .then(response => response.json())
        .then(doctorsList => {
            const container = document.getElementById('doctor-list');
            if (container) {
                container.innerHTML = ''; 
                doctorsList.forEach(doctor => {
                    container.innerHTML += `
                        <div class="doctor-card">
                            <h3>Dr. ${doctor.name}</h3>
                            <p>Specialization: ${doctor.specialization || 'General Physician'}</p>
                            <button onclick="navigateToAppointment('${doctor._id}')">Book Appointment</button>
                        </div>
                    `;
                });
            }
        })
        .catch(err => console.error("Error pulling live doctor files:", err));
}

function navigateToAppointment(doctorId) {
    window.location.href = `book-appointment.html?doctorId=${doctorId}`;
}

// ==================== FEATURE 4: APPOINTMENT SCHEDULING ====================
async function handleAppointmentBooking(event) {
    if(event) event.preventDefault();
    const doctorId = document.getElementById('doctorId').value;
    const patientId = document.getElementById('patientId').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;

    try {
        const res = await axios.post(`${API_URL}/appointments/book`, { doctorId, patientId, date, time });
        if (res.data.success) {
            alert("Appointment Scheduled Successfully!");
            window.location.href = 'patient-dashboard.html';
        } else {
            alert("Booking failed: " + res.data.message);
        }
    } catch (err) {
        console.error(err);
        alert("Error mapping database appointment slot.");
    }
}

// ==================== FEATURE 5: AI DISEASE PREDICTOR ====================
async function checkSymptomsWithAI(event) {
    if(event) event.preventDefault();
    const symptomsInput = document.getElementById('symptomsText').value;
    const resultDiv = document.getElementById('aiResultDisplay');

    try {
        if(resultDiv) resultDiv.innerText = "Analyzing symptoms with AI model...";
        const res = await axios.post(`${API_URL}/ai/predict`, { symptoms: symptomsInput });
        if(resultDiv) {
            resultDiv.innerHTML = `<strong>Predicted Condition:</strong> ${res.data.prediction}<br>
                                   <strong>Recommended Specialist:</strong> ${res.data.specialist}`;
        }
    } catch (err) {
        if(resultDiv) resultDiv.innerText = "AI System offline. Please consult a doctor directly.";
    }
}

// Global Event Triggers Mapping to match your HTML IDs
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('doctor-list')) loadAvailableDoctors();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', loginUser);

    const regForm = document.getElementById('registerForm');
    if (regForm) regForm.addEventListener('submit', registerUser);

    const appForm = document.getElementById('appointmentForm');
    if (appForm) appForm.addEventListener('submit', handleAppointmentBooking);

    const aiForm = document.getElementById('aiSymptomForm');
    if (aiForm) aiForm.addEventListener('submit', checkSymptomsWithAI);
});