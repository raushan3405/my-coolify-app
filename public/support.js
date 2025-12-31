document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#ticketsTable tbody');

    async function loadTickets() {
        try {
            const response = await fetch('/api/support');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const tickets = await response.json();

            tableBody.innerHTML = ''; // Clear existing data

            if (tickets.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No support tickets found.</td></tr>';
                return;
            }

            tickets.forEach(ticket => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${ticket.ticket_id}</td>
                    <td>${ticket.subject}</td>
                    <td>${ticket.customer_name || ticket.submitter_name || 'N/A'}</td>
                    <td>${ticket.priority}</td>
                    <td><span class="status" style="background-color:${getStatusColor(ticket.status)}; color: white; padding: 3px 8px; border-radius: 4px;">${ticket.status}</span></td>
                    <td>${ticket.formatted_updated_at}</td>
                    <td>
                        <a href="view-ticket.html?id=${ticket.ticket_id}" class="btn" style="background-color: #17a2b8; padding: 5px 10px;">View</a>
                        <button class="btn btn-delete" data-id="${ticket.ticket_id}" style="background-color: #dc3545; padding: 5px 10px;">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Failed to fetch tickets:', error);
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Failed to load data. Is the server running?</td></tr>';
        }
    }

    function getStatusColor(status) {
        switch (status) {
            case 'Open': return '#28a745'; // Green
            case 'In Progress': return '#ffc107'; // Yellow
            case 'Closed': return '#6c757d'; // Gray
            default: return '#6c757d';
        }
    }

    // Event listener for delete button clicks
    tableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('btn-delete')) {
            const recordId = event.target.dataset.id;
            
            if (confirm(`Are you sure you want to delete ticket #${recordId}?`)) {
                try {
                    const response = await fetch(`/api/support/${recordId}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        loadTickets(); // Refresh the list
                    } else {
                        const result = await response.json();
                        alert(`Error: ${result.msg || 'Could not delete ticket.'}`);
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    alert('An error occurred while trying to delete the ticket.');
                }
            }
        }
    });

    // Initial load
    loadTickets();
});
