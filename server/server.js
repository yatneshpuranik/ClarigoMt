import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'supersecret_clarigo_jwt_key_2026';
}

if (!process.env.ADMIN_SIGNUP_KEY) {
  process.env.ADMIN_SIGNUP_KEY;
}

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy and running' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid resource ID format: ${err.value}` });
  }

  if (err.name === 'ValidationError') {
    const errorDetails = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: errorDetails.join(', ') });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate field value entered' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid or forged token signature' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token has expired. Please log in again.' });
  }

  return res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger API Docs available at http://localhost:${PORT}/api-docs`);
});
