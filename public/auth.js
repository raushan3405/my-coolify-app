// This script is included in every protected HTML file.

// Get user info from localStorage, saved during login
const user = JSON.parse(localStorage.getItem('user'));

// NOTE: The primary authentication guard (checking for a token)
// is now handled on the SERVER SIDE before any page is sent.
// This script now only handles UI personalization and logout.


// --- Authorization & UI Helpers ---

function getCurrentUser() {
    return user;
}

function isManager() {
    return user && (user.role === 'Manager' || user.role === 'Admin');
}

// --- Logout Function ---

async function logout() {
    try {
        // Tell the server to clear the authentication cookie
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout API call failed:', error);
    }
    
    // Always clear local storage and redirect, regardless of API success
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// --- Dynamic UI adjustments based on role ---

document.addEventListener('DOMContentLoaded', () => {
    // Welcome message
    const welcomeEl = document.getElementById('welcome-message');
    if (welcomeEl && user) {
        welcomeEl.textContent = `Welcome, ${user.name}!`;
    }

    // Hide elements meant only for managers if the user is not a manager
    if (user && !isManager()) {
        const managerOnlyElements = document.querySelectorAll('.manager-only');
        managerOnlyElements.forEach(el => {
            el.style.display = 'none';
        });
    }
});
