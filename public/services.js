document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#servicesTable tbody');
    const searchInput = document.querySelector('input[placeholder="Search Services..."]');
    const searchButton = document.querySelector('button.btn-dark');

    async function loadServices(searchTerm = '') {
        try {
            const url = searchTerm ? `/api/services?search=${encodeURIComponent(searchTerm)}` : '/api/services';
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const services = await response.json();

            tableBody.innerHTML = '';

            if (services.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No services found.</td></tr>';
                return;
            }

            services.forEach(service => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${service.fs_code}</td>
                    <td>${service.service_name}</td>
                    <td>${service.category || 'N/A'}</td>
                    <td>${service.price ? `₹${service.price}` : 'N/A'}</td>
                    <td>
                        <a href="edit-service.html?id=${service.fs_code}" class="btn" style="background-color: #ffc107; padding: 5px 10px; margin-right: 5px;">Edit</a>
                        <button class="btn btn-delete" data-id="${service.fs_code}" style="background-color: #dc3545; padding: 5px 10px;">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Failed to fetch services:', error);
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load data. Is the server running?</td></tr>';
        }
    }

    // Event listener for delete button clicks
    tableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('btn-delete')) {
            const serviceId = event.target.dataset.id;
            
            if (confirm(`Are you sure you want to delete service ${serviceId}?`)) {
                try {
                    const response = await fetch(`/api/services/${serviceId}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        loadServices(searchInput.value);
                    } else {
                        const result = await response.json();
                        alert(`Error: ${result.msg || 'Could not delete service.'}`);
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    alert('An error occurred while trying to delete the service.');
                }
            }
        }
    });

    // Event listeners for search
    searchButton.addEventListener('click', () => loadServices(searchInput.value));
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            loadServices(searchInput.value);
        }
    });

    // Initial load of service data
    loadServices();
});
