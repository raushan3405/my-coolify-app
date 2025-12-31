document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newPostForm');
    const messageDiv = document.getElementById('form-message');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const postData = Object.fromEntries(formData.entries());

        // Ensure empty datetime is sent as null
        if (!postData.scheduled_post_date) {
            postData.scheduled_post_date = null;
        }

        messageDiv.textContent = '';

        try {
            const response = await fetch('/api/social_media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Social media post saved successfully! Redirecting...';
                messageDiv.style.color = 'green';
                form.reset();
                setTimeout(() => { window.location.href = 'social-media.html'; }, 2000);
            } else {
                messageDiv.textContent = `Error: ${result.msg || 'Could not save post.'}`;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Submission error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
            messageDiv.style.color = 'red';
        }
    });
});
