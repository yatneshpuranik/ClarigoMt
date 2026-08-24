import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
  try {
    await connectDB();

    console.log('Seeding initial demo users...');

    // Clear existing test users if desired or check existing
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      await User.create({
        fullName: 'Demo Administrator',
        email: 'admin@example.com',
        password: 'adminpassword123',
        role: 'Admin',
      });
      console.log('Created default Admin account (admin@example.com / adminpassword123)');
    } else {
      console.log('Default Admin account already exists.');
    }

    const userExists = await User.findOne({ email: 'user@example.com' });
    if (!userExists) {
      await User.create({
        fullName: 'Demo Standard User',
        email: 'user@example.com',
        password: 'userpassword123',
        role: 'User',
      });
      console.log('Created default User account (user@example.com / userpassword123)');
    } else {
      console.log('Default User account already exists.');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
