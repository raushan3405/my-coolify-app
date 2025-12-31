document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#incomeTable tbody');

    async function loadIncome() {
        try {
            const response = await fetch('/api/budget/income');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const incomeRecords = await response.json();

            tableBody.innerHTML = ''; // Clear existing data

            if (incomeRecords.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No income records found.</td></tr>';
                return;
            }

            incomeRecords.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.income_date}</td>
                    <td>${record.source}</td>
                    <td>${record.description || 'N/A'}</td>
                    <td>₹${parseFloat(record.amount).toFixed(2)}</td>
                    <td>
                        <a href="edit-income.html?id=${record.income_id}" class="btn" style="background-color: #ffc107; padding: 5px 10px;">Edit</a>
                        <button class="btn btn-delete" data-id="${record.income_id}" style="background-color: #dc3545; padding: 5px 10px;">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Failed to fetch income:', error);
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load data. Is the server running?</td></tr>';
        }
    }

    // Event listener for delete button clicks
    tableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('btn-delete')) {
            const recordId = event.target.dataset.id;
            
            if (confirm(`Are you sure you want to delete this income record?`)) {
                try {
                    const response = await fetch(`/api/budget/income/${recordId}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        loadIncome(); // Refresh the list
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
    loadIncome();
});
