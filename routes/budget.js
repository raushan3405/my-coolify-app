const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection

// --- SUMMARY --- 
router.get('/summary', async (req, res) => {
  try {
    const incomeQuery = 'SELECT SUM(amount) as total_income FROM budget_income';
    const expenseQuery = 'SELECT SUM(amount) as total_expenses FROM budget_expenses';
    const incomeResult = await db.query(incomeQuery);
    const expenseResult = await db.query(expenseQuery);
    const total_income = parseFloat(incomeResult.rows[0].total_income) || 0;
    const total_expenses = parseFloat(expenseResult.rows[0].total_expenses) || 0;
    const net_balance = total_income - total_expenses;
    res.json({ total_income, total_expenses, net_balance });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- INCOME ROUTES --- 
// ... (GET, POST, PUT, DELETE for income remain the same) ...
router.get('/income', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT *, TO_CHAR(income_date, \'YYYY-MM-DD\') as income_date FROM budget_income ORDER BY income_date DESC');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
router.get('/income/:id', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT *, TO_CHAR(income_date, \'YYYY-MM-DD\') as income_date FROM budget_income WHERE income_id = $1', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ msg: 'Income record not found.'});
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
router.post('/income', async (req, res) => {
    try {
        const { source, amount, description, income_date } = req.body;
        if (!source || !amount) { return res.status(400).json({ msg: 'Source and Amount are required.' }); }
        const query = 'INSERT INTO budget_income (source, amount, description, income_date) VALUES ($1, $2, $3, $4) RETURNING *';
        const { rows } = await db.query(query, [source, amount, description || null, income_date || new Date()]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
router.put('/income/:id', async (req, res) => {
    try {
        const { source, amount, description, income_date } = req.body;
        if (!source || !amount) { return res.status(400).json({ msg: 'Source and Amount are required.' }); }
        const query = 'UPDATE budget_income SET source = $1, amount = $2, description = $3, income_date = $4 WHERE income_id = $5 RETURNING *';
        const { rows } = await db.query(query, [source, amount, description || null, income_date || new Date(), req.params.id]);
        if (rows.length === 0) return res.status(404).json({ msg: 'Income record not found.'});
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
router.delete('/income/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM budget_income WHERE income_id = $1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ msg: 'Income record not found.'});
        res.json({ msg: 'Income record deleted.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- EXPENSE ROUTES --- 

router.get('/expenses', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT *, TO_CHAR(expense_date, \'YYYY-MM-DD\') as expense_date FROM budget_expenses ORDER BY expense_date DESC');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/expenses/:id', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT *, TO_CHAR(expense_date, \'YYYY-MM-DD\') as expense_date FROM budget_expenses WHERE expense_id = $1', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ msg: 'Expense record not found.'});
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/expenses', async (req, res) => {
    try {
        const { category, amount, description, expense_date } = req.body;
        if (!category || !amount) {
            return res.status(400).json({ msg: 'Category and Amount are required.' });
        }
        const query = 'INSERT INTO budget_expenses (category, amount, description, expense_date) VALUES ($1, $2, $3, $4) RETURNING *';
        const { rows } = await db.query(query, [category, amount, description || null, expense_date || new Date()]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/expenses/:id', async (req, res) => {
    try {
        const { category, amount, description, expense_date } = req.body;
        if (!category || !amount) {
            return res.status(400).json({ msg: 'Category and Amount are required.' });
        }
        const query = 'UPDATE budget_expenses SET category = $1, amount = $2, description = $3, expense_date = $4 WHERE expense_id = $5 RETURNING *';
        const { rows } = await db.query(query, [category, amount, description || null, expense_date || new Date(), req.params.id]);
        if (rows.length === 0) return res.status(404).json({ msg: 'Expense record not found.'});
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/expenses/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM budget_expenses WHERE expense_id = $1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ msg: 'Expense record not found.'});
        res.json({ msg: 'Expense record deleted.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
