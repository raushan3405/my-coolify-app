document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('updateTicketForm');
    const messageDiv = document.getElementById('form-message');
    const ticketId = new URLSearchParams(window.location.search).get('id');

    const subjectHeader = document.getElementById('ticket-subject-header');
    const submitterNameEl = document.getElementById('submitter-name');
    const submitterContactEl = document.getElementById('submitter-contact');
    const descriptionEl = document.getElementById('ticket-description');

    if (!ticketId) {
        messageDiv.textContent = 'No ticket ID provided. Redirecting...';
        messageDiv.style.color = 'red';
        setTimeout(() => { window.location.href = 'support.html'; }, 2000);
        return;
    }

    // --- Fetch and Populate Existing Data ---
    try {
        const response = await fetch(`/api/support/${ticketId}`);
        if (!response.ok) throw new Error('Ticket not found.');
        const ticket = await response.json();

        // Populate static details
        subjectHeader.textContent = `Ticket #${ticket.ticket_id}: ${ticket.subject}`;
        submitterNameEl.textContent = ticket.customer_name || ticket.submitter_name;
        submitterContactEl.textContent = ticket.customer_email || ticket.submitter_email;
        descriptionEl.textContent = ticket.description;

        // Populate form fields for submission
        form.elements.ticket_id.value = ticket.ticket_id;
        form.elements.subject.value = ticket.subject; // Hidden field
        form.elements.description_hidden.value = ticket.description; // Hidden field
        form.elements.priority.value = ticket.priority;
        form.elements.status.value = ticket.status;

    } catch (error) {
        console.error('Failed to load ticket data:', error);
        messageDiv.textContent = `Error: ${error.message}`;
        messageDiv.style.color = 'red';
    }

    // --- Handle Form Submission for Update ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(form);
        const updatedData = Object.fromEntries(formData.entries());

        messageDiv.textContent = '';

        try {
            const response = await fetch(`/api/support/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Ticket updated successfully! Redirecting...';
                messageDiv.style.color = 'green';
                setTimeout(() => { window.location.href = 'support.html'; }, 2000);
            } else {
                messageDiv.textContent = `Error: ${result.msg || 'Could not update ticket.'}`;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Update error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
            messageDiv.style.color = 'red';
        }
    });
});
