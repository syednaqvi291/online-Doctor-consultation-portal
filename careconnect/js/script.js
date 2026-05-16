// Automatically handles local dev port vs live Vercel container link
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : window.location.origin;

// ==================== WEBRTC ALTERNATIVE: JITSI VIDEO INFRASTRUCTURE ====================
function startDoctorConsultation(appointmentId) {
    const domain = "8x8.vc"; 
    const options = {
        roomName: `CareConnect-SecureRoom-${appointmentId}`,
        width: "100%",
        height: 500,
        parentNode: document.getElementById("meet"), 
        lang: "en",
        configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false
        }
    };
    const api = new JitsiMeetExternalAPI(domain, options);
    console.log("Jitsi serverless live consultation frame ready.");
}

// ==================== REGISTRATION FEATURE ====================
async function registerUser() {
    // Is code mein fallback tracking add kar di hai taaki agar id galti se short ya change ho, toh bhi data capture ho jaye
    const fullName = document.getElementById('regFullName')?.value || document.getElementById('fullName')?.value || document.getElementById('name')?.value;
    const email = document.getElementById('regEmail')?.value || document.getElementById('email')?.value;
    const password = document.getElementById('regPassword')?.value || document.getElementById('password')?.value;
    const role = document.getElementById('regRole')?.value || document.getElementById('role')?.value || 'Patient';

    // Debugging terminal alert logic to check values inside console
    console.log("Captured Sign-Up Trace:", { fullName, email, password, role });

    if (!fullName || !email || !password) {
        alert("Form evaluation failed. Make sure your input IDs match 'regFullName', 'regEmail', and 'regPassword' in HTML.");
        return;
    }

    try {
        const response = await axios.post(`${API_URL}/api/auth/register`, {
            fullName,
            email,
            password,
            role
        });

        if (response.data.success) {
            alert("Registration successful! Redirecting...");
            if (typeof toggleAuthMode === 'function') {
                toggleAuthMode(); 
            }
        } else {
            alert(response.data.message || "Registration trace rejected by server");
        }
    } catch (error) {
        console.error("Pipeline breakdown:", error);
        alert(error.response?.data?.message || "Registration Pipeline Fault");
    }
}

// ==================== LOGIN FEATURE ====================
async function loginUser() {
    const email = document.getElementById('loginEmail')?.value || document.getElementById('email')?.value;
    const password = document.getElementById('loginPassword')?.value || document.getElementById('password')?.value;

    if (!email || !password) {
        alert("Please provide credentials");
        return;
    }

    try {
        const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            if (response.data.user.role === 'Doctor') {
                window.location.href = 'doctor-dashboard.html';
            } else {
                window.location.href = 'patient-dashboard.html';
            }
        }
    } catch (error) {
        alert(error.response?.data?.message || "Server connectivity error during authentication.");
    }
}