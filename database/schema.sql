-- Salon POS Database Schema
-- Created: 2025-03-28

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS salon_pos;
USE salon_pos;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employee') DEFAULT 'employee',
  status ENUM('active', 'inactive', 'disabled') DEFAULT 'active',
  is_deleted TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
);

-- Roles table (for extensibility)
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  permissions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Locations table (for multi-location support - Phase 3)
CREATE TABLE IF NOT EXISTS locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Service categories
CREATE TABLE IF NOT EXISTS service_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location_id INT,
  is_deleted TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX idx_location (location_id)
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id INT NOT NULL,
  description TEXT,
  duration INT NOT NULL COMMENT 'Duration in minutes',
  base_price DECIMAL(10, 2) NOT NULL,
  commission_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
  commission_value DECIMAL(10, 2),
  is_active TINYINT DEFAULT 1,
  is_deleted TINYINT DEFAULT 0,
  location_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES service_categories(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX idx_category (category_id),
  INDEX idx_location (location_id)
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  salary_type ENUM('fixed', 'commission', 'hybrid') DEFAULT 'commission',
  base_salary DECIMAL(10, 2),
  bank_account_details JSON,
  is_active TINYINT DEFAULT 1,
  is_deleted TINYINT DEFAULT 0,
  location_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX idx_user (user_id),
  INDEX idx_location (location_id)
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  preferred_employee_id INT,
  notes TEXT,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  visit_count INT DEFAULT 0,
  is_deleted TINYINT DEFAULT 0,
  location_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (preferred_employee_id) REFERENCES users(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX idx_phone (phone),
  INDEX idx_location (location_id),
  UNIQUE KEY unique_phone_location (phone, location_id)
);

-- Commission rules
CREATE TABLE IF NOT EXISTS commission_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NOT NULL,
  commission_percentage DECIMAL(5, 2),
  commission_fixed DECIMAL(10, 2),
  apply_after_discount TINYINT DEFAULT 1,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id),
  INDEX idx_service (service_id)
);

-- Tasks (Employee self-entry)
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  customer_id INT,
  service_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  price DECIMAL(10, 2),
  discount_type ENUM('percentage', 'fixed'),
  discount_value DECIMAL(10, 2),
  notes TEXT,
  is_locked TINYINT DEFAULT 0,
  is_deleted TINYINT DEFAULT 0,
  location_id INT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_employee (employee_id),
  INDEX idx_customer (customer_id),
  INDEX idx_service (service_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_location (location_id)
);

-- Products (Inventory items)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit_type ENUM('ml', 'gm', 'pcs', 'l', 'kg') DEFAULT 'pcs',
  description TEXT,
  is_active TINYINT DEFAULT 1,
  is_deleted TINYINT DEFAULT 0,
  location_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX idx_location (location_id)
);

-- Batches (for batch-wise inventory)
CREATE TABLE IF NOT EXISTS batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  batch_number VARCHAR(100) NOT NULL,
  purchase_date DATE,
  expiry_date DATE,
  cost_price DECIMAL(10, 2),
  selling_price DECIMAL(10, 2),
  initial_quantity INT NOT NULL,
  current_quantity INT NOT NULL,
  supplier VARCHAR(255),
  is_active TINYINT DEFAULT 1,
  is_deleted TINYINT DEFAULT 0,
  location_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX idx_product (product_id),
  INDEX idx_expiry_date (expiry_date),
  INDEX idx_location (location_id),
  UNIQUE KEY unique_batch_number (batch_number, product_id)
);

-- Task products (products used in a task)
CREATE TABLE IF NOT EXISTS task_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  product_id INT NOT NULL,
  batch_id INT,
  quantity_used DECIMAL(10, 2),
  is_deleted TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (batch_id) REFERENCES batches(id),
  INDEX idx_task (task_id),
  INDEX idx_product (product_id)
);

-- Invoices (Phase 2)
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT,
  employee_id INT,
  invoice_date DATETIME NOT NULL,
  subtotal DECIMAL(10, 2),
  discount_type ENUM('percentage', 'fixed'),
  discount_value DECIMAL(10, 2),
  tax_amount DECIMAL(10, 2),
  tax_percentage DECIMAL(5, 2),
  total_amount DECIMAL(10, 2),
  payment_method ENUM('cash', 'card', 'online', 'cheque') DEFAULT 'cash',
  status ENUM('draft', 'completed', 'voided', 'refunded') DEFAULT 'draft',
  void_reason TEXT,
  is_deleted TINYINT DEFAULT 0,
  location_id INT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_invoice_number (invoice_number),
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_location (location_id)
);

-- Invoice items
CREATE TABLE IF NOT EXISTS invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  item_type ENUM('service', 'product') NOT NULL,
  service_id INT,
  product_id INT,
  batch_id INT,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10, 2),
  line_total DECIMAL(10, 2),
  is_deleted TINYINT DEFAULT 0,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (batch_id) REFERENCES batches(id),
  INDEX idx_invoice (invoice_id)
);

-- Expenses (Phase 2)
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  bill_attachment VARCHAR(255),
  created_by INT,
  is_deleted TINYINT DEFAULT 0,
  location_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX idx_location (location_id),
  INDEX idx_expense_date (expense_date)
);

-- Inventory movements (for tracking stock changes)
CREATE TABLE IF NOT EXISTS inventory_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id INT NOT NULL,
  movement_type ENUM('purchase', 'deduction', 'wastage', 'adjustment', 'return') NOT NULL,
  quantity_change INT NOT NULL,
  reference_type VARCHAR(50) COMMENT 'task, invoice, expense, etc',
  reference_id INT,
  notes TEXT,
  created_by INT,
  location_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (batch_id) REFERENCES batches(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX idx_batch (batch_id),
  INDEX idx_created_at (created_at)
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  table_name VARCHAR(100),
  action VARCHAR(20) COMMENT 'INSERT, UPDATE, DELETE',
  old_data JSON,
  new_data JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  location_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX idx_user (user_id),
  INDEX idx_table (table_name),
  INDEX idx_created_at (created_at)
);

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  data_type VARCHAR(50),
  location_id INT,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Insert default location
INSERT INTO locations (name, address, phone, email) VALUES
('Main Salon', '123 Main St', '+1234567890', 'info@salon.com');

-- Insert default roles
INSERT INTO roles (role_name, permissions) VALUES
('admin', '{"all": true}'),
('employee', '{"tasks": true, "commission": true, "reports_personal": true}');

-- Create indexes for common queries
CREATE INDEX idx_tasks_date_range ON tasks(location_id, created_at);
CREATE INDEX idx_invoices_date_range ON invoices(location_id, created_at);
CREATE INDEX idx_expenses_date_range ON expenses(location_id, expense_date);
CREATE INDEX idx_audit_logs_user_date ON audit_logs(user_id, created_at);
