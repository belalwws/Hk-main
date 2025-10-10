-- Migration: Add Supervisor System
-- This script adds the supervisor role and related tables to the existing database

-- 1. Update UserRole enum to include 'supervisor'
-- Note: PostgreSQL enum modification requires special handling
DO $$ 
BEGIN
    -- Check if 'supervisor' value already exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'supervisor' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
    ) THEN
        -- Add 'supervisor' to the UserRole enum
        ALTER TYPE "UserRole" ADD VALUE 'supervisor';
    END IF;
END $$;

-- 2. Create supervisors table
CREATE TABLE IF NOT EXISTS "supervisors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hackathonId" TEXT,
    "permissions" JSONB,
    "department" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supervisors_pkey" PRIMARY KEY ("id")
);

-- 3. Create supervisor_invitations table
CREATE TABLE IF NOT EXISTS "supervisor_invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "hackathonId" TEXT,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invitedBy" TEXT NOT NULL,
    "permissions" JSONB,
    "department" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supervisor_invitations_pkey" PRIMARY KEY ("id")
);

-- 4. Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "supervisors_userId_hackathonId_key" ON "supervisors"("userId", "hackathonId");
CREATE UNIQUE INDEX IF NOT EXISTS "supervisor_invitations_token_key" ON "supervisor_invitations"("token");

-- 5. Add foreign key constraints
DO $$ 
BEGIN
    -- Add foreign key for supervisors.userId -> users.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'supervisors_userId_fkey'
    ) THEN
        ALTER TABLE "supervisors" ADD CONSTRAINT "supervisors_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Add foreign key for supervisors.hackathonId -> hackathons.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'supervisors_hackathonId_fkey'
    ) THEN
        ALTER TABLE "supervisors" ADD CONSTRAINT "supervisors_hackathonId_fkey" 
        FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Add foreign key for supervisor_invitations.invitedBy -> users.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'supervisor_invitations_invitedBy_fkey'
    ) THEN
        ALTER TABLE "supervisor_invitations" ADD CONSTRAINT "supervisor_invitations_invitedBy_fkey" 
        FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Add foreign key for supervisor_invitations.hackathonId -> hackathons.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'supervisor_invitations_hackathonId_fkey'
    ) THEN
        ALTER TABLE "supervisor_invitations" ADD CONSTRAINT "supervisor_invitations_hackathonId_fkey" 
        FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS "supervisors_userId_idx" ON "supervisors"("userId");
CREATE INDEX IF NOT EXISTS "supervisors_hackathonId_idx" ON "supervisors"("hackathonId");
CREATE INDEX IF NOT EXISTS "supervisors_isActive_idx" ON "supervisors"("isActive");
CREATE INDEX IF NOT EXISTS "supervisor_invitations_email_idx" ON "supervisor_invitations"("email");
CREATE INDEX IF NOT EXISTS "supervisor_invitations_status_idx" ON "supervisor_invitations"("status");
CREATE INDEX IF NOT EXISTS "supervisor_invitations_expiresAt_idx" ON "supervisor_invitations"("expiresAt");

-- 7. Update existing tables if needed (add any missing columns)
-- This is a safety check in case some columns are missing

-- Check if users table needs any updates for supervisor support
-- (Currently no changes needed to users table)

-- Check if hackathons table needs any updates for supervisor support
-- (Currently no changes needed to hackathons table)

-- Migration completed successfully
-- The database now supports the supervisor system with:
-- 1. Updated UserRole enum with 'supervisor' value
-- 2. supervisors table for supervisor assignments
-- 3. supervisor_invitations table for invitation system
-- 4. All necessary foreign keys and indexes
