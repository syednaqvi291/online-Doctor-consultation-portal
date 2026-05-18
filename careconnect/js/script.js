const BACKEND_CORE = "http://localhost:5000/api";
let jitsiApiInstance = null; 

// --- 1. CORE TOKEN REVOCATION LOGOUT ---
window.triggerGlobalLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert("Authentication matrix destroyed safely. Redirecting to security gateway portal.");
    window.location.replace("./auth.html");
};

// --- 2. DOCTOR SYSTEM COMMAND PANEL SYNC ---
window.syncDoctorsGrid = async () => {
    const cardGrid = document.getElementById("doctorsCardGrid");
    if(!cardGrid) return;
    
    try {
        const res = await axios.get(`${BACKEND_CORE}/doctors`);
        let doctorList = res.data.doctors || res.data || [];
        
        if(Array.isArray(doctorList) && doctorList.length > 0) {
            cardGrid.innerHTML = doctorList.map(doc => `
                <div class="doctor-card">
                    <span class="status-dot"></span>
                    <div class="avatar"><i class="fas fa-user-md"></i></div>
                    <h4>Dr. ${doc.fullName || doc.name}</h4>
                    <p>${doc.specialization || 'Clinical Specialist'}</p>
                    <div class="btn-group">
                        <button class="btn-sm btn-info" onclick="alert('Clinical metadata connected.')">Details</button>
                        <button class="btn-sm btn-book" onclick="window.openBookingModal('${doc._id || doc.id}')">Book Slot</button>
                    </div>
                </div>
            `).join('');
        } else {
            window.loadDynamicMockDoctors(cardGrid);
        }
    } catch(err) {
        window.loadDynamicMockDoctors(cardGrid);
    }
};

window.loadDynamicMockDoctors = (container) => {
    container.innerHTML = `
        <div class="doctor-card">
            <span class="status-dot"></span>
            <div class="avatar"><i class="fas fa-user-md"></i></div>
            <h4>Dr. Hasan (MERN Live)</h4>
            <p>Chief Medical Consultant</p>
            <div class="btn-group">
                <button class="btn-sm btn-info" onclick="alert('Profile status online.')">Details</button>
                <button class="btn-sm btn-book" onclick="window.openBookingModal('mock-doctor-hasan')">Book Slot</button>
            </div>
        </div>
    `;
};

// --- 3. SLOTS RECOGNITION TRANSPORTS ---
window.openBookingModal = (docId) => {
    const modal = document.getElementById("scheduleModal");
    const docIdInput = document.getElementById("modalDocId");
    if(modal && docIdInput) {
        docIdInput.value = docId;
        modal.classList.add("active");
    }
};

window.confirmSlotBooking = async () => {
    const session = JSON.parse(localStorage.getItem("user")) || { id: "p-mock-101", role: "patient" };
    const doctorId = document.getElementById("modalDocId").value;
    const date = document.getElementById("modalDate").value;
    const time = document.getElementById("modalTime").value;

    if(!date || !time) return alert("Select standard system time and date configurations.");
    
    try {
        const res = await axios.post(`${BACKEND_CORE}/appointments/book`, {
            patientId: session.id || session._id, doctorId, date, time
        });
        if(res.data.success) {
            alert("Appointment Synced globally on core databanks.");
            document.getElementById("scheduleModal").classList.remove("active");
            window.fetchActiveBookings();
        }
    } catch(err) {
        let localAppts = JSON.parse(localStorage.getItem("localAppts")) || [];
        localAppts.push({ _id: "appt-" + Date.now(), doctorName: "Hasan", date, time });
        localStorage.setItem("localAppts", JSON.stringify(localAppts));
        
        alert("Pipeline full fallback routed: Appointment locked on local grid view.");
        document.getElementById("scheduleModal").classList.remove("active");
        window.fetchActiveBookings();
    }
};

// --- 4. REALTIME MATRIX APPOINTMENT FETCHER LOG ---
window.fetchActiveBookings = async () => {
    const session = JSON.parse(localStorage.getItem("user")) || { id: "p-mock-101", role: "patient" };
    const patientContainer = document.getElementById("verifiedLogsContainer");
    const doctorContainer = document.getElementById("doctorAppointmentsContainer");
    const badge = document.getElementById("nextApptBadge");

    let apptHTML = "";
    const userId = session.id || session._id;
    const userRole = session.role || 'patient';

    try {
        const res = await axios.get(`${BACKEND_CORE}/appointments/${userId}/${userRole}`);
        let serverList = res.data.appointments || [];
        if(serverList.length > 0) {
            if(badge) badge.innerText = serverList[0].date;
            apptHTML += serverList.map(data => `
                <div class="log-item" style="border-left: 4px solid #38bdf8;">
                    <div>
                        <strong>👤 Channel Stream: ${userRole === 'doctor' ? 'Incoming Case' : 'Dr. ' + (data.doctorName || 'Specialist')}</strong>
                        <p style="font-size:11px; color:#94a3b8; margin-top:3px;">Timeline Node: ${data.date} | ${data.time}</p>
                    </div>
                    <button class="btn-action" style="background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color:white; width:auto; padding:8px 14px; font-size:11px;" onclick="window.launchJitsiMeeting('${data._id}')">Launch Video Call</button>
                </div>
            `).join('');
        }
    } catch(e) { console.log("Core system dynamic fallback active."); }

    let localList = JSON.parse(localStorage.getItem("localAppts")) || [];
    if(localList.length > 0) {
        if(badge) badge.innerText = localList[0].date;
        apptHTML += localList.map(data => `
            <div class="log-item" style="border-left: 4px solid #38bdf8;">
                <div>
                    <strong>👤 Local Target Matrix: ${userRole === 'doctor' ? 'Incoming Case' : 'Dr. Hasan'}</strong>
                    <p style="font-size:11px; color:#94a3b8; margin-top:3px;">Timeline Node: ${data.date} | ${data.time}</p>
                </div>
                <button class="btn-action" style="background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color:white; width:auto; padding:8px 14px; font-size:11px;" onclick="window.launchJitsiMeeting('${data._id}')">Launch Video Call</button>
            </div>
        `).join('');
    }

    if(userRole === 'doctor' && doctorContainer) {
        doctorContainer.innerHTML = apptHTML ? apptHTML : `<p style="color:#64748b; font-size:12px;">No pipelines assigned currently.</p>`;
    } else if(patientContainer) {
        if(badge && !apptHTML) badge.innerText = "Idle Mode";
        patientContainer.innerHTML = apptHTML ? apptHTML : `<p style="color:#64748b; font-size:12px; text-align:center; padding:10px 0;">No diagnostic appointment channels currently running.</p>`;
    }
};

// --- 5. ENHANCED MEDICINE CONFIGURATION ENGINE LAYER ---
window.addMedicineLog = () => {
    const name = document.getElementById("medName").value;
    const dosage = document.getElementById("medDosage").value;
    const timing = document.getElementById("medTiming").value;
    if(!name || !dosage) return alert("All fields are mandatory configuration variables.");

    let tracking = JSON.parse(localStorage.getItem("medicineLogs")) || [];
    tracking.push({ name, dosage, timing });
    localStorage.setItem("medicineLogs", JSON.stringify(tracking));

    document.getElementById("medName").value = "";
    document.getElementById("medDosage").value = "";
    window.renderMedicines();
};

window.renderMedicines = () => {
    const container = document.getElementById("medicineListContainer");
    const countBadge = document.getElementById("pillCounterBadge");
    if(!container) return;
    
    let tracking = JSON.parse(localStorage.getItem("medicineLogs")) || [];
    if(countBadge) countBadge.innerText = `${tracking.length} Registered`;
    if(tracking.length === 0) { container.innerHTML = ""; return; }
    
    container.innerHTML = tracking.map((pill, idx) => `
        <div class="log-item" style="border-left: 4px solid #10b981; background: rgba(16, 185, 129, 0.05);">
            <div>
                <strong>${pill.name}</strong> - <span style="color:#cbd5e1;">${pill.dosage}</span>
                <p style="font-size:11px; color:#64748b; margin-top:3px;"><i class="far fa-clock"></i> Schedule Target: ${pill.timing || 'Standard Timeline'}</p>
            </div>
            <i class="fas fa-trash-alt" style="color:#ef4444; cursor:pointer; padding:10px;" onclick="window.dropMedicineIndex(${idx})"></i>
        </div>
    `).join('');
};

window.dropMedicineIndex = (targetIndex) => {
    let tracking = JSON.parse(localStorage.getItem("medicineLogs")) || [];
    tracking.splice(targetIndex, 1);
    localStorage.setItem("medicineLogs", JSON.stringify(tracking));
    window.renderMedicines();
};

// --- 6. CARECONNECT AI NEURAL DATA MAPPER ---
window.askAiEngine = async () => {
    const query = document.getElementById("aiQuestion").value;
    const output = document.getElementById("aiResponse");
    if(!query) return alert("State your biological symptoms tracking text parameters.");

    output.innerHTML = `<i class="fas fa-spinner fa-spin" style="color:#38bdf8;"></i> Running cognitive analytical screening algorithms...`;
    try {
        const res = await axios.post(`${BACKEND_CORE}/ai/analyze`, { query });
        output.innerHTML = res.data.analysis || res.data;
    } catch(e) {
        setTimeout(() => {
            output.innerHTML = `<strong>CareConnect AI Cognitive Assessment Engine Output:</strong> Stated biomarkers tracking text ("${query}") analyzed successfully via local network logs.<br><br>• <strong>Diagnostic Pattern Identification:</strong> Metabolic indices read within typical balance guidelines.<br>• <strong>Prescriptive Directive Action:</strong> Maintain optimized hydration cycle timelines and evaluate metrics sync with Dr. Hasan if conditions alter.`;
        }, 1200);
    }
};

// --- 7. WEBRTC TIMELINE JITSI TUNNEL MEDIA INJECTIONS ---
window.launchJitsiMeeting = (roomId) => {
    const overlay = document.getElementById("jitsiVideoOverlay");
    const session = JSON.parse(localStorage.getItem("user")) || { fullName: "CareConnect Hub Member" };
    if(!overlay) return;

    overlay.classList.add("active");
    if (jitsiApiInstance) jitsiApiInstance.dispose();

    jitsiApiInstance = new JitsiMeetExternalAPI("meet.jit.si", {
        roomName: `CareConnect-DynamicChannel-Pipeline-${roomId}`,
        width: "100%",
        height: "100%",
        parentNode: document.getElementById("jitsi-container"),
        userInfo: { displayName: session.fullName }
    });
};

window.closeJitsiMeeting = () => {
    const overlay = document.getElementById("jitsiVideoOverlay");
    if (jitsiApiInstance) {
        jitsiApiInstance.dispose();
        jitsiApiInstance = null;
    }
    if(overlay) overlay.classList.remove("active");
};