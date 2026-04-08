# 🌿 FarmOrgano System
### Organic Farming Management System

A complete web-based management system for organic farms — built with PHP, MySQL, HTML, CSS, and JavaScript. Designed to run on XAMPP.

---

## 📁 Project Structure

```
farmorgano-system/
│
├── frontend/
│   ├── index.html                  ← Landing page
│   ├── css/
│   │   ├── style.css               ← Global styles (eco-green theme)
│   │   └── dashboard.css           ← Dashboard layout & sidebar
│   ├── js/
│   │   ├── utils.js                ← Shared utilities (API, toast, modals)
│   │   ├── auth.js                 ← Login / Register logic
│   │   └── dashboard.js            ← All module logic (crops, orders, etc.)
│   └── pages/
│       ├── login.html
│       ├── register.html
│       └── dashboard.html
│
├── backend/
│   ├── config/
│   │   └── db.php                  ← MySQL connection
│   └── api/
│       ├── auth/
│       │   ├── login.php
│       │   ├── register.php
│       │   └── logout.php
│       ├── crops/
│       │   └── index.php           ← GET, POST, PUT, DELETE
│       ├── fertilizers/
│       │   └── index.php           ← GET, POST, DELETE
│       ├── customers/
│       │   └── index.php           ← GET, POST, DELETE
│       ├── orders/
│       │   └── index.php           ← GET, POST, DELETE
│       ├── sales/
│       │   └── index.php           ← GET, GET?report=monthly
│       └── dashboard/
│           └── index.php           ← Aggregated stats for dashboard
│
├── database/
│   └── farmorgano.sql              ← DB schema + sample data
│
└── README.md
```

---

## ⚙️ Setup Instructions

### Step 1 — Install XAMPP
Download and install XAMPP from: https://www.apachefriends.org/

### Step 2 — Copy Project Files
Copy the entire `farmorgano-system` folder into your XAMPP `htdocs` directory:
```
C:\xampp\htdocs\farmorgano-system\
```

### Step 3 — Start XAMPP Services
- Open XAMPP Control Panel
- Start **Apache**
- Start **MySQL**

### Step 4 — Import the Database
1. Open your browser and go to: http://localhost/phpmyadmin
2. Click **"New"** to create a new database (or just import — the SQL file creates it automatically)
3. Click **"Import"** tab
4. Click **"Choose File"** and select: `farmorgano-system/database/farmorgano.sql`
5. Click **"Go"** to import

### Step 5 — Configure Database (if needed)
Open `backend/config/db.php` and update credentials if different:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');   // your MySQL username
define('DB_PASS', '');       // your MySQL password (empty by default in XAMPP)
define('DB_NAME', 'farmorgano');
```

### Step 6 — Open the App
Visit in your browser:
```
http://localhost/farmorgano-system/frontend/index.html
```

---

## 🔐 Default Login Credentials

| Field    | Value                    |
|----------|--------------------------|
| Email    | admin@farmorgano.com     |
| Password | password                 |

> These are pre-loaded via the SQL sample data. The password is stored as a bcrypt hash.

---

## ✨ Features

| Module         | Features                                      |
|----------------|-----------------------------------------------|
| Authentication | Register, Login, Logout, Password Hashing     |
| Crops          | Add, View, Edit (Update), Delete              |
| Fertilizers    | Add, View, Delete                             |
| Customers      | Add, View, Delete                             |
| Orders         | Create, View, Delete (auto-creates sales)     |
| Sales          | View all, Monthly aggregated reports          |
| Dashboard      | Stats cards, Bar chart, Donut chart, Recent orders |

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript   |
| Backend    | PHP 8+ (REST API style)           |
| Database   | MySQL 5.7+ / MariaDB              |
| Charts     | Chart.js v4 (CDN)                 |
| Fonts      | Google Fonts (Playfair Display + DM Sans) |
| Server     | Apache (XAMPP)                    |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint                        | Description     |
|--------|---------------------------------|-----------------|
| POST   | /backend/api/auth/login.php     | User login      |
| POST   | /backend/api/auth/register.php  | User register   |
| GET    | /backend/api/auth/logout.php    | Logout          |

### Crops
| Method | Endpoint                        | Description     |
|--------|---------------------------------|-----------------|
| GET    | /backend/api/crops/index.php    | List all crops  |
| POST   | /backend/api/crops/index.php    | Add crop        |
| PUT    | /backend/api/crops/index.php    | Update crop     |
| DELETE | /backend/api/crops/index.php    | Delete crop     |

### Fertilizers
| Method | Endpoint                              | Description         |
|--------|---------------------------------------|---------------------|
| GET    | /backend/api/fertilizers/index.php    | List fertilizers    |
| POST   | /backend/api/fertilizers/index.php    | Add fertilizer      |
| DELETE | /backend/api/fertilizers/index.php    | Delete fertilizer   |

### Customers
| Method | Endpoint                            | Description       |
|--------|-------------------------------------|-------------------|
| GET    | /backend/api/customers/index.php    | List customers    |
| POST   | /backend/api/customers/index.php    | Add customer      |
| DELETE | /backend/api/customers/index.php    | Delete customer   |

### Orders
| Method | Endpoint                          | Description     |
|--------|-----------------------------------|-----------------|
| GET    | /backend/api/orders/index.php     | List orders     |
| POST   | /backend/api/orders/index.php     | Create order    |
| DELETE | /backend/api/orders/index.php     | Delete order    |

### Sales
| Method | Endpoint                                          | Description           |
|--------|---------------------------------------------------|-----------------------|
| GET    | /backend/api/sales/index.php                      | All sales records     |
| GET    | /backend/api/sales/index.php?report=monthly       | Monthly aggregation   |

### Dashboard
| Method | Endpoint                              | Description         |
|--------|---------------------------------------|---------------------|
| GET    | /backend/api/dashboard/index.php      | All stats + chart   |

---

## 📝 Notes for Submission

- All passwords are hashed using PHP `password_hash()` with BCRYPT
- Sessions are managed server-side via PHP `$_SESSION`
- All API responses follow a consistent JSON format: `{ success, message, data }`
- Orders automatically generate a linked Sales record on creation
- Frontend uses Fetch API (AJAX) — no page reloads required
- Charts powered by Chart.js loaded via CDN (requires internet)
- Fully responsive — works on mobile, tablet, and desktop

---

## 👨‍💻 Project Info

- **Project Title:** FarmOrgano – Organic Farming Management System  
- **Technology:** PHP + MySQL + HTML + CSS + JavaScript  
- **Server:** Apache (XAMPP)  
- **Purpose:** College Submission Project  

---

*Built with 🌿 for sustainable organic farming management.*
