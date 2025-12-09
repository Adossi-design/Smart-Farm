# 🌱 Smart Farm Application   

## 🚀 [Live Demo](https://smart-farm-market.vercel.app/)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-development-orange.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

> Bridging the gap between farmers, agricultural advisors, and administrators for a smarter agricultural ecosystem.

**Smart Farm** is a comprehensive web platform designed to empower farmers by connecting them with expert advice, market opportunities, and real-time weather data. It facilitates a seamless flow of information between agricultural stakeholders to improve productivity and sustainability.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Usage & Credentials](#-usage--credentials)
- [API Endpoints](#-api-endpoints)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Features

### 🌾 For Farmers
*   **Dashboard:** Personalized hub with weather updates and quick access to services.
*   **Marketplace:** List agricultural produce for sale, manage inventory, and reach buyers.
*   **Advisory Access:** Browse expert articles and tips on best farming practices.
*   **Weather Widget:** Real-time weather updates and weekly forecasts (currently mocked).
*   **Profile Management:** Manage personal details and contact information.

### 👨‍🏫 For Advisors
*   **Knowledge Sharing:** Publish rich-text articles with images to guide farmers.
*   **Content Management:** Edit and update advisory posts to keep information current.
*   **Professional Profile:** Showcase expertise, organization, and specialization.

### 🛡️ For Administrators
*   **Analytics Dashboard:** Visual insights into user growth and content generation.
*   **User Management:** Register and oversee Advisors and other Administrators.
*   **Farmer Oversight:** View registered farmers and monitor platform usage.
*   **System Health:** Monitor key platform metrics.

---

## 🛠 Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | **React (Vite)** | Fast, modern UI library |
| | **Tailwind CSS** | Utility-first CSS framework for styling |
| | **Recharts** | Composable charting library for React |
| | **React Quill** | Rich text editor for content creation |
| **Backend** | **Node.js & Express** | Scalable server-side runtime |
| | **SQLite** | Lightweight, serverless database |
| | **Sequelize** | Promise-based Node.js ORM |
| | **JWT** | Secure authentication mechanism |

---

## 📂 Project Structure

```bash
Smart-Farm/
├── smart-farm-app/         # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Global state (Auth, Data)
│   │   ├── pages/          # Application views
│   │   └── ...
│   └── .env                # Frontend configuration
├── smart-farm-backend/     # Backend Node.js Application
│   ├── config/             # Database setup
│   ├── controllers/        # Business logic
│   ├── models/             # Database schemas
│   ├── routes/             # API endpoints
│   ├── uploads/            # Image storage
│   └── server.js           # App entry point
└── README.md               # Documentation
```

---

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   **Node.js** (v14 or higher)
*   **npm** (Node Package Manager)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd Smart-Farm
    ```

2.  **Backend Setup**
    ```bash
    cd smart-farm-backend
    npm install
    ```

3.  **Frontend Setup**
    ```bash
    cd ../smart-farm-app
    npm install
    ```

---

## ⚙️ Configuration

### Backend (`smart-farm-backend/.env`)
Create a `.env` file in the backend directory if you wish to override defaults:
```env
PORT=5000
JWT_SECRET=your_super_secret_key
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=password
```

### Frontend (`smart-farm-app/.env`)
The frontend comes with a default `.env` file. Ensure it points to your backend:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME="Smart Farm"
```

---

## 🔑 Usage & Credentials

1.  **Start the Backend**
    ```bash
    cd smart-farm-backend
    npm run dev
    ```
    *Server runs on `http://localhost:5000`*

2.  **Start the Frontend**
    ```bash
    cd smart-farm-app
    npm run dev
    ```
    *App runs on `http://localhost:5173`*

### Default Login Credentials
The system automatically seeds these accounts on the first run:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@test.com` | `password` |
| **Advisor** | `advisor@test.com` | `password` |
| **Farmer** | `farmer@test.com` | `password` |

---

## 📡 API Endpoints

### Authentication
*   `POST /api/auth/register` - Register new farmer
*   `POST /api/auth/login` - User login
*   `PUT /api/auth/profile` - Update profile

### Products
*   `GET /api/products` - List all products
*   `POST /api/products` - Create product (Farmer)
*   `PUT /api/products/:id` - Update product
*   `DELETE /api/products/:id` - Delete product

### Advice
*   `GET /api/advice` - List advice articles
*   `POST /api/advice` - Publish advice (Advisor)

### Admin
*   `GET /api/admin/stats` - System statistics
*   `POST /api/admin/advisors` - Register advisor

---

## 🗺️ Roadmap

- [ ] Integration with real-time Weather API (e.g., OpenWeatherMap)
- [ ] Payment Gateway integration for product purchases
- [ ] Mobile Application (React Native)
- [ ] Multi-language support (Kinyarwanda, French, English)
- [ ] SMS notifications for farmers

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
