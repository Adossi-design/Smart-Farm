# � Toumaï Marketplace

A modern, fully-responsive agricultural marketplace platform connecting farmers, fishermen, butchers, livestock sellers, food producers, and local sellers directly with buyers. Built with React, Node.js, and SQLite.

![Status](https://img.shields.io/badge/status-production--ready-green.svg)
![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 🎯 About the Project

**Toumaï Marketplace** solves a critical problem in emerging markets: connecting local producers directly to buyers without middlemen. Farmers, food producers, and local sellers can list products with real-time communication, while buyers can browse, compare, and purchase fresh local products directly.

The platform provides:
- **Direct Communication:** Real-time messaging between buyers and sellers
- **Product Listings:** Easy-to-use product management with images and detailed descriptions  
- **Marketplace Discovery:** Browse products by category with powerful search
- **Role-Based Access:** Farmer, Buyer, and Admin dashboards
- **Fully Responsive Design:** Works perfectly on mobile, tablet, and desktop
- **Dark Mode Support:** Eye-friendly interface with light/dark theme toggle

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Database Setup](#-database-setup)
- [API Overview](#-api-overview)
- [Documentation](#-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Key Features

### 👨‍🌾 For Sellers (Farmers, Producers, Fishermen, etc.)
- **Product Management Dashboard:** Add, edit, and delete listings with categories, pricing, quantity, and location
- **Real-Time Messaging:** Communicate directly with interested buyers
- **Seller Profile:** Build credibility with buyer reviews and ratings
- **Local Inventory Control:** Manage availability and quantity per location
- **Image Upload:** Add product photos (local storage with Supabase fallback)

### 🛒 For Buyers  
- **Marketplace Discovery:** Browse all products with search and category filters
- **Product Details:** View detailed information, seller ratings, and contact info
- **Shopping Cart & Checkout:** Add items to cart and prepare for purchase
- **Messaging:** Chat directly with sellers about products and delivery
- **Bookmarks:** Save favorite products for later
- **Reviews & Ratings:** Rate sellers after purchase for community trust

### �️ For Administrators
- **User Management:** Manage farmers, buyers, and admins
- **Platform Analytics:** Monitor key metrics and system health
- **Content Moderation:** Review and manage platform content
- **Report Management:** Handle seller reports and compliance issues

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite 5.4** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **React Router v6** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **i18next** - Internationalization framework

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web server framework
- **Sequelize** - ORM for database operations
- **SQLite / PostgreSQL** - Database (SQLite local, PostgreSQL production)
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Socket.IO** - WebSocket server

---

## 🏗️ Project Structure

```
Smart-Farm/
├── smart-farm-app/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components (dashboards, auth, marketplace)
│   │   ├── context/             # React Context (Auth, Data, Theme)
│   │   ├── utils/               # API helpers, socket utilities
│   │   ├── App.jsx              # Main app with routing
│   │   └── index.css            # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── smart-farm-backend/          # Backend (Node.js + Express)
│   ├── config/                  # Database configuration
│   ├── controllers/             # Business logic handlers
│   ├── models/                  # Sequelize models
│   ├── routes/                  # API route definitions
│   ├── middleware/              # Auth & upload middleware
│   ├── uploads/                 # Local file storage
│   ├── server.js                # Express server entry point
│   └── database.sqlite          # SQLite database file
│
├── ARCHITECTURE.md              # Technical design documentation
├── SETUP_GUIDE.md               # Database & local development setup
├── PROJECT_REPORT.md            # Project retrospective & decisions
└── README.md                    # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Windows PowerShell** or terminal of choice
- **Git** (for version control)

### Frontend Setup

```powershell
cd smart-farm-app
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Backend Setup

```powershell
cd smart-farm-backend
npm install

# Copy environment file
copy .env.example .env

# Start development server (auto-restarts)
npm run dev
```

Backend API will be running at `http://localhost:5000`

---

## 🗄️ Database Setup

**See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed Windows database configuration.**

### Quick Database Info
- **Local Development:** SQLite (file-based, included)
- **Production:** PostgreSQL recommended
- **File Location:** `smart-farm-backend/database.sqlite`
- **Auto-Seeds:** Admin and Farmer test accounts

Default Test Credentials:
```
Admin:    admin@test.com / 123456
Farmer:   farmer@test.com / 123456
```

⚠️ **Change these credentials before deployment!**

---

## 🌐 API Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Products (Marketplace)
- `GET /api/products` - List all products with filters
- `POST /api/products` - Create new listing (seller only)
- `PUT /api/products/:id` - Update listing
- `DELETE /api/products/:id` - Delete listing

### Messaging
- `GET /api/conversations` - List user conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/:id/messages` - Get messages
- `POST /api/conversations/:id/messages` - Send message
- `POST /api/conversations/:id/attachments` - Upload file

### Reviews
- `POST /api/reviews` - Submit seller review
- `GET /api/reviews/seller/:sellerId` - Get seller reviews

### Reports
- `POST /api/reports` - Report seller
- `GET /api/reports` - Get reports (admin only)

---

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture and design decisions
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed local development and Windows database setup  
- **[PROJECT_REPORT.md](./PROJECT_REPORT.md)** - Project retrospective and lessons learned

---

## 🚀 Deployment

### Prepare for Production
1. Change all default credentials
2. Set secure JWT secret
3. Configure production database (PostgreSQL recommended)
4. Review SETUP_GUIDE.md for deployment steps

Backend includes `vercel.json` configuration for Vercel deployment.

---

## 🤝 Contributing

The codebase follows these principles:

1. **Senior-Level Code:** Clean, readable, well-structured code
2. **Single Responsibility:** Each file and function has one purpose
3. **Responsive by Default:** All new features must work on mobile, tablet, desktop
4. **Tested:** Core functionality tested before deployment
5. **Documented:** Code comments for complex logic
6. **Consistent Style:** Follow existing patterns and conventions

---

## 📝 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for connecting local communities and empowering sellers.**

Last Updated: May 2026

