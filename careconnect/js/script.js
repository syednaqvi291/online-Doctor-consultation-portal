// Local dev vs Live Vercel server configuration container base route switch
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : window.location.origin;

// ==================== SCREEN TOGGLE UTILITY ====================
// Purely robust error proof display controller that does not touch layouts or titles
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
    } else {
        // Fallback strategy context if elements exist directly without custom container wrappers
        const containers = document.querySelectorAll('.auth-container, [id*="Section"]');
        containers.forEach(el => el.classList.toggle('hidden'));
    }
}

// ==================== REGISTRATION PIPELINE ====================
async function registerUser() {
    // Read data using explicit IDs matching configuration arrays
    let fullName = document.getElementById('regFullName')?.value?.trim();
    let email = document.getElementById('regEmail')?.value?.trim();
    let password = document.getElementById('regPassword')?.value?.trim();
    let role = document.getElementById('regRole')?.value || 'Patient';

    // Fallback logic context: If IDs don't match, grab data by looking at placeholders directly
    if (!fullName) fullName = document.querySelector('#registerSection input[type="text"], input[placeholder*="name"]')?.value?.trim();
    if (!email) email = document.querySelector('#registerSection input[type="email"], input[placeholder*="email"]')?.value?.trim();
    if (!password) password = document.querySelector('#registerSection input[type="password"], input[placeholder*="password"]')?.value?.trim();

    console.log("Safe Pipeline Intercept Capture:", { fullName, email, password, role });

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
        console.error("Backend Register Interface Error:", error);
        alert(error.response?.data?.message || "Registration Pipeline Fault");
    }
}

// ==================== LOGIN PIPELINE ====================
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
        console.error("Authentication router check failed:", error);
        alert(error.response?.data?.message || "Invalid email or password.");
    }
}

// ==================== SERVERLESS CONSULTATION LAUNCHER ====================
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