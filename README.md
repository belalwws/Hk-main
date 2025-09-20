# Hackathon Platform

A comprehensive hackathon management platform built with Next.js, Prisma, and PostgreSQL.

## Database Setup

This project supports both SQLite (for development) and PostgreSQL (for production).

### Development (SQLite)

For local development, use the SQLite schema:

```bash
# Copy environment variables
cp .env.example .env

# Set DATABASE_URL for SQLite
DATABASE_URL="file:./dev.db"

# Generate Prisma client using development schema
npx prisma generate --schema ./schema.dev.prisma

# Push database schema
npx prisma db push --schema ./schema.dev.prisma

# Optional: Open Prisma Studio
npx prisma studio --schema ./schema.dev.prisma
```

### Production (PostgreSQL)

For production deployment (Render, Vercel, etc.), use the PostgreSQL schema:

```bash
# DATABASE_URL will be provided by your hosting service
# For Render, this is automatically set

# Generate Prisma client using production schema
npx prisma generate --schema ./schema.prisma

# Push database schema (or use migrations)
npx prisma db push --schema ./schema.prisma
```

### Schema Files

- `schema.prisma` - Production schema for PostgreSQL
- `schema.dev.prisma` - Development schema for SQLite

The main differences:
- PostgreSQL schema uses `Json` type for complex data
- SQLite schema uses `String` type for JSON data (parsed in application code)

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Set up database (choose development or production setup above)

# Run development server
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Secret for JWT tokens
- `NEXTAUTH_URL` - Your application URL
- `NEXTAUTH_SECRET` - NextAuth secret
- Email configuration for notifications
- Other application settings

## Features

- Multi-hackathon management
- User registration and team formation
- Judge evaluation system
- Dynamic registration forms
- Custom landing pages
- Results and scoring
- Email notifications
- Admin dashboard

## Deployment

The application is configured for deployment on Render with PostgreSQL. The build process automatically:

1. Installs dependencies (`npm ci`)
2. Generates Prisma client (`npx prisma generate --schema ./schema.prisma`)
3. Pushes database schema (`npx prisma db push --schema ./schema.prisma`)
4. Builds the application (`npm run build`)

Make sure your production environment has the correct `DATABASE_URL` set.
