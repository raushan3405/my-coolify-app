document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#customersTable tbody');
    const searchInput = document.querySelector('input[placeholder="Search Customers..."]');
    const searchButton = document.querySelector('button.btn-dark');
    const newCustomerButton = document.querySelector('a.btn:not(.btn-dark)');

    // Hide New Customer button for non-managers
    if (!isManager()) {
        newCustomerButton.style.display = 'none';
    }

    async function loadCustomers(searchTerm = '') {
        try {
            const url = searchTerm ? `/api/customers?search=${encodeURIComponent(searchTerm)}` : '/api/customers';
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
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
                    <td>${customer.full_name}</td>
                    <td>${customer.email || 'N/A'}</td>
                    <td>${customer.mobile_number}</td>
                    <td>${customer.gender || 'N/A'}</td>
                    <td>${customer.caste || 'N/A'}</td>
                    <td>${customer.address || 'N/A'}</td>
                    <td>
                        <a href="customer-details.html?id=${customer.cust_id}" class="btn">More Details</a>
                    </td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Failed to fetch customers:', error);
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red;">Failed to load data. Is the server running?</td></tr>';
        }
    }

    searchButton.addEventListener('click', () => loadCustomers(searchInput.value));
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') loadCustomers(searchInput.value);
    });

    loadCustomers();
});
