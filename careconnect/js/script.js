// Automatically handles local dev port vs live Vercel container link
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : window.location.origin;

// ==================== WEBRTC ALTERNATIVE: JITSI VIDEO INFRASTRUCTURE ====================
// Jab doctor ya patient dashboard me "Join Call" par click karein, tab isko trigger karna hai
function startDoctorConsultation(appointmentId) {
    const domain = "8x8.vc"; 
    const options = {
        roomName: `CareConnect-SecureRoom-${appointmentId}`,
        width: "100%",
        height: 500,
        parentNode: document.getElementById("meet"), // Dashboard layout me jahan video chalani hai wahan ye id wala div hona chahiye
        lang: "en",
        configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false
        }
    };
    
    // Bina design kharab kiye full screen layout me call open kar dega
    const api = new JitsiMeetExternalAPI(domain, options);
    console.log("Jitsi serverless live consultation frame ready.");
}

// ==================== REGISTRATION FEATURE ====================
async function registerUser() {
    const fullName = document.getElementById('regFullName')?.value;
    const email = document.getElementById('regEmail')?.value;
    const password = document.getElementById('regPassword')?.value;
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

        if (response.data.success) {
            alert("Registration successful! Redirecting...");
            toggleAuthMode(); // Purana layout screen function toggle karne ke liye
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
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
        alert("Please provide credentials");
        return;
    }

    try {
        const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Route dashboard based on user role identity
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