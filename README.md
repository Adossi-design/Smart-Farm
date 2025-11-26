# Smart Farm Application

A comprehensive web application designed to bridge the gap between farmers, agricultural advisors, and administrators. This platform empowers farmers to list their produce, access expert agricultural advice, and stay updated with weather forecasts, while enabling advisors to share knowledge and administrators to oversee the ecosystem.

## 🚀 Features

### 🌾 For Farmers
*   **Dashboard:** Personalized view with weather updates and quick actions.
*   **Marketplace:** Post, edit, and delete agricultural products for sale.
*   **Advisory Access:** Read expert advice and tips on farming practices.
*   **Weather Widget:** View current weather and weekly forecasts (mocked data).
*   **Profile Management:** Update personal details and contact information.

### 👨‍🏫 For Advisors
*   **Content Creation:** Publish rich-text advisory articles with images.
*   **Content Management:** Edit and manage published advice posts.
*   **Profile Management:** Showcase specialization and organization details.

### 🛡️ For Administrators
*   **Analytics Dashboard:** Visual statistics on users (Farmers, Advisors) and content (Products, Advice) using interactive charts.
*   **User Management:**
    *   Register and manage Advisors.
    *   Register and manage other Administrators.
    *   View and manage registered Farmers.
*   **System Oversight:** Monitor platform activity.

## 🛠️ Tech Stack

### Frontend (`smart-farm-app`)
*   **Framework:** React (Vite)
*   **Styling:** Tailwind CSS
*   **Routing:** React Router DOM
*   **State Management:** Context API
*   **Charts:** Recharts
*   **Rich Text Editor:** React Quill
*   **Internationalization:** i18next

### Backend (`smart-farm-backend`)
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** SQLite
*   **ORM:** Sequelize
*   **Authentication:** JWT (JSON Web Tokens)
*   **File Uploads:** Multer
*   **Security:** Bcryptjs, CORS

## 📂 Project Structure

```
Smart-Farm/
├── smart-farm-app/         # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth and Data contexts
│   │   ├── pages/          # Dashboard and Landing pages
│   │   └── ...
│   └── ...
├── smart-farm-backend/     # Backend Node.js Application
│   ├── config/             # Database configuration
│   ├── controllers/        # Request handlers
│   ├── models/             # Sequelize models (User, Product, Advice)
│   ├── routes/             # API routes
│   ├── uploads/            # Directory for uploaded images
│   └── server.js           # Entry point
└── README.md               # Project Documentation
```

## 🏁 Getting Started

### Prerequisites
*   Node.js (v14 or higher)
*   npm (Node Package Manager)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Smart-Farm
    ```

2.  **Setup Backend:**
    ```bash
    cd smart-farm-backend
    npm install
    ```
    *   Create a `.env` file in `smart-farm-backend/` (optional, defaults are provided in `server.js`):
        ```env
        PORT=5000
        JWT_SECRET=your_jwt_secret
        ADMIN_EMAIL=admin@test.com
        ADMIN_PASSWORD=password
        ```

3.  **Setup Frontend:**
    ```bash
    cd ../smart-farm-app
    npm install
    ```

### Running the Application

1.  **Start the Backend Server:**
    ```bash
    cd smart-farm-backend
    npm run dev
    ```
    *   The server will start on `http://localhost:5000`.
    *   It will automatically create the SQLite database and seed default users.

2.  **Start the Frontend Application:**
    ```bash
    cd smart-farm-app
    npm run dev
    ```
    *   The application will be available at `http://localhost:5173` (or the port shown in the terminal).

## 🔑 Default Credentials

The system automatically seeds the following users on the first run:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@test.com` | `password` |
| **Advisor** | `advisor@test.com` | `password` |
| **Farmer** | `farmer@test.com` | `password` |

## 📡 API Endpoints

### Authentication
*   `POST /api/auth/register` - Register a new farmer
*   `POST /api/auth/login` - Login user
*   `PUT /api/auth/profile` - Update user profile

### Products
*   `GET /api/products` - Get all products
*   `GET /api/products/my` - Get logged-in farmer's products
*   `POST /api/products` - Create a product (Farmer only)
*   `PUT /api/products/:id` - Update a product
*   `DELETE /api/products/:id` - Delete a product

### Advice
*   `GET /api/advice` - Get all advice
*   `GET /api/advice/my` - Get logged-in advisor's posts
*   `POST /api/advice` - Create advice (Advisor only)

### Admin
*   `GET /api/admin/stats` - Get system statistics
*   `GET /api/admin/advisors` - List all advisors
*   `POST /api/admin/advisors` - Register a new advisor
*   `GET /api/admin/farmers` - List all farmers
