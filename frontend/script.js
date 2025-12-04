// API Configuration
const API_BASE = "http://localhost:3000/api";

let serviceRequests = [];
let currentRequestId = null;

// get driver's department from localStorage; you can set it via a login screen
let driverDept = localStorage.getItem('civiq_driver_department') || 'All Services';

// Initialize app
async function init() {
    try {
        await loadRequests();

        // Load user profile
        const username = localStorage.getItem('civiq_user') || 'Driver';
        document.getElementById('driverName').textContent = username;

        // Set department dropdown value
        const deptSelect = document.getElementById('driverDeptSelect');
        if (deptSelect) {
            deptSelect.value = driverDept;
        }

        await fetchStats();
        displayRequests();
        setupEventListeners();
        showNotification('Connected to backend successfully!', 'success');
    } catch (error) {
        console.error('Failed to initialize:', error);
        showNotification('Failed to connect to backend. Make sure server is running.', 'error');
        // Load demo data as fallback
        loadDemoData();
    }
}

// Load requests from backend
async function loadRequests() {
    const response = await fetch(`${API_BASE}/requests`);
    if (!response.ok) throw new Error('Failed to fetch requests');
    serviceRequests = await response.json();
    // We now keep ALL requests and filter in displayRequests
}

// Load demo data if backend is unavailable
function loadDemoData() {
    serviceRequests = [
        {
            id: 1,
            service: 'Road Repair',
            department: 'Road Repair',
            location: 'MP Nagar, Zone 1, Bhopal',
            description: 'Large pothole on main road causing traffic issues. Multiple complaints received.',
            priority: 'urgent',
            status: 'submitted',
            dateSubmitted: '2024-11-26T09:30:00',
            phone: '+91 98765 43210',
            coordinates: { latitude: 23.2599, longitude: 77.4126 },
            departmentCompleted: false,
            driverCompleted: false
        },
        {
            id: 2,
            service: 'Water Supply',
            department: 'Water Supply',
            location: 'Arera Colony, Bhopal',
            description: 'No water supply for past 24 hours. Pipe leak reported near main junction.',
            priority: 'high',
            status: 'assigned',
            dateSubmitted: '2024-11-26T08:15:00',
            phone: '+91 98765 43211',
            coordinates: { latitude: 23.2156, longitude: 77.4304 },
            departmentCompleted: false,
            driverCompleted: false
        }
    ];
    updateStats();
    displayRequests();
}

function setupEventListeners() {
    document.getElementById('statusFilter').addEventListener('change', displayRequests);
    document.getElementById('serviceFilter').addEventListener('change', displayRequests);
    document.getElementById('priorityFilter').addEventListener('change', displayRequests);

    // Forward department dropdown listener
    const statusUpdate = document.getElementById('statusUpdate');
    if (statusUpdate) {
        statusUpdate.addEventListener('change', function () {
            const show = this.value === 'forward-dept';
            const forwardGroup = document.getElementById('departmentForwardGroup');
            if (forwardGroup) forwardGroup.style.display = show ? 'block' : 'none';
        });
    }
}

// Fetch stats from backend
async function fetchStats() {
    try {
        const response = await fetch('http://localhost:3000/api/dashboard-stats');
        const stats = await response.json();

        document.getElementById('pendingCount').textContent = stats.pending;
        document.getElementById('activeCount').textContent = stats.active;
        document.getElementById('completedCount').textContent = stats.completedToday;
        document.getElementById('totalCount').textContent = stats.total;
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

function updateStats() {
    fetchStats();
}

function displayRequests() {
    const statusFilter = document.getElementById('statusFilter').value;
    const serviceFilter = document.getElementById('serviceFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;

    let filtered = serviceRequests.filter(request => {
        // Filter by current driver department (unless 'All Services' is selected)
        if (driverDept !== 'All Services' && request.department !== driverDept) return false;

        let matchStatus;
        if (statusFilter === 'all') {
            matchStatus = request.status !== 'completed'; // Hide completed by default
        } else if (statusFilter === 'assigned') {
            // Show both assigned (waiting) and in-progress (active) tasks
            matchStatus = request.status === 'assigned' || request.status === 'in-progress';
        } else {
            matchStatus = request.status === statusFilter;
        }

        const matchService = serviceFilter === 'all' || request.service === serviceFilter;
        const matchPriority = priorityFilter === 'all' || request.priority === priorityFilter;
        return matchStatus && matchService && matchPriority;
    });

    const container = document.getElementById('requestsContainer');

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No requests found for ${driverDept}</h3>
                <p>Try adjusting your filters or check back later</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(request => {
        const statusClass = `status-${request.status}`;
        const priorityClass = `priority-${request.priority}`;
        const date = new Date(request.dateSubmitted).toLocaleString();

        let actionButtons = '';
        if (request.status === 'submitted') {
            actionButtons = `<button class="btn btn-primary" onclick="openUpdateModal(${request.id})">
                <i class="fas fa-user-check"></i> Assign to Me
            </button>`;
        } else if (request.status === 'assigned') {
            actionButtons = `<button class="btn btn-primary" onclick="openUpdateModal(${request.id})">
                <i class="fas fa-play"></i> Start Work
            </button>`;
        } else if (request.status === 'in-progress') {
            actionButtons = `<button class="btn btn-success" onclick="openUpdateModal(${request.id})">
                <i class="fas fa-check"></i> Mark as Completed
            </button>`;
        } else if (request.status === 'waiting-driver-update') {
            actionButtons = `<button class="btn btn-warning" onclick="openUpdateModal(${request.id})">
                <i class="fas fa-clock"></i> Waiting Confirmation
            </button>`;
        }

        // show confirm button if department reported completion
        if (request.departmentCompleted === true && !request.driverCompleted) {
            actionButtons += `<button class="btn btn-success" onclick="openUpdateModal(${request.id})">
                <i class="fas fa-check-double"></i> Confirm Completion
            </button>`;
        }

        const mapsLink = request.coordinates
            ? `https://maps.google.com/?q=${request.coordinates.latitude},${request.coordinates.longitude}`
            : '#';
        const photoSection = request.photo ? `
            <div class="request-photo">
                <h4><i class="fas fa-camera"></i> Photo Evidence</h4>
                <img src="${request.photo}" alt="Uploaded issue photo" loading="lazy">
            </div>
        ` : '';

        return `
            <div class="request-card">
                <div class="request-header">
                    <div class="request-id">Request #SR${String(request.id).padStart(6, '0')}</div>
                    <span class="status-badge ${statusClass}">
                        ${request.status.replace('-', ' ').toUpperCase()}
                    </span>
                </div>
                <div class="request-body">
                    <div class="request-info">
                        <div class="info-item">
                            <i class="fas fa-tools info-icon"></i>
                            <div class="info-content">
                                <h4>Service Type</h4>
                                <p>${request.service}</p>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-map-marker-alt info-icon"></i>
                            <div class="info-content">
                                <h4>Location</h4>
                                <p>${request.location}</p>
                                <a href="${mapsLink}" target="_blank" class="location-link">
                                    <i class="fas fa-external-link-alt"></i> Open in Maps
                                </a>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-exclamation-triangle info-icon"></i>
                            <div class="info-content">
                                <h4>Priority</h4>
                                <span class="priority-badge ${priorityClass}">
                                    ${request.priority.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-phone info-icon"></i>
                            <div class="info-content">
                                <h4>Contact</h4>
                                <p>${request.phone}</p>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-calendar info-icon"></i>
                            <div class="info-content">
                                <h4>Submitted</h4>
                                <p>${date}</p>
                            </div>
                        </div>
                    </div>
                    <div class="info-item" style="grid-column: 1/-1;">
                        <i class="fas fa-info-circle info-icon"></i>
                        <div class="info-content">
                            <h4>Description</h4>
                            <p>${request.description}</p>
                        </div>
                    </div>
                    ${photoSection}
                    <div class="request-actions">
                        ${actionButtons}
                        <button class="btn btn-secondary" onclick="viewDetails(${request.id})">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openUpdateModal(requestId) {
    currentRequestId = requestId;
    const request = serviceRequests.find(r => r.id === requestId);

    const statusSelect = document.getElementById('statusUpdate');
    statusSelect.innerHTML = '';

    if (request.status === 'submitted') {
        statusSelect.innerHTML = '<option value="assigned">Assign to Me</option><option value="forward-dept">Forward to Department</option>';
    } else if (request.status === 'assigned') {
        statusSelect.innerHTML = '<option value="in-progress">Start Work</option><option value="forward-dept">Forward to Department</option>';
    } else if (request.status === 'in-progress') {
        statusSelect.innerHTML = '<option value="completed">Mark as Completed</option><option value="forward-dept">Forward to Department</option>';
    } else if (request.status === 'waiting-driver-update') {
        // Only allow confirming or forwarding
        statusSelect.innerHTML = '<option value="forward-dept">Forward to Department</option>';
    }

    if (request.departmentCompleted === true && !request.driverCompleted) {
        statusSelect.innerHTML += '<option value="driver-confirm">Confirm Work Completion</option>';
    }

    document.getElementById('updateNotes').value = '';
    const forwardGroup = document.getElementById('departmentForwardGroup');
    if (forwardGroup) forwardGroup.style.display = 'none';

    // Select first option by default
    if (statusSelect.firstChild) {
        document.getElementById('statusUpdate').value = statusSelect.firstChild.value;
    }

    document.getElementById('updateModal').classList.add('active');
}

function closeModal() {
    document.getElementById('updateModal').classList.remove('active');
    currentRequestId = null;
}

async function submitUpdate() {
    const newStatus = document.getElementById('statusUpdate').value;
    const notes = document.getElementById('updateNotes').value;

    const request = serviceRequests.find(r => r.id === currentRequestId);
    if (!request) return;

    // Add history entry
    request.history = request.history || [];
    request.history.push({
        by: driverDept,
        notes,
        timestamp: new Date().toISOString()
    });

    if (newStatus === 'assigned') {
        request.status = 'assigned';
        request.assignedTo = driverDept;
    } else if (newStatus === 'in-progress') {
        request.status = 'in-progress';
    } else if (newStatus === 'completed') {
        // driver marking done (if driver finishes by themselves)
        request.driverCompleted = true;
        request.status = 'completed';
    } else if (newStatus === 'forward-dept') {
        const newDept = document.getElementById('forwardDepartment').value;
        if (!newDept) { showNotification('Select a department', 'error'); return; }
        request.department = newDept;
        request.status = 'submitted';
        request.departmentCompleted = false;
        request.departmentCompletedAt = null;
    } else if (newStatus === 'driver-confirm') {
        request.driverCompleted = true;
        request.status = 'completed';
    }

    try {
        // Send update to backend
        const response = await fetch(`${API_BASE}/requests/${request.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request)
        });

        if (!response.ok) throw new Error('Update failed');

        // Reload requests from backend
        await loadRequests();
        updateStats();
        displayRequests();
        closeModal();

        let message = 'Request updated successfully!';
        if (newStatus === 'assigned') {
            message = 'Request assigned successfully!';
        } else if (newStatus === 'in-progress') {
            message = 'Work started on request!';
        } else if (newStatus === 'completed' || newStatus === 'driver-confirm') {
            message = 'Request marked as completed!';
        } else if (newStatus === 'forward-dept') {
            message = 'Request forwarded to ' + request.department;
        }

        showNotification(message, 'success');
    } catch (error) {
        console.error('Update failed:', error);
        showNotification('Failed to update request. Please try again.', 'error');
    }
}

function viewDetails(requestId) {
    const request = serviceRequests.find(r => r.id === requestId);
    if (request && request.coordinates) {
        window.open(`https://maps.google.com/?q=${request.coordinates.latitude},${request.coordinates.longitude}`, '_blank');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    notification.className = `notification ${type}`;
    notificationText.textContent = message;

    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function logout() {
    localStorage.removeItem('civiq_user');
    window.location.href = 'login.html';
}

window.onclick = function (event) {
    const modal = document.getElementById('updateModal');
    if (event.target === modal) {
        closeModal();
    }
}

function switchDepartment(newDept) {
    driverDept = newDept;
    localStorage.setItem('civiq_driver_department', newDept);
    // No reload needed, just re-filter
    displayRequests();
}

// Initialize when page loads
init();
