document.addEventListener('DOMContentLoaded', async () => {
    // Podium elements
    const firstPlaceName = document.querySelector('.first-place .podium-name');
    const firstPlaceIncome = document.querySelector('.first-place .podium-income');
    const secondPlaceName = document.querySelector('.second-place .podium-name');
    const secondPlaceIncome = document.querySelector('.second-place .podium-income');
    const thirdPlaceName = document.querySelector('.third-place .podium-name');
    const thirdPlaceIncome = document.querySelector('.third-place .podium-income');

    // Ranking table body
    const tableBody = document.querySelector('.ranking-table tbody');

    function formatCurrency(num) {
        return `₹${parseFloat(num).toFixed(2)}`;
    }

    try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
            throw new Error('Could not fetch leaderboard data.');
        }
        const leaderboardData = await response.json();

        // Clear table body
        tableBody.innerHTML = '';

        if (leaderboardData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No sales data available.</td></tr>';
            return;
        }

        // Populate Podium (Top 3)
        leaderboardData.forEach(performer => {
            if (performer.rank === '1') {
                firstPlaceName.textContent = performer.ftm_name;
                firstPlaceIncome.textContent = formatCurrency(performer.total_income);
            }
            if (performer.rank === '2') {
                secondPlaceName.textContent = performer.ftm_name;
                secondPlaceIncome.textContent = formatCurrency(performer.total_income);
            }
            if (performer.rank === '3') {
                thirdPlaceName.textContent = performer.ftm_name;
                thirdPlaceIncome.textContent = formatCurrency(performer.total_income);
            }
        });

        // Populate Ranking Table (Ranks 4 and below)
        const remainingRanks = leaderboardData.filter(p => parseInt(p.rank) >= 1); // Display all in table as well
        remainingRanks.forEach(performer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${performer.rank}</td>
                <td>${performer.ftm_name}</td>
                <td>${performer.ftm_code}</td>
                <td>${formatCurrency(performer.total_income)}</td>
                <td>-</td> 
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Leaderboard Error:', error);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load leaderboard.</td></tr>';
    }
});
