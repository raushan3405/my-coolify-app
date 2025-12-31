document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('editServiceForm');
    const messageDiv = document.getElementById('form-message');
    const serviceId = new URLSearchParams(window.location.search).get('id');

    if (!serviceId) {
        messageDiv.textContent = 'No service ID provided. Redirecting...';
        messageDiv.style.color = 'red';
        setTimeout(() => { window.location.href = 'services.html'; }, 2000);
        return;
    }

    // --- Fetch and Populate Existing Data ---
    try {
        const response = await fetch(`/api/services/${serviceId}`);
        if (!response.ok) {
            throw new Error('Service not found.');
        }
        const service = await response.json();

        for (const key in service) {
            if (form.elements[key]) {
                form.elements[key].value = service[key];
            }
        }

    } catch (error) {
        console.error('Failed to load service data:', error);
        messageDiv.textContent = `Error: ${error.message}`;
        messageDiv.style.color = 'red';
    }

    // --- Handle Form Submission for Update ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(form);
        const updatedData = Object.fromEntries(formData.entries());

        messageDiv.textContent = '';

        try {
            const response = await fetch(`/api/services/${serviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Service updated successfully! Redirecting...';
                messageDiv.style.color = 'green';

                setTimeout(() => {
                    window.location.href = 'services.html';
                }, 2000);

            } else {
                messageDiv.textContent = `Error: ${result.msg || 'Could not update service.'}`;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Update error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
            messageDiv.style.color = 'red';
        }
    });
});
