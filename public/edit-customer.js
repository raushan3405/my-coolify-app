document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('editCustomerForm');
    const messageDiv = document.getElementById('form-message');
    const customerId = new URLSearchParams(window.location.search).get('id');
    
    const existingDocsSection = document.getElementById('existing-docs-section');
    const newDocsSection = document.getElementById('new-docs-section');
    const addDocBtn = document.getElementById('add-doc-btn');
    document.getElementById('back-to-details').href = `customer-details.html?id=${customerId}`;

    if (!customerId) {
        messageDiv.textContent = 'No customer ID provided. Redirecting...';
        setTimeout(() => { window.location.href = 'customers.html'; }, 2000);
        return;
    }

    // --- 1. Fetch and Populate Form ---
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        if (!response.ok) throw new Error('Customer not found.');
        const customer = await response.json();

        // Populate text fields
        for (const key in customer) {
            if (form.elements[key]) {
                form.elements[key].value = customer[key];
            }
        }
        document.getElementById('cust_id_display').textContent = customer.cust_id;

        // Populate existing documents
        if (customer.documents && customer.documents.length > 0) {
            existingDocsSection.innerHTML = customer.documents.map(doc => `
                <div class="form-group">
                    <input type="checkbox" name="documents_to_delete" value="${doc.document_id}">
                    <label>Mark for deletion: <a href="/${doc.file_path.replace('public/','')}" target="_blank">${doc.document_name}</a></label>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load customer data:', error);
        messageDiv.textContent = `Error: ${error.message}`;
    }

    // --- 2. Dynamic "Add New Document" Logic ---
    addDocBtn.addEventListener('click', () => {
        const newDocGroup = document.createElement('div');
        newDocGroup.className = 'form-group document-group';
        newDocGroup.innerHTML = `
            <label>New Document</label>
            <input type="text" name="new_document_names" placeholder="Document Name" required>
            <input type="file" name="new_documents" accept=".pdf,.jpg,.jpeg,.png" required style="margin-top: 5px;">
            <button type="button" class="btn btn-delete-doc" style="background: #dc3545; margin-top: 5px;">Remove</button><hr>
        `;
        newDocsSection.appendChild(newDocGroup);
    });
    newDocsSection.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete-doc')) {
            e.target.closest('.document-group').remove();
        }
    });

    // --- 3. Form Submission ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        messageDiv.textContent = '';

        const formData = new FormData(form);

        try {
            const response = await fetch(`/api/customers/${customerId}`, {
                method: 'PUT',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Customer updated successfully! Redirecting...';
                messageDiv.style.color = 'green';
                setTimeout(() => { window.location.href = `customer-details.html?id=${customerId}`; }, 2000);
            } else {
                messageDiv.textContent = `Error: ${result.msg || 'Could not update customer.'}`;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Update error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
        }
    });
});
