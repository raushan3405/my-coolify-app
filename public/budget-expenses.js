document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#expensesTable tbody');

    async function loadExpenses() {
        try {
            const response = await fetch('/api/budget/expenses');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const expenseRecords = await response.json();

            tableBody.innerHTML = ''; // Clear existing data

            if (expenseRecords.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No expense records found.</td></tr>';
                return;
            }

            expenseRecords.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.expense_date}</td>
                    <td>${record.category}</td>
                    <td>${record.description || 'N/A'}</td>
                    <td>₹${parseFloat(record.amount).toFixed(2)}</td>
                    <td>
                        <a href="edit-expense.html?id=${record.expense_id}" class="btn" style="background-color: #ffc107; padding: 5px 10px;">Edit</a>
                        <button class="btn btn-delete" data-id="${record.expense_id}" style="background-color: #dc3545; padding: 5px 10px;">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Failed to fetch expenses:', error);
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load data. Is the server running?</td></tr>';
        }
    }

    // Event listener for delete button clicks
    tableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('btn-delete')) {
            const recordId = event.target.dataset.id;
            
            if (confirm(`Are you sure you want to delete this expense record?`)) {
                try {
                    const response = await fetch(`/api/budget/expenses/${recordId}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        loadExpenses(); // Refresh the list
                    } else {
                        const result = await response.json();
                        alert(`Error: ${result.msg || 'Could not delete record.'}`);
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    alert('An error occurred while trying to delete the record.');
                }
            }
        }
    });

    // Initial load
    loadExpenses();
});
