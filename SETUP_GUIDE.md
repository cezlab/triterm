# TriTerm Setup Guide

Step-by-step guide to set up your TriTerm installation: migrate the database and create your first admin user.

---

## Prerequisites

Before starting, make sure you have:
- ✅ Node.js 18+ installed
- ✅ npm installed
- ✅ `.env` file configured in `server/` directory
- ✅ All dependencies installed (`npm install`)

---

## Step 1: Migrate Database

The database needs to be initialized with the schema before you can create users.

### 1.1 Navigate to Server Directory

```bash
cd server
```

### 1.2 Generate Prisma Client

This generates the Prisma client code needed to interact with the database:

```bash
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client (version x.x.x) in ./node_modules/@prisma/client
```

### 1.3 Run Database Migrations

This creates the database file (if it doesn't exist) and applies all migrations:

```bash
npx prisma migrate dev --name init
```

**Expected output:**
```
✔ Your database is now in sync with your schema.

✔ Generated Prisma Client (version x.x.x)
```

**What this does:**
- Creates `prisma/dev.db` (SQLite database file)
- Creates all tables (User, Session, AuditLog, etc.)
- Applies the initial migration

### 1.4 Verify Database Creation

Check that the database file was created:

```bash
ls -la prisma/dev.db
```

You should see the database file listed.

### Alternative: Use `db push` (Development Only)

If you prefer to push the schema directly without migrations:

```bash
npx prisma db push
```

**Note:** `db push` is for development. Use `migrate dev` for production-ready setups.

---

## Step 2: Create Admin User

Once the database is set up, create your first admin user.

### 2.1 Navigate to Server Directory

```bash
cd server
```

### 2.2 Run Create Admin Script

Use the provided script to create an admin user:

```bash
npm run create-admin <email> <username> <password>
```

**Example:**
```bash
npm run create-admin admin@example.com admin SecurePass123!@#
```

### 2.3 Password Requirements

Your password must meet these requirements:
- ✅ **Minimum 8 characters**
- ✅ **At least one uppercase letter** (A-Z)
- ✅ **At least one lowercase letter** (a-z)
- ✅ **At least one number** (0-9)
- ✅ **At least one special character** (!@#$%^&*...)

**Good password examples:**
- `MyPass123!`
- `Admin@24`
- `Secure#8`

### 2.4 Verify User Creation

If successful, you'll see:

```
✅ Admin user created successfully!

User Details:
  ID:       <user-id>
  Email:    admin@example.com
  Username: admin
  Role:     ADMIN
  Active:   Yes
  Created:  <timestamp>

🎉 You can now login with these credentials!
```

### 2.5 Login

1. Open your TriTerm application in a browser
2. Go to the login page
3. Enter the email and password you just created
4. You'll be logged in as an admin with full privileges

---

## Troubleshooting

### Database Migration Issues

**Error: "Cannot connect to database"**
- Check that `DATABASE_URL` is set correctly in `server/.env`
- For SQLite: `DATABASE_URL="file:./dev.db"`
- Make sure you're in the `server/` directory when running commands

**Error: "The table 'main.User' does not exist"**
- You need to run migrations first (Step 1.3)
- Run: `npx prisma migrate dev --name init`

**Error: "Migration already applied"**
- The database is already set up
- You can skip to Step 2 (Create Admin User)

### Admin User Creation Issues

**Error: "User already exists"**
- The email or username is already taken
- Try a different email or username
- Or login with existing credentials

**Error: "Password validation failed"**
- Check that your password meets all requirements
- Minimum 8 characters with uppercase, lowercase, number, and special character

**Error: "Database tables do not exist"**
- Go back to Step 1 and run migrations first
- Run: `npx prisma migrate dev --name init`

---

## Quick Reference

### Complete Setup (Copy & Paste)

```bash
# Step 1: Setup Database
cd server
npx prisma generate
npx prisma migrate dev --name init

# Step 2: Create Admin User
npm run create-admin admin@example.com admin SecurePass123!@#

# Step 3: Start Server
npm run dev
```

### Database Location

After migration, your database will be at:
```
server/prisma/dev.db
```

### Environment Variables

Make sure your `server/.env` has:
```bash
DATABASE_URL="file:./dev.db"
```

---

## Next Steps

After completing setup:

1. **Login** with your admin credentials
2. **Access Admin Dashboard** - Click the shield icon (🛡️) in the header
3. **Create More Users** - Go to User Management → Create User
4. **Configure Settings** - Adjust system settings in Admin Dashboard
5. **Enable Signup** (Optional) - Allow users to self-register in System Settings

---

## Additional Commands

### View Database in Prisma Studio

```bash
cd server
npx prisma studio
```

This opens a web interface to view and edit your database.

### Reset Database (⚠️ Deletes All Data)

```bash
cd server
npx prisma migrate reset
```

**Warning:** This will delete all data and recreate the database.

### Check Database Status

```bash
cd server
npx prisma migrate status
```

Shows which migrations have been applied.

---

## Production Setup

For production, use PostgreSQL instead of SQLite:

1. **Update `.env`:**
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/triterm"
   ```

2. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Create admin user** (same as Step 2)

---

## Need Help?

- Check server logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure Node.js version is 18+ (`node --version`)
- Make sure all dependencies are installed (`npm install`)

