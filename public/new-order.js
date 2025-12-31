document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newOrderForm');
    const messageDiv = document.getElementById('form-message');
    const customerSelect = document.getElementById('cust_id');
    const serviceSelect = document.getElementById('fs_code');
    const teamSelect = document.getElementById('ftm_code');
    const priceInput = document.getElementById('service_cost');

    let servicesData = []; // Store service data to access prices

    // Generic function to populate a select dropdown
    function populateDropdown(selectElement, data, valueField, textField) {
        selectElement.innerHTML = `<option value="">-- Select an option --</option>`; // Clear existing options
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueField];
            option.textContent = `${item[textField]} (${item[valueField]})`;
            selectElement.appendChild(option);
        });
    }

    // Fetch all necessary data for the form dropdowns
    async function loadInitialData() {
        try {
            const [customersRes, servicesRes, teamRes] = await Promise.all([
                fetch('/api/customers'),
                fetch('/api/services'),
                fetch('/api/f_team')
            ]);

            const customers = await customersRes.json();
            servicesData = await servicesRes.json(); // Store for later use
            const team = await teamRes.json();

            populateDropdown(customerSelect, customers, 'cust_id', 'name');
            populateDropdown(serviceSelect, servicesData, 'fs_code', 'service_name');
            populateDropdown(teamSelect, team, 'ftm_code', 'name');

        } catch (error) {
            console.error('Failed to load initial form data:', error);
            messageDiv.textContent = 'Error loading form data. Please refresh the page.';
            messageDiv.style.color = 'red';
        }
    }

    // Event listener to auto-fill price when a service is selected
    serviceSelect.addEventListener('change', (event) => {
        const selectedServiceCode = event.target.value;
        const selectedService = servicesData.find(s => s.fs_code === selectedServiceCode);
        priceInput.value = selectedService ? selectedService.price : '';
    });

    // Event listener for form submission
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const orderData = Object.fromEntries(formData.entries());

        messageDiv.textContent = '';

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Order created successfully! Redirecting to My Orders...';
                messageDiv.style.color = 'green';
                form.reset();
                setTimeout(() => { window.location.href = 'my-orders.html'; }, 2000);
            } else {
                messageDiv.textContent = `Error: ${result.msg || 'Could not create order.'}`;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Order submission error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
            messageDiv.style.color = 'red';
        }
    });

    // Initial data load
    loadInitialData();
});
