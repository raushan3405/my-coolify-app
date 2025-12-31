document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newExpenseForm');
    const messageDiv = document.getElementById('form-message');

    // Set default date to today
    document.getElementById('expense_date').valueAsDate = new Date();

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const expenseData = Object.fromEntries(formData.entries());

        messageDiv.textContent = '';

        try {
            const response = await fetch('/api/budget/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expenseData),
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Expense record created successfully! Redirecting...';
                messageDiv.style.color = 'green';
                form.reset();
                setTimeout(() => { window.location.href = 'budget-expenses.html'; }, 2000);
            } else {
                messageDiv.textContent = `Error: ${result.msg || 'Could not create record.'}`;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Submission error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
            messageDiv.style.color = 'red';
        }
    });
});
