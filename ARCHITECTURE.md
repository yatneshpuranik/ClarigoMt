# Architecture Document

## System Architecture

```text
Frontend (React + Vite + React Router + Axios)
 ├── Pages
 │   ├── Login (`/login`)
 │   ├── Signup (`/signup`)
 │   ├── Dashboard (`/dashboard`) - User Welcome Screen
 │   └── AdminDashboard (`/admin`) - User Management Table
 │
 ├── Components
 │   ├── Header - Navigation & Dynamic Auth State
 │   ├── ProtectedRoute - Client guard for logged-in users
 │   ├── AdminRoute - Client guard for Admin role only
 │   └── UserModal - Form modal for Add / Edit User
 │
 ├── Services
 │   └── api.js - Centralized Axios instance with Bearer token & 401 interceptor
 │
 └── Auth State & Session Handling
     └── sessionStorage (`token`, `user`, `role`)

Backend (Node.js + Express.js)
 ├── Config
 │   └── db.js - MongoDB Mongoose connection handler
 │
 ├── Models
 │   └── User.js - Mongoose Schema (fullName, email, password, role)
 │
 ├── Middleware
 │   ├── authMiddleware.js - JWT verification middleware
 │   └── adminMiddleware.js - Admin role authorization middleware
 │
 ├── Controllers
 │   ├── authController.js - signup, login, getMe handlers
 │   └── userController.js - getUsers, createUser, updateUser, deleteUser handlers
 │
 ├── Routes
 │   ├── authRoutes.js - `/api/auth` endpoints
 │   └── userRoutes.js - `/api/users` endpoints
 │
 └── server.js - Express application entry point
```

---

## Detailed Data & Logic Flow

### 1. Request & Authentication Flow
1. **User Login**: User submits credentials on `/login`.
2. **Backend Processing**: `authController.login` validates input, finds user in MongoDB by email, and verifies password using `bcryptjs.compare()`.
3. **Token Generation**: Upon verification, backend signs a JWT containing `{ id: user._id, role: user.role }` using `JWT_SECRET`.
4. **Response**: Backend responds with `{ token, user: { id, fullName, email, role } }`.
5. **Client Storage**: React app saves `token`, `user`, and `role` to `sessionStorage` and sets up authentication headers in Axios.
6. **Navigation**: User is redirected to `/admin` if Admin, or `/dashboard` if standard User.

### 2. Authenticated API Request Flow
1. **Axios Interceptor**: For every outgoing HTTP request, Axios injects `Authorization: Bearer <token>` from `sessionStorage`.
2. **Backend Auth Middleware**: Express runs `authMiddleware`:
   - Extracts token from `Authorization` header.
   - Verifies token via `jwt.verify(token, process.env.JWT_SECRET)`.
   - Attaches decoded user object `req.user` to the request object.
3. **Backend Admin Middleware**: For `/api/users` endpoints, Express runs `adminMiddleware`:
   - Checks `req.user.role === 'Admin'`.
   - If not Admin, rejects immediately with `403 Forbidden`.
4. **Controller Execution**: Handles business logic, reads/writes to MongoDB, and returns JSON payload (excluding password fields).

### 3. Frontend Protection Flow
- **`ProtectedRoute`**: Wraps `/dashboard`. Checks `sessionStorage.getItem('token')`. If missing, redirects to `/login`.
- **`AdminRoute`**: Wraps `/admin`. Checks `sessionStorage.getItem('token')` and `sessionStorage.getItem('role') === 'Admin'`. If not logged in, redirects to `/login`. If logged in as non-Admin, redirects to `/dashboard`.
- **Axios 401 Interceptor**: If any backend response returns `401 Unauthorized`, `sessionStorage` is cleared and the user is redirected to `/login`.

### 4. MongoDB Model Schema (`User`)
```javascript
{
  fullName: { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ['Admin', 'User'], default: 'User' },
  timestamps: true
}
```

### 5. Session & Storage Lifecycle
- **Creation**: On successful login/signup, items set in `sessionStorage`:
  - `token`: Bearer JWT token string.
  - `user`: JSON stringified user details (`id`, `fullName`, `email`, `role`).
  - `role`: String `"Admin"` or `"User"`.
- **Persistence**: Persists across page reloads within the same browser tab session.
- **Destruction**: Cleared on explicit Logout button click or on receiving HTTP 401 token invalidation.
