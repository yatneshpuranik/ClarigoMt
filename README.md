# ClarigoMt — MERN Authentication & User Management

ClarigoMt is a production-ready, role-based authentication and user management web application built with the MERN stack (MongoDB, Express.js, React.js, and Node.js).

---

## Live Demo

- **Frontend App:** [https://clarigo-mt.vercel.app](https://clarigo-mt.vercel.app)
- **Backend API:** [https://clarigomt.onrender.com/api](https://clarigomt.onrender.com/api)
- **Swagger API Docs:** [https://clarigomt.onrender.com/api-docs/](https://clarigomt.onrender.com/api-docs/)

---

## Overview

ClarigoMt provides a secure foundation for user authentication and role-based access control, including:

- User and Admin self-registration and authentication
- JWT-based token authentication
- `bcrypt` single-pass password hashing
- Authoritative database role-based authorization
- Protected frontend routes (`ProtectedRoute`, `AdminRoute`) and backend middleware
- Complete Admin user management (CRUD)
- Dynamic session restoration via `/api/auth/me`
- Interactive OpenAPI 3.0.0 / Swagger UI documentation
- Fully mobile-responsive dark editorial UI (320px–1440px+)

---

## Role-Based Functionality

| Feature | Standard User | Administrator |
| :--- | :---: | :---: |
| Signup | ✅ | ✅ |
| Login | ✅ | ✅ |
| User Dashboard | ✅ | ✅ |
| View All Users | ❌ | ✅ |
| Add New Users | ❌ | ✅ |
| Edit Users | ❌ | ✅ |
| Delete Users | ❌ | ✅ |
| Admin Dashboard | ❌ | ✅ |

> **Note:** Admin-only operations are strictly protected at both the frontend routing level and backend middleware level.

---

## Admin Signup

To register as an Administrator, select `Admin` during signup and provide the Admin Signup Key configured in the backend environment variables.

The key is intentionally not exposed in this README for security. Standard `User` signup does not require an Admin Signup Key.

---

## Demo Credentials

> **Note:** These are demo credentials for evaluation/testing only. Do not use real personal credentials in a public repository.

### Standard User Account
- **Email:** `user@example.com`
- **Password:** `userpassword123` (or `123456`)

### Administrator Account
- **Email:** `admin@example.com`
- **Password:** `adminpassword123`

---

## API Documentation

Interactive Swagger UI documentation is served live at:
**[https://clarigomt.onrender.com/api-docs/](https://clarigomt.onrender.com/api-docs/)** (or `http://localhost:5000/api-docs` when running locally).

### Authentication Endpoints
- `POST /api/auth/signup` — Register a new user or administrator account.
- `POST /api/auth/login` — Authenticate credentials and receive a signed JWT token.
- `GET /api/auth/me` — Fetch current authenticated profile directly from MongoDB.

### User Management Endpoints (Admin Only)
- `GET /api/users` — Retrieve list of all registered users (passwords omitted).
- `POST /api/users` — Create a new user account.
- `PUT /api/users/:id` — Update an existing user's details or role.
- `DELETE /api/users/:id` — Delete a user account (self-deletion blocked).

---

## Tech Stack

- **Frontend:** React 18, Vite, React Router DOM v7, Axios, Tailwind CSS
- **Backend:** Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, `swagger-ui-express`, `swagger-jsdoc`
- **Database:** MongoDB Atlas (`mongoose`)

---

## Environment Variables

Configure environment variables in `.env` files for backend and frontend.

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-jwt-secret>
ADMIN_SIGNUP_KEY=<your-admin-signup-key>
CLIENT_URL=<your-frontend-url>
```

### Frontend (`client/.env`)
```env
VITE_API_URL=<your-backend-api-url>
```

> **Security Note:** Never commit `.env` files or production secrets to public repositories.

---

## Local Development

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 3. Seed Demo Data (Optional)
```bash
cd server
npm run seed
```

---

## Deployment Architecture

```text
Frontend
React + Vite
      ↓
Vercel (https://clarigo-mt.vercel.app)

Backend
Node.js + Express
      ↓
Render (https://clarigomt.onrender.com)

Database
MongoDB Atlas
```

---

## Security Highlights

- **Password Hashing:** Passwords are hashed using `bcrypt` (single-pass in Mongoose pre-save hook).
- **JWT Authentication:** Requests to protected endpoints require `Authorization: Bearer <JWT>`.
- **Authoritative DB Authorization:** Client-side `sessionStorage` is treated purely as UI cache. Role authorization queries live user data from MongoDB (`User.findById(decoded.id)`).
- **Key-Protected Admin Signup:** Admin account registration requires a backend-configured signup key.
- **Data Protection:** Passwords and password hashes are omitted from all user management API responses.
