document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#customersTable tbody');
    const searchInput = document.querySelector('input[placeholder="Cust Search"]');
    const searchButton = document.querySelector('button.btn-dark');

    // Function to fetch customer data and populate the table
    async function loadCustomers(searchTerm = '') {
        try {
            const url = searchTerm ? `/api/customers?search=${encodeURIComponent(searchTerm)}` : '/api/customers';
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const customers = await response.json();

            tableBody.innerHTML = '';

            if (customers.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No customers found.</td></tr>';
                return;
            }

            customers.forEach(customer => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${customer.cust_id}</td>
                    <td>${customer.name}</td>
                    <td>${customer.email || 'N/A'}</td>
                    <td>${customer.mob_no}</td>
                    <td>${customer.gender}</td>
                    <td>${customer.caste}</td>
                    <td>${customer.address}</td>
                    <td>
                        <a href="edit-customer.html?id=${customer.cust_id}" class="btn" style="background-color: #ffc107; padding: 5px 10px; margin-right: 5px;">Edit</a>
                        <button class="btn btn-delete" data-id="${customer.cust_id}" style="background-color: #dc3545; padding: 5px 10px;">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Failed to fetch customers:', error);
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red;">Failed to load data. Is the server running?</td></tr>';
        }
    }

    // Event listener for delete button clicks (using event delegation)
    tableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('btn-delete')) {
            const customerId = event.target.dataset.id;
            
            if (confirm(`Are you sure you want to delete customer ${customerId}?`)) {
                try {
                    const response = await fetch(`/api/customers/${customerId}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        // Refresh the customer list to show the change
                        loadCustomers(searchInput.value);
                    } else {
                        const result = await response.json();
                        alert(`Error: ${result.msg || 'Could not delete customer.'}`);
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    alert('An error occurred while trying to delete the customer.');
                }
            }
        }
    });

    // Event listeners for search
    searchButton.addEventListener('click', () => loadCustomers(searchInput.value));
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            loadCustomers(searchInput.value);
        }
    });

    // Initial load of customer data
    loadCustomers();
});
