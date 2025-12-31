document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('newTicketForm');
    const messageDiv = document.getElementById('form-message');
    const customerSelect = document.getElementById('cust_id');

    // --- 1. Fetch and Populate Customers Dropdown ---
    async function loadCustomers() {
        try {
            const response = await fetch('/api/customers');
            if (!response.ok) throw new Error('Failed to load customers');
            const customers = await response.json();

            customerSelect.innerHTML = '<option value="">-- Select an existing customer --</option>';
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.cust_id;
                option.textContent = `${customer.name} (${customer.cust_id})`;
                customerSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Customer loading error:', error);
            customerSelect.innerHTML = '<option value="">Could not load customers</option>';
        }
    }

    // --- 2. Handle Form Submission ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const ticketData = Object.fromEntries(formData.entries());

        messageDiv.textContent = '';

        // Basic validation: either a customer is selected or name/email is provided
        if (!ticketData.cust_id && (!ticketData.submitter_name || !ticketData.submitter_email)) {
            messageDiv.textContent = 'Please either select an existing customer or provide a name and email.';
            messageDiv.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketData),
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Support ticket created successfully! Redirecting...';
                messageDiv.style.color = 'green';
                form.reset();
                setTimeout(() => { window.location.href = 'support.html'; }, 2000);
            } else {
                messageDiv.textContent = `Error: ${result.msg || 'Could not create ticket.'}`;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Submission error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
            messageDiv.style.color = 'red';
        }
    });

    // --- Initial Load ---
    loadCustomers();
});
