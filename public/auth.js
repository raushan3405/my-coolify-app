// This script is included in the main app shell (index.html)

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// 1. Authentication Guard: If no token, redirect to the login route.
if (!token) {
    window.location.href = '/login';
}

// 2. Authorization Helpers
function getCurrentUser() {
    return user;
}

function isManager() {
    return user && (user.role === 'Manager' || user.role === 'Admin');
}

// 3. Logout Function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// 4. Dynamic UI adjustments based on role
document.addEventListener('DOMContentLoaded', () => {
    // This code runs after the main content is loaded
    if (user && !isManager()) {
        // Hide elements meant only for managers
        const managerOnlyElements = document.querySelectorAll('.manager-only');
        managerOnlyElements.forEach(el => {
            el.style.display = 'none';
        });
    }
    
    // Welcome message
    const welcomeEl = document.getElementById('welcome-message');
    if(welcomeEl && user) {
        welcomeEl.textContent = `Welcome, ${user.name}!`;
    }
});
