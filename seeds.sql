-- Frmply Management System - Sample Seed Data

-- Clear existing data (optional, use with caution)
-- TRUNCATE TABLE notifications, support_tickets, social_media_posts, budget_income, budget_expenses, sales, invoices, orders, customers, f_team, services RESTART IDENTITY CASCADE;

-- 1. Customers
INSERT INTO customers (cust_id, name, email, mob_no, dob, gender, mother_name, father_name, caste, address, pin_code)
VALUES
('FC0001', 'Amit Kumar', 'amit.k@example.com', '9876543210', '1995-05-20', 'Male', 'Sunita Devi', 'Ramesh Kumar', 'OBC', '123 Main St, Patna', '800001'),
('FC0002', 'Priya Sharma', 'priya.s@example.com', '9876543211', '1998-08-15', 'Female', 'Anita Sharma', 'Vijay Sharma', 'General', '456 Park Ave, Delhi', '110001'),
('FC0003', 'Sanjay Verma', 'sanjay.v@example.com', '9876543212', '1992-11-30', 'Male', 'Geeta Verma', 'Anil Verma', 'SC', '789 Lake Rd, Mumbai', '400001');

-- 2. F-Team (Frmply Team)
INSERT INTO f_team (ftm_code, name, role, email)
VALUES
('FTM001', 'Rajesh Singh', 'Senior Agent', 'rajesh.s@frmply.com'),
('FTM002', 'Meena Kumari', 'Junior Agent', 'meena.k@frmply.com');

-- 3. Services
INSERT INTO services (fs_code, service_name, category, price, start_date, end_date)
VALUES
('FS0001', 'BIO DATA SIMPLE', 'Documentation', 50.00, '2024-01-01', '2024-12-31'),
('FS0002', 'CTET - SC/ST/PH', 'Education', 400.00, '2024-06-01', '2024-07-15'),
('FS0003', 'AADHAAR UPDATE', 'Govt. Service', 150.00, '2024-01-01', '2024-12-31');

-- 4. Orders (with different statuses)
INSERT INTO orders (cust_id, fs_code, ftm_code, govt_cost, service_cost, status)
VALUES
('FC0001', 'FS0001', 'FTM001', 20.00, 30.00, 'Completed'), -- Will generate a sale
('FC0002', 'FS0002', 'FTM001', 350.00, 50.00, 'Completed'), -- Will generate a sale
('FC0003', 'FS0003', 'FTM002', 100.00, 50.00, 'In Progress'),
('FC0001', 'FS0002', 'FTM002', 350.00, 50.00, 'New');

-- 5. Budget Data
INSERT INTO budget_income (source, amount, description, income_date)
VALUES
('Initial Investment', 50000.00, 'Seed funding', '2024-01-01'),
('Client Project Advance', 15000.00, 'Advance for project X', '2024-02-15');

INSERT INTO budget_expenses (category, amount, description, expense_date)
VALUES
('Office Rent', 10000.00, 'Monthly rent for office space', '2024-02-01'),
('Software Subscription', 2500.00, 'Adobe Creative Cloud', '2024-02-05'),
('Utilities', 3000.00, 'Electricity and Internet', '2024-02-10');

-- Note: Sales, Invoices, and Notifications are generated automatically by the application logic
-- when orders are created or completed, so they do not need to be seeded directly.

-- Run the status update endpoint for completed orders to trigger sales generation.
-- This part is illustrative; it should be done via API calls after the server is running.
-- Example: PUT /api/orders/1/status with body {"status": "Completed"}
-- Example: PUT /api/orders/2/status with body {"status": "Completed"}

SELECT 'Seed data successfully inserted.';
