// Automatically handles local development port vs live Vercel URL production container
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : window.location.origin;

// ==================== FAIL-SAFE SCREEN TOGGLE ====================
// Agar aapke HTML me class badal rahi thi ya style block ho raha tha, yeh dono tarike handle karega
function toggleAuth() {
    const loginSec = document.getElementById('loginSection');
    const registerSec = document.getElementById('registerSection');
    
    if (loginSec && registerSec) {
        // Fallback check: Agar styles exist nahi karti to direct toggle karega
        if (loginSec.style.display === 'none' || loginSec.classList.contains('hidden')) {
            loginSec.style.display = 'block';
            loginSec.classList.remove('hidden');
            registerSec.style.display = 'none';
            registerSec.classList.add('hidden');
        } else {
            loginSec.style.display = 'none';
            loginSec.classList.add('hidden');
            registerSec.style.display = 'block';
            registerSec.classList.remove('hidden');
        }
    }
}

// ==================== REGISTRATION ENGINE ====================
async function registerUser() {
    // 1. Direct ID se element reading
    let fullName = document.getElementById('regFullName')?.value?.trim();
    let email = document.getElementById('regEmail')?.value?.trim();
    let password = document.getElementById('regPassword')?.value?.trim();
    let role = document.getElementById('regRole')?.value || 'Patient';

    // 2. Fallback: Agar aapke HTML me different IDs hain, to attributes se fetch karega
    if (!fullName) fullName = document.querySelector('input[placeholder*="name"], #name')?.value?.trim();
    if (!email) email = document.querySelector('input[type="email"]')?.value?.trim();
    if (!password) password = document.querySelector('input[type="password"]')?.value?.trim();

    if (!fullName || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const response = await axios.post(`${API_URL}/api/auth/register`, {
            fullName,
            email,
            password,
            role
        });

        if (response.data.success || response.data) {
            alert("Registration successful! Switching to login...");
            toggleAuth();
        }
    } catch (error) {
        alert(error.response?.data?.message || "Registration Pipeline Fault - Backend connection failed.");
    }
}

// ==================== LOGIN ENGINE ====================
async function loginUser() {
    let email = document.getElementById('loginEmail')?.value?.trim();
    let password = document.getElementById('loginPassword')?.value?.trim();

    if (!email) email = document.querySelector('#loginSection input[type="email"]')?.value?.trim();
    if (!password) password = document.querySelector('#loginSection input[type="password"]')?.value?.trim();

    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            window.location.href = response.data.user.role === 'Doctor' 
                ? 'doctor-dashboard.html' 
                : 'patient-dashboard.html';
        }
    } catch (error) {
        alert(error.response?.data?.message || "Invalid credentials.");
    }
}

// ==================== WEBRTC INFRASTRUCTURE LAUNCHER ====================
function startDoctorConsultation(appointmentId) {
    const domain = "8x8.vc"; 
    const options = {
        roomName: `CareConnect-SecureRoom-${appointmentId}`,
        width: "100%",
        height: 500,
        parentNode: document.getElementById("meet"), 
        lang: "en"
    };
    new JitsiMeetExternalAPI(domain, options);
}