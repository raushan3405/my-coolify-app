document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('editPostForm');
    const messageDiv = document.getElementById('form-message');
    const postId = new URLSearchParams(window.location.search).get('id');

    if (!postId) {
        messageDiv.textContent = 'No post ID provided. Redirecting...';
        messageDiv.style.color = 'red';
        setTimeout(() => { window.location.href = 'social-media.html'; }, 2000);
        return;
    }

    // --- Fetch and Populate Existing Data ---
    try {
        const response = await fetch(`/api/social_media/${postId}`);
        if (!response.ok) {
            throw new Error('Post not found.');
        }
        const post = await response.json();

        // Populate the form
        for (const key in post) {
            if (form.elements[key]) {
                form.elements[key].value = post[key];
            }
        }

    } catch (error) {
        console.error('Failed to load post data:', error);
        messageDiv.textContent = `Error: ${error.message}`;
        messageDiv.style.color = 'red';
    }

    // --- Handle Form Submission for Update ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(form);
        const updatedData = Object.fromEntries(formData.entries());

        if (!updatedData.scheduled_post_date) {
            updatedData.scheduled_post_date = null;
        }

        messageDiv.textContent = '';

        try {
            const response = await fetch(`/api/social_media/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Post updated successfully! Redirecting...';
                messageDiv.style.color = 'green';
                setTimeout(() => { window.location.href = 'social-media.html'; }, 2000);
            } else {
                messageDiv.textContent = `Error: ${result.msg || 'Could not update post.'}`;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Update error:', error);
            messageDiv.textContent = 'A network error occurred. Please try again.';
            messageDiv.style.color = 'red';
        }
    });
});
