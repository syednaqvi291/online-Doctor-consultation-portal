/**
 * ============================================================================
 * Online Doctor Consultation Portal - Core JavaScript
 * ============================================================================
 * Handles UI interactions, role toggles, and client-side form validation.*/
 // Backend URL matching your server.js
const API_URL = "http://127.0.0.1:5000/api/user";

// --- LOGIN FUNCTION ---
async function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;

    try {
        const res = await axios.post(`${API_URL}/login`, { email, password, role });
        
        // Saving user data locally
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userName', res.data.name);
        localStorage.setItem('userRole', res.data.role);

        // Redirecting to the correct dashboard based on role
        if (res.data.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else if (res.data.role === 'doctor') {
            window.location.href = 'doctor-dashboard.html';
        } else {
            window.location.href = 'patient-dashboard.html';
        }
    } catch (err) {
        alert(err.response ? err.response.data : "Server error: Check if backend is running");
    }
}

// --- REGISTER FUNCTION ---
async function registerUser() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;

    try {
        const res = await axios.post(`${API_URL}/register`, { name, email, password, role });
        alert(res.data.message);
        location.reload(); // Refresh to show Login form
    } catch (err) {
        alert(err.response ? err.response.data : "Registration failed");
    }
}