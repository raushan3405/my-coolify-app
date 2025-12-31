document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#socialPostsTable tbody');

    async function loadPosts() {
        try {
            const response = await fetch('/api/social_media');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const posts = await response.json();

            tableBody.innerHTML = ''; // Clear existing data

            if (posts.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No social media posts found.</td></tr>';
                return;
            }

            posts.forEach(post => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${post.platform}</td>
                    <td>${post.content.substring(0, 50)}...</td>
                    <td>${post.formatted_post_date || 'Not Scheduled'}</td>
                    <td><span class="status" style="background-color:${getStatusColor(post.status)}; color: white; padding: 3px 8px; border-radius: 4px;">${post.status}</span></td>
                    <td>
                        <a href="edit-social-post.html?id=${post.post_id}" class="btn" style="background-color: #ffc107; padding: 5px 10px;">Edit</a>
                        <button class="btn btn-delete" data-id="${post.post_id}" style="background-color: #dc3545; padding: 5px 10px;">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Failed to fetch posts:', error);
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load data. Is the server running?</td></tr>';
        }
    }

    function getStatusColor(status) {
        switch (status) {
            case 'Posted': return '#28a745'; // Green
            case 'Scheduled': return '#17a2b8'; // Blue
            case 'Draft': return '#ffc107'; // Yellow
            case 'Cancelled': return '#6c757d'; // Gray
            default: return '#6c757d';
        }
    }

    // Event listener for delete button clicks
    tableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('btn-delete')) {
            const recordId = event.target.dataset.id;
            
            if (confirm(`Are you sure you want to delete this post?`)) {
                try {
                    const response = await fetch(`/api/social_media/${recordId}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        loadPosts(); // Refresh the list
                    } else {
                        const result = await response.json();
                        alert(`Error: ${result.msg || 'Could not delete post.'}`);
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    alert('An error occurred while trying to delete the post.');
                }
            }
        }
    });

    // Initial load
    loadPosts();
});
