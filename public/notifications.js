document.addEventListener('DOMContentLoaded', async () => {
    const notificationList = document.getElementById('notification-list');

    async function loadNotifications() {
        try {
            const response = await fetch('/api/notifications');
            if (!response.ok) {
                throw new Error('Could not load notifications.');
            }
            const notifications = await response.json();

            notificationList.innerHTML = ''; // Clear previous items

            if (notifications.length === 0) {
                notificationList.innerHTML = '<div class="notification-item"><p>No notifications yet.</p></div>';
                return;
            }

            notifications.forEach(notification => {
                const item = document.createElement('div');
                item.className = 'notification-item';
                if (!notification.is_read) {
                    item.classList.add('unread');
                }

                item.innerHTML = `
                    <div>
                        <p>${notification.message}</p>
                        <small>${notification.formatted_date}</small>
                    </div>
                    <a href="${notification.link_url}" class="btn btn-view-notification" data-id="${notification.notification_id}" data-read="${notification.is_read}">View</a>
                `;
                notificationList.appendChild(item);
            });

        } catch (error) {
            console.error('Notification loading error:', error);
            notificationList.innerHTML = '<div class="notification-item"><p style="color:red;">Failed to load notifications.</p></div>';
        }
    }

    // Event listener for clicking on a notification's view button
    notificationList.addEventListener('click', async (event) => {
        if (event.target.classList.contains('btn-view-notification')) {
            event.preventDefault(); // Stop immediate navigation

            const notificationId = event.target.dataset.id;
            const isRead = event.target.dataset.read === 'true';
            const targetUrl = event.target.href;

            // If the notification is not already read, mark it as read
            if (!isRead) {
                try {
                    await fetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
                } catch (error) {
                    console.error('Failed to mark notification as read:', error);
                    // Still navigate even if the PUT request fails
                }
            }
            
            // Navigate to the link
            window.location.href = targetUrl;
        }
    });

    loadNotifications();
});
