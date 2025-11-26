# Smart Farm Backend

A lightweight Node.js backend for the Smart Farm application. This project provides a REST API for authentication, product management, advice posts, admin operations, and file uploads. It uses Express, Sequelize (SQLite), and common middleware for auth and file handling.

**Tech stack:**
- **Runtime:** Node.js
- **Framework:** Express
- **ORM:** Sequelize (SQLite)
- **Auth:** JSON Web Tokens (`jsonwebtoken`)
- **Uploads:** `multer`

**Project status:** Minimal production-ready backend scaffold — extend controllers, models, and routes as needed.

**Repository layout**
- `server.js`: application entrypoint.
- `config/database.js`: Sequelize setup (uses SQLite file `database.sqlite` by default).
- `controllers/`: request handlers (e.g. `authController.js`, `productController.js`).
- `models/`: Sequelize models (e.g. `User.js`, `Product.js`, `Advice.js`).
- `routes/`: route definitions (`authRoutes.js`, `productRoutes.js`, `adviceRoutes.js`, `adminRoutes.js`).
- `middleware/`: middleware functions (`authMiddleware.js`, `uploadMiddleware.js`).
- `uploads/`: directory for file uploads (images, etc.).

**Dependencies (selected)**
- `express`, `dotenv`, `sequelize`, `sqlite3`, `jsonwebtoken`, `bcryptjs`, `multer`, `cors`.

**Quick start (Windows PowerShell)**

1. Install dependencies

```powershell
npm install
```

2. Create environment file

Copy the example or create a `.env` file at project root. See `.env.example` below for recommended keys.

```powershell
copy .env.example .env
```

3. Start the server

```powershell
# Development (auto-restarts):
npm run dev

# Production:
npm start
```

The `package.json` defines `start` as `node server.js` and `dev` as `nodemon server.js`.

**Environment variables (.env.example)**
- `PORT` — port to run the server (default: `3000`)
- `JWT_SECRET` — secret key for signing JWTs
- `NODE_ENV` — `development` or `production` (optional)

Example file (create `.env` from this):

```
PORT=3000
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

Notes:
- The default SQLite database file is `database.sqlite` (created in the project root). To change storage, edit `config/database.js`.

**API overview**
The API is split into route modules in `routes/`. Below are suggested endpoints based on the controllers and routes present — check the specific route files for full details and any required auth.

- **Authentication (`routes/authRoutes.js`)**
  - `POST /auth/register` — create a user (request body: name, email, password)
  - `POST /auth/login` — authenticate and receive a JWT (request body: email, password)

- **Products (`routes/productRoutes.js`)**
  - `GET /products` — list products
  - `GET /products/:id` — get single product
  - `POST /products` — create product (likely protected/admin)
  - `PUT /products/:id` — update product (protected)
  - `DELETE /products/:id` — remove product (protected)

- **Advice (`routes/adviceRoutes.js`)**
  - `GET /advice` — list advice posts
  - `POST /advice` — create an advice post (may be protected)
  - `GET /advice/:id` — get advice details

- **Admin (`routes/adminRoutes.js`)**
  - Admin-specific operations (user/product moderation). Check `routes/adminRoutes.js` for exact endpoints and requirements.

File upload endpoints use `multer` and store files in `uploads/`. The middleware in `middleware/uploadMiddleware.js` manages the upload handling.

**Authentication**
- Auth is implemented with JWTs. Login returns a token which should be sent in requests that require authentication using the `Authorization: Bearer <token>` header.
- The middleware `middleware/authMiddleware.js` guards protected routes.

**Database**
- Uses Sequelize with the SQLite dialect. The default database file is `database.sqlite` at the repository root (configured in `config/database.js`).
- If you want to use a different DB (e.g., PostgreSQL, MySQL), update `config/database.js` to use the proper Sequelize connection configuration and install the corresponding driver.

**Uploads**
- Uploaded files are placed in the `uploads/` folder. Ensure this folder is writable by the running process.

**Extending the project**
- Add model fields and run migrations (if/when you introduce Sequelize migrations).
- Add unit and integration tests (none provided by default).
- Harden security: rate limiting, validation, stricter CORS, HTTPS in production.

**Troubleshooting**
- If the server doesn't start: check `PORT` and ensure no other process is using it.
- DB errors: verify `database.sqlite` exists or that `config/database.js` points to a valid storage path.
- Upload issues: ensure `uploads/` exists and has appropriate permissions.

**Useful commands**
- Install deps: `npm install`
- Start dev server: `npm run dev`
- Start production server: `npm start`

**Where to look next**
- Route definitions: `routes/`
- Business logic: `controllers/`
- Data models: `models/`
- Middleware (auth & uploads): `middleware/`

If you'd like, I can:
- Add a `.env.example` file to the repo.
- Add a brief API reference with exact request/response examples by reading the route and controller files.
- Add a small Postman collection or OpenAPI spec for the API.

**API Documentation**
A Postman collection is included in the repository: `smart-farm-backend.postman_collection.json`. You can import this file into Postman to test the API endpoints.


---
Generated on: November 25, 2025
