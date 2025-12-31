document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#invoicesTable tbody');

    async function loadInvoices() {
        try {
            const response = await fetch('/api/invoices');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const invoices = await response.json();

            tableBody.innerHTML = ''; // Clear existing data

            if (invoices.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No invoices found.</td></tr>';
                return;
            }

            invoices.forEach(invoice => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${invoice.invoice_number}</td>
                    <td>${invoice.customer_name || 'N/A'}</td>
                    <td>${invoice.issue_date}</td>
                    <td>${invoice.due_date}</td>
                    <td>${invoice.grand_total ? `₹${parseFloat(invoice.grand_total).toFixed(2)}` : '₹0.00'}</td>
                    <td><span class="status" style="background-color:${getStatusColor(invoice.status)}; color: white; padding: 3px 8px; border-radius: 4px;">${invoice.status}</span></td>
                    <td>
                        <a href="invoice-view.html?id=${invoice.invoice_id}" class="btn" style="padding: 5px 10px;">View</a>
                    </td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Failed to fetch invoices:', error);
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Failed to load data. Is the server running?</td></tr>';
        }
    }

    function getStatusColor(status) {
        switch (status) {
            case 'Paid': return '#28a745'; // Green
            case 'Unpaid': return '#ffc107'; // Yellow
            case 'Overdue': return '#dc3545'; // Red
            case 'Cancelled': return '#6c757d'; // Gray
            default: return '#6c757d';
        }
    }

    // Initial load of invoice data
    loadInvoices();
});
