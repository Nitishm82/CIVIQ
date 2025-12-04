document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (password.length < 4) {
            alert("Password must be at least 4 characters long.");
            return;
        }

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('civiq_users') || '[]');
        console.log('Current users:', users);

        if (users.some(u => u.username === username)) {
            alert("Username already exists. Please choose another one.");
            return;
        }

        // Register user
        const newUser = {
            fullName,
            username,
            password
        };

        users.push(newUser);
        localStorage.setItem('civiq_users', JSON.stringify(users));
        console.log('User registered:', newUser);
        console.log('Updated users list:', users);

        // Show success and redirect
        const btn = registerForm.querySelector('.login-btn');
        btn.innerHTML = '<i class="fas fa-check"></i> Registered!';
        btn.style.backgroundColor = '#10b981'; // Success green
        btn.disabled = true;

        setTimeout(() => {
            alert("Registration successful! Please login.");
            window.location.href = 'login.html';
        }, 1000);
    });
});
