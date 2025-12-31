-- Frmply Management System - Complete Database Schema
-- Execute this entire file to create all necessary tables.

-- 1. Customers
CREATE TABLE customers (
    cust_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    mob_no VARCHAR(15),
    dob DATE,
    gender VARCHAR(10),
    mother_name VARCHAR(255),
    father_name VARCHAR(255),
    caste VARCHAR(50),
    address TEXT,
    pin_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. F-Team (Frmply Team)
CREATE TABLE f_team (
    ftm_code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Services
CREATE TABLE services (
    fs_code VARCHAR(10) PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    advt_no VARCHAR(50),
    start_date DATE,
    end_date DATE,
    age_criteria VARCHAR(50),
    education_criteria TEXT,
    physical_male TEXT,
    physical_female TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    cust_id VARCHAR(10) NOT NULL REFERENCES customers(cust_id),
    fs_code VARCHAR(10) NOT NULL REFERENCES services(fs_code),
    ftm_code VARCHAR(10) REFERENCES f_team(ftm_code),
    status VARCHAR(20) NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Completed', 'Site Crash', 'Cancelled')),
    govt_cost NUMERIC(10, 2) DEFAULT 0.00,
    service_cost NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Sales
CREATE TABLE sales (
    sale_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL UNIQUE REFERENCES orders(order_id),
    cust_id VARCHAR(10) NOT NULL REFERENCES customers(cust_id),
    fs_code VARCHAR(10) NOT NULL REFERENCES services(fs_code),
    ftm_code VARCHAR(10) REFERENCES f_team(ftm_code),
    sale_amount NUMERIC(10, 2) NOT NULL,
    completion_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    customer_name VARCHAR(255),
    service_name VARCHAR(255),
    ftm_name VARCHAR(255)
);

-- 6. Invoices
CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(20) UNIQUE NOT NULL,
    order_id INT NOT NULL REFERENCES orders(order_id),
    cust_id VARCHAR(10) NOT NULL REFERENCES customers(cust_id),
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    grand_total NUMERIC(10, 2) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'Unpaid' CHECK (status IN ('Unpaid', 'Paid', 'Overdue', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Budget Income
CREATE TABLE budget_income (
    income_id SERIAL PRIMARY KEY,
    source VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    income_date DATE NOT NULL DEFAULT CURRENT_DATE,
    sale_id INT REFERENCES sales(sale_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Budget Expenses
CREATE TABLE budget_expenses (
    expense_id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Notifications
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    link_url VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Support Tickets
CREATE TABLE support_tickets (
    ticket_id SERIAL PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    cust_id VARCHAR(10) REFERENCES customers(cust_id) ON DELETE SET NULL,
    submitter_name VARCHAR(255),
    submitter_email VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Closed')),
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Social Media Posts
CREATE TABLE social_media_posts (
    post_id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    link_url VARCHAR(255),
    scheduled_post_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Scheduled', 'Posted', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Universal Trigger Function for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with an updated_at column
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_f_team_updated_at BEFORE UPDATE ON f_team FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_media_posts_updated_at BEFORE UPDATE ON social_media_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'All tables and triggers created successfully.';
