document.addEventListener('DOMContentLoaded', async () => {
    const detailsContainer = document.getElementById('customer-details-container');
    const nameHeader = document.getElementById('customer-name-header');
    const docList = document.getElementById('document-list');
    const editBtn = document.getElementById('cd-edit-btn');
    const deleteBtn = document.getElementById('cd-delete-btn');
    const customerId = new URLSearchParams(window.location.search).get('id');

    const fields = {
        cust_id: document.getElementById('cd-cust-id'),
        full_name: document.getElementById('cd-full-name'),
        email: document.getElementById('cd-email'),
        mobile_number: document.getElementById('cd-mobile'),
        date_of_birth: document.getElementById('cd-dob'),
        gender: document.getElementById('cd-gender'),
        mother_name: document.getElementById('cd-mother'),
        father_name: document.getElementById('cd-father'),
        caste: document.getElementById('cd-caste'),
        address: document.getElementById('cd-address'),
        pin_code: document.getElementById('cd-pin'),
        identification_1: document.getElementById('cd-id1'),
        identification_2: document.getElementById('cd-id2'),
    };

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

        nameHeader.textContent = 'CUSTOMER DETAILS';
        if (fields.cust_id) fields.cust_id.value = customer.cust_id || '';
        if (fields.full_name) fields.full_name.value = customer.full_name || '';
        if (fields.email) fields.email.value = customer.email || '';
        if (fields.mobile_number) fields.mobile_number.value = customer.mobile_number || '';
        if (fields.date_of_birth) fields.date_of_birth.value = customer.date_of_birth || '';
        if (fields.gender) fields.gender.value = customer.gender || '';
        if (fields.mother_name) fields.mother_name.value = customer.mother_name || '';
        if (fields.father_name) fields.father_name.value = customer.father_name || '';
        if (fields.caste) fields.caste.value = customer.caste || '';
        if (fields.address) fields.address.value = customer.address || '';
        if (fields.pin_code) fields.pin_code.value = customer.pin_code || '';
        if (fields.identification_1) fields.identification_1.value = customer.identification_1 || '';
        if (fields.identification_2) fields.identification_2.value = customer.identification_2 || '';

        docList.innerHTML = '';
        if (customer.documents && customer.documents.length > 0) {
            customer.documents.forEach(doc => {
                const webPath = doc.file_path.replace('public/', ''); 
                const row = document.createElement('div');
                row.className = 'cd-doc-row';
                row.innerHTML = `
                    <div class="cd-doc-name">${doc.document_name || 'Document'}</div>
                    <a class="btn cd-doc-btn" href="${webPath}" target="_blank">VIEW</a>
                `;
                docList.appendChild(row);
            });
        } else {
            docList.innerHTML = '<div class="cd-doc-empty">No documents uploaded for this customer.</div>';
        }

        if (isManager()) {
            if (editBtn) {
                editBtn.href = `edit-customer.html?id=${customer.cust_id}`;
                editBtn.style.display = 'inline-flex';
            }
            if (deleteBtn) {
                deleteBtn.dataset.id = customer.cust_id;
                deleteBtn.style.display = 'inline-flex';
            }
        }

    } catch (error) {
        console.error('Failed to load customer details:', error);
        detailsContainer.innerHTML = `<p style="color:red; text-align:center;">${error.message}</p>`;
    }

    // --- Delete Functionality (only available to managers) ---
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async (event) => {
            if (!isManager()) return;
            const id = event.target.dataset.id;
            if (!id) return;
            if(confirm(`Are you sure you want to permanently delete customer ${id}?`)){
                try {
                    const response = await fetch(`/api/customers/${id}`, {
                        method: 'DELETE',
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
        });
    }
});
