document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#teamTable tbody');

    async function loadTeamMembers() {
        try {
            const response = await fetch('/api/f_team');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const members = await response.json();

            tableBody.innerHTML = ''; // Clear existing data

            if (members.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No team members found.</td></tr>';
                return;
            }

            members.forEach(member => {
                const row = document.createElement('tr');
                const statusText = member.is_active ? 'Active' : 'Inactive';
                const statusColor = member.is_active ? '#28a745' : '#6c757d';

                row.innerHTML = `
                    <td>${member.ftm_code}</td>
                    <td>${member.name}</td>
                    <td>${member.role || 'N/A'}</td>
                    <td>${member.email || 'N/A'}</td>
                    <td><span class="status" style="background-color:${statusColor}; color: white; padding: 3px 8px; border-radius: 4px;">${statusText}</span></td>
                    <td>
                        <a href="edit-team-member.html?id=${member.ftm_code}" class="btn" style="background-color: #ffc107; padding: 5px 10px;">Edit</a>
                        <button class="btn btn-delete" data-id="${member.ftm_code}" style="background-color: #dc3545; padding: 5px 10px;">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Failed to fetch team members:', error);
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Failed to load data. Is the server running?</td></tr>';
        }
    }

    // Event listener for delete button clicks
    tableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('btn-delete')) {
            const memberId = event.target.dataset.id;
            
            if (confirm(`Are you sure you want to delete team member ${memberId}?`)) {
                try {
                    const response = await fetch(`/api/f_team/${memberId}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        loadTeamMembers(); // Refresh the list
                    } else {
                        const result = await response.json();
                        alert(`Error: ${result.msg || 'Could not delete team member.'}`);
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    alert('An error occurred while trying to delete the team member.');
                }
            }
        }
    });

    // Initial load
    loadTeamMembers();
});
