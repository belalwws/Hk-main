-- Migration: Add Upload Tokens table for Magic Link functionality
-- Created: 2025-01-16
-- Description: Allows participants to upload presentations via magic links

-- Create upload_tokens table
CREATE TABLE IF NOT EXISTS "upload_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upload_tokens_pkey" PRIMARY KEY ("id")
);

-- Create unique index on token
CREATE UNIQUE INDEX IF NOT EXISTS "upload_tokens_token_key" ON "upload_tokens"("token");

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "upload_tokens_token_idx" ON "upload_tokens"("token");
CREATE INDEX IF NOT EXISTS "upload_tokens_participantId_idx" ON "upload_tokens"("participantId");
CREATE INDEX IF NOT EXISTS "upload_tokens_teamId_idx" ON "upload_tokens"("teamId");

-- Add foreign key constraints
ALTER TABLE "upload_tokens" ADD CONSTRAINT "upload_tokens_participantId_fkey" 
    FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "upload_tokens" ADD CONSTRAINT "upload_tokens_teamId_fkey" 
    FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "upload_tokens" ADD CONSTRAINT "upload_tokens_hackathonId_fkey" 
    FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add comment
COMMENT ON TABLE "upload_tokens" IS 'Magic links for participants to upload presentations';

