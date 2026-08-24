# AuthDash — MERN Authentication & User Management Application

A production-ready, role-based authentication and user-management application built with MongoDB, Express.js, React.js, and Node.js.

## Live Documentation & API Reference

- **Swagger / OpenAPI Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API Base**: [http://localhost:5000/api](http://localhost:5000/api)

---

## Quick Start

### 1. Run Development Server
```bash
npm run dev
```

### 2. Seed Initial Demo Accounts (Optional)
```bash
cd server
npm run seed
```

> **Demo Credentials**:
> - **Admin**: `admin@example.com` / `adminpassword123`
> - **Standard User**: `user@example.com` / `userpassword123`

---

## API Summary & Security

- **Authentication**: `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- **User Management (Admin Only)**: `GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`
- **Security Scheme**: `Authorization: Bearer <JWT>`
- **Role Enforcement**: `403 Forbidden` returned when non-Admin accounts attempt Admin endpoints.
