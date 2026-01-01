document.addEventListener('DOMContentLoaded', async () => {
    const detailsContainer = document.getElementById('customer-details-container');
    const nameHeader = document.getElementById('customer-name-header');
    const docList = document.getElementById('document-list');
    const headerActions = document.querySelector('.header-actions');
    const customerId = new URLSearchParams(window.location.search).get('id');

    if (!customerId) {
        detailsContainer.innerHTML = '<p style="color:red; text-align:center;">No customer ID provided. <a href="customers.html">Go back</a>.</p>';
        return;
    }

    try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (!response.ok) {
            throw new Error('Customer not found.');
        }
        const customer = await response.json();

        // --- 1. Populate Customer Details ---
        nameHeader.textContent = customer.full_name;
        detailsContainer.innerHTML = `
            <div class="form-group"><label>Customer ID</label><p>${customer.cust_id}</p></div>
            <div class="form-group"><label>Full Name</label><p>${customer.full_name}</p></div>
            <div class="form-group"><label>Email</label><p>${customer.email || 'N/A'}</p></div>
            <div class="form-group"><label>Mobile Number</label><p>${customer.mobile_number}</p></div>
            <div class="form-group"><label>Date of Birth</label><p>${customer.date_of_birth || 'N/A'}</p></div>
            <div class="form-group"><label>Gender</label><p>${customer.gender || 'N/A'}</p></div>
            <div class="form-group"><label>Mother's Name</label><p>${customer.mother_name || 'N/A'}</p></div>
            <div class="form-group"><label>Father's Name</label><p>${customer.father_name || 'N/A'}</p></div>
            <div class="form-group"><label>Caste</label><p>${customer.caste || 'N/A'}</p></div>
            <div class="form-group"><label>Address</label><p>${customer.address || 'N/A'}</p></div>
            <div class="form-group"><label>Pin Code</label><p>${customer.pin_code || 'N/A'}</p></div>
            <div class="form-group"><label>Identification 1</label><p>${customer.identification_1 || 'N/A'}</p></div>
            <div class="form-group"><label>Identification 2</label><p>${customer.identification_2 || 'N/A'}</p></div>
        `;

        // --- 2. Populate Documents List ---
        docList.innerHTML = '';
        if (customer.documents && customer.documents.length > 0) {
            customer.documents.forEach(doc => {
                const li = document.createElement('li');
                const webPath = doc.file_path.replace('public/', '');
                li.innerHTML = `<a href="${webPath}" target="_blank">${doc.document_name}</a>`;
                docList.appendChild(li);
            });
        } else {
            docList.innerHTML = '<li>No documents uploaded for this customer.</li>';
        }

        // --- 3. Add Action Buttons ---
        const editButton = document.createElement('a');
        editButton.href = `edit-customer-v2.html?id=${customer.cust_id}`; // Link to the new edit page
        editButton.className = 'btn';
        editButton.textContent = 'Edit';
        editButton.style.backgroundColor = '#ffc107';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-delete';
        deleteButton.textContent = 'Delete';
        deleteButton.style.backgroundColor = '#dc3545';
        deleteButton.dataset.id = customer.cust_id;
        
        headerActions.appendChild(editButton);
        headerActions.appendChild(deleteButton);

    } catch (error) {
        console.error('Failed to load customer details:', error);
        detailsContainer.innerHTML = `<p style="color:red; text-align:center;">${error.message}</p>`;
    }

    // --- 4. Add Delete Functionality ---
    headerActions.addEventListener('click', async (event) => {
        if(event.target.classList.contains('btn-delete')){
            const customerId = event.target.dataset.id;
            if(confirm(`Are you sure you want to permanently delete customer ${customerId}? This will also delete all their documents.`)){
                try {
                    const response = await fetch(`/api/customers/${customerId}`, {
                        method: 'DELETE'
                    });
                    const result = await response.json();
                    if(response.ok){
                        alert(result.msg);
                        window.location.href = 'customers.html';
                    } else {
                        throw new Error(result.msg || 'Could not delete customer.');
                    }
                } catch (err) {
                    alert(`Error: ${err.message}`);
                }
            }
        }
    });
});
