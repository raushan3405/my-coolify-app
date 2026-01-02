document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (!form) return;

    let messageDiv = document.getElementById('form-message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'form-message';
        form.prepend(messageDiv);
    }

    const submitButton = form.querySelector('button[type="submit"]');

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

            if (response.ok && result.success) {
                // IMPORTANT: Save user info for UI personalization (e.g., showing name/role)
                localStorage.setItem('user', JSON.stringify(result.user));
                
                // The server has set the secure cookie. Now, redirect.
                window.location.href = '/';
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
