# Tech Stack Specifications

## Frontend
- **Framework**: React.js 19 (via Vite build tool)
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios v1.x (with centralized instance & interceptors)
- **Styling**: Tailwind CSS v4 + Vanilla CSS
- **State & Session**: Redux Toolkit (`@reduxjs/toolkit` & `react-redux`) + `sessionStorage` for tab persistence

## Backend
- **Runtime**: Node.js (ES Modules syntax: `import`/`export`)
- **Web Framework**: Express.js 5.x
- **Authentication**: `jsonwebtoken` (JWT Bearer tokens)
- **Password Hashing**: `bcryptjs`
- **Environment Management**: `dotenv`
- **CORS Handler**: `cors` middleware

## Database
- **Database**: MongoDB (Cloud Atlas Instance)
- **ODM**: Mongoose 9.x

## Development & Tooling
- **Editor**: VS Code
- **Package Manager**: `npm`
- **Concurrency**: `concurrently` (runs root `npm run dev` to launch frontend on 5173 and backend on 5000)
- **Development Server**: `nodemon` (backend), Vite dev server (frontend)
