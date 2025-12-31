document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#salesTable tbody');

    async function loadSales() {
        try {
            const response = await fetch('/api/sales');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const sales = await response.json();

            tableBody.innerHTML = ''; // Clear existing data

            if (sales.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="15" style="text-align:center;">No sales records found.</td></tr>';
                return;
            }

            sales.forEach(sale => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${sale.cust_id}</td>
                    <td>${sale.customer_name || 'N/A'}</td>
                    <td>${sale.gender || 'N/A'}</td>
                    <td>${sale.mob_no || 'N/A'}</td>
                    <td>${sale.caste || 'N/A'}</td>
                    <td>${sale.fs_code}</td>
                    <td>${sale.service_name || 'N/A'}</td>
                    <td>${sale.category || 'N/A'}</td>
                    <td>${sale.date}</td>
                    <td>${sale.time}</td>
                    <td>${sale.ftm_code || 'N/A'}</td>
                    <td>${sale.ftm_name || 'N/A'}</td>
                    <td>${sale.govt_cost ? `₹${sale.govt_cost}` : '₹0'}</td>
                    <td>${sale.service_cost ? `₹${sale.service_cost}` : '₹0'}</td>
                    <td>${sale.sale_amount ? `₹${sale.sale_amount}` : '₹0'}</td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Failed to fetch sales:', error);
            tableBody.innerHTML = '<tr><td colspan="15" style="text-align:center; color:red;">Failed to load data. Is the server running?</td></tr>';
        }
    }

    // Initial load of sales data
    loadSales();
});
