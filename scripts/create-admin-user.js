#!/usr/bin/env node

/**
 * Create Admin User Script
 * 
 * This script creates an admin user directly in the database when signup is disabled.
 * 
 * Usage:
 *   node scripts/create-admin-user.js <email> <username> <password>
 * 
 * Example:
 *   node scripts/create-admin-user.js admin@example.com admin SecurePass123!@#
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
import { resolve } from 'path';

// Try to load .env from server directory
const envPath = resolve(__dirname, '../server/.env');
try {
  dotenv.config({ path: envPath });
} catch (e) {
  // Fallback to root .env
  dotenv.config();
}

// Initialize Prisma - will use DATABASE_URL from environment
const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function createAdminUser(email, username, password) {
  try {
    console.log('🔐 Creating admin user...\n');

    // Validate inputs
    if (!email || !username || !password) {
      console.error('❌ Error: Email, username, and password are required');
      console.log('\nUsage: node scripts/create-admin-user.js <email> <username> <password>');
      console.log('Example: node scripts/create-admin-user.js admin@example.com admin SecurePass123!@#');
      process.exit(1);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Error: Invalid email format');
      process.exit(1);
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      console.error('❌ Error: Username can only contain letters, numbers, underscores, and hyphens');
      process.exit(1);
    }

    if (username.length < 3 || username.length > 20) {
      console.error('❌ Error: Username must be between 3 and 20 characters');
      process.exit(1);
    }

    // Validate password strength
    if (password.length < 12) {
      console.error('❌ Error: Password must be at least 12 characters');
      process.exit(1);
    }

    if (!/[A-Z]/.test(password)) {
      console.error('❌ Error: Password must contain at least one uppercase letter');
      process.exit(1);
    }

    if (!/[a-z]/.test(password)) {
      console.error('❌ Error: Password must contain at least one lowercase letter');
      process.exit(1);
    }

    if (!/[0-9]/.test(password)) {
      console.error('❌ Error: Password must contain at least one number');
      process.exit(1);
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(password)) {
      console.error('❌ Error: Password must contain at least one special character');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        console.error(`❌ Error: User with email ${email} already exists`);
        process.exit(1);
      }
      if (existingUser.username.toLowerCase() === username.toLowerCase()) {
        console.error(`❌ Error: Username ${username} is already taken`);
        process.exit(1);
      }
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    console.log('👤 Creating user in database...');
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('User Details:');
    console.log(`  ID:       ${user.id}`);
    console.log(`  Email:    ${user.email}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Role:     ${user.role}`);
    console.log(`  Active:   ${user.isActive ? 'Yes' : 'No'}`);
    console.log(`  Created:  ${user.createdAt.toISOString()}`);
    console.log('\n🎉 You can now login with these credentials!');

  } catch (error) {
    console.error('\n❌ Error creating user:', error.message);
    
    if (error.code === 'P2002') {
      console.error('   A user with this email or username already exists.');
    } else if (error.code === 'P1001') {
      console.error('   Cannot connect to database. Please check your DATABASE_URL.');
    } else {
      console.error('   Full error:', error);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('❌ Error: Missing required arguments');
  console.log('\nUsage: node scripts/create-admin-user.js <email> <username> <password>');
  console.log('\nExample:');
  console.log('  node scripts/create-admin-user.js admin@example.com admin SecurePass123!@#');
  console.log('\nPassword Requirements:');
  console.log('  - Minimum 12 characters');
  console.log('  - At least one uppercase letter');
  console.log('  - At least one lowercase letter');
  console.log('  - At least one number');
  console.log('  - At least one special character');
  process.exit(1);
}

const [email, username, password] = args;

// Run the script
createAdminUser(email, username, password);

