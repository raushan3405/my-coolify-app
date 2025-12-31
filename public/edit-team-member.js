document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('editTeamMemberForm');
    const messageDiv = document.getElementById('form-message');
    const memberId = new URLSearchParams(window.location.search).get('id');

    if (!memberId) {
        messageDiv.textContent = 'No team member ID provided. Redirecting...';
        messageDiv.style.color = 'red';
        setTimeout(() => { window.location.href = 'f-team.html'; }, 2000);
        return;
    }

    // --- Fetch and Populate Existing Data ---
    try {
        const response = await fetch(`/api/f_team/${memberId}`);
        if (!response.ok) {
            throw new Error('Team member not found.');
        }
        const member = await response.json();

        // Populate the form with the fetched data
        for (const key in member) {
            if (form.elements[key]) {
                form.elements[key].value = member[key];
            }
        }

    } catch (error) {
        console.error('Failed to load team member data:', error);
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
            const response = await fetch(`/api/f_team/${memberId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Team member updated successfully! Redirecting...';
                messageDiv.style.color = 'green';

                setTimeout(() => {
                    window.location.href = 'f-team.html';
                }, 2000);

            } else {
                messageDiv.textContent = `Error: ${result.msg || 'Could not update team member.'}`;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Update error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
            messageDiv.style.color = 'red';
        }
    });
});
