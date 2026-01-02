// This script should be included in every protected HTML file.

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// 1. Authentication Guard: If no token, redirect to login page.
if (!token) {
    if (!window.location.pathname.endsWith('login.html')) {
        window.location.href = 'login.html';
    }
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
    window.location.href = 'login.html';
}

// 4. Dynamic UI adjustments based on role
document.addEventListener('DOMContentLoaded', () => {
    if (!isManager()) {
        // Hide F-Team link in sidebar
        const fTeamLink = document.querySelector('a[href="f-team.html"]');
        if (fTeamLink) {
            fTeamLink.parentElement.style.display = 'none';
        }
    }
});
