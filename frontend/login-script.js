document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        console.log('Attempting login with:', username, password);

        // Mock authentication
        if (username && password) {
            // Check against registered users
            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('civiq_users') || '[]');
            } catch (e) {
                console.error('Error parsing users:', e);
                users = [];
            }
            console.log('Registered users:', users);

            const user = users.find(u => u.username === username && u.password === password);
            console.log('Found user:', user);

            if (user) {
                // Save username to localStorage
                localStorage.setItem('civiq_user', user.fullName); // Use full name for display

                // Add a small delay to simulate processing and show button feedback
                const btn = loginForm.querySelector('.login-btn');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Logging in...';
                btn.disabled = true;

                setTimeout(() => {
                    // Redirect to index.html
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                alert("Invalid username or password. Please try again or register.");
            }
        }
    });
});
