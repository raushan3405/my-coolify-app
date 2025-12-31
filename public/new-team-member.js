document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newTeamMemberForm');
    const messageDiv = document.getElementById('form-message');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const memberData = Object.fromEntries(formData.entries());

        messageDiv.textContent = '';

        try {
            const response = await fetch('/api/f_team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(memberData),
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Team member created successfully! Redirecting...';
                messageDiv.style.color = 'green';
                form.reset();
                setTimeout(() => { window.location.href = 'f-team.html'; }, 2000);
            } else {
                messageDiv.textContent = `Error: ${result.msg || 'Could not create team member.'}`;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Submission error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
            messageDiv.style.color = 'red';
        }
    });
});
