document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newCustomerForm');
    const messageDiv = document.getElementById('form-message');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        // Create a data object from the form fields
        const formData = new FormData(form);
        const customerData = Object.fromEntries(formData.entries());

        // Clear previous messages
        messageDiv.textContent = '';
        messageDiv.style.color = 'black';

        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customerData),
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Customer created successfully! Redirecting to customer list...';
                messageDiv.style.color = 'green';
                form.reset(); // Clear the form fields

                // Redirect back to the customer list after a short delay
                setTimeout(() => {
                    window.location.href = 'customers.html';
                }, 2000);

            } else {
                // Display error message from the server (e.g., duplicate ID)
                messageDiv.textContent = `Error: ${result.msg || 'Could not create customer.'}`;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Submission error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
            messageDiv.style.color = 'red';
        }
    });
});
