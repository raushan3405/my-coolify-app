document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newServiceForm');
    const messageDiv = document.getElementById('form-message');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const serviceData = Object.fromEntries(formData.entries());

        messageDiv.textContent = '';

        try {
            const response = await fetch('/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(serviceData),
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Service created successfully! Redirecting to service list...';
                messageDiv.style.color = 'green';
                form.reset();

                setTimeout(() => {
                    window.location.href = 'services.html';
                }, 2000);

            } else {
                messageDiv.textContent = `Error: ${result.msg || 'Could not create service.'}`;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Submission error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
            messageDiv.style.color = 'red';
        }
    });
});
