document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newCustomerForm');
    const messageDiv = document.getElementById('form-message');
    const submitButton = form.querySelector('button[type="submit"]');
    const addDocBtn = document.getElementById('add-doc-btn');
    const docSection = document.getElementById('document-section');

    if (!isManager()) {
        window.location.href = '/customers.html';
        return;
    }

    const mobileInput = document.getElementById('mobile_number');
    const custIdPreview = document.getElementById('cust_id_preview');

    const generateCustIdPreview = (mobile) => {
        const digits = String(mobile || '').replace(/\D/g, '');
        if (digits.length < 4) return '';
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        const lastFour = digits.slice(-4);
        return `FS${day}${month}${year}${lastFour}`;
    };

    const updateCustIdPreview = () => {
        if (!custIdPreview || !mobileInput) return;
        custIdPreview.value = generateCustIdPreview(mobileInput.value);
    };

    if (mobileInput) {
        mobileInput.addEventListener('input', updateCustIdPreview);
        updateCustIdPreview();
    }

    // --- 1. Dynamic Document Field Logic ---
    addDocBtn.addEventListener('click', () => {
        const docCount = docSection.querySelectorAll('.document-group').length;
        const newDocGroup = document.createElement('div');
        newDocGroup.className = 'form-group document-group';
        newDocGroup.innerHTML = `
            <label>Document ${docCount + 1}</label>
            <input type="text" name="document_names" placeholder="Document Name (e.g., Aadhar Card)" required>
            <input type="file" name="documents" accept=".pdf,.jpg,.jpeg,.png" required>
            <button type="button" class="btn btn-delete-doc">Remove</button>
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

    // --- 2. Form Submission Logic with Loading State ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        messageDiv.textContent = '';

        if (!isManager()) {
            messageDiv.textContent = 'Unauthorized.';
            messageDiv.style.color = 'red';
            return;
        }

        const email = form.elements.email ? String(form.elements.email.value || '').trim() : '';
        const mobile = mobileInput ? String(mobileInput.value || '').replace(/\D/g, '') : '';

        if (!email) {
            messageDiv.textContent = 'Email is required.';
            messageDiv.style.color = 'red';
            return;
        }

        if (mobile.length !== 10) {
            messageDiv.textContent = 'Mobile number must be 10 digits.';
            messageDiv.style.color = 'red';
            return;
        }

        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `Saving... <span class="loader"></span>`;

        const formData = new FormData(form);

        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = `Customer ${result.full_name} created successfully with ID: ${result.cust_id}! Redirecting...`;
                messageDiv.style.color = 'green';
                setTimeout(() => { window.location.href = 'customers.html'; }, 3000);
            } else {
                messageDiv.textContent = `Error: ${result.msg || 'Could not create customer.'}`;
                messageDiv.style.color = 'red';
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        } catch (error) {
            console.error('Submission error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
});
