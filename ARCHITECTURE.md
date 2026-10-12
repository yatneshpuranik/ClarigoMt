# Architecture Document

## System Architecture

```text
Frontend (React 19 + Redux Toolkit + Vite + React Router DOM v7 + Axios)
 ├── Pages / Screens
 │   ├── Login (`/login`)
 │   ├── Signup (`/signup`) - Supports key-protected Admin registration
 │   ├── Dashboard (`/dashboard`) - Standard User Welcome Screen
 │   └── AdminDashboard (`/admin`) - User Management CRUD Table & Responsive Cards
 │
 ├── Components
 │   ├── Header - Navigation & Synchronized Redux Auth State
 │   ├── ProtectedRoute - Client guard for authenticated users
 │   ├── AdminRoute - Client guard for Admin role with database backing
 │   └── UserModal - Add / Edit User Modal with self-demotion lockout prevention
 │
 ├── State Management (Redux Toolkit)
 │   ├── store.js - Central Redux Store
 │   └── authSlice.js - User authentication slice (`token`, `user`, `role`, `isInitialized`)
 │
 ├── Services
 │   └── api.js - Centralized Axios instance with Bearer token & 401 interceptor
 │
 └── Persistence
     └── sessionStorage (`token`, `user`, `role`) for seamless tab persistence

Backend (Node.js + Express.js 5)
 ├── Config
 │   ├── db.js - MongoDB Mongoose connection handler
 │   └── swagger.js - OpenAPI 3.0.0 / Swagger UI definition
 │
 ├── Models
 │   └── User.js - Mongoose Schema (fullName, email, password, role) with bcrypt hook
 │
 ├── Middleware
 │   └── authMiddleware.js - JWT verification (`protect`) & authoritative DB role check (`adminOnly`)
 │
 ├── Controllers
 │   ├── authController.js - signup (key-protected), login, getMe handlers
 │   └── userController.js - getUsers, getUserById, createUser, updateUser, deleteUser handlers
 │
 ├── Routes
 │   ├── authRoutes.js - `/api/auth` endpoints
 │   └── userRoutes.js - `/api/users` endpoints
 │
 └── server.js - Express application entry point with startup env checks and error middleware
```

---

## Detailed Data & Logic Flow

### 1. Request & Authentication Flow
1. **User Login**: User submits credentials on `/login`.
2. **Backend Processing**: `authController.login` validates input strings, finds user in MongoDB by email, and verifies password using `bcryptjs.compare()`.
3. **Token Generation**: Upon verification, backend signs a JWT containing `{ id: user._id, role: user.role }` using `JWT_SECRET`. No hardcoded fallback secret is used.
4. **Response**: Backend responds with `{ token, user: { id, fullName, email, role } }`.
5. **Redux Store**: Dispatches `setCredentials({ token, user })`, updating the centralized Redux store and caching values in `sessionStorage`.
6. **Navigation**: User is redirected to `/admin` if Admin, or `/dashboard` if standard User.

### 2. Key-Protected Admin Registration Flow
1. **Admin Selection**: On `/signup`, choosing `role: "Admin"` dynamically activates the Admin Signup Key input field.
2. **Submission**: Client sends `{ fullName, email, password, role, adminKey }`.
3. **Server Validation**: `authController.signup` checks `adminKey === process.env.ADMIN_SIGNUP_KEY`. If invalid or omitted, returns `403 Forbidden`.
4. **Account Creation**: Password hashed in Mongoose `pre('save')` hook, signed JWT issued, and Redux credentials set.

### 3. Authenticated API Request Flow
1. **Axios Interceptor**: Outgoing HTTP requests automatically inject `Authorization: Bearer <token>` from `sessionStorage`.
2. **Backend Auth Middleware**: Express runs `protect` middleware:
   - Validates Bearer token using `jwt.verify(token, process.env.JWT_SECRET)`.
   - Queries authoritative database record: `User.findById(decoded.id).select('-password')`.
   - Attaches live user record to `req.user`.
3. **Backend Admin Authorization**: Protected user routes run `adminOnly` middleware:
   - Verifies `req.user.role === 'Admin'`. If not Admin, rejects immediately with `403 Forbidden`.
4. **Controller Execution**: Handles business logic, reads/writes to MongoDB, and returns JSON payload (passwords excluded).

### 4. Anti-Lockout & Defensive Guard Flow
- **Self-Demotion Prevention**: If an active Admin attempts to update their own account to `User`, the backend rejects with `400 Bad Request`.
- **Self-Deletion Prevention**: If an active Admin attempts to delete their own account, the backend rejects with `400 Bad Request`.
- **Last-Admin Safeguard**: If an Admin is the sole remaining administrator in the database, demoting or deleting them is blocked (`adminCount <= 1` check).
- **Client-Side Enforcement**: In `AdminDashboard`, the active Admin's Delete button is disabled and tagged `(You)`. In `UserModal`, demoting the active Admin account is disabled with clear user feedback.

### 5. Single Source of Truth (Redux Toolkit)
- On app launch, `App.jsx` evaluates if a session exists and fetches `/auth/me` **only once** to initialize the profile.
- All child components (`Header`, `ProtectedRoute`, `AdminRoute`, `Dashboard`, `AdminDashboard`) subscribe to `state.auth` directly without triggering redundant network requests.
- When an administrator modifies their own profile in the dashboard, `updateUserSuccess` updates Redux state immediately, reflecting changes across the entire interface.

