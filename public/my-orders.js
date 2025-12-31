document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#ordersTable tbody');
    const kpiCards = {
        totalRevenue: document.querySelector('.card-revenue .card-body p'),
        totalOrder: document.querySelector('.card:nth-child(2) .card-body p'),
        pending: document.querySelector('.card:nth-child(3) .card-body p'),
        siteCrash: document.querySelector('.card:nth-child(4) .card-body p'),
        complete: document.querySelector('.card:nth-child(5) .card-body p'),
    };
    const orderStatuses = ['New', 'In Progress', 'Completed', 'Site Crash', 'Cancelled'];

    async function loadOrders() {
        try {
            const response = await fetch('/api/orders');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const orders = await response.json();

            tableBody.innerHTML = '';

            if (orders.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No orders found.</td></tr>';
                updateKpiCards([]);
                return;
            }

            orders.forEach(order => {
                const row = document.createElement('tr');
                const statusDropdown = `<select class="status-select" data-order-id="${order.order_id}">${orderStatuses.map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select>`;
                
                // Dynamically create the action button
                let actionButton = '';
                if (order.status === 'Completed') {
                    actionButton = `<button class="btn btn-generate-invoice" data-order-id="${order.order_id}" style="padding: 5px 10px; background-color: #17a2b8;">Gen. Invoice</button>`;
                } else {
                    actionButton = `<a href="#" class="btn" style="padding: 5px 10px; background-color: #6c757d; cursor: not-allowed;" disabled>View</a>`;
                }

                row.innerHTML = `
                    <td>${order.date}</td>
                    <td>${order.time}</td>
                    <td>${order.cust_id}</td>
                    <td>${order.customer_name || 'N/A'}</td>
                    <td>${order.fs_code}</td>
                    <td>${order.service_name || 'N/A'}</td>
                    <td>${order.ftm_name || 'N/A'}</td>
                    <td>${statusDropdown}</td>
                    <td>${actionButton}</td>
                `;
                tableBody.appendChild(row);
            });

            updateKpiCards(orders);

        } catch (error) {
            console.error('Failed to fetch orders:', error);
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:red;">Failed to load data.</td></tr>';
        }
    }

    function updateKpiCards(orders) {
        let pendingCount = 0, completeCount = 0, siteCrashCount = 0;
        orders.forEach(order => {
            if (['New', 'In Progress', 'Pending'].includes(order.status)) pendingCount++;
            if (order.status === 'Completed') completeCount++;
            if (order.status === 'Site Crash') siteCrashCount++;
        });
        kpiCards.totalOrder.textContent = orders.length;
        kpiCards.pending.textContent = pendingCount;
        kpiCards.complete.textContent = completeCount;
        kpiCards.siteCrash.textContent = siteCrashCount;
    }

    // Event delegation for table body clicks and changes
    tableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('btn-generate-invoice')) {
            const orderId = event.target.dataset.orderId;
            event.target.textContent = 'Generating...';
            event.target.disabled = true;

            try {
                const response = await fetch('/api/invoices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order_id: orderId })
                });
                const result = await response.json();
                if (response.ok) {
                    alert(`Invoice ${result.invoice_number} created successfully!`);
                    window.location.href = `invoice-view.html?id=${result.invoice_id}`;
                } else {
                    alert(`Error: ${result.msg}`);
                    event.target.textContent = 'Gen. Invoice';
                    event.target.disabled = false;
                }
            } catch (error) {
                console.error('Invoice generation error:', error);
                alert('A network error occurred.');
                event.target.textContent = 'Gen. Invoice';
                event.target.disabled = false;
            }
        }
    });

    tableBody.addEventListener('change', async (event) => {
        if (event.target.classList.contains('status-select')) {
            const orderId = event.target.dataset.orderId;
            const newStatus = event.target.value;
            try {
                const response = await fetch(`/api/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.msg || 'Failed to update status');
                }
                loadOrders(); // Reload everything
            } catch (error) {
                alert(`Failed to update status: ${error.message}`);
                loadOrders(); // Revert dropdown on failure
            }
        }
    });

    loadOrders();
});
