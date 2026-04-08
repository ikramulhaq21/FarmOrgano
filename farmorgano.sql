-- ============================================================
-- FarmOrgano System - Database Setup
-- Import this file in phpMyAdmin or run via MySQL CLI
-- ============================================================

CREATE DATABASE IF NOT EXISTS farmorgano CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farmorgano;

-- -----------------------------------------------
-- Table: users
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------
-- Table: crops
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS crops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    season VARCHAR(50),
    soil_type VARCHAR(100),
    duration VARCHAR(50),
    yield_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------
-- Table: fertilizers
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS fertilizers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(100),
    `usage` TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------
-- Table: customers
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------
-- Table: orders
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------
-- Table: sales
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Sample Users (password: 'password123' hashed)
INSERT INTO users (name, email, password) VALUES
('Admin User', 'admin@farmorgano.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('John Farmer', 'john@farmorgano.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Sample Crops
INSERT INTO crops (name, category, season, soil_type, duration, yield_info) VALUES
('Tomato', 'Vegetable', 'Kharif', 'Loamy', '60-80 days', '20-25 tons per hectare'),
('Wheat', 'Cereal', 'Rabi', 'Clay Loam', '120-150 days', '3-4 tons per hectare'),
('Rice', 'Cereal', 'Kharif', 'Clayey', '100-120 days', '4-6 tons per hectare'),
('Spinach', 'Leafy Vegetable', 'Rabi', 'Sandy Loam', '30-45 days', '8-10 tons per hectare'),
('Mango', 'Fruit', 'Summer', 'Alluvial', '4-5 years', '10-15 tons per hectare');

-- Sample Fertilizers
INSERT INTO fertilizers (name, type, `usage`) VALUES
('Vermicompost', 'Organic', 'Apply 2-3 kg per plant before sowing. Rich in nutrients.'),
('Neem Cake', 'Organic', 'Mix 200 kg per acre in soil. Acts as pest repellent and fertilizer.'),
('Cow Dung Manure', 'Organic', 'Apply 10-15 tons per hectare. Improves soil structure.'),
('Bone Meal', 'Organic', 'Use 50 kg per acre. High in phosphorus for root development.'),
('Green Manure', 'Organic', 'Grow and plow under crops like sunhemp or dhaincha.');

-- Sample Customers
INSERT INTO customers (name, contact, address) VALUES
('Ravi Kumar', '9876543210', '12, Green Lane, Hyderabad, Telangana'),
('Sunita Devi', '9812345678', '45, Farm Road, Warangal, Telangana'),
('Mohan Lal', '9765432109', '78, Market Street, Nizamabad, Telangana'),
('Priya Sharma', '9654321098', '23, Organic Park, Karimnagar, Telangana');

-- Sample Orders
INSERT INTO orders (customer_id, product_name, quantity, price, date) VALUES
(1, 'Tomato', 50, 25.00, '2024-01-10'),
(2, 'Wheat', 100, 18.50, '2024-01-15'),
(3, 'Spinach', 30, 15.00, '2024-02-05'),
(1, 'Rice', 80, 35.00, '2024-02-20'),
(4, 'Mango', 40, 60.00, '2024-03-10'),
(2, 'Tomato', 60, 25.00, '2024-03-22');

-- Sample Sales
INSERT INTO sales (order_id, total_amount, month, year) VALUES
(1, 1250.00, 1, 2024),
(2, 1850.00, 1, 2024),
(3, 450.00, 2, 2024),
(4, 2800.00, 2, 2024),
(5, 2400.00, 3, 2024),
(6, 1500.00, 3, 2024);
