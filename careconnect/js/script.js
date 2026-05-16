const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : window.location.origin;

// Clean form layout switcher
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

// Complete Registration Trigger Function
async function registerUser() {
    const fullName = document.getElementById('regFullName')?.value?.trim();
    const email = document.getElementById('regEmail')?.value?.trim();
    const password = document.getElementById('regPassword')?.value?.trim();
    const role = document.getElementById('regRole')?.value || 'Patient';

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
            alert("Registration successful! Redirecting to login...");
            toggleAuth();
        }
    } catch (error) {
        alert(error.response?.data?.message || "Account creation failed or server down.");
    }
}

// Complete Login Trigger Function
async function loginUser() {
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value?.trim();

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

// Serverless Consultation Framework Launcher
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