# Frmply Management System - Web Application

This project is a full-stack web application converted from the original Excel-based "Frmply Management System". It provides a comprehensive suite of tools for managing customers, services, orders, sales, invoices, team performance, and budgets.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (with plans to migrate to React.js)
- **Backend:** Node.js with Express
- **Database:** PostgreSQL

---

## Setup and Run Instructions

Follow these steps to get the application running on your local machine.

### 1. Database Setup

- **Install PostgreSQL:** If you don't have it installed, download and install PostgreSQL from the official website.
- **Create Database:** Create a new database in PostgreSQL. You can name it `frmply_db` or any name you prefer.
- **Create Tables:** Open a SQL query tool (like `psql` or a GUI like DBeaver/pgAdmin) connected to your new database. You will need to create all the tables for the application. The complete SQL code for all tables is provided in `all_schemas.sql`.

### 2. Configure Environment

- **Create `.env` file:** In the root directory of the project, create a new file named `.env`.
- **Add Credentials:** Add your PostgreSQL database credentials to this file. It should look like this (replace with your actual credentials):

  ```
  # PostgreSQL Database Connection Settings
  DB_USER=your_postgres_username
  DB_HOST=localhost
  DB_DATABASE=frmply_db
  DB_PASSWORD=your_secret_password
  DB_PORT=5432
  ```

### 3. Install Dependencies

- **Open Terminal:** Open a terminal or command prompt in the root directory of the project.
- **Run Install Command:** Run the following command to install all the necessary Node.js packages:

  ```bash
  npm install
  ```

### 4. Seed the Database (Optional but Recommended)

To populate the application with sample data for demonstration purposes, you can run the provided seed file.

- **Connect to DB:** Connect to your `frmply_db` database using a SQL tool.
- **Run SQL Script:** Open the `seeds.sql` file, copy all its content, and execute it as a query. This will insert sample customers, services, orders, and budget data.

### 5. Run the Application

- **Start Server:** In your terminal, run the following command to start the Node.js server:

  ```bash
  node index.js
  ```
- **View the App:** Once the server is running, you will see a message like `Server is running on http://localhost:3000`. Open your web browser and navigate to this URL:

  [http://localhost:3000](http://localhost:3000)

---

## Business Logic and Workflow

- **Order to Sale:** A record is automatically added to the `sales` table when an order's status is changed to "Completed".
- **Order to Invoice:** An invoice can be generated from a "Completed" order on the "My Orders" page. This automatically calculates totals and assigns a unique invoice number.
- **Notifications:** A notification is automatically generated when a new order is created.
- **Leaderboard:** The leaderboard dynamically calculates and ranks team member performance based on their total sales from the `sales` table.
