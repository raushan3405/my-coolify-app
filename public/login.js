document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const messageDiv = document.getElementById('form-message');
    const submitButton = form.querySelector('button[type="submit"]');

    // Check if user is already logged in
    if (localStorage.getItem('token')) {
        window.location.href = 'index.html';
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        messageDiv.textContent = '';

        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `Logging in... <span class="loader"></span>`;

        const email = form.email.value;
        const password = form.password.value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (response.ok) {
                // Store token and user info in local storage
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                
                // Redirect to dashboard
                window.location.href = 'index.html';
            } else {
                messageDiv.textContent = result.msg || 'Login failed.';
                messageDiv.style.color = 'red';
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        } catch (error) {
            console.error('Login error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
});
