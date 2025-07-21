#!/usr/bin/env tsx

/**
 * setup admin script
 * example: pnpm tsx scripts/setup-admin.ts admin@example.com
 */

// Load environment variables from .env file
import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config({ path: resolve(__dirname, '../.env') });

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { user } from '../src/server/db/schema';
import { createChildLogger } from '../src/lib/logger/logger';

const setupAdminLogger = createChildLogger('setup-admin');

// Create database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL is not set');
  process.exit(1);
}
const sql = neon(databaseUrl);
const db = drizzle(sql);

function getAdminEmails(): string[] {
  const adminEmails = process.env.ADMIN_EMAILS || '';
  return adminEmails.split(',').map(email => email.trim()).filter(Boolean);
}

function isAdminEmail(email: string): boolean {
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email);
}

async function setupAdmin(email: string) {
  try {
    setupAdminLogger.info('🔍 check admin config...');
    
    // check if the email is in the admin list
    if (!isAdminEmail(email)) {
      setupAdminLogger.error('❌ error: this email is not in the admin list');
      setupAdminLogger.info('please add this email to the ADMIN_EMAILS environment variable');
      setupAdminLogger.info('current admin emails:', getAdminEmails());
      process.exit(1);
    }

    // find user
    setupAdminLogger.info(`🔍 find user: ${email}`);
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      setupAdminLogger.error('❌ error: user not found');
      setupAdminLogger.info('please ensure the user has registered an account');
      process.exit(1);
    }

    const currentUser = existingUser[0];
    if (!currentUser) {
      setupAdminLogger.error('❌ error: user data is abnormal');
      process.exit(1);
    }

    // check if the user is already an admin
    if (currentUser.role === 'admin') {
      setupAdminLogger.warn('✅ this user is already an admin');
      return;
    }

    // update user role to admin
    setupAdminLogger.info('🔄 set user to admin...');
    await db
      .update(user)
      .set({ 
        role: 'admin',
        updatedAt: new Date()
      })
      .where(eq(user.email, email));

    setupAdminLogger.info('✅ success set admin');
    setupAdminLogger.info(`${email} is now an admin`);

  } catch (error) {
    console.error('❌ error: failed to set admin:', error);
    process.exit(1);
  }
}

async function main() {
  const email = process.argv[2];

  if (!email) {
    setupAdminLogger.error('❌ error: please provide an email address');
    setupAdminLogger.info('example: pnpm tsx scripts/setup-admin.ts admin@example.com');
    process.exit(1);
  }

  // validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setupAdminLogger.error('❌ error: invalid email format');
    process.exit(1);
  }

  await setupAdmin(email);
  process.exit(0);
}

main().catch(console.error); 