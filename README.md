# Store Rating Management System (Indian Retail & Customer Network)

A full-stack web application designed for managing and submitting ratings (1 to 5 stars) for registered stores across India, featuring a common authentication portal and role-based dashboards for **System Administrators**, **Normal Users**, and **Store Owners**.

Built strictly in accordance with the **FullStack Intern Coding Challenge - V1.1** requirements.

---

##  Table of Contents
1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Key Features by Role](#-key-features-by-role)
4. [Form Validation Rules](#-form-validation-rules)
5. [Project Folder Structure](#-project-folder-structure)
6. [Database Schema (MySQL)](#-database-schema-mysql)
7. [Environment Configuration](#-environment-configuration)
8. [Setup and Installation Guide](#-setup-and-installation-guide)
9. [Pre-Seeded Demo Accounts (Testing)](#-pre-seeded-demo-accounts-testing)
10. [RESTful API Endpoints](#-restful-api-endpoints)
11. [Running the Automated Verification Test Suite](#-running-the-automated-verification-test-suite)
12. [Interview Explanation Notes (Fresher Guide)](#-interview-explanation-notes-fresher-guide)

---

##  Project Overview

The **Store Rating Management System** is a full-stack platform that enables users to discover registered stores and submit verified ratings from 1 to 5 stars. It implements a unified authentication gateway where users with different privileges are redirected to their specialized portals:
- **System Administrator (Anand Swaroop Shrivastava):** Oversees platform metrics, registers new stores, and manages user accounts.
- **Normal User (Aarav Rajeshwar Deshmukh):** Browses registered stores (e.g., Vijay Sales, Reliance Digital, Fabindia), searches by name/address, submits new ratings, and modifies previous ratings.
- **Store Owner (Ramesh Chandra Choudhary - Vijay Sales):** Monitors their specific store's average rating and views the list of customers who rated their business.

---

##  Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React.js (Vite), HTML5, CSS3, JavaScript (ES6+) | Modern, responsive, component-based user interface |
| **Routing** | React Router v6 | Client-side routing and role-based route guards |
| **HTTP Client** | Axios | RESTful API communication with JWT interceptors |
| **Backend** | Node.js & Express.js | Scalable REST API with modular controllers and middleware |
| **Database** | MySQL (MySQL Server 8.0+) | Relational database with foreign keys and unique constraints |
| **DB Driver** | mysql2/promise | High-performance MySQL connection pool for Node.js |
| **Security & Auth** | bcryptjs & jsonwebtoken (JWT) | Salted password hashing (10 rounds) and stateless token auth |
| **Validation** | express-validator | Dual-layer validation on both frontend and backend |
| **Configuration** | dotenv & cors | Environment variable isolation and CORS management |

---

##  Key Features by Role

### 1. System Administrator
- **Real-Time Analytics Dashboard:** Displays live counts of:
  - Total number of registered users (`SQL COUNT()`)
  - Total number of registered stores (`SQL COUNT()`)
  - Total number of submitted ratings (`SQL COUNT()`)
  - User breakdown by role (Normal Users, Admins, Store Owners)
- **Store Management:**
  - View all registered stores with Name, Email, Address, and Average Rating (`SQL AVG()`).
  - Search stores across Name, Email, and Address (e.g., Mumbai, Bengaluru, Delhi).
  - Ascending and descending column sorting on key fields.
  - Add new stores with validation and optional Store Owner assignment.
- **User Management:**
  - View all registered users with Name, Email, Address, and Role.
  - Search and filter users by Name, Email, Address, and Role dropdown.
  - Ascending and descending column sorting on all table columns.
  - Add new users (Normal Users, Admins, or Store Owners).
  - **User Details Modal:** View full user details. If the selected user is a **Store Owner**, their store details and overall store rating are automatically retrieved and displayed.

### 2. Normal User
- **Registration Page:** Sign up with Name (20–60 chars), Email (unique), Address (max 400 chars), and Password (8–16 chars with uppercase & special character). Automatically assigned the `user` role.
- **Store Listing:** View all registered stores displaying Store Name, Address, Overall Rating, and the User's Own Submitted Rating (or "Not rated yet").
- **Search & Sort:** Search stores by Store Name and Address; sort columns in ascending/descending order.
- **Rating System (1 to 5 Stars):**
  - Interactive star picker (1: Poor, 2: Fair, 3: Good, 4: Very Good, 5: Excellent).
  - Submit a new rating.
  - Modify a previously submitted rating at any time.
  - **Duplicate Prevention:** MySQL database unique constraint `(user_id, store_id)` and backend `ON DUPLICATE KEY UPDATE` prevent duplicate ratings from the same user for the same store.
  - Automatically recalculates and updates store average ratings in real time.
- **Password Update:** Logged-in users can update their account password.

### 3. Store Owner
- **Store Performance Portal:** View assigned store name, email, physical address, and overall average customer rating.
- **Customer Ratings List:** View every customer who submitted a rating for their store:
  - Customer Full Name
  - Customer Email
  - Submitted Rating (1 to 5 stars)
  - Date Submitted
- **Data Isolation & Security:** Store owners can **only** view rating records belonging strictly to their own store.
- **Column Sorting:** Sort customer feedback by Name, Email, Rating, and Date.
- **Password Update:** Change account password after logging in.

---

##  Form Validation Rules

Implemented on **both Frontend and Backend** (never trusting frontend alone):

| Field | Validation Rule | Error Message / Constraint |
|---|---|---|
| **Name** | Min 20 characters, Max 60 characters | "Name must be between 20 and 60 characters in length." |
| **Address** | Maximum 400 characters | "Address must not exceed 400 characters." |
| **Password** | 8 to 16 characters, $\ge$ 1 uppercase letter (`A-Z`), $\ge$ 1 special character (`[!@#$%^&*...]`) | "Password must be 8-16 characters with at least 1 uppercase letter and 1 special character." |
| **Email** | Standard email format regex, unique in MySQL | "Please provide a valid email address." / "Email already exists." |
| **Rating** | Integer between 1 and 5 | "Rating must be an integer between 1 and 5." |

---

##  Project Folder Structure

```
store-rating-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL2 connection pool configuration
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, GetMe, UpdatePassword
│   │   ├── adminController.js    # Stats, Manage Users, Manage Stores, User Details
│   │   ├── storeController.js    # User store listings, submit/modify rating
│   │   └── ownerController.js    # Store Owner dashboard & ratings list
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role authorization (RBAC)
│   │   └── validators.js         # express-validator rules matching challenge spec
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── adminRoutes.js        # /api/admin/*
│   │   ├── storeRoutes.js        # /api/stores/*
│   │   └── ownerRoutes.js        # /api/owner/*
│   ├── .env                      # Local environment variables
│   ├── .env.example              # Template environment variables
│   ├── package.json              # Backend dependencies and scripts
│   ├── server.js                 # Express server & API routes
│   └── test-suite.js             # Automated 27-check end-to-end verification test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Responsive navigation bar with user profile & logout
│   │   │   ├── Modal.jsx         # Accessible modal dialog for forms & details
│   │   │   ├── StarRating.jsx    # Interactive 1-5 star picker and display badge
│   │   │   └── ProtectedRoute.jsx# Role-based route authorization guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global user auth state, login, register, logout
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Common login page with 1-click test credentials
│   │   │   ├── Register.jsx      # Normal user signup page with live counters
│   │   │   ├── AdminDashboard.jsx# Admin stats, stores table, users table, modals
│   │   │   ├── UserDashboard.jsx # Normal user store browsing, search, sort, rating
│   │   │   ├── OwnerDashboard.jsx# Store owner rating KPI & customer reviews table
│   │   │   └── UpdatePassword.jsx# Secure password update form
│   │   ├── services/
│   │   │   └── api.js            # Axios instance with JWT interceptor
│   │   ├── styles/
│   │   │   └── index.css         # Clean, responsive design system
│   │   ├── App.jsx               # React Router routes and protection
│   │   └── main.jsx              # React DOM mounting
│   ├── index.html                # HTML template with Google Fonts
│   ├── package.json              # Frontend dependencies and scripts
│   └── vite.config.js            # Vite build configuration with API proxy
│
├── database/
│   └── database.sql              # Complete MySQL DDL & DML seed script
└── README.md                     # Comprehensive project documentation
```

---

##  Database Schema (MySQL)

### 1. `users` Table
Stores user accounts for all three roles (`admin`, `user`, `owner`):
```sql
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
    INDEX idx_user_role (role)
);
```

### 2. `stores` Table
Stores registered stores and links them to an optional Store Owner:
```sql
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    address VARCHAR(400) NOT NULL,
    owner_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_store_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_store_name (name),
    INDEX idx_store_email (email)
);
```

### 3. `ratings` Table
Stores 1–5 star ratings. Includes a compound **UNIQUE KEY** on `(user_id, store_id)`:
```sql
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rating_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_rating_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_store UNIQUE (user_id, store_id),
    INDEX idx_rating_store (store_id),
    INDEX idx_rating_user (user_id)
);
```

---

##  Environment Configuration

### Backend (`store-rating-system/backend/.env`)
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Hello@123
DB_NAME=store_rating_db
DB_PORT=3306
JWT_SECRET=super_secret_store_rating_jwt_key_2026_secure
JWT_EXPIRES_IN=24h
```

---

##  Setup and Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v26.4.0)
- **MySQL Server**: 8.0 or higher

### Step 1: Initialize Database
```bash
mysql -u root -p < store-rating-system/database/database.sql
```

### Step 2: Install Backend Dependencies
```bash
cd store-rating-system/backend
npm install
```

### Step 3: Install Frontend Dependencies & Build
```bash
cd ../frontend
npm install
npm run build
```

### Step 4: Run the Application
Open your browser at: **`http://localhost:5000`**

---

##  Pre-Seeded Indian Demo Accounts (Testing)

The database includes ready-to-use Indian accounts with valid passwords matching all security rules (8–16 chars, 1 uppercase, 1 special character).

| Role | Full Name | Email | Password | Pre-Assigned Entity |
|---|---|---|---|---|
| **System Administrator** | Anand Swaroop Shrivastava | `admin@storerating.in` | `Admin@1234` | Full administrative control |
| **Store Owner** | Ramesh Chandra Choudhary | `ramesh.choudhary@vijaysales.in` | `Owner@1234` | Owner of *Vijay Sales Electronics Megastore* (Avg: 4.75 ★) |
| **Normal User** | Aarav Rajeshwar Deshmukh | `aarav.deshmukh@gmail.com` | `User@1234` | Normal User account with existing store ratings |

> **Pro Tip:** The login page features **1-Click Test Credential Buttons** that automatically fill in these Indian accounts for instant testing!

---

##  RESTful API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Normal user registration
- `POST /api/auth/login` - Common login for all roles (returns JWT token and user info)
- `GET /api/auth/me` - Get profile of currently logged-in user *(Protected)*
- `PUT /api/auth/update-password` - Update current user password *(Protected)*

### Admin Operations (`/api/admin`) - Restricted to `admin` Role
- `GET /api/admin/stats` - Dashboard counts (`total_users`, `total_stores`, `total_ratings`, breakdown)
- `GET /api/admin/stores` - List stores with average rating, search (`?search=`), and sort (`?sortBy=name&order=asc`)
- `POST /api/admin/stores` - Add new store
- `GET /api/admin/users` - List users with search, role filter (`?role=user`), and sorting
- `POST /api/admin/users` - Add user (Normal User, Admin, or Store Owner)
- `GET /api/admin/users/:id` - Complete user details (if Store Owner, includes store rating)
- `GET /api/admin/store-owners` - List of store owners for assignment dropdown

### Stores & Ratings (`/api/stores`) - Authenticated Users
- `GET /api/stores` - Browse stores with overall average rating and current user's rating
- `POST /api/stores/:storeId/rating` - Submit or modify rating (1 to 5) *(Restricted to `user` role)*

### Store Owner Portal (`/api/owner`) - Restricted to `owner` Role
- `GET /api/owner/dashboard` - Get store details, average rating, and list of users who rated their store

---

##  Running the Automated Verification Test Suite

An end-to-end verification test suite has been provided in `backend/test-suite.js`. It performs 27 automated assertions verifying all requirements:
```bash
cd store-rating-system/backend
node test-suite.js
```

### Test Suite Output:
```
====================================================
 RUNNING COMPREHENSIVE E2E VERIFICATION TEST SUITE  
====================================================

[PASS] 1. System Health Check
[PASS] 2a. Validation: Name < 20 chars correctly rejected (400)
[PASS] 2b. Validation: Password without special char rejected (400)
[PASS] 2c. Normal User Registration with role "user" (201)
[PASS] 2d. Validation: Duplicate Email rejected (409 Conflict)
[PASS] 3a. Common Login: Admin role authentication & redirect token
[PASS] 3b. Common Login: Store Owner role authentication & redirect token
[PASS] 3c. Common Login: Normal User role authentication & redirect token
[PASS] 3d. Authentication: Invalid credentials rejected (401)
[PASS] 4a. Security: Normal user forbidden from Admin endpoints (403)
[PASS] 4b. Security: Store Owner forbidden from Admin endpoints (403)
[PASS] 4c. Security: Normal user forbidden from Store Owner endpoints (403)
[PASS] 4d. Security: Unauthenticated access blocked (401)
[PASS] 5a. Admin Dashboard: Actual MySQL counts for users, stores, ratings
[PASS] 5b. Admin Manage Users: Add new user
[PASS] 5c. Admin Manage Users: View users list with sorting & filtering
[PASS] 5d. Admin User Details: View user details with Store Owner rating
[PASS] 5e. Admin Manage Stores: Add new store with assigned owner
[PASS] 5f. Admin Manage Stores: View stores with average rating & sorting
[PASS] 6a. Normal User: View stores listing with overall rating and user rating
[PASS] 6b. Normal User: Search stores by name and address
[PASS] 6c. Normal User: Submit rating (1 to 5)
[PASS] 6d. Normal User: Modify existing rating & auto-update average rating
[PASS] 6e. Validation: Rating outside 1-5 range rejected (400)
[PASS] 7a. Store Owner: View store details and average rating
[PASS] 7b. Store Owner: View customer ratings list (Name, Email, Rating, Date)
[PASS] 8. Password Update: Logged-in user can update password

====================================================
 SUMMARY: 27 / 27 TESTS PASSED 
====================================================
ALL REQUIREMENTS VERIFIED AND WORKING PERFECTLY!
```
