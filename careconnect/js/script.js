const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : window.location.origin;

function toggleAuth() {
    const loginSec = document.getElementById('loginSection');
    const registerSec = document.getElementById('registerSection');
    
    if (loginSec && registerSec) {
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

        if (response.data && response.data.success) {
            alert("Registration successful! Switching to login...");
            toggleAuth();
        } else {
            alert(response.data.message || "Registration encountered an issue.");
        }
    } catch (error) {
        console.error("Registration Frontend Log:", error);
        alert(error.response?.data?.message || "Registration Pipeline Fault.");
    }
}

async function loginUser() {
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value?.trim();

    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        if (response.data && response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            const targetPage = response.data.user.role === 'Doctor' 
                ? '/doctor-dashboard.html' 
                : '/patient-dashboard.html';
                
            window.location.href = window.location.origin + targetPage;
        } else {
            alert(response.data?.message || "Login failed.");
        }
    } catch (error) {
        console.error("Login Frontend Log:", error);
        alert(error.response?.data?.message || "Invalid credentials.");
    }
}

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