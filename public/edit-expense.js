document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('editExpenseForm');
    const messageDiv = document.getElementById('form-message');
    const recordId = new URLSearchParams(window.location.search).get('id');

    if (!recordId) {
        messageDiv.textContent = 'No record ID provided. Redirecting...';
        messageDiv.style.color = 'red';
        setTimeout(() => { window.location.href = 'budget-expenses.html'; }, 2000);
        return;
    }

    // --- Fetch and Populate Existing Data ---
    try {
        const response = await fetch(`/api/budget/expenses/${recordId}`);
        if (!response.ok) {
            throw new Error('Expense record not found.');
        }
        const record = await response.json();

        // Populate the form
        for (const key in record) {
            if (form.elements[key]) {
                form.elements[key].value = record[key];
            }
        }

    } catch (error) {
        console.error('Failed to load expense data:', error);
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
            const response = await fetch(`/api/budget/expenses/${recordId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Expense record updated successfully! Redirecting...';
                messageDiv.style.color = 'green';
                setTimeout(() => { window.location.href = 'budget-expenses.html'; }, 2000);
            } else {
                messageDiv.textContent = `Error: ${result.msg || 'Could not update record.'}`;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Update error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
            messageDiv.style.color = 'red';
        }
    });
});
