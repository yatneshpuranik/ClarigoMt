# Product Requirements Document (PRD)

## 1. Product Overview
A secure MERN-based (MongoDB, Express.js, React.js, Node.js) authentication and user-management application. The system supports full user registration, login, role-based session access, and comprehensive user administration for Admin users while providing a clean dashboard for standard users.

## 2. Objective
Build a robust, production-ready role-based authentication and user management system where:
- Users can self-register with a designated role (User or Admin).
- Users can log in securely and receive a JSON Web Token (JWT).
- Client-side sessions are managed securely using `sessionStorage`.
- Admins can view, create, edit, and delete user accounts.
- Standard users are restricted to viewing only their own profile/dashboard.
- Protected routes prevent unauthorized access both on client (React Router guards) and server (Express JWT & Role middleware).

## 3. User Roles & Capabilities

### Admin Role
- **Login**: Authenticate into the application.
- **Admin Dashboard Access**: View administrative overview and full user management table.
- **View All Users**: Fetch and display all registered user records.
- **Add Users**: Create new user accounts (with name, email, role, and password).
- **Edit Users**: Modify existing user details (name, email, role, and optionally password).
- **Delete Users**: Remove user accounts (with safeguard against self-deletion).
- **Logout**: Terminate session and clear stored tokens/user data.

### User Role
- **Signup**: Register a new user account.
- **Login**: Authenticate into the application.
- **User Dashboard Access**: View custom welcome dashboard showing personal details.
- **Profile View**: Display full name, email, and assigned role.
- **Logout**: Terminate session and clear stored tokens/user data.
- **Restrictions**: Cannot access `/admin`, cannot view all users, cannot add/edit/delete users, and cannot invoke administrative backend APIs.

## 4. Functional Requirements

### 4.1 Authentication & Session Handling
- **Signup Endpoint**: `POST /api/auth/signup` accepts user credentials, hashes password, saves record, and returns safe user data.
- **Login Endpoint**: `POST /api/auth/login` verifies credentials, generates JWT containing `id` and `role`, and returns token with user payload.
- **Client Session Handling**: Stores `token`, `user`, and `role` in `sessionStorage`.
- **Axios Interceptor / Utility**: Automatically attaches `Authorization: Bearer <token>` header to all outgoing API requests.
- **Logout**: Clears `sessionStorage` and navigates user to `/login`.
- **Token Expiry / 401 Interception**: Automatically clears session and redirects to `/login` if any request yields HTTP 401.

### 4.2 Header & Navigation State
- When **Logged In**: Displays User Name, Role Badge (Admin / User), and Logout button. Hides Login and Signup options.
- When **Logged Out**: Displays Login and Signup options. Hides Logout button and user profile summary.
- **Authenticated Redirection**: If a logged-in user navigates to `/login` or `/signup`, redirect automatically to `/dashboard` (or `/admin` if Admin).

### 4.3 Client Routing & Route Guards
- **Public Routes**: `/login`, `/signup`
- **Protected Routes**: `/dashboard` (accessible by any logged-in user)
- **Admin-Only Routes**: `/admin` (accessible ONLY by users with `role: "Admin"`)
- **Unauthenticated Guard**: Redirects unauthenticated access attempts to `/login`.
- **Role Guard**: Redirects non-Admin users attempting to access `/admin` to `/dashboard`.

### 4.4 Admin User Management (CRUD)
- **Fetch Users**: `GET /api/users` (Admin only) returns user array excluding passwords.
- **Create User**: `POST /api/users` (Admin only) creates a new user after validation & password hashing.
- **Update User**: `PUT /api/users/:id` (Admin only) updates user details. Password update is optional.
- **Delete User**: `DELETE /api/users/:id` (Admin only) removes target user, blocking self-deletion of active Admin session.

## 5. Validation Requirements

### 5.1 Signup Validation
- **Full Name**: Required, non-empty string.
- **Email**: Required, valid email format regex check.
- **Password**: Required, minimum 6 characters.
- **Role**: Required, must be either `"Admin"` or `"User"`.

### 5.2 Login Validation
- **Email**: Required, valid email format.
- **Password**: Required, minimum 6 characters.

### 5.3 Admin Add/Edit User Validation
- **Add User**: Full Name (required), Email (required, valid format), Role (required), Password (required, min 6 characters).
- **Edit User**: Full Name (required), Email (required, valid format), Role (required), Password (optional, min 6 characters if provided).

## 6. Non-Functional Requirements
- **Security**: Password hashing using `bcryptjs` with salt round >= 10. Passwords must NEVER be returned in API responses.
- **JWT**: Signed using a secure environment secret with payload limited to non-sensitive identifiers (`id`, `role`).
- **UI/UX**: Clean, responsive layout using modern styling, clear feedback banners, modal dialogs for CRUD, inline form errors, and smooth page transitions.
- **Environment Isolation**: No hardcoded API keys or database strings; loaded via `.env`.
