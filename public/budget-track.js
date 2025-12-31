document.addEventListener('DOMContentLoaded', () => {
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpensesEl = document.getElementById('total-expenses');
    const netBalanceEl = document.getElementById('net-balance');
    const incomeTableBody = document.querySelector('#incomeTable tbody');
    const expensesTableBody = document.querySelector('#expensesTable tbody');

    function formatCurrency(num) {
        return `₹${parseFloat(num).toFixed(2)}`;
    }

    async function loadBudgetData() {
        try {
            const [summaryRes, incomeRes, expensesRes] = await Promise.all([
                fetch('/api/budget/summary'),
                fetch('/api/budget/income'),
                fetch('/api/budget/expenses')
            ]);

            if (!summaryRes.ok || !incomeRes.ok || !expensesRes.ok) {
                throw new Error('Failed to fetch budget data.');
            }

            const summary = await summaryRes.json();
            const income = await incomeRes.json();
            const expenses = await expensesRes.json();

            // 1. Update KPI Cards
            totalIncomeEl.textContent = formatCurrency(summary.total_income);
            totalExpensesEl.textContent = formatCurrency(summary.total_expenses);
            netBalanceEl.textContent = formatCurrency(summary.net_balance);
            netBalanceEl.style.color = summary.net_balance >= 0 ? '#28a745' : '#dc3545';

            // 2. Populate Recent Income Table (top 5)
            incomeTableBody.innerHTML = '';
            income.slice(0, 5).forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${item.date}</td><td>${item.source}</td><td>${formatCurrency(item.amount)}</td>`;
                incomeTableBody.appendChild(row);
            });

            // 3. Populate Recent Expenses Table (top 5)
            expensesTableBody.innerHTML = '';
            expenses.slice(0, 5).forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${item.date}</td><td>${item.category}</td><td>${formatCurrency(item.amount)}</td>`;
                expensesTableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Budget load error:', error);
            totalIncomeEl.textContent = 'Error';
            totalExpensesEl.textContent = 'Error';
            netBalanceEl.textContent = 'Error';
        }
    }

    loadBudgetData();
});
