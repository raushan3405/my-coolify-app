document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newCustomerForm');
    const messageDiv = document.getElementById('form-message');
    const addDocBtn = document.getElementById('add-doc-btn');
    const docSection = document.getElementById('document-section');

    // --- 1. Dynamic Document Field Logic ---
    addDocBtn.addEventListener('click', () => {
        const docCount = docSection.querySelectorAll('.document-group').length;
        const newDocGroup = document.createElement('div');
        newDocGroup.className = 'form-group document-group';
        newDocGroup.innerHTML = `
            <label>Document ${docCount + 1}</label>
            <input type="text" name="document_names" placeholder="Document Name (e.g., Aadhar Card)" required>
            <input type="file" name="documents" accept=".pdf,.jpg,.jpeg,.png" required style="margin-top: 5px;">
            <button type="button" class="btn btn-delete-doc" style="background: #dc3545; margin-top: 5px;">Remove</button>
            <hr>
        `;
        docSection.appendChild(newDocGroup);
    });

    // Event delegation to handle remove buttons
    docSection.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete-doc')) {
            e.target.closest('.document-group').remove();
        }
    });

    // --- 2. Form Submission Logic ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        messageDiv.textContent = '';

        const formData = new FormData(form);

        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                body: formData, // No 'Content-Type' header, browser sets it for multipart/form-data
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = `Customer ${result.full_name} created successfully with ID: ${result.cust_id}! Redirecting...`;
                messageDiv.style.color = 'green';
                form.reset();
                docSection.innerHTML = '';
                setTimeout(() => { window.location.href = 'customers.html'; }, 3000);
            } else {
                messageDiv.textContent = `Error: ${result.msg || 'Could not create customer.'}`;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Submission error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
            messageDiv.style.color = 'red';
        }
    });
});
