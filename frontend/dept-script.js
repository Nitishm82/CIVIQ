// Department Dashboard logic
const API_BASE = "http://localhost:3000/api";
let requests = [];
let currentDepartment = null;
let currentUser = null;
let activeRequestId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Setup login page if present
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        // preselect stored
        const stored = localStorage.getItem('civiq_department');
        if (stored) {
            // redirect to dashboard
            window.location.href = 'dept-dashboard.html';
        }
        return;
    }

    // Dashboard page
    currentDepartment = localStorage.getItem('civiq_department');
    currentUser = localStorage.getItem('civiq_department_user') || 'Staff';
    if (!currentDepartment) {
        window.location.href = 'dept-login.html';
        return;
    }

    const deptNameEl = document.getElementById('deptName');
    if (deptNameEl) deptNameEl.textContent = currentDepartment;

    const deptUserEl = document.getElementById('deptUser');
    if (deptUserEl) deptUserEl.textContent = currentUser;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', loadRequests);

    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) statusFilter.addEventListener('change', renderRequests);

    const searchBox = document.getElementById('searchBox');
    if (searchBox) searchBox.addEventListener('input', renderRequests);

    // Modal
    const actionSelect = document.getElementById('deptAction');
    const forwardGroup = document.getElementById('forwardGroup');
    if (actionSelect) {
        actionSelect.addEventListener('change', () => {
            forwardGroup.style.display = actionSelect.value === 'forward' ? 'block' : 'none';
        });
    }

    const modalClose = document.getElementById('modalClose');
    if (modalClose) modalClose.addEventListener('click', closeModal);

    const modalCancel = document.getElementById('modalCancel');
    if (modalCancel) modalCancel.addEventListener('click', closeModal);

    const modalSubmit = document.getElementById('modalSubmit');
    if (modalSubmit) modalSubmit.addEventListener('click', submitModal);

    loadRequests();
});

async function handleLogin(e) {
    e.preventDefault();
    const dept = document.getElementById('deptSelect').value;
    const name = document.getElementById('userName').value;
    const pw = document.getElementById('password').value;

    if (!dept || !name || !pw) {
        alert('Fill all fields');
        return;
    }

    // Demo: store in localStorage (production: call backend auth)
    localStorage.setItem('civiq_department', dept);
    localStorage.setItem('civiq_department_user', name);

    // redirect to dashboard
    window.location.href = 'dept-dashboard.html';
}

function logout() {
    localStorage.removeItem('civiq_department');
    localStorage.removeItem('civiq_department_user');
    window.location.href = 'dept-login.html';
}

async function loadRequests() {
    try {
        const res = await fetch(`${API_BASE}/requests`);
        if (!res.ok) throw new Error('API unavailable');
        const all = await res.json();
        // filter requests for this department
        requests = all.filter(r => r.department === currentDepartment);
    } catch (err) {
        console.warn('Backend error - using demo data', err);
        // demo fallback
        requests = demoRequests().filter(r => r.department === currentDepartment);
    }
    updateStats();
    renderRequests();
}

function updateStats() {
    const pending = requests.filter(r => r.status === 'submitted').length;
    const inProgress = requests.filter(r => r.status === 'in-progress' || r.status === 'assigned').length;
    const waitingDriver = requests.filter(r => r.departmentCompleted === true && !r.driverCompleted).length;

    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('inProgressCount').textContent = inProgress;
    document.getElementById('waitingDriverCount').textContent = waitingDriver;
}

function renderRequests() {
    const container = document.getElementById('requestsList');
    const statusFilter = document.getElementById('statusFilter').value;
    const q = document.getElementById('searchBox').value.trim().toLowerCase();

    let filtered = requests.filter(r => {
        if (statusFilter !== 'all') {
            if (statusFilter === 'waiting-driver-update') {
                if (!(r.departmentCompleted === true && !r.driverCompleted)) return false;
            } else if (r.status !== statusFilter) return false;
        } else {
            // default hide completed
            if (r.status === 'completed') return false;
        }

        if (!q) return true;
        const searchable = `${r.id} ${r.location} ${r.phone} ${r.service}`.toLowerCase();
        return searchable.includes(q);
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="request-card"><p class="small">No requests found for selected filters.</p></div>`;
        return;
    }

    container.innerHTML = filtered.map(r => {
        const badge = r.status.replace('-', ' ').toUpperCase();
        const waitingDriverFlag = r.departmentCompleted && !r.driverCompleted ? '<div class="small" style="color:#e67e22">Waiting driver confirmation</div>' : '';
        return `
      <div class="request-card">
        <div class="request-header">
          <div class="id">SR${String(r.id).padStart(6, '0')} — ${r.service}</div>
          <div class="status-badge">${badge}</div>
        </div>
        <div class="request-body">
          <p class="small"><strong>Location:</strong> ${r.location}</p>
          <p class="small"><strong>Priority:</strong> ${r.priority}</p>
          <p class="small"><strong>Submitted:</strong> ${new Date(r.dateSubmitted).toLocaleString()}</p>
          <p class="small"><strong>Contact:</strong> ${r.phone || '—'}</p>
          <p class="small"><strong>Description:</strong> ${r.description || '—'}</p>
          ${waitingDriverFlag}
          <div class="request-actions">
            <button class="btn" onclick="openModal(${r.id})"><i class="fas fa-edit"></i> Update</button>
            <button class="btn" onclick="viewOnMap(${r.id})"><i class="fas fa-map-marker-alt"></i> Map</button>
          </div>
        </div>
      </div>
    `;
    }).join('');
}

// modal handling
function openModal(id) {
    activeRequestId = id;
    const req = requests.find(x => x.id === id);
    if (!req) return;
    document.getElementById('modalTitle').textContent = `Request SR${String(id).padStart(6, '0')}`;
    document.getElementById('notes').value = '';
    document.getElementById('deptAction').value = 'start';
    document.getElementById('forwardGroup').style.display = 'none';
    document.getElementById('modal').classList.add('active');
}
function closeModal() {
    document.getElementById('modal').classList.remove('active');
    activeRequestId = null;
}

async function submitModal() {
    if (!activeRequestId) return;
    const action = document.getElementById('deptAction').value;
    const notes = document.getElementById('notes').value;
    const forwardTo = document.getElementById('forwardTo').value;

    const request = requests.find(r => r.id === activeRequestId);
    if (!request) return alert('Request not found');

    // prepare update payload
    const payload = { ...request };
    // add history
    payload.history = payload.history || [];
    payload.history.push({
        by: currentUser,
        action,
        notes,
        timestamp: new Date().toISOString()
    });

    if (action === 'start') {
        payload.status = 'in-progress';
        payload.assignedTo = currentUser;
    } else if (action === 'complete') {
        payload.departmentCompleted = true;
        payload.departmentCompletedAt = new Date().toISOString();
        payload.status = 'waiting-driver-update';
    } else if (action === 'forward') {
        if (!forwardTo) return alert('Select department to forward');
        payload.department = forwardTo;
        payload.status = 'submitted';
        // clear departmentCompleted flags
        payload.departmentCompleted = false;
        payload.departmentCompletedAt = null;
    }

    // send update to backend
    try {
        const res = await fetch(`${API_BASE}/requests/${request.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Update failed');

        // update local copy by reloading
        await loadRequests();
        closeModal();
        alert('Updated successfully');
    } catch (err) {
        console.warn('Update failed, updating locally', err);
        // fallback local update (demo mode)
        Object.assign(request, payload);
        updateStats();
        renderRequests();
        closeModal();
    }
}

function viewOnMap(id) {
    const req = requests.find(r => r.id === id);
    if (req && req.coordinates) {
        window.open(`https://maps.google.com/?q=${req.coordinates.latitude},${req.coordinates.longitude}`, '_blank');
    } else {
        alert('No coordinates available');
    }
}

// Demo fallback data
function demoRequests() {
    return [
        { id: 101, service: 'Road Repair', department: 'Road Repair', location: 'Zone 1, Main Rd', description: 'Large pothole', priority: 'urgent', status: 'submitted', dateSubmitted: new Date().toISOString(), phone: '+91 9876543210', departmentCompleted: false, driverCompleted: false },
        { id: 102, service: 'Water Supply', department: 'Water Supply', location: 'Sector 9', description: 'No water since morning', priority: 'high', status: 'assigned', dateSubmitted: new Date().toISOString(), phone: '+91 9876500011', departmentCompleted: false, driverCompleted: false },
        { id: 103, service: 'Street Lighting', department: 'Street Lighting', location: 'Park Ave', description: 'Lamp post damaged', priority: 'medium', status: 'in-progress', dateSubmitted: new Date().toISOString(), phone: '+91 9876600022', departmentCompleted: false, driverCompleted: false }
    ];
}

// Expose functions to global scope for HTML onclick
window.handleLogin = handleLogin;
window.openModal = openModal;
window.closeModal = closeModal;
window.submitModal = submitModal;
window.viewOnMap = viewOnMap;
