-- ==============================================================
-- STORE RATING MANAGEMENT SYSTEM - DATABASE SCHEMA & SEED DATA
-- Database: MySQL 8.0+
-- Locale & Entity Context: Indian Retail & Customer Network
-- ==============================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS store_rating_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE store_rating_db;

-- 2. Drop tables in reverse order of foreign keys (for clean re-runs)
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS users;

-- 3. Users Table
-- Stores credentials and profiles for Admin, Normal Users, and Store Owners
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    role ENUM('admin', 'user', 'owner') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_name (name),
    INDEX idx_user_email (email),
    INDEX idx_user_role (role),
    INDEX idx_user_address (address(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Stores Table
-- Stores registered business outlets and references an optional Store Owner
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    address VARCHAR(400) NOT NULL,
    owner_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_store_owner
        FOREIGN KEY (owner_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_store_name (name),
    INDEX idx_store_email (email),
    INDEX idx_store_address (address(100)),
    INDEX idx_store_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Ratings Table
-- Stores user ratings (1 to 5) for registered stores
-- Constraint: unique_user_store ensures a user can rate each store at most once
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rating_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_rating_store
        FOREIGN KEY (store_id) REFERENCES stores(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT unique_user_store
        UNIQUE (user_id, store_id),
    INDEX idx_rating_store (store_id),
    INDEX idx_rating_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- INDIAN SEED DATA FOR TESTING & EVALUATION
-- ==============================================================

-- A. Insert Default System Administrator (Indian)
-- Password: Admin@1234
INSERT INTO users (id, name, email, password, address, role) VALUES
(1, 'Anand Swaroop Shrivastava', 'admin@storerating.in', '$2a$10$zeiKR9gNTyN8ruJgvbgo1uVG8E8GY.QDOobMHYTX/zIOmObtyx0M6', 'Plot No. 101, Cyber City, DLF Phase 2, Gurugram, Haryana 122002', 'admin');

-- B. Insert Default Store Owners (Indian)
-- Password: Owner@1234
INSERT INTO users (id, name, email, password, address, role) VALUES
(2, 'Ramesh Chandra Choudhary', 'ramesh.choudhary@vijaysales.in', '$2a$10$ok6z43jo3BKAt9/EiPWEcuDXqFsyDe7Nfart7FZjD3G.T4GzjBs/O', 'Shop No. 14, Phoenix Marketcity, LBS Marg, Kurla West, Mumbai, Maharashtra 400070', 'owner'),
(3, 'Priya Darshini Venkatesh', 'priya.venkatesh@reliancedigital.in', '$2a$10$ok6z43jo3BKAt9/EiPWEcuDXqFsyDe7Nfart7FZjD3G.T4GzjBs/O', 'No. 45, 100 Feet Road, Indiranagar 2nd Stage, Bengaluru, Karnataka 560038', 'owner'),
(4, 'Suresh Kumar Maheshwari', 'suresh.maheshwari@fabindia.in', '$2a$10$ok6z43jo3BKAt9/EiPWEcuDXqFsyDe7Nfart7FZjD3G.T4GzjBs/O', 'Shop No. 8, South Extension Part 1 Market, New Delhi, Delhi 110049', 'owner');

-- C. Insert Default Normal Users (Indian)
-- Password: User@1234
INSERT INTO users (id, name, email, password, address, role) VALUES
(5, 'Aarav Rajeshwar Deshmukh', 'aarav.deshmukh@gmail.com', '$2a$10$ocAMP7Kg42JF8FjquScsXeEjKUcnUIGDGxtrdYPsHA8hDulDbX.JS', 'Flat No. 302, Shanti Kunj Apartments, F.C. Road, Shivajinagar, Pune, Maharashtra 411005', 'user'),
(6, 'Deepika Rameshvardhan Nair', 'deepika.nair@gmail.com', '$2a$10$ocAMP7Kg42JF8FjquScsXeEjKUcnUIGDGxtrdYPsHA8hDulDbX.JS', 'House No. 12, Panampilly Nagar Main Avenue, Kochi, Kerala 682036', 'user'),
(7, 'Aditya Vikramaditya Joshi', 'aditya.joshi@gmail.com', '$2a$10$ocAMP7Kg42JF8FjquScsXeEjKUcnUIGDGxtrdYPsHA8hDulDbX.JS', 'B-404, Galaxy Heights, S.G. Highway, Bodakdev, Ahmedabad, Gujarat 380054', 'user'),
(8, 'Ananya Priyadarshini Sen', 'ananya.sen@gmail.com', '$2a$10$ocAMP7Kg42JF8FjquScsXeEjKUcnUIGDGxtrdYPsHA8hDulDbX.JS', 'Flat 5A, Highland Park, E.M. Bypass, Kolkata, West Bengal 700075', 'user'),
(9, 'Rohan Surendranath Verma', 'rohan.verma@gmail.com', '$2a$10$ocAMP7Kg42JF8FjquScsXeEjKUcnUIGDGxtrdYPsHA8hDulDbX.JS', 'Boring Canal Road, Near Panchmukhi Mandir, Patna, Bihar 800001', 'user');

-- D. Insert Sample Registered Indian Stores
INSERT INTO stores (id, name, email, address, owner_id) VALUES
(1, 'Vijay Sales Electronics Megastore', 'contact@vijaysales.in', 'Plot 22, Link Road, Andheri West, Mumbai, Maharashtra 400053', 2),
(2, 'Reliance Digital Superstore Bengaluru', 'support@reliancedigital.in', 'Commercial Block 4, Brigade Road, Ashok Nagar, Bengaluru, Karnataka 560025', 3),
(3, 'Fabindia Ethnic Handicrafts Outlet', 'care@fabindia.in', 'Shop 18, Khan Market Commercial Complex, New Delhi, Delhi 110003', 4),
(4, 'Nature Basket Gourmet Fresh Mart', 'orders@naturesbasket.in', 'Road No. 36, Jubilee Hills Checkpost, Hyderabad, Telangana 500033', NULL),
(5, 'Tanishq Jewellery Heritage Showroom', 'contact@tanishq.co.in', 'G.S. Road, Christian Basti, Dispur, Guwahati, Assam 781005', NULL);

-- E. Insert Initial Verified Ratings
INSERT INTO ratings (user_id, store_id, rating) VALUES
(5, 1, 5), -- Aarav rates Vijay Sales 5
(6, 1, 4), -- Deepika rates Vijay Sales 4
(7, 1, 5), -- Aditya rates Vijay Sales 5
(8, 1, 5), -- Ananya rates Vijay Sales 5 (Average = 4.75)
(5, 2, 4), -- Aarav rates Reliance Digital 4
(6, 2, 4), -- Deepika rates Reliance Digital 4
(7, 2, 3), -- Aditya rates Reliance Digital 3 (Average = 3.67)
(8, 3, 5), -- Ananya rates Fabindia 5
(9, 3, 5), -- Rohan rates Fabindia 5 (Average = 5.00)
(9, 4, 4); -- Rohan rates Nature Basket 4 (Average = 4.00)
