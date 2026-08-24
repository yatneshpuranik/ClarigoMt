# Requirements & Acceptance Criteria Checklist

## Implementation Checklist

### Authentication
- [ ] **Signup**: Self-registration with Name, Email, Password, and Role selection.
- [ ] **Login**: Authentication with Email and Password.
- [ ] **Logout**: Clear `sessionStorage` and redirect to `/login`.
- [ ] **JWT Generation**: Sign JWT containing `id` and `role` upon successful login/signup.
- [ ] **JWT Validation**: Verify JWT in backend middleware on protected endpoints.
- [ ] **bcrypt Password Hashing**: Hash passwords before saving to MongoDB (min 10 salt rounds).
- [ ] **sessionStorage Handling**: Store `token`, `user`, and `role` securely in `sessionStorage`.

### Authorization
- [ ] **Admin Role**: Full system access including Admin Dashboard & User Management APIs.
- [ ] **User Role**: Access restricted to standard User Dashboard only.
- [ ] **Admin Middleware**: Reject non-admin API calls with `403 Forbidden`.
- [ ] **Frontend Protected Route**: Block unauthenticated users from `/dashboard` and `/admin`.
- [ ] **Frontend Admin Route Guard**: Block non-admin users from `/admin` (redirect to `/dashboard`).
- [ ] **Backend Protected APIs**: Require valid JWT for `/api/users` and `/api/auth/me`.

### Admin Functionality
- [ ] **User Table**: Display list of users with Name, Email, Role, and Action buttons.
- [ ] **Add User**: Modal form allowing Admin to add a user (Password required).
- [ ] **Edit User**: Modal form allowing Admin to edit user details (Password optional).
- [ ] **Delete User**: Ability to delete user with confirmation & self-deletion guard.
- [ ] **Role Management**: Dynamically change user roles between `"User"` and `"Admin"`.

### User Functionality
- [ ] **Welcome Dashboard**: Clean user dashboard greeting user by name.
- [ ] **Name Display**: Show logged-in user's full name.
- [ ] **Role Display**: Show assigned role badge.
- [ ] **Logout Option**: Easily accessible logout button.

### Validation
- [ ] **Signup Validation**: Required full name, valid email regex, min 6 char password, valid role.
- [ ] **Login Validation**: Required email, valid email regex, min 6 char password.
- [ ] **Add User Validation**: Name, valid email, role, min 6 char password required.
- [ ] **Edit User Validation**: Name, valid email, role required; password optional (min 6 chars if filled).

### UI / UX
- [ ] **Header**: Dynamic navigation showing user profile summary & logout when logged in, or Login/Signup links when logged out.
- [ ] **Role Badges**: Visual indicator distinguishing Admin (e.g., purple/indigo) vs User (blue/slate).
- [ ] **User Modal**: Clean modal layout for Add & Edit user operations with inline errors.
- [ ] **Feedback & Error Messages**: Clear alert banners for backend validation, duplicate email, and server errors.

---

## Acceptance Criteria

### AC 1: User Registration (Signup)
- **Given** an unauthenticated visitor on `/signup`,
- **When** valid details (Name, Email, Password >= 6 chars, Role) are submitted,
- **Then** the user is created in MongoDB with hashed password, JWT is generated, session stored, and user redirected to appropriate dashboard.
- **When** duplicate email or invalid input is provided,
- **Then** appropriate HTTP 400/409 error is returned and displayed in UI.

### AC 2: User Login & Session Persistence
- **Given** a registered user on `/login`,
- **When** correct email and password are submitted,
- **Then** backend responds with JWT and user object, stored in `sessionStorage`, and user is navigated to `/dashboard` (or `/admin` if Admin).
- **When** credentials are invalid,
- **Then** HTTP 401 error message "Invalid email or password" is displayed.

### AC 3: Route Protection & Security Guards
- **Given** an unauthenticated visitor navigating directly to `/dashboard` or `/admin`,
- **Then** they are immediately redirected to `/login`.
- **Given** an authenticated standard `User` navigating to `/admin`,
- **Then** they are immediately redirected to `/dashboard`.
- **Given** an authenticated standard `User` making an API request to `GET /api/users`,
- **Then** backend returns `403 Forbidden`.

### AC 4: Admin User CRUD Operations
- **Given** an authenticated `Admin` on `/admin`,
- **When** viewing the page, all users are fetched and rendered in a responsive table.
- **When** clicking "Add User", modal opens; submitting creates user and refreshes table.
- **When** clicking "Edit User", modal opens populated with user details; submitting updates user in DB.
- **When** clicking "Delete User", confirmation modal appears; confirming deletes user from DB.
