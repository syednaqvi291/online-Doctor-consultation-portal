// Automatically handles local development port vs live Vercel URL production container
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : window.location.origin;

// ==================== SCREEN TOGGLE UTILITY ====================
// Isme koi innerText ya classList crash nahi hai, yeh simple aur safe element display switcher hai
function toggleAuth() {
    const loginSec = document.getElementById('loginSection');
    const registerSec = document.getElementById('registerSection');
    
    if (loginSec && registerSec) {
        if (loginSec.style.display === 'none') {
            loginSec.style.display = 'block';
            registerSec.style.display = 'none';
        } else {
            loginSec.style.display = 'none';
            registerSec.style.display = 'block';
        }
    }
}

// ==================== REGISTRATION PIPELINE ====================
async function registerUser() {
    // Inputs reading with strict selectors and fallback placeholder mapping
    let fullName = document.getElementById('regFullName')?.value?.trim();
    let email = document.getElementById('regEmail')?.value?.trim();
    let password = document.getElementById('regPassword')?.value?.trim();
    let role = document.getElementById('regRole')?.value || 'Patient';

    // Fallback strategy: Agar kisi vajah se IDs mismatch hain, toh querySelector placeholder se data utha lega
    if (!fullName) fullName = document.querySelector('input[placeholder*="name"]')?.value?.trim();
    if (!email) email = document.querySelector('input[type="email"]')?.value?.trim();
    if (!password) password = document.querySelector('input[type="password"]')?.value?.trim();

    console.log("Captured Registry Trace:", { fullName, email, password, role });

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
        console.error("Backend Registry Crash Context:", error);
        alert(error.response?.data?.message || "Registration Pipeline Fault - Server Error");
    }
}

// ==================== LOGIN PIPELINE ====================
async function loginUser() {
    let email = document.getElementById('loginEmail')?.value?.trim();
    let password = document.getElementById('loginPassword')?.value?.trim();

    if (!email) email = document.querySelector('input[type="email"]')?.value?.trim();
    if (!password) password = document.querySelector('input[type="password"]')?.value?.trim();

    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Redirect based on user dashboard mapping context
            window.location.href = response.data.user.role === 'Doctor' 
                ? 'doctor-dashboard.html' 
                : 'patient-dashboard.html';
        }
    } catch (error) {
        console.error("Login Router Fault:", error);
        alert(error.response?.data?.message || "Invalid email or password.");
    }
}

// ==================== SERVERLESS CONSULTATION LAUNCHER ====================
// WebRTC alternative framework using secure Jitsi infrastructure channel
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
    console.log("Serverless safe live frame injected successfully.");
}