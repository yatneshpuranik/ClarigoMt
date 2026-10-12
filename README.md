# ClarigoMt — MERN Authentication & User Management

ClarigoMt is a production-ready, role-based authentication and user management web application built with the MERN stack (MongoDB, Express.js, React.js 19, and Node.js).

---

## Live Demo

- **Frontend App:** [https://clarigo-mt.vercel.app](https://clarigo-mt.vercel.app)
- **Backend API:** [https://clarigomt.onrender.com/api](https://clarigomt.onrender.com/api)
- **Swagger API Docs:** [https://clarigomt.onrender.com/api-docs/](https://clarigomt.onrender.com/api-docs/)

---

## Overview

ClarigoMt provides a secure foundation for user authentication and role-based access control, including:

- User and Admin self-registration and authentication
- Strict JWT token authentication with **zero hardcoded fallback secrets**
- Key-protected Admin self-registration (`ADMIN_SIGNUP_KEY`)
- `bcrypt` single-pass password hashing (no double-hashing on update)
- **Authoritative database role-based authorization** queried directly from MongoDB
- Centralized shared auth state with **Redux Toolkit** (eliminates duplicate `/auth/me` calls)
- Comprehensive edge-case handling (safe `ObjectId` casting, blank payload rejection, and self-demotion/last-admin lockout prevention)
- Protected frontend routes (`ProtectedRoute`, `AdminRoute`) and Express middleware
- Complete Admin user management (CRUD: view, add, edit, delete users)
- Interactive OpenAPI 3.0.0 / Swagger UI documentation
- Fully mobile-responsive dark editorial UI (320px–1440px+)

---

## Role-Based Functionality

| Feature | Standard User | Administrator |
| :--- | :---: | :---: |
| Signup | ✅ | ✅ (with Admin Key) |
| Login | ✅ | ✅ |
| User Dashboard | ✅ | ✅ |
| View All Users | ❌ | ✅ |
| Add New Users | ❌ | ✅ |
| Edit Users | ❌ | ✅ |
| Delete Users | ❌ | ✅ (Self-deletion blocked) |
| Admin Dashboard | ❌ | ✅ |

> **Note:** Admin-only operations are strictly protected at both the frontend routing level and backend middleware level.

---

## Key-Protected Admin Signup

To register as an Administrator:
1. Select **Administrator** in the "Register as role" dropdown on the signup page.
2. The UI dynamically presents an **Admin Signup Key** input field.
3. The client submits `adminKey` along with credentials to `POST /api/auth/signup`.
4. The backend verifies `adminKey` against `process.env.ADMIN_SIGNUP_KEY`. If invalid or omitted, the server rejects the request with `403 Forbidden`.
5. Standard `User` registrations do not require an Admin Signup Key.

---

## Demo Credentials

> **Note:** These are demo credentials for evaluation/testing only. Do not use real personal credentials in a public repository.

### Standard User Account
- **Email:** `user@example.com`
- **Password:** `userpassword123` (or `123456`)

### Administrator Account
- **Email:** `admin@example.com`
- **Password:** `adminpassword123`
- **Admin Signup Key (Demo):** Configured in `.env` as `admin123`

---

## API Documentation

Interactive Swagger UI documentation is served live at:
**[https://clarigomt.onrender.com/api-docs/](https://clarigomt.onrender.com/api-docs/)** (or `http://localhost:5000/api-docs` when running locally).

### Authentication Endpoints
- `POST /api/auth/signup` — Register a new user or administrator account (requires `adminKey` if role is `Admin`).
- `POST /api/auth/login` — Authenticate credentials and receive a signed JWT token.
- `GET /api/auth/me` — Fetch current authenticated profile directly from MongoDB.

### User Management Endpoints (Admin Only)
- `GET /api/users` — Retrieve list of all registered users (passwords omitted).
- `GET /api/users/:id` — Retrieve a single user record by ID.
- `POST /api/users` — Create a new user account.
- `PUT /api/users/:id` — Update an existing user's details or role (self-demotion and last-admin demotion blocked).
- `DELETE /api/users/:id` — Delete a user account (self-deletion and last-admin deletion blocked).

---

## Tech Stack

- **Frontend:** React 19, Vite, Redux Toolkit (`@reduxjs/toolkit`, `react-redux`), React Router DOM v7, Axios, Tailwind CSS v4
- **Backend:** Node.js, Express.js 5, JWT (`jsonwebtoken`), `bcryptjs`, `swagger-ui-express`, `swagger-jsdoc`
- **Database:** MongoDB Atlas (`mongoose` 9)

---

## Environment Variables

Configure environment variables in `.env` files for backend and frontend.

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
ADMIN_SIGNUP_KEY=your_admin_signup_key
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

> **Security Note:** Never commit `.env` files with production secrets to public repositories.

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
React 19 + Redux Toolkit + Vite
      ↓
Vercel (https://clarigo-mt.vercel.app)

Backend
Node.js + Express 5
      ↓
Render (https://clarigomt.onrender.com)

Database
MongoDB Atlas
```

---

## Security & Reliability Highlights

1. **Password Hashing:** Passwords are hashed using `bcrypt` (single-pass in Mongoose `pre('save')` hook, preventing double-hashing on update).
2. **Strict JWT Security:** Requests to protected endpoints require `Authorization: Bearer <JWT>`. The server enforces `JWT_SECRET` with **zero hardcoded fallback strings**; if absent, startup fails immediately.
3. **Authoritative DB Authorization:** Client-side tokens provide identity, but roles are authoritatively verified against live database records on every protected request (`User.findById(decoded.id)`).
4. **Key-Protected Admin Signup:** Public registration for the Administrator role strictly mandates `ADMIN_SIGNUP_KEY`. The frontend conditionally prompts for the key and passes it in the request.
5. **Anti-Lockout Protection:**
   - Logged-in admins cannot demote their own account to `User`.
   - Logged-in admins cannot delete their own active account.
   - System prevents demoting or deleting the last remaining administrator in the database.
6. **Robust Input Validation & Edge Case Handling:**
   - Malformed/invalid MongoDB ObjectIds are validated upfront and caught by centralized error middleware returning `400 Bad Request` instead of `500 Server Error`.
   - Blank payloads and empty whitespace updates on `PUT` and `POST` endpoints are rejected.
7. **Single Source of Truth (Redux Toolkit):** Centralized auth store prevents redundant `/auth/me` calls (initializes once on app boot) and keeps user profile changes in sync across all components.

