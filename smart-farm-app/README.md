# Smart Farm Platform

A React-based platform for connecting farmers with customers and advisors.

## Features

- **Marketplace**: Browse and search for agricultural products.
- **Farmer Dashboard**: Post products, view weather, receive advice.
- **Advisor Dashboard**: Publish farming tips and advice.
- **Admin Dashboard**: Manage users and platform settings.
- **Multi-language Support**: English, French, Arabic.

# Smart Farm Platform

This repository contains the Smart Farm front-end — a React + Vite app that connects farmers, customers and advisors. It includes role-based dashboards, a marketplace, and multi-language support (English, French, Arabic).

**Quick links**:
- **Run (dev)**: `npm run dev`
- **Build**: `npm run build`
- **Preview build**: `npm run preview`

**Core features**
- **Marketplace**: Browse and search products
- **Farmer Dashboard**: Add and manage product listings
- **Advisor Dashboard**: Post farming advice
- **Admin Dashboard**: Manage users and platform
- **i18n**: English, French and Arabic translations via `react-i18next`

**Tech stack**
- **Framework**: React (18)
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **i18n**: i18next + react-i18next

**Repository layout**
- `src/` : Application source
- `src/components/` : Reusable components
- `src/context/` : `AuthContext.jsx`, `DataContext.jsx` (data + auth helpers)
- `src/pages/` : Page components (dashboards, auth, home)
- `vite.config.js` : Vite config
- `package.json` : Scripts and dependencies

**Prerequisites**
- Node.js 18+ and npm
- A running backend API (by default expected at `http://localhost:5000`)

**Environment variables (.env)**
This project exposes client environment variables using Vite. Variables that should be available to client code must be prefixed with `VITE_`.

Create a `.env` file in the project root and add the entries below (a sample `.env` is included in this repo):

```
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Smart Farm
VITE_GOOGLE_ANALYTICS_ID=
VITE_MAPS_API_KEY=
PORT=5173
```

- **VITE_API_BASE_URL**: Base URL for your backend API. The front-end will call endpoints like `${VITE_API_BASE_URL}/api/auth/login`.
- **VITE_APP_NAME**: App display name.
- **VITE_GOOGLE_ANALYTICS_ID** / **VITE_MAPS_API_KEY**: Optional third-party keys.
- **PORT**: Port used by the dev server (optional, Vite default is 5173).

Note: this project currently contains some hard-coded API URLs (e.g. `http://localhost:5000` in `src/context/AuthContext.jsx` and `src/context/DataContext.jsx`). To use `VITE_API_BASE_URL` in code, replace those strings with `import.meta.env.VITE_API_BASE_URL` or wrap with a fallback, for example:

```js
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
await fetch(`${API_BASE}/api/auth/login`, { /* ... */ });
```

If you want, I can update the code to use `VITE_API_BASE_URL` everywhere — tell me and I'll make the change.

**Run the app (local dev)**
1. Install dependencies:

```
npm install
```

2. Start the dev server:

```
npm run dev
```

3. Open `http://localhost:5173` (or the port reported by Vite).

**Build & deploy**

```
npm run build
npm run preview
```

Copy the `dist/` folder to your static host (Netlify, Vercel, S3, etc.) and be sure to set any runtime environment variables there as required by your hosting provider.

**Authentication and local storage**
- The app stores a serialized user object in `localStorage` under the `smartFarmUser` key after login. The backend is expected to return a JSON object containing at least a `token` field for protected requests.

**Internationalization**
- Translations are in `src/i18n.js`. `i18next-browser-languagedetector` is used to detect the language.

**Next steps / Recommendations**
- Replace hard-coded API URLs with `import.meta.env.VITE_API_BASE_URL` to make environment configuration consistent.
- Add a `.env.example` (we include a `.env` sample here) and ensure secrets are never committed for production.
- Add CORS configuration on your backend to allow the front-end origin.

If you'd like, I can:
- Update the source to consume `VITE_API_BASE_URL` (small code changes in `src/context/*`).
- Add a `.env.example` and update `.gitignore` to ensure real secrets are not committed.

---

If you want me to automatically switch the client code to use the `VITE_API_BASE_URL` variable, reply "Update code to use env" and I'll patch the files.
