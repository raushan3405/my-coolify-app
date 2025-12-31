document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('editCustomerForm');
    const messageDiv = document.getElementById('form-message');
    const customerId = new URLSearchParams(window.location.search).get('id');

    if (!customerId) {
        messageDiv.textContent = 'No customer ID provided. Redirecting...';
        messageDiv.style.color = 'red';
        setTimeout(() => { window.location.href = 'customers.html'; }, 2000);
        return;
    }

    // --- Fetch and Populate Existing Data ---
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (!response.ok) {
            throw new Error('Customer not found.');
        }
        const customer = await response.json();

        for (const key in customer) {
            if (form.elements[key]) {
                form.elements[key].value = customer[key];
            }
        }

    } catch (error) {
        console.error('Failed to load customer data:', error);
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
            const response = await fetch(`/api/customers/${customerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Customer updated successfully! Redirecting...';
                messageDiv.style.color = 'green';

                setTimeout(() => {
                    window.location.href = 'customers.html';
                }, 2000);

            } else {
                messageDiv.textContent = `Error: ${result.msg || 'Could not update customer.'}`;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Update error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
            messageDiv.style.color = 'red';
        }
    });
});
